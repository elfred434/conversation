/** Normalise une phrase pour comparaison. */
export function normalizeText(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9' ]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Distance de Levenshtein. */
export function levenshteinDistance(a: string, b: string): number {
  const m = a.length
  const n = b.length
  if (m === 0) return n
  if (n === 0) return m
  let prev = Array.from({ length: n + 1 }, (_, i) => i)
  let curr = new Array<number>(n + 1).fill(0)
  for (let i = 1; i <= m; i++) {
    curr[0] = i
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost)
    }
    const tmp = prev
    prev = curr
    curr = tmp
  }
  return prev[n]
}

/** Similarite 0..1. */
export function stringSimilarity(a: string, b: string): number {
  if (a === b) return 1
  const maxLen = Math.max(a.length, b.length)
  if (maxLen === 0) return 1
  return 1 - levenshteinDistance(a, b) / maxLen
}

/** Reponse acceptable ?
 * Egalite normalisee (casse, ponctuation, espaces ignores).
 * La tolerance aux fautes de frappe est volontairement TRES limitee :
 *  - reponse en un seul mot : une seule lettre de difference, et uniquement si
 *    le mot attendu fait au moins 6 lettres ;
 *  - reponse en plusieurs mots : aucune tolerance, car une seule lettre y porte
 *    souvent tout le sens grammatical (has/had, has/have, was/were, told/said...). */
export function isAnswerCloseEnough(given: string, expected: string): boolean {
  const g = normalizeText(given)
  const e = normalizeText(expected)
  if (!g || !e) return false
  if (g === e) return true
  if (e.includes(' ')) return false
  return e.length >= 6 && levenshteinDistance(g, e) === 1
}

/** La reponse saisie n'est-elle que la faute recopiee depuis l'enonce ?
 * Utilise pour bloquer le « recopier la faute » dans les exercices
 * d'orthographe / d'ordre des mots / de correction de phrase.
 * Un mot est compare mot a mot (« beautiful » n'est pas « beautifull »),
 * une phrase est comparee en bloc. */
export function isCopiedFromQuestion(given: string, question: string): boolean {
  const g = normalizeText(given)
  if (!g) return false
  const q = normalizeText(question)
  if (g.includes(' ')) return q.includes(g)
  return q.split(' ').includes(g)
}

export interface WordScore {
  word: string
  matched: boolean
}

/** Compare la cible et la transcription mot a mot. */
export function scoreWords(target: string, transcript: string): WordScore[] {
  const tWords = normalizeText(target)
    .split(' ')
    .filter((w) => w)
  const uWords = normalizeText(transcript)
    .split(' ')
    .filter((w) => w)
  return tWords.map((tw) => ({
    word: tw,
    matched: uWords.some((uw) => stringSimilarity(tw, uw) >= 0.8),
  }))
}

/** Plus longue sous-sequence commune entre deux listes de mots (question d'ordre). */
function lcsLen(a: string[], b: string[]): number {
  const m = a.length
  const n = b.length
  if (m === 0 || n === 0) return 0
  let prev = new Array<number>(n + 1).fill(0)
  let curr = new Array<number>(n + 1).fill(0)
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      curr[j] = a[i - 1] === b[j - 1] ? prev[j - 1] + 1 : Math.max(prev[j], curr[j - 1])
    }
    const tmp = prev
    prev = curr
    curr = new Array<number>(n + 1).fill(0)
  }
  return prev[n]
}

/** Score global 0..1 : mots entendus ET remis dans le bon ordre.
 * Dire tous les mots mais dans le desordre ne rapporte presque rien. */
export function pronunciationScore(target: string, transcript: string): number {
  const words = scoreWords(target, transcript)
  if (words.length === 0) return 0
  const uWords = normalizeText(transcript)
    .split(' ')
    .filter((w) => w)
  const matchedSeq = words.filter((w) => w.matched).map((w) => w.word)
  if (matchedSeq.length === 0) return 0
  const heard = words.filter((w) => w.matched).length / words.length
  const inOrder = lcsLen(matchedSeq, uWords) / matchedSeq.length
  return heard * inOrder
}

/** 0..1 — part des mots entendus qui sont aussi dans le bon ordre.
 * (1 = ordre parfait ; utile pour expliquer un score bas malgre des mots verts.) */
export function wordOrderRatio(target: string, transcript: string): number {
  const words = scoreWords(target, transcript).filter((w) => w.matched)
  if (words.length === 0) return 0
  const uWords = normalizeText(transcript)
    .split(' ')
    .filter((w) => w)
  return lcsLen(words.map((w) => w.word), uWords) / words.length
}

export interface WordDiff {
  before: string
  wrong: string
  right: string
  after: string
}

/** Diff minimal entre la phrase brute et sa correction : si un seul mot change,
 * renvoie le contexte pour la pilule "mot barre -> correction", sinon null. */
export function wordDiffLabel(raw: string, corrected: string): WordDiff | null {
  const norm = (w: string): string => w.toLowerCase().replace(/[^a-zà-öø-ÿ'’-]/gi, '')
  const a = raw.trim().split(/\s+/)
  const b = corrected.trim().split(/\s+/)
  if (a.length !== b.length || a.length < 2) return null
  const diffs: number[] = []
  for (let i = 0; i < a.length; i++) if (norm(a[i]) !== norm(b[i])) diffs.push(i)
  if (diffs.length !== 1) return null
  const i = diffs[0]
  return {
    before: a.slice(0, i).join(' '),
    wrong: a[i],
    right: b[i],
    after: a.slice(i + 1).join(' '),
  }
}
