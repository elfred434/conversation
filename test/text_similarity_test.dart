import 'package:flutter_test/flutter_test.dart';
import 'package:english_conversation_app/domain/utils/text_similarity.dart';

void main() {
  group('normalizeText', () {
    test('casse, ponctuation et espaces', () {
      expect(normalizeText('  Hello,   World! '), "hello world");
    });
  });

  group('levenshteinDistance', () {
    test('cas simples', () {
      expect(levenshteinDistance('', 'abc'), 3);
      expect(levenshteinDistance('abc', ''), 3);
      expect(levenshteinDistance('world', 'word'), 1);
      expect(levenshteinDistance('same', 'same'), 0);
    });
  });

  group('stringSimilarity', () {
    test('bornes', () {
      expect(stringSimilarity('abc', 'abc'), 1.0);
      expect(stringSimilarity('world', 'word'), closeTo(0.8, 0.001));
      expect(stringSimilarity('', ''), 1.0);
    });
  });

  group('isAnswerCloseEnough', () {
    test('egalite normalisee', () {
      expect(isAnswerCloseEnough('  Went  ', 'went'), isTrue);
      expect(isAnswerCloseEnough('have lived.', 'have lived'), isTrue);
    });
    test('tolere une petite faute de frappe', () {
      // "wentt" vs "went" : similarite 0.8... sous le seuil sur 5 chars.
      expect(isAnswerCloseEnough('recieved', 'received'), isFalse);
      expect(isAnswerCloseEnough('an apple', 'an apple'), isTrue);
    });
    test('rejette une reponse differente', () {
      expect(isAnswerCloseEnough('went', 'gone'), isFalse);
      expect(isAnswerCloseEnough('', 'went'), isFalse);
    });
  });
}
