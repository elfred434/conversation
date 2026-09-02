import 'package:english_conversation_app/domain/entities/exercise.dart';
import 'package:english_conversation_app/domain/repositories/progress_repository.dart';

/// Construit une file d'exercices ciblant en priorite les categories ou
/// l'utilisateur commet le plus d'erreurs (statistiques de progression).
///
/// Ordre de priorite :
/// 1. categories triees par nombre d'erreurs decroissant ;
/// 2. puis les categories jamais rencontrees (ordre de la banque).
///
/// Si la file est plus courte que [count], on complete en rebouclant sur
/// la banque entiere.
List<Exercise> pickTargetedExercises(
  List<Exercise> bank,
  ProgressStats stats, {
  int count = 10,
}) {
  final byCat = <String, List<Exercise>>{};
  for (final ex in bank) {
    byCat.putIfAbsent(ex.category, () => []).add(ex);
  }

  final sortedStats = stats.byCategory.entries.toList()
    ..sort((a, b) => b.value.compareTo(a.value));
  final seen = sortedStats.map((e) => e.key).toSet();

  final priority = <String>[
    ...sortedStats.map((e) => e.key),
    ...byCat.keys.where((c) => !seen.contains(c)),
  ];

  final queue = <Exercise>[];
  for (final cat in priority) {
    queue.addAll(byCat[cat] ?? const <Exercise>[]);
  }
  if (queue.length < count && bank.isNotEmpty) {
    while (queue.length < count) {
      queue.addAll(bank);
    }
  }
  return queue.take(count).toList();
}
