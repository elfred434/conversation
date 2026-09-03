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
