import { afterEach, describe, expect, test, vi } from 'vitest'
import type { Settings } from '../types'

vi.mock('./llm', () => ({
  NO_KEY_MSG: 'Aucune clé API',
  streamChat: async function* (): AsyncGenerator<string> {
    yield '{"en":"walk"}'
  },
}))
import {
  bareEnglishForm,
  cachedTranslation,
  looksFrenchLoose,
  looksFrenchStrict,
  translateFrEn,
  validTranslation,
} from './frTranslate'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('filtres francais / anglais', () => {
  test('looksFrenchStrict : infinitifs et conjugaisons typiques', () => {
    expect(looksFrenchStrict('laver')).toBe(true)
    expect(looksFrenchStrict('finir')).toBe(true)
    expect(looksFrenchStrict('entendre')).toBe(true)
    expect(looksFrenchStrict('mangez')).toBe(true)
    expect(looksFrenchStrict('mangeons')).toBe(true)
    expect(looksFrenchStrict('mangeant')).toBe(true)
  })
  test('looksFrenchLoose : les e finaux ambigus, mais pas le reste', () => {
    expect(looksFrenchLoose('chante')).toBe(true)
    expect(looksFrenchLoose('mangé')).toBe(true) // normalise -> mange
    expect(looksFrenchLoose('laver')).toBe(false) // deja strict
    expect(looksFrenchLoose('speak')).toBe(false)
    expect(looksFrenchLoose('work')).toBe(false)
  })
  test('validTranslation : nettoie le bruit des API', () => {
    expect(validTranslation('voyager', 'to travel')).toBe('travel')
    expect(validTranslation('chante', 'sings')).toBe('sing')
    expect(validTranslation('chante', 'sing')).toBe('sing')
    expect(validTranslation('aller', 'go')).toBe('go')
    expect(validTranslation('aller', 'aller')).toBeNull() // identique
    expect(validTranslation('voir', 'MYMEMORY WARNING: YOU USED ALL YOUR FREE QUOTA')).toBeNull()
    expect(validTranslation('x', '12 345')).toBeNull() // pas un mot
    expect(validTranslation('speak', 'speak')).toBeNull()
  })
  test('bareEnglishForm : formes conjuguees anglaises simples', () => {
    expect(bareEnglishForm('sings')).toBe('sing')
    expect(bareEnglishForm('goes')).toBe('go')
    expect(bareEnglishForm('studies')).toBe('study')
    expect(bareEnglishForm('sing')).toBe('sing')
    expect(bareEnglishForm('pass')).toBe('pass') // ss intact
  })
})

describe('translateFrEn (API simulees)', () => {
  test('succes MyMemory + cache local', async () => {
    const calls: string[] = []
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string | URL) => {
        calls.push(String(url))
        return {
          json: async () => ({ responseData: { translatedText: 'to wash' } }),
        }
      }),
    )
    const t = await translateFrEn('laver') // strict
    expect(t).toBe('wash')
    expect(calls.length).toBe(1)
    // deuxieme appel : servi par le cache, pas de fetch
    const again = await translateFrEn('laver')
    expect(again).toBe('wash')
    expect(calls.length).toBe(1)
    expect(cachedTranslation('laver')).toBe('wash')
  })
  test('fin e ambigue : accepte le francais hors dictionnaire', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        json: async () => ({ responseData: { translatedText: 'sing' } }),
      })),
    )
    expect(await translateFrEn('chante')).toBe('sing')
    expect(cachedTranslation('chante')).toBe('sing')
  })
  test('mot anglais inconnu : API sans reponse utile -> null', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_url: string | URL) => {
        throw new Error('offline')
      }),
    )
    expect(await translateFrEn('worg')).toBeNull() // ne ressemble pas au francais : ni essaye
    expect(await translateFrEn('worge')).toBeNull() // essaye (fin e) mais API morte
  })
  test('IA configuree : prioritaire sur les API sans cle', async () => {
    const calls: string[] = []
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string | URL) => {
        calls.push(String(url))
        throw new Error('ne doit pas etre appele')
      }),
    )
    const settings = { provider: 'gemini', apiKey: 'x' } as unknown as Settings
    expect(await translateFrEn('marcher', settings)).toBe('walk')
    expect(calls.length).toBe(0)
  })
  test('echec des deux API -> null, mot traite comme anglais', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('offline')
      }),
    )
    expect(await translateFrEn('motinconnu')).toBeNull()
    expect(await translateFrEn('truker')).toBeNull()
  })
})
