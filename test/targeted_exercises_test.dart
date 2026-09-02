import 'package:flutter_test/flutter_test.dart';
import 'package:english_conversation_app/domain/entities/exercise.dart';
import 'package:english_conversation_app/domain/repositories/progress_repository.dart';
import 'package:english_conversation_app/domain/usecases/targeted_exercises.dart';

Exercise _ex(String cat, String id) =>
    Exercise(category: cat, question: 'Q $id', answer: 'A $id');

void main() {
  final bank = [
    _ex('tense', 't1'),
    _ex('article', 'a1'),
    _ex('tense', 't2'),
    _ex('other', 'o1'),
    _ex('article', 'a2'),
    _ex('preposition', 'p1'),
  ];

  test('priorise les categories avec le plus d\'erreurs', () {
    final stats = const ProgressStats(
      total: 4,
      byCategory: {'tense': 3, 'article': 1},
    );
    final out = pickTargetedExercises(bank, stats, count: 6);
    // tense (3 erreurs) d'abord, puis article (1), puis jamais vus.
    expect(out.first.category, 'tense');
    expect(out[1].category, 'tense');
    expect(out[2].category, 'article');
    expect(out[3].category, 'article');
    // Les categories non rencontrees arrivent apres (ordre de la banque).
    expect(out.skip(4).map((e) => e.category), containsAll(['other', 'preposition']));
  });

  test('respecte la limite count', () {
    final stats = const ProgressStats(total: 1, byCategory: {'tense': 1});
    final out = pickTargetedExercises(bank, stats, count: 3);
    expect(out.length, 3);
  });

  test('sans stats : priorise l\'ordre des categories de la banque', () {
    final out = pickTargetedExercises(bank, const ProgressStats(), count: 4);
    expect(out.length, 4);
    // Categories groupees dans l'ordre de la banque : tense, article…
    expect(out.map((e) => e.category).toSet(), containsAll(['tense', 'article']));
    expect(out.first.category, 'tense');
  });

  test('complete en rebouclant si la banque est trop courte', () {
    final small = [_ex('tense', 'only1')];
    final out = pickTargetedExercises(small, const ProgressStats(), count: 5);
    expect(out.length, 5);
  });
}
