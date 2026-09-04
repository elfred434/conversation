/** Traduction francais -> anglais pour les verbes hors dictionnaire : IA de la app puis API sans cle. */
import { normalizeVerb } from './conjugation'
import type { Settings } from '../types'
import { streamChat, NO_KEY_MSG } from './llm'

const CACHE_KEY = 'ff_fr_en_cache'
const cache: Map<string, string> = loadCache()

function loadCache(): Map<string, string> {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (raw) return new Map(Object.entries(JSON.parse(raw) as Record<string, string>))
  } catch {
    /* ignore */
  }
  return new Map()
}

function saveCache(): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(Object.fromEntries(cache)))
  } catch {
    /* ignore */
  }
}

/** Traduction deja en cache local (perist entre les visites). */
export function cachedTranslation(w: string): string | null {
  return cache.get(normalizeVerb(w)) ?? null
}

/** Fin strictement francaises : infinitifs (-er/-ir/-re) et conjugaisons typiques. */
export function looksFrenchStrict(w: string): boolean {
  const s = normalizeVerb(w)
  return /(er|ir|re|ez|ent|ons|ant)$/.test(s)
}

/**
 * Fin ambiguE (termine par 'e' : 'chante', mais aussi 'see', 'hope').
 * Le resultat passera par un controle aller-retour avant d'etre accepte.
 */
export function looksFrenchLoose(w: string): boolean {
  const s = normalizeVerb(w)
  return !looksFrenchStrict(s) && /e$/.test(s)
}

/** Deconjugue une forme anglaise simple : sings -> sing, goes -> go, studies -> study. */
export function bareEnglishForm(w: string): string {
  if (/ies$/.test(w)) return `${w.slice(0, -3)}y`
  if (/oes$/.test(w)) return w.slice(0, -2)
  if (/(ch|sh|ss|x|z)es$/.test(w)) return w.slice(0, -2)
  if (/[^s]s$/.test(w)) return w.slice(0, -1)
  return w
}

/** Traduction exploitable : mot anglais simple, different de la saisie, sans bruit d'API. */
export function validTranslation(input: string, t: unknown): string | null {
  const s = String(t ?? '')
    .trim()
    .toLowerCase()
    .replace(/^to\s+/, '')
  if (!s || s === normalizeVerb(input)) return null
  if (/mymemory|warning|invalid|limit|error/i.test(s)) return null
  const m = s.match(/^[a-zà-öø-ÿ-]+/)
  if (!m) return null
  const bare = bareEnglishForm(m[0])
  return bare === normalizeVerb(input) ? null : bare
}

async function myMemory(w: string, signal: AbortSignal): Promise<string | null> {
  const r = await fetch(
    `https://api.mymemory.translated.net/get?q=${encodeURIComponent(w)}&langpair=fr|en`,
    { signal },
  )
  const j = (await r.json()) as { responseData?: { translatedText?: string } }
  return validTranslation(w, j?.responseData?.translatedText)
}

async function lingva(w: string, signal: AbortSignal): Promise<string | null> {
  const r = await fetch(`https://lingva.ml/api/v1/fr/en/${encodeURIComponent(w)}`, { signal })
  const j = (await r.json()) as { translation?: string }
  return validTranslation(w, j?.translation)
}

/** Traduction par l'IA configuree (cascade de la app). Retourne null si absente/erreur. */
async function viaAI(w: string, settings: Settings, signal: AbortSignal): Promise<string | null> {
  try {
    const system =
      'You translate French verbs to English. Reply with ONLY a strict JSON object, no commentary.'
    const user = `Translate the French verb "${w}" to its English infinitive. Reply ONLY: {"en":"<verb>"}`
    let full = ''
    for await (const chunk of streamChat(settings, system, [{ role: 'user', content: user }], signal)) {
      full += chunk
    }
    const start = full.indexOf('{')
    const end = full.lastIndexOf('}')
    if (start === -1 || end <= start) return null
    const j = JSON.parse(full.slice(start, end + 1)) as { en?: unknown }
    return validTranslation(w, j.en)
  } catch (e) {
    if (e instanceof Error && e.message === NO_KEY_MSG) return null // pas de cle : API sans cle ensuite
    return null
  }
}

export async function translateFrEn(
  word: string,
  settings?: Settings,
  signal?: AbortSignal,
): Promise<string | null> {
  const w = normalizeVerb(word)
  if (!w) return null
  const hit = cache.get(w)
  if (hit) return hit
  const strict = looksFrenchStrict(w)
  const loose = !strict && looksFrenchLoose(w)
  if (!strict && !loose) return null // ne ressemble pas a un francais : verbe anglais
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 20000)
  const onAbort = (): void => ctrl.abort()
  signal?.addEventListener('abort', onAbort)
  try {
    if (settings) {
      const ai = await viaAI(w, settings, ctrl.signal)
      if (ai) {
        cache.set(w, ai)
        saveCache()
        return ai
      }
    }
    for (const api of [myMemory, lingva]) {
      try {
        const t = await api(w, ctrl.signal)
        if (!t) continue
        cache.set(w, t)
        saveCache()
        return t
      } catch {
        /* api suivante */
      }
    }
    return null
  } finally {
    clearTimeout(timer)
    signal?.removeEventListener('abort', onAbort)
  }
}
