/// Exercice de remblissage (fill-in-the-blank) cible sur un type d'erreur.
///
/// [category] utilise les memes valeurs que CorrectionResult.category :
/// article, preposition, tense, spelling, word_order, other.
class Exercise {
  final String category;
  final String question;

  /// Reponse attendue (comparaison normalisee, tolere une petite faute).
  final String answer;

  /// Astuce optionnelle affichee apres un echec.
  final String? hint;

  const Exercise({
    required this.category,
    required this.question,
    required this.answer,
    this.hint,
  });
}

/// Banque d'exercices hors-ligne (aucun reseau requis), organisee par
/// categorie d'erreur. Espace = trou a completer.
const List<Exercise> kExercises = [
  // --- Articles ---
  Exercise(
    category: 'article',
    question: '___ apple a day keeps the doctor away.',
    answer: 'An',
    hint: 'Devant un son voyelle, on utilise "an".',
  ),
  Exercise(
    category: 'article',
    question: 'She is ___ best student in the class.',
    answer: 'the',
    hint: 'Superlatif => article défini "the".',
  ),
  Exercise(
    category: 'article',
    question: 'I bought ___ umbrella for the rain.',
    answer: 'an',
  ),
  Exercise(
    category: 'article',
    question: 'He plays ___ piano every evening.',
    answer: 'the',
    hint: 'Les instruments de musique prennent "the" en anglais.',
  ),

  // --- Prépositions ---
  Exercise(
    category: 'preposition',
    question: "I'm looking forward ___ meeting you.",
    answer: 'to',
    hint: 'Expression figée : "look forward to + -ing".',
  ),
  Exercise(
    category: 'preposition',
    question: 'She arrived ___ the airport at six.',
    answer: 'at',
  ),
  Exercise(
    category: 'preposition',
    question: 'He is really good ___ mathematics.',
    answer: 'at',
    hint: '"be good at something".',
  ),
  Exercise(
    category: 'preposition',
    question: 'We usually meet ___ Mondays.',
    answer: 'on',
    hint: 'Les jours de la semaine prennent "on".',
  ),

  // --- Temps verbaux ---
  Exercise(
    category: 'tense',
    question: 'Yesterday, she ___ (go) to the market.',
    answer: 'went',
    hint: '"Yesterday" => prétérit.',
  ),
  Exercise(
    category: 'tense',
    question: 'I ___ (live) here since 2019.',
    answer: 'have lived',
    hint: '"Since" + action qui continue => present perfect.',
  ),
  Exercise(
    category: 'tense',
    question: 'Look! It ___ (rain) right now.',
    answer: 'is raining',
    hint: 'Action en cours => présent progressif.',
  ),
  Exercise(
    category: 'tense',
    question: 'When I arrived, they ___ (already / eat).',
    answer: 'had already eaten',
    hint: 'Antériorité au passé => past perfect.',
  ),

  // --- Orthographe ---
  Exercise(
    category: 'spelling',
    question: 'I recieved your letter this morning. (mot mal orthographié ?)',
    answer: 'received',
    hint: '"i" avant "e" sauf après "c" : re-C-EI-ved.',
  ),
  Exercise(
    category: 'spelling',
    question: 'We will definately come to the party. (mot mal orthographié ?)',
    answer: 'definitely',
  ),
  Exercise(
    category: 'spelling',
    question: "It's a beautifull city. (mot mal orthographié ?)",
    answer: 'beautiful',
  ),
  Exercise(
    category: 'spelling',
    question: 'I beleive you. (mot mal orthographié ?)',
    answer: 'believe',
    hint: '"i" avant "e" sauf après "c".',
  ),

  // --- Ordre des mots ---
  Exercise(
    category: 'word_order',
    question: 'She speaks fluently English. (remets la phrase en ordre)',
    answer: 'She speaks English fluently.',
  ),
  Exercise(
    category: 'word_order',
    question: 'I like very much this movie. (remets la phrase en ordre)',
    answer: 'I like this movie very much.',
  ),
  Exercise(
    category: 'word_order',
    question: 'He always is late. (remets la phrase en ordre)',
    answer: 'He is always late.',
    hint: 'L\'adverbe vient APRÈS le verbe "be".',
  ),
  Exercise(
    category: 'word_order',
    question: 'They go never to the cinema. (remets la phrase en ordre)',
    answer: 'They never go to the cinema.',
  ),

  // --- Divers (calques / usages) ---
  Exercise(
    category: 'other',
    question: 'I have 25 years old. (corrige la phrase)',
    answer: 'I am 25 years old.',
    hint: 'En anglais, on "être" un âge, on ne l\'a pas.',
  ),
  Exercise(
    category: 'other',
    question: 'Can you borrow me your pen? (corrige la phrase)',
    answer: 'Can you lend me your pen?',
    hint: 'borrow = prendre ; lend = donner.',
  ),
  Exercise(
    category: 'other',
    question: 'I said him the truth. (corrige la phrase)',
    answer: 'I told him the truth.',
  ),
  Exercise(
    category: 'other',
    question: 'Everybody were happy yesterday. (corrige la phrase)',
    answer: 'Everybody was happy yesterday.',
    hint: '"Everybody" est singulier.',
  ),
];
