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

/** Reponse acceptable ? Egalite normalisee ou similarite >= 0.85. */
export function isAnswerCloseEnough(given: string, expected: string): boolean {
  const g = normalizeText(given)
  const e = normalizeText(expected)
  if (!g || !e) return false
  if (g === e) return true
  return stringSimilarity(g, e) >= 0.85
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

/** Score global 0..1. */
export function pronunciationScore(target: string, transcript: string): number {
  const words = scoreWords(target, transcript)
  if (words.length === 0) return 0
  return words.filter((w) => w.matched).length / words.length
}
