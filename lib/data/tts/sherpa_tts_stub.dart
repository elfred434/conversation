import 'package:english_conversation_app/data/tts/tts_service.dart';

/// Stub du moteur TTS neuronal pour les plateformes non supportees (web).
class SherpaTtsService implements TtsService {
  SherpaTtsService();

  static bool get platformSupported => false;

  Future<bool> get isModelInstalled => Future.value(false);

  Future<void> downloadModel(
          {void Function(double progress)? onProgress}) async =>
      throw UnsupportedError('TTS neuronal non supporte sur cette plateforme.');

  @override
  Future<bool> isReady() async => false;

  @override
  Future<void> speak(String text, {double speed = 1.0}) async {}

  @override
  Future<void> stop() async {}
}
