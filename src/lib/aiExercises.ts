import type { Progress, Settings } from '../types'
import type { Exercise } from './exercises'
import { streamChat, PROVIDERS } from './llm'
import { LEVELS } from './prompts'
import type { CefrLevel } from '../types'

const KNOWN_CATEGORIES = new Set(['article', 'preposition', 'tense', 'spelling', 'word_order', 'other'])

const SYSTEM =
  'You generate English grammar exercises for French-speaking learners. ' +
  'Reply with ONLY a strict JSON array — no markdown fences, no commentary, nothing else.'

/** Construit les messages (system + user) demandant des exercices cibles a l'IA. */
export function buildExerciseMessages(
  level: CefrLevel,
  stats: Progress,
  count: number,
  previous: string[],
): { system: string; user: string } {
  const statLine =
    Object.entries(stats.byCategory).length > 0
      ? Object.entries(stats.byCategory)
          .sort((a, b) => b[1] - a[1])
          .map(([c, n]) => `${c}: ${n}`)
          .join(', ')
      : 'none yet'

  const user =
    `Generate ${count} short English exercises targeting the learner's most frequent mistake categories.\n` +
    `Learner CEFR level: ${LEVELS[level].label}.\n` +
    `Mistake statistics (category: count): ${statLine}. Weight the exercises toward the biggest mistakes first; ` +
    `if there are no stats yet, spread evenly across: article, preposition, tense, spelling, word_order, other.\n\n` +
    `Each JSON item must have exactly:\n` +
    `- "category": one of article | preposition | tense | spelling | word_order | other\n` +
    `- "question": the exercise text in English. Use ___ as the blank to fill for article/preposition/tense. ` +
    `For spelling: a sentence containing exactly ONE misspelled word followed by " (mot mal orthographié ?)". ` +
    `For word_order: a scrambled sentence followed by " (remets la phrase en ordre)". ` +
    `For other: an incorrect sentence followed by " (corrige la phrase)".\n` +
    `- "answer": the expected answer (only the missing word(s) for blanks; the full corrected sentence for spelling/word_order/other).\n` +
    `- "hint": a very short explanation in French (optional).\n\n` +
    `Adapt difficulty to the level, keep each exercise short. Do NOT repeat these previous exercises: ` +
    `${previous.length > 0 ? previous.map((q) => `"${q}"`).join('; ') : '(none)'}.\n` +
    `Return ONLY the JSON array.`

  return { system: SYSTEM, user }
}

/** Extrait et valide le tableau d'exercices d'une reponse LLM (tolerant aux fences et bavardages). */
export function parseExercises(text: string, count = 10): Exercise[] {
  let cleaned = text.trim()
  cleaned = cleaned.replace(/```(?:json)?/gi, '')
  const start = cleaned.indexOf('[')
  const end = cleaned.lastIndexOf(']')
  if (start === -1 || end === -1 || end <= start) {
    throw new Error('Reponse IA sans tableau JSON')
  }
  let raw: unknown
  try {
    raw = JSON.parse(cleaned.slice(start, end + 1))
  } catch {
    throw new Error('JSON invalide dans la reponse IA')
  }
  if (!Array.isArray(raw)) throw new Error('La reponse IA n est pas un tableau')

  const out: Exercise[] = []
  const seen = new Set<string>()
  for (const item of raw) {
    if (typeof item !== 'object' || item === null) continue
    const it = item as Record<string, unknown>
    const question = typeof it.question === 'string' ? it.question.trim() : ''
    const answer = typeof it.answer === 'string' ? it.answer.trim() : ''
    if (!question || !answer) continue
    const key = question.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    const category =
      typeof it.category === 'string' && KNOWN_CATEGORIES.has(it.category) ? it.category : 'other'
    const hint = typeof it.hint === 'string' && it.hint.trim() ? it.hint.trim() : undefined
    out.push({ category, question, answer, hint })
    if (out.length >= count) break
  }
  if (out.length === 0) throw new Error('Aucun exercice exploitable dans la reponse IA')
  return out
}

/**
 * Genere des exercices cibles avec le LLM configure (1 appel, JSON en fin de flux).
 * Jette NO_KEY si le fournisseur exige une cle absente ; sinon les erreurs reseau remontent.
 */
export async function generateExercises(
  settings: Settings,
  level: CefrLevel,
  stats: Progress,
  count: number,
  previous: string[],
  signal?: AbortSignal,
): Promise<Exercise[]> {
  if (PROVIDERS[settings.provider].needsKey && !settings.apiKey.trim()) {
    throw new Error('NO_KEY')
  }
  const { system, user } = buildExerciseMessages(level, stats, count, previous)

  // Garde-fou : la generation JSON ne devrait jamais depasser 45 s.
  const timeout = new AbortController()
  const timer = setTimeout(() => timeout.abort(), 45000)
  const onExternalAbort = (): void => timeout.abort()
  signal?.addEventListener('abort', onExternalAbort)

  try {
    let full = ''
    for await (const chunk of streamChat(settings, system, [{ role: 'user', content: user }], timeout.signal)) {
      full += chunk
    }
    return parseExercises(full, count)
  } finally {
    clearTimeout(timer)
    signal?.removeEventListener('abort', onExternalAbort)
  }
}
