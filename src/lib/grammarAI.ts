import type { Settings } from '../types'
import type { GrammarQuestion, GrammarRule } from './grammar'
import { streamChat, NO_KEY_MSG } from './llm'

export { NO_KEY_MSG as GRAMMAR_NO_KEY }

const SYSTEM =
  'You generate English grammar quiz questions for French-speaking learners. ' +
  'Reply with ONLY a strict JSON array — no markdown fences, no commentary, nothing else.'

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Masque la reponse dans la phrase complete -> question avec exactement un ___ .
 * Retourne null si la phrase est inutilisable : sans le mot, mot present 2 fois
 * (trou ambigue), phrase trop courte/longue, ou trou deja present.
 * C'est la garde-fou principal : l'IA ne place plus le trou elle-meme, donc elle
 * ne peut plus produire de phrase cassee du genre "The are ___ playing".
 */
export function maskAnswer(full: string, a: string): string | null {
  const sentence = full.replace(/\s+/g, ' ').trim()
  const answer = a.replace(/\s+/g, ' ').trim()
  if (!sentence || !answer) return null
  if (sentence.includes('___')) return null
  const words = sentence.split(' ').length
  if (words < 4 || words > 30) return null
  const re = new RegExp(`\\b${escapeRegExp(answer)}\\b`, 'gi')
  const hits = sentence.match(re)
  if (!hits || hits.length !== 1) return null // mot absent ou ambigue
  return sentence.replace(re, '___')
}

/** Messages (system + user) pour generer des questions sur une regle donnee. */
export function buildGrammarMessages(
  rule: GrammarRule,
  count: number,
  previous: string[],
): { system: string; user: string } {
  // Le style montre des phrases COMPLETES : c'est l'app qui cachera le mot.
  const styleExamples = rule.questions
    .slice(0, 2)
    .map((q) => JSON.stringify({ full: q.q.replace('___', q.a), a: q.a, hint: q.hint ?? '' }))
    .join('\n')
  const examplesLine = rule.examples?.map((e) => `${e.en} (= ${e.fr})`).join(' ; ') ?? ''

  const user =
    `Create ${count} NEW quiz questions to check mastery of this English grammar rule:\n` +
    `Rule: ${rule.title}\n` +
    `Explanation: ${rule.rule}\n` +
    (examplesLine ? `Typical examples: ${examplesLine}\n` : '') +
    `\nEach question is a COMPLETE, correct English sentence containing the answer:\n${styleExamples}\n\n` +
    `Requirements:\n` +
    `- "full": one natural, correct English sentence that contains the word "a" EXACTLY ONCE. Never write ___, never omit the answer, never scramble the word order.\n` +
    `- "a": the key word(s) tested by the rule (short).\n` +
    `- The app hides "a" inside "full" to build the blank: a broken, incomplete or answer-less sentence = an unusable question.\n` +
    `- Vary the shapes: statements, negative, question, different contexts and subjects.\n` +
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
    const a = typeof it.a === 'string' ? it.a.trim() : ''
    if (!a) continue
    const hint = typeof it.hint === 'string' && it.hint.trim() ? it.hint.trim() : undefined
    let q = ''
    if (typeof it.full === 'string' && it.full.trim()) {
      // Format attendu : phrase complete -> on masque le mot nous-memes.
      const masked = maskAnswer(it.full, a)
      if (!masked) continue // phrase sans le mot, ambigue ou bancale
      q = masked
    } else if (typeof it.q === 'string') {
      // Tolerance : ancien format avec un trou place par le modele.
      q = it.q.trim()
      if (q.split('___').length !== 2) continue // exactement un trou
    } else {
      continue
    }
    const key = q.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
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
