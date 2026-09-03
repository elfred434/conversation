import type { DictEntry } from './dictionary'

export interface WordRuleItem {
  word: string
  pos: string
  meaning: string
  rule: string
  examples: string[]
}

export interface WordRuleFamily {
  id: string
  title: string
  hint?: string
  items: WordRuleItem[]
}

export interface WordRuleData {
  meta: { version: number; updated: string; note: string }
  families: WordRuleFamily[]
}

let cache: WordRuleData | null = null

/** Decoupe un exemple "EN | FR" en deux parties. */
export function splitExample(ex: string): { en: string; fr: string } {
  const i = ex.indexOf('|')
  if (i === -1) return { en: ex.trim(), fr: '' }
  return { en: ex.slice(0, i).trim(), fr: ex.slice(i + 1).trim() }
}

/** Mots d'une famille, pour la recherche (word + meaning). */
export function familyMatches(family: WordRuleFamily, q: string): boolean {
  const needle = q.trim().toLowerCase()
  if (!needle) return true
  return (
    family.title.toLowerCase().includes(needle) ||
    family.items.some(
      (it) => it.word.toLowerCase().includes(needle) || it.meaning.toLowerCase().includes(needle),
    )
  )
}

/** Charge public/data/word_rules.json a la demande (1 seul reseau, puis cache memoire).
 *  Le fichier vit dans le depot git : il ne gonfle jamais le bundle du site. */
export async function loadWordRules(basePath = 'data/word_rules.json'): Promise<WordRuleData> {
  if (cache) return cache
  const res = await fetch(basePath)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  cache = (await res.json()) as WordRuleData
  return cache
}

/** Re-check le dictionnaire natif pour l'audio sur le mot d'une famille. */
export type { DictEntry }

// ==================== Quiz de discrimination ====================

export interface WordQuizQuestion {
  familyId: string
  familyTitle: string
  /** Phrase avec ___ a la place du mot. */
  sentence: string
  /** Mot de base attendu (tel qu'affiche dans les options). */
  answer: string
  /** Choix possibles = les mots de la famille (2 a 4). */
  options: string[]
  /** Regle d'usage du bon mot : montree apres chaque reponse. */
  rule: string
  meaning: string
  fullExample: { en: string; fr: string }
}

function shuffle<T>(arr: T[], rng: () => number = Math.random): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Remplace la (flexion du) mot par ___ dans l'exemple ; renvoie null si absent. */
function blankWord(example: string, word: string): { sentence: string; form: string } | null {
  const m = example.match(new RegExp(`\\b${word}(s|es|ed|d|ing|ing|t)?\\b`, 'i'))
  if (!m) return null
  return { sentence: example.replace(m[0], '___'), form: m[0] }
}

/** Construit le pool de questions depuis les familles (donnees reelles du depot). */
export function buildQuizPool(families: WordRuleFamily[]): WordQuizQuestion[] {
  const pool: WordQuizQuestion[] = []
  const seen = new Set<string>()
  for (const fam of families) {
    const options = fam.items.map((it) => it.word.toLowerCase())
    for (const item of fam.items) {
      for (const ex of item.examples) {
        const { en, fr } = splitExample(ex)
        const blanked = blankWord(en, item.word)
        if (!blanked) continue
        const key = blanked.sentence.toLowerCase()
        if (seen.has(key)) continue
        seen.add(key)
        pool.push({
          familyId: fam.id,
          familyTitle: fam.title,
          sentence: blanked.sentence,
          answer: item.word.toLowerCase(),
          options,
          rule: item.rule,
          meaning: item.meaning,
          fullExample: { en, fr },
        })
      }
    }
  }
  return pool
}

/** Prend `count` questions reparties (pas deux fois la meme famille de suite),
 *  puis melange les options. Deterministe via rng injectable (tests). */
export function pickQuizQuestions(
  pool: WordQuizQuestion[],
  count: number,
  rng: () => number = Math.random,
): WordQuizQuestion[] {
  const shuffled = shuffle(pool, rng)
  const picked: WordQuizQuestion[] = []
  for (const q of shuffled) {
    if (picked.length >= count) break
    if (picked.length > 0 && picked[picked.length - 1].familyId === q.familyId) continue
    picked.push(q)
  }
  // si le filtre anti-suite a trop retire, complete avec le reste
  if (picked.length < count) {
    for (const q of shuffled) {
      if (picked.length >= count) break
      if (!picked.includes(q)) picked.push(q)
    }
  }
  return picked.slice(0, count).map((q) => ({ ...q, options: shuffle(q.options, rng) }))
}
