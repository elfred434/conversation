import { describe, expect, test } from 'vitest'
import { buildPhrasesMessages, parsePhrases } from './phrases'
import { interestingWords, parseDictionary } from './dictionary'

describe('parsePhrases', () => {
  test('tableau JSON propre', () => {
    const out = parsePhrases('[{"en":"How are you?","fr":"Ça va ?","phon":"haou ar you"}]')
    expect(out).toEqual([{ en: 'How are you?', fr: 'Ça va ?', phon: 'haou ar you' }])
  })
  test('tolere fences et bavardages, phon manquant => vide', () => {
    const out = parsePhrases('Here you go:\n```json\n[{"en":"Take care","fr":"Prends soin de toi"}]\n```')
    expect(out).toEqual([{ en: 'Take care', fr: 'Prends soin de toi', phon: '' }])
  })
  test('filtre invalides et doublons, respecte la limite', () => {
    const items = Array.from({ length: 5 }, (_, i) => `{"en":"Phrase ${i}","fr":"Trad ${i}","phon":"p${i}"}`)
    items.push('{"en":"Phrase 1","fr":"doublon"}')
    const out = parsePhrases(`[${items.join(',')}]`, 3)
    expect(out.map((p) => p.en)).toEqual(['Phrase 0', 'Phrase 1', 'Phrase 2'])
  })
  test('echec net sans tableau', () => {
    expect(() => parsePhrases('no json')).toThrow()
  })
})

describe('buildPhrasesMessages', () => {
  test('contient le sujet, le niveau et la consigne JSON', () => {
    const { user } = buildPhrasesMessages('a2', 'at the barber', 10, ['Take care'])
    expect(user).toContain('at the barber')
    expect(user).toContain('A2')
    expect(user).toContain('Take care')
    expect(user).toContain('phon')
  })
})

describe('parseDictionary', () => {
  const payload = [
    {
      word: 'hello',
      phonetic: '/həˈloʊ/',
      phonetics: [
        { text: '/həˈloʊ/', audio: '' },
        { text: '', audio: 'https://api.dictionaryapi.dev/media/pronunciations/en/hello-us.mp3' },
      ],
      meanings: [
        {
          partOfSpeech: 'exclamation',
          definitions: [
            { definition: 'used as a greeting', example: 'hello there, Pablo!' },
            { definition: 'used to answer a telephone', example: 'hello?' },
          ],
        },
        {
          partOfSpeech: 'noun',
          definitions: [{ definition: 'an utterance of “hello”' }],
        },
      ],
    },
  ]
  test('extrait phonetique, audio et definitions', () => {
    const e = parseDictionary(payload)
    expect(e?.word).toBe('hello')
    expect(e?.phonetic).toBe('/həˈloʊ/')
    expect(e?.audio).toContain('hello-us.mp3')
    expect(e?.defs.length).toBe(3)
    expect(e?.defs[0]).toEqual({ pos: 'exclamation', def: 'used as a greeting', example: 'hello there, Pablo!' })
  })
  test('entries vides ou malformes => null', () => {
    expect(parseDictionary([])).toBeNull()
    expect(parseDictionary({ title: 'No Definitions Found' })).toBeNull()
    expect(parseDictionary(null)).toBeNull()
  })
})

describe('interestingWords', () => {
  test('retire les mots outils, garde les plus longs, sans doublons', () => {
    // "pass" et "salt" font 4 lettres : l'ordre d'apparition est conserve
    expect(interestingWords('Could you pass me the salt, please?')).toEqual(['pass', 'salt'])
  })
  test('moins de deux candidats', () => {
    expect(interestingWords('I am ok').length).toBe(0)
  })
})
