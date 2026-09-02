import 'package:flutter_test/flutter_test.dart';
import 'package:english_conversation_app/domain/entities/level.dart';
import 'package:english_conversation_app/domain/utils/correction_trailer.dart';

void main() {
  test('mode correction : instruction de balise presente', () {
    final p = buildSystemPrompt(CefrLevel.b1);
    expect(p, contains(kCorrectionMarker));
    expect(p, contains('"category"'));
    // b1 n'est pas un niveau debutant : l'instruction A1 ne doit pas y etre.
    expect(p.contains('complete beginner (A1)'), isFalse);
  });

  test('mode ecoute : pas de balise, consigne "do NOT correct"', () {
    final p = buildSystemPrompt(CefrLevel.b1, correct: false);
    expect(p.contains(kCorrectionMarker), isFalse);
    expect(p, contains('do NOT correct'));
  });

  test('le niveau est injecte dans le prompt', () {
    expect(buildSystemPrompt(CefrLevel.a1), contains('complete beginner (A1)'));
    expect(buildSystemPrompt(CefrLevel.c2), contains('near-native (C2)'));
  });

  test('le scenario est ajoute au prompt', () {
    final p = buildSystemPrompt(CefrLevel.a2, scenarioPrompt: 'Talk about travel.');
    expect(p, contains('Scenario: Talk about travel.'));
  });
}
