import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:english_conversation_app/domain/entities/exercise.dart';
import 'package:english_conversation_app/domain/utils/text_similarity.dart';
import 'package:english_conversation_app/presentation/providers/providers.dart';

/// Libelles francais des categories d'erreur.
const Map<String, String> kCategoryLabels = {
  'article': 'Articles',
  'preposition': 'Prépositions',
  'tense': 'Temps verbaux',
  'spelling': 'Orthographe',
  'word_order': 'Ordre des mots',
  'other': 'Divers',
};

/// Ecran d'exercices cibles : priorise les categories ou l'utilisateur fait
/// le plus d'erreurs (suivi dans « Ma progression »). 100% hors-ligne.
class ExercisesScreen extends ConsumerStatefulWidget {
  const ExercisesScreen({super.key});

  @override
  ConsumerState<ExercisesScreen> createState() => _ExercisesScreenState();
}

class _ExercisesScreenState extends ConsumerState<ExercisesScreen> {
  int _index = 0;
  int _score = 0;
  bool _checked = false;
  bool _wasCorrect = false;
  final _ctrl = TextEditingController();

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  void _check(List<Exercise> list) {
    final current = list[_index];
    final ok = isAnswerCloseEnough(_ctrl.text, current.answer);
    setState(() {
      _checked = true;
      _wasCorrect = ok;
      if (ok) _score++;
    });
  }

  void _next(List<Exercise> list) {
    setState(() {
      _index++;
      _checked = false;
      _wasCorrect = false;
      _ctrl.clear();
    });
  }

  void _restart() {
    setState(() {
      _index = 0;
      _score = 0;
      _checked = false;
      _wasCorrect = false;
      _ctrl.clear();
    });
  }

  @override
  Widget build(BuildContext context) {
    final async = ref.watch(targetedExercisesProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Exercices ciblés')),
      body: async.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => const Center(child: Text('Erreur de chargement.')),
        data: (list) {
          if (list.isEmpty) {
            return const Center(child: Text('Aucun exercice disponible.'));
          }
          if (_index >= list.length) {
            return _buildSummary(context, list.length);
          }
          return _buildExercise(context, list);
        },
      ),
    );
  }

  Widget _buildSummary(BuildContext context, int total) {
    final pct = total == 0 ? 0 : (_score * 100 / total).round();
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text('Terminé !', style: Theme.of(context).textTheme.headlineSmall),
            const SizedBox(height: 12),
            Text(
              '$_score / $total  ($pct%)',
              style:
                  const TextStyle(fontSize: 32, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Text(
              pct >= 80
                  ? 'Excellent, continue comme ça ! 🎉'
                  : pct >= 50
                      ? 'Bien ! Encore un petit effort. 💪'
                      : 'Chaque erreur corrigée te fait progresser. 🌱',
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            FilledButton.icon(
              onPressed: _restart,
              icon: const Icon(Icons.refresh),
              label: const Text('Recommencer'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildExercise(BuildContext context, List<Exercise> list) {
    final exercise = list[_index];
    final total = list.length;
    final label = kCategoryLabels[exercise.category] ?? exercise.category;
    final isLast = _index + 1 >= total;
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        LinearProgressIndicator(value: _index / total),
        const SizedBox(height: 8),
        Text('Question ${_index + 1} / $total · Score : $_score',
            style: Theme.of(context).textTheme.bodySmall),
        const SizedBox(height: 16),
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Chip(
                  label: Text(label),
                  avatar: const Icon(Icons.track_changes, size: 18),
                ),
                const SizedBox(height: 12),
                Text(
                  exercise.question,
                  style: const TextStyle(fontSize: 20, height: 1.4),
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: _ctrl,
                  enabled: !_checked,
                  decoration: const InputDecoration(
                    labelText: 'Ta réponse',
                    border: OutlineInputBorder(),
                  ),
                  onSubmitted: (_) =>
                      _checked ? _next(list) : _check(list),
                ),
                const SizedBox(height: 12),
                if (_checked) ...[
                  Text(
                    _wasCorrect ? '✅ Bravo, c\'est correct !' : '❌ Pas tout à fait.',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      color: _wasCorrect ? Colors.green : Colors.red,
                    ),
                  ),
                  if (!_wasCorrect) ...[
                    const SizedBox(height: 6),
                    Text(
                      'Bonne réponse : ${exercise.answer}',
                      style: const TextStyle(
                          fontSize: 16, fontWeight: FontWeight.w600),
                    ),
                    if (exercise.hint != null) ...[
                      const SizedBox(height: 4),
                      Text(
                        '💡 ${exercise.hint}',
                        style: const TextStyle(
                            fontSize: 14, fontStyle: FontStyle.italic),
                      ),
                    ],
                  ],
                  const SizedBox(height: 12),
                  FilledButton.icon(
                    onPressed: () => _next(list),
                    icon: const Icon(Icons.arrow_forward),
                    label: Text(isLast ? 'Voir le résultat' : 'Suivant'),
                  ),
                ] else
                  FilledButton.icon(
                    onPressed: _ctrl.text.trim().isEmpty
                        ? null
                        : () => _check(list),
                    icon: const Icon(Icons.check),
                    label: const Text('Vérifier'),
                  ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
