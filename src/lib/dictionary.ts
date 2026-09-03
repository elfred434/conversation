/** Dictionnaire gratuit sans cle : dictionaryapi.dev (CORS ouvert).
 *  Fournit la phonetique IPA, l'audio NATIF (enregistrements reels) et des definitions. */

export interface DictSense {
  pos: string
  def: string
  example?: string
}

export interface DictEntry {
  word: string
  /** Phonétique IPA, ex : /həˈloʊ/ — vide si inconnue. */
  phonetic: string
  /** URL d'un enregistrement audio reel (mp3) — vide si absent. */
  audio: string
  defs: DictSense[]
}

interface RawPhonetic {
  text?: unknown
  audio?: unknown
}
interface RawDefinition {
  definition?: unknown
  example?: unknown
}
interface RawMeaning {
  partOfSpeech?: unknown
  definitions?: RawDefinition[]
}
interface RawEntry {
  word?: unknown
  phonetic?: unknown
  phonetics?: RawPhonetic[]
  meanings?: RawMeaning[]
}

/** Parse tolerante de la reponse dictionaryapi.dev (pure — testable sans reseau). */
export function parseDictionary(payload: unknown): DictEntry | null {
  if (!Array.isArray(payload) || payload.length === 0) return null
  let phonetic = ''
  let audio = ''
  const defs: DictSense[] = []

  for (const rawEntry of payload as RawEntry[]) {
    if (typeof rawEntry !== 'object' || rawEntry === null) continue
    if (!phonetic && typeof rawEntry.phonetic === 'string' && rawEntry.phonetic) phonetic = rawEntry.phonetic
    for (const p of rawEntry.phonetics ?? []) {
      if (!phonetic && typeof p?.text === 'string' && p.text) phonetic = p.text
      if (!audio && typeof p?.audio === 'string' && p.audio) audio = p.audio
    }
    for (const m of rawEntry.meanings ?? []) {
      const pos = typeof m?.partOfSpeech === 'string' ? m.partOfSpeech : ''
      for (const d of (m?.definitions ?? []).slice(0, 2)) {
        if (typeof d?.definition === 'string' && d.definition && defs.length < 3) {
          defs.push({
            pos,
            def: d.definition,
            example: typeof d.example === 'string' && d.example ? d.example : undefined,
          })
        }
      }
    }
  }
  if (!phonetic && !audio && defs.length === 0) return null
  const first = (payload as RawEntry[])[0]
  const word = typeof first?.word === 'string' ? first.word : ''
  return { word, phonetic, audio, defs }
}

/** Recherche un mot dans le dictionnaire gratuit. Renvoie null si absent/erreur reseau. */
export async function lookupWord(word: string, signal?: AbortSignal): Promise<DictEntry | null> {
  const w = word.trim()
  if (!w) return null
  try {
    const res = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(w)}`,
      { signal },
    )
    if (!res.ok) return null
    return parseDictionary(await res.json())
  } catch {
    return null
  }
}

/** Mots "interessants" d'une phrase (hors mots outils), les plus longs d'abord. */
const STOPWORDS = new Set(
  ('the a an to for of in on at it is are you your i my me we do does can could would have has ' +
    'and or please there here this that with from what how where when was were get got take some ' +
    'just like see speak tell more one two nice have had be been am ok okay so no not dont im its')
    .split(' '),
)

export function interestingWords(phrase: string, max = 2): string[] {
  return [...new Set(phrase.toLowerCase().replace(/[^a-z'\s]/g, '').split(/\s+/))]
    .filter((w) => w.length > 2 && !STOPWORDS.has(w))
    .sort((a, b) => b.length - a.length)
    .slice(0, max)
}
