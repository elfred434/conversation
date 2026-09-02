import 'package:english_conversation_app/config/llm_providers.dart';

/// Reglages de l'application (provider + cle API + URL locale), persistes localement.
class AppSettings {
  final LlmProvider provider;
  final String apiKey;
  final String model;
  final bool autoSpeak;
  final String baseUrl;

  /// Moteur de voix : 'system' (flutter_tts) ou 'neural' (sherpa-onnx offline).
  final String ttsEngine;

  /// Vitesse de lecture (0.7 -> 1.3).
  final double ttsSpeed;

  const AppSettings({
    this.provider = LlmProvider.openai,
    this.apiKey = '',
    this.model = '',
    this.autoSpeak = false,
    this.baseUrl = '',
    this.ttsEngine = 'system',
    this.ttsSpeed = 1.0,
  });

  AppSettings copyWith({
    LlmProvider? provider,
    String? apiKey,
    String? model,
    bool? autoSpeak,
    String? baseUrl,
    String? ttsEngine,
    double? ttsSpeed,
  }) =>
      AppSettings(
        provider: provider ?? this.provider,
        apiKey: apiKey ?? this.apiKey,
        model: model ?? this.model,
        autoSpeak: autoSpeak ?? this.autoSpeak,
        baseUrl: baseUrl ?? this.baseUrl,
        ttsEngine: ttsEngine ?? this.ttsEngine,
        ttsSpeed: ttsSpeed ?? this.ttsSpeed,
      );
}
