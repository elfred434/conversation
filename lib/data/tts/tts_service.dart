/// Interface commune des moteurs de synthese vocale.
abstract class TtsService {
  /// Le moteur est-il operationnel (modele installe, etc.) ?
  Future<bool> isReady();

  /// Lit [text] a voix haute. [speed] : 1.0 = vitesse normale.
  Future<void> speak(String text, {double speed = 1.0});

  /// Interrompt la lecture en cours.
  Future<void> stop();
}
