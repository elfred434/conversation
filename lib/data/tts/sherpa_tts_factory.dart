/// Selectionne l'implementation du moteur TTS neuronal selon la plateforme :
/// vraie implementation (dart:io) sur desktop/mobile, stub sur le web.
export 'sherpa_tts_io.dart' if (dart.library.js) 'sherpa_tts_stub.dart';
