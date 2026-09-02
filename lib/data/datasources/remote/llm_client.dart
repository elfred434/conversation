import 'dart:async';
import 'package:english_conversation_app/domain/entities/conversation_message.dart';

/// Abstraction sur un fournisseur LLM externe.
///
/// Les implementations concretes (OpenAI, Gemini, ...) traduisent ce
/// contrat vers l'API correspondante. La couche domaine/data ne depend
/// que de cette interface -> on peut changer de fournisseur sans toucher
/// au reste de l'app.
abstract class LlmClient {
  /// Diffuse la reponse du LLM morceau par morceau (streaming).
  ///
  /// Quand la correction est activee, le system prompt demande au modele
  /// d'ajouter en fin de reponse une balise @@CORRECTION@@{...} ; elle est
  /// extraite par le ChatNotifier (un seul appel LLM par message).
  Stream<String> streamChat({
    required ConversationMessage systemPrompt,
    required List<ConversationMessage> history,
    required ConversationMessage userMessage,
  });
}
