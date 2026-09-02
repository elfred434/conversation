import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:english_conversation_app/domain/entities/conversation_message.dart';
import 'package:english_conversation_app/domain/entities/level.dart';
import 'package:english_conversation_app/domain/entities/scenario.dart';
import 'package:english_conversation_app/domain/entities/conversation_session.dart';
import 'package:english_conversation_app/domain/usecases/start_conversation.dart';
import 'package:english_conversation_app/domain/usecases/send_message.dart';
import 'package:english_conversation_app/domain/repositories/history_repository.dart';
import 'package:english_conversation_app/domain/repositories/progress_repository.dart';
import 'package:english_conversation_app/domain/utils/correction_trailer.dart';
import 'package:english_conversation_app/presentation/state/chat_state.dart';

/// Orchestre la conversation : streaming, historique et corrections.
///
/// ECONOMIE D'APPELS : la correction grammaticale est fusionnee dans l'appel
/// principal du tuteur. Le LLM ajoute en fin de reponse une balise
/// @@CORRECTION@@{...} (instruction dans le system prompt) ; on la retire de
/// l'affichage et on l'attache a la bulle utilisateur. Un SEUL appel LLM par
/// message, au lieu de deux -> deux fois moins de quota / rate-limits.
class ChatNotifier extends StateNotifier<ChatState> {
  ChatNotifier(this._start, this._send, this._history, this._progress)
      : super(const ChatState());

  final StartConversation _start;
  final SendMessage _send;
  final HistoryRepository _history;
  final ProgressRepository _progress;

  CefrLevel? _level;
  String? _scenarioId;
  String? _sessionId;
  String _sessionTitle = '';
  int _counter = 0;

  String _newId() => 'm${_counter++}_${DateTime.now().microsecondsSinceEpoch}';

  String _resolveTitle(String? scenarioId) {
    if (scenarioId == null) return 'Conversation libre';
    for (final s in kScenarios) {
      if (s.id == scenarioId) return s.title;
    }
    return 'Conversation';
  }

  /// Reduit les infos sensibles (cle API) des messages d'erreur affiches a l'utilisateur.
  String _redact(String message) =>
      message.replaceAll(RegExp(r'key=[^&\s"]+'), 'key=***');

  /// Demarre une conversation : reprend une session existante (sessionId) ou
  /// en cree une nouvelle (salutation du tuteur).
  Future<void> start({
    required CefrLevel level,
    String? scenarioId,
    String? sessionId,
  }) async {
    _level = level;
    _scenarioId = scenarioId;

    if (sessionId != null) {
      final session = await _history.getSession(sessionId);
      if (session != null) {
        _sessionId = session.id;
        _sessionTitle = session.title;
        state = ChatState(messages: session.messages);
        return;
      }
    }

    _sessionId = _newId();
    _sessionTitle = _resolveTitle(scenarioId);

    state = ChatState(
      messages: [ConversationMessage.assistant('', id: _newId())],
      isStreaming: true,
    );

    final buffer = StringBuffer();
    try {
      await for (final chunk in _start(level: level, scenarioId: scenarioId)) {
        buffer.write(chunk);
        state = state.copyWith(messages: _updateAssistant(buffer.toString()));
      }
    } catch (e) {
      state = state.copyWith(error: _redact(e.toString()));
    } finally {
      state = state.copyWith(isStreaming: false);
      // Nettoyage defensif : la salutation ne devrait pas contenir de balise.
      final parsed = extractCorrectionTrailer(buffer.toString());
      if (parsed.hasTrailer) {
        state = state.copyWith(
          messages: _updateAssistant(parsed.content.trim()),
        );
      }
      await _persist();
    }
  }

  /// Envoie un message utilisateur et diffuse la reponse.
  Future<void> send(String text) async {
    final trimmed = text.trim();
    if (trimmed.isEmpty || state.isStreaming || _level == null) return;

    final userMsg = ConversationMessage.user(trimmed, id: _newId());
    state = state.copyWith(
      messages: [...state.messages, userMsg],
      isStreaming: true,
      error: null,
    );

    final history = state.messages
        .where((m) => m.role != MessageRole.system)
        .toList();
    final assistantId = _newId();
    state = state.copyWith(
      messages: [
        ...state.messages,
        ConversationMessage.assistant('', id: assistantId),
      ],
    );

    final buffer = StringBuffer();
    try {
      await for (final chunk in _send(
        level: _level!,
        history: history,
        userText: trimmed,
        scenarioId: _scenarioId,
      )) {
        buffer.write(chunk);
        state = state.copyWith(
          messages: _updateAssistantById(assistantId, buffer.toString()),
        );
      }
    } catch (e) {
      state = state.copyWith(error: _redact(e.toString()));
    } finally {
      state = state.copyWith(isStreaming: false);
    }

    // Correction incluse dans la reponse (1 seul appel LLM au total).
    await _extractCorrection(userMsg.id, assistantId, buffer.toString());
    await _persist();
  }

  /// Extrait la balise de correction de la reponse : epure la bulle du
  /// tuteur, attache la correction a la bulle utilisateur et enregistre le
  /// type d'erreur pour le suivi de progression.
  Future<void> _extractCorrection(
    String userMessageId,
    String assistantId,
    String fullText,
  ) async {
    final parsed = extractCorrectionTrailer(fullText);
    if (!parsed.hasTrailer) return;

    final display = parsed.content.trim();
    state = state.copyWith(
      messages: _updateAssistantById(
        assistantId,
        display.isEmpty ? '…' : display,
      ),
    );

    final correction = parsed.correction;
    if (correction != null && (correction.corrected?.isNotEmpty ?? false)) {
      state = state.copyWith(
        messages: [
          for (final m in state.messages)
            if (m.id == userMessageId)
              m.copyWith(correction: correction.corrected)
            else
              m,
        ],
      );
      if (correction.category != null) {
        try {
          await _progress.recordCorrection(correction.category!);
        } catch (_) {
          // La progression ne doit jamais faire echouer la conversation.
        }
      }
    }
  }

  Future<void> _persist() async {
    if (_sessionId == null) return;
    final session = ConversationSession(
      id: _sessionId!,
      title: _sessionTitle,
      scenarioId: _scenarioId ?? '',
      messages: state.messages,
    );
    await _history.saveSession(session);
  }

  List<ConversationMessage> _updateAssistant(String content) {
    final list = [...state.messages];
    final idx = list.lastIndexWhere((m) => m.role == MessageRole.assistant);
    if (idx >= 0) list[idx] = list[idx].copyWith(content: content);
    return list;
  }

  List<ConversationMessage> _updateAssistantById(
    String id,
    String content,
  ) =>
      [
        for (final m in state.messages)
          if (m.id == id) m.copyWith(content: content) else m,
      ];
}
