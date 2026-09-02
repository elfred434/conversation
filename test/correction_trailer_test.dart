import 'package:flutter_test/flutter_test.dart';
import 'package:english_conversation_app/domain/utils/correction_trailer.dart';

void main() {
  test('aucune balise -> texte intact, pas de correction', () {
    final r = extractCorrectionTrailer('Great job! Tell me more.');
    expect(r.hasTrailer, isFalse);
    expect(r.content, 'Great job! Tell me more.');
    expect(r.correction, isNull);
  });

  test('balise complete -> texte epure + correction', () {
    const reply = 'Good try! '
        '@@CORRECTION@@{"corrected":"I went to school yesterday",'
        '"category":"tense","explanation":"Use past tense"}';
    final r = extractCorrectionTrailer(reply);
    expect(r.hasTrailer, isTrue);
    expect(r.content, 'Good try!');
    expect(r.correction?.corrected, 'I went to school yesterday');
    expect(r.correction?.category, 'tense');
    expect(r.correction?.explanation, 'Use past tense');
  });

  test('categorie inconnue -> other', () {
    const reply =
        'Nice! @@CORRECTION@@{"corrected":"Hello","category":"weird_cat","explanation":""}';
    final r = extractCorrectionTrailer(reply);
    expect(r.correction?.category, 'other');
  });

  test('balise avec fence markdown -> quand meme parsee', () {
    const reply = 'Almost!\n@@CORRECTION@@\n```json\n'
        '{"corrected":"an apple","category":"article","explanation":""}\n```';
    final r = extractCorrectionTrailer(reply);
    expect(r.hasTrailer, isTrue);
    expect(r.content, 'Almost!');
    expect(r.correction?.corrected, 'an apple');
    expect(r.correction?.category, 'article');
  });

  test('JSON casse -> balise retiree, correction nulle', () {
    const reply = 'Hmm @@CORRECTION@@{"corrected": broken';
    final r = extractCorrectionTrailer(reply);
    expect(r.hasTrailer, isTrue);
    expect(r.correction, isNull);
  });

  test('corrected vide -> correction nulle (pas de faute)', () {
    const reply =
        'Perfect! @@CORRECTION@@{"corrected":"","category":"other","explanation":""}';
    final r = extractCorrectionTrailer(reply);
    expect(r.hasTrailer, isTrue);
    expect(r.correction, isNull);
  });
}
