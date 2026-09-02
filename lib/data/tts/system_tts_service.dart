import 'package:flutter_tts/flutter_tts.dart';
import 'package:english_conversation_app/data/tts/tts_service.dart';

/// Moteur TTS "systeme" (flutter_tts) : marche partout, mais la voix
/// Windows (SAPI 5) est robotique. Sert de repli par defaut.
class SystemTtsService implements TtsService {
  SystemTtsService(this._tts);

  final FlutterTts _tts;

  @override
  Future<bool> isReady() async => true;

  @override
  Future<void> speak(String text, {double speed = 1.0}) async {
    await _tts.setLanguage('en-US');
    // flutter_tts : 0.5 ~ debit normal sur la plupart des plateformes.
    await _tts.setSpeechRate((0.45 * speed).clamp(0.05, 1.0));
    await _tts.speak(text);
  }

  @override
  Future<void> stop() => _tts.stop();
}
