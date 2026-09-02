import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_tts/flutter_tts.dart';

import 'package:english_conversation_app/data/tts/tts_service.dart';
import 'package:english_conversation_app/data/tts/system_tts_service.dart';
import 'package:english_conversation_app/data/tts/sherpa_tts_factory.dart';
import 'package:english_conversation_app/presentation/providers/providers.dart';

/// Moteur TTS "systeme" (flutter_tts) : repli universel.
final systemTtsProvider = Provider<TtsService>((ref) => SystemTtsService(FlutterTts()));

/// Moteur TTS neuronal offline (sherpa-onnx + Piper), voix naturelle.
final sherpaTtsProvider = Provider<SherpaTtsService>((ref) => SherpaTtsService());

/// Haut-parleur unique de l'app : route vers le moteur neuronal si choisi
/// (et disponible), avec repli automatique sur la voix systeme.
final speakerProvider = Provider<TtsService>((ref) {
  final engine =
      ref.watch(settingsNotifierProvider.select((s) => s.ttsEngine));
  final speed =
      ref.watch(settingsNotifierProvider.select((s) => s.ttsSpeed));
  return _Speaker(
    ref.watch(systemTtsProvider),
    ref.watch(sherpaTtsProvider),
    neuralSelected: engine == 'neural',
    defaultSpeed: speed,
  );
});

class _Speaker implements TtsService {
  _Speaker(
    this._system,
    this._neuralService, {
    required bool neuralSelected,
    required double defaultSpeed,
  })  : _neuralSelected = neuralSelected,
        _defaultSpeed = defaultSpeed;

  final TtsService _system;
  final SherpaTtsService _neuralService;
  final bool _neuralSelected;
  final double _defaultSpeed;

  @override
  Future<bool> isReady() async => true;

  @override
  Future<void> speak(String text, {double speed = 1.0}) async {
    final effective = speed == 1.0 ? _defaultSpeed : speed;
    await stop();
    if (_neuralSelected && await _neuralService.isReady()) {
      try {
        await _neuralService.speak(text, speed: effective);
        return;
      } catch (_) {
        // Repli silencieux sur la voix systeme.
      }
    }
    await _system.speak(text, speed: effective);
  }

  @override
  Future<void> stop() async {
    await _system.stop();
    await _neuralService.stop();
  }
}

/// Etat du telechargement du modele neuronal.
class TtsSetupState {
  final bool downloading;
  final double progress;
  final String? error;

  const TtsSetupState({
    this.downloading = false,
    this.progress = 0,
    this.error,
  });

  const TtsSetupState.idle() : this();
}

class TtsSetupNotifier extends StateNotifier<TtsSetupState> {
  TtsSetupNotifier(this._sherpa) : super(const TtsSetupState.idle());

  final SherpaTtsService _sherpa;

  Future<void> download() async {
    if (state.downloading) return;
    state = const TtsSetupState(downloading: true, progress: 0);
    try {
      await _sherpa.downloadModel(
        onProgress: (p) => state = TtsSetupState(downloading: true, progress: p),
      );
      state = const TtsSetupState.idle();
    } catch (e) {
      state = TtsSetupState(error: e.toString());
    }
  }
}

final sherpaSetupProvider =
    StateNotifierProvider<TtsSetupNotifier, TtsSetupState>(
        (ref) => TtsSetupNotifier(ref.watch(sherpaTtsProvider)));

/// Conservé pour compat : acces brut a flutter_tts (non utilise par l'UI,
/// preferer [speakerProvider]).
final flutterTtsProvider = Provider<FlutterTts>((ref) => FlutterTts());
