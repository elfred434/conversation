import type { Progress } from '../types'

export interface Exercise {
  category: string
  question: string
  answer: string
  hint?: string
}

export const CATEGORY_LABELS: Record<string, string> = {
  article: 'Articles',
  preposition: 'Prépositions',
  tense: 'Temps verbaux',
  spelling: 'Orthographe',
  word_order: 'Ordre des mots',
  other: 'Divers',
}

/** Banque d'exercices hors-ligne (espace = trou a completer). */
export const EXERCISES: Exercise[] = [
  { category: 'article', question: '___ apple a day keeps the doctor away.', answer: 'An', hint: 'Devant un son voyelle, on utilise "an".' },
  { category: 'article', question: 'She is ___ best student in the class.', answer: 'the', hint: 'Superlatif => article défini "the".' },
  { category: 'article', question: 'I bought ___ umbrella for the rain.', answer: 'an' },
  { category: 'article', question: 'He plays ___ piano every evening.', answer: 'the', hint: 'Les instruments de musique prennent "the".' },
  { category: 'preposition', question: "I'm looking forward ___ meeting you.", answer: 'to', hint: 'Expression figée : "look forward to + -ing".' },
  { category: 'preposition', question: 'She arrived ___ the airport at six.', answer: 'at' },
  { category: 'preposition', question: 'He is really good ___ mathematics.', answer: 'at', hint: '"be good at something".' },
  { category: 'preposition', question: 'We usually meet ___ Mondays.', answer: 'on', hint: 'Les jours de la semaine prennent "on".' },
  { category: 'tense', question: 'Yesterday, she ___ (go) to the market.', answer: 'went', hint: '"Yesterday" => prétérit.' },
  { category: 'tense', question: 'I ___ (live) here since 2019.', answer: 'have lived', hint: '"Since" + action qui continue => present perfect.' },
  { category: 'tense', question: 'Look! It ___ (rain) right now.', answer: 'is raining', hint: 'Action en cours => présent progressif.' },
  { category: 'tense', question: 'When I arrived, they ___ (already / eat).', answer: 'had already eaten', hint: 'Antériorité au passé => past perfect.' },
  { category: 'spelling', question: 'I recieved your letter this morning. (mot mal orthographié ?)', answer: 'received', hint: '"i" avant "e" sauf après "c".' },
  { category: 'spelling', question: 'We will definately come to the party. (mot mal orthographié ?)', answer: 'definitely' },
  { category: 'spelling', question: "It's a beautifull city. (mot mal orthographié ?)", answer: 'beautiful' },
  { category: 'spelling', question: 'I beleive you. (mot mal orthographié ?)', answer: 'believe', hint: '"i" avant "e" sauf après "c".' },
  { category: 'word_order', question: 'She speaks fluently English. (remets la phrase en ordre)', answer: 'She speaks English fluently.' },
  { category: 'word_order', question: 'I like very much this movie. (remets la phrase en ordre)', answer: 'I like this movie very much.' },
  { category: 'word_order', question: 'He always is late. (remets la phrase en ordre)', answer: 'He is always late.', hint: 'L\'adverbe vient APRÈS le verbe "be".' },
  { category: 'word_order', question: 'They go never to the cinema. (remets la phrase en ordre)', answer: 'They never go to the cinema.' },
  { category: 'other', question: 'I have 25 years old. (corrige la phrase)', answer: 'I am 25 years old.', hint: "En anglais, on « être » un âge, on ne l'a pas." },
  { category: 'other', question: 'Can you borrow me your pen? (corrige la phrase)', answer: 'Can you lend me your pen?', hint: 'borrow = prendre ; lend = donner.' },
  { category: 'other', question: 'I said him the truth. (corrige la phrase)', answer: 'I told him the truth.' },
  { category: 'other', question: 'Everybody were happy yesterday. (corrige la phrase)', answer: 'Everybody was happy yesterday.', hint: '"Everybody" est singulier.' },
]

/** Priorise les categories ou l'utilisateur fait le plus d'erreurs. */
export function pickTargetedExercises(bank: Exercise[], stats: Progress, count = 10): Exercise[] {
  const byCat = new Map<string, Exercise[]>()
  for (const ex of bank) {
    const list = byCat.get(ex.category) ?? []
    list.push(ex)
    byCat.set(ex.category, list)
  }
  const sorted = Object.entries(stats.byCategory).sort((a, b) => b[1] - a[1])
  const seen = new Set(sorted.map(([c]) => c))
  const priority = [...sorted.map(([c]) => c), ...[...byCat.keys()].filter((c) => !seen.has(c))]

  const queue: Exercise[] = []
  for (const cat of priority) queue.push(...(byCat.get(cat) ?? []))
  while (queue.length < count && bank.length > 0) queue.push(...bank)
  return queue.slice(0, count)
}
