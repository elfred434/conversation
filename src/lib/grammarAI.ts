import type { Settings } from '../types'
import type { GrammarQuestion, GrammarRule } from './grammar'
import { streamChat, NO_KEY_MSG } from './llm'

export { NO_KEY_MSG as GRAMMAR_NO_KEY }

const SYSTEM =
  'You generate English grammar quiz questions for French-speaking learners. ' +
  'Reply with ONLY a strict JSON array — no markdown fences, no commentary, nothing else.'

/** Messages (system + user) pour generer des questions sur une regle donnee. */
export function buildGrammarMessages(
  rule: GrammarRule,
  count: number,
  previous: string[],
): { system: string; user: string } {
  const styleExamples = rule.questions
    .slice(0, 2)
    .map((q) => JSON.stringify({ q: q.q, a: q.a, hint: q.hint ?? '' }))
    .join('\n')
  const examplesLine = rule.examples?.map((e) => `${e.en} (= ${e.fr})`).join(' ; ') ?? ''

  const user =
    `Create ${count} NEW quiz questions to check mastery of this English grammar rule:\n` +
    `Rule: ${rule.title}\n` +
    `Explanation: ${rule.rule}\n` +
    (examplesLine ? `Typical examples: ${examplesLine}\n` : '') +
    `\nStyle to follow (fill-in-the-blank, exactly one ___ per question):\n${styleExamples}\n\n` +
    `Requirements:\n` +
    `- "q": the question sentence, exactly one ___ where the answer goes. Vary the shapes: statements, negative, question, different contexts/subjects.\n` +
    `- "a": ONLY the missing word(s), short.\n` +
    `- "hint": a very short French hint (optional but welcome).\n` +
    `- Difficulty suited to this rule; natural, everyday English.\n` +
    (previous.length > 0
      ? `- Do NOT repeat or trivially reword these existing questions: ${previous.map((p) => `"${p}"`).join('; ')}.\n`
      : '') +
    `\nReturn ONLY the JSON array.`
  return { system: SYSTEM, user }
}

/** Parse tolerant de la reponse : fences, texte autour, items invalides filtres. */
export function parseGrammarQuestions(text: string, min = 4, count = 12): GrammarQuestion[] {
  const cleaned = text.trim().replace(/```(?:json)?/gi, '')
  const start = cleaned.indexOf('[')
  const end = cleaned.lastIndexOf(']')
  if (start === -1 || end === -1 || end <= start) throw new Error('Réponse IA sans tableau JSON')
  let raw: unknown
  try {
    raw = JSON.parse(cleaned.slice(start, end + 1))
  } catch {
    throw new Error('JSON invalide dans la réponse IA')
  }
  if (!Array.isArray(raw)) throw new Error('La réponse IA n’est pas un tableau')

  const out: GrammarQuestion[] = []
  const seen = new Set<string>()
  for (const item of raw) {
    if (typeof item !== 'object' || item === null) continue
    const it = item as Record<string, unknown>
    const q = typeof it.q === 'string' ? it.q.trim() : ''
    const a = typeof it.a === 'string' ? it.a.trim() : ''
    if (!q || !a) continue
    if (q.split('___').length !== 2) continue // exactement un trou
    const key = q.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    const hint = typeof it.hint === 'string' && it.hint.trim() ? it.hint.trim() : undefined
    out.push({ q, a, hint })
    if (out.length >= count) break
  }
  if (out.length < min) throw new Error(`Pas assez de questions valables (${out.length})`)
  return out
}

/** Genere des questions de quiz avec le LLM configure (cascade de la app). */
export async function generateGrammarQuestions(
  settings: Settings,
  rule: GrammarRule,
  count: number,
  previous: string[],
  signal?: AbortSignal,
): Promise<GrammarQuestion[]> {
  const { system, user } = buildGrammarMessages(rule, count, previous)
  const timeout = new AbortController()
  const timer = setTimeout(() => timeout.abort(), 45000)
  const onExternalAbort = (): void => timeout.abort()
  signal?.addEventListener('abort', onExternalAbort)
  try {
    let full = ''
    for await (const chunk of streamChat(settings, system, [{ role: 'user', content: user }], timeout.signal)) {
      full += chunk
    }
    return parseGrammarQuestions(full)
  } finally {
    clearTimeout(timer)
    signal?.removeEventListener('abort', onExternalAbort)
  }
}
