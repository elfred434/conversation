import { describe, expect, test } from 'vitest'
import { buildQuizPool, familyMatches, pickQuizQuestions, splitExample } from './wordRules'
import type { WordRuleData } from './wordRules'
import rawData from '../../public/data/word_rules.json'

// Les VRAIES donnees du depot : si le fichier casse, les tests cassent.
const data = rawData as WordRuleData

describe('base word_rules.json', () => {
  test('structure valide et riche', () => {
    expect(data.families.length).toBeGreaterThanOrEqual(40)
    for (const f of data.families) {
      expect(f.id.length).toBeGreaterThan(0)
      expect(f.items.length).toBeGreaterThanOrEqual(2)
      for (const it of f.items) {
        expect(it.rule.length).toBeGreaterThan(10)
        expect(it.examples.length).toBeGreaterThan(0)
      }
    }
  })
  test('pas de (mot + sens) duplique entre familles (anti-embrouille)', () => {
    // Un meme mot peut revenir (little adjectif vs quantifiant, at lieu vs temps) :
    // c'est le sujet. Ce qui est interdit : le MEME mot avec le MEME sens.
    const seen = new Set<string>()
    for (const f of data.families) {
      for (const it of f.items) {
        const k = `${it.word.toLowerCase()} :: ${it.meaning.toLowerCase()}`
        expect(seen.has(k), `entree duplique : ${k}`).toBe(false)
        seen.add(k)
      }
    }
  })
  test('mots uniques a l interieur d une famille (options de quiz non ambigues)', () => {
    for (const f of data.families) {
      const words = f.items.map((it) => it.word.toLowerCase())
      expect(new Set(words).size).toBe(words.length)
    }
  })
  test('splitExample', () => {
    expect(splitExample('Can I borrow your pen? | Puis-je emprunter ton stylo ?')).toEqual({
      en: 'Can I borrow your pen?',
      fr: 'Puis-je emprunter ton stylo ?',
    })
    expect(splitExample('No translation').fr).toBe('')
  })
  test('familyMatches par mot, sens ou titre', () => {
    const f = data.families.find((x) => x.id === 'borrow-lend')!
    expect(familyMatches(f, 'borrow')).toBe(true)
    expect(familyMatches(f, 'emprunter')).toBe(true)
    expect(familyMatches(f, 'Borrow / Lend')).toBe(true)
    expect(familyMatches(f, 'zzz')).toBe(false)
  })
})

describe('buildQuizPool sur les donnees reelles', () => {
  const pool = buildQuizPool(data.families)

  test('pool copieux', () => {
    expect(pool.length).toBeGreaterThanOrEqual(100)
  })
  test('chaque question est propre : un trou, reponse parmi les options', () => {
    for (const q of pool) {
      expect(q.sentence.split('___').length).toBe(2)
      expect(q.options).toContain(q.answer)
      expect(q.options.length).toBeGreaterThanOrEqual(2)
      expect(q.rule.length).toBeGreaterThan(10)
    }
  })
  test('le mot borrow genere bien une question', () => {
    const b = pool.find((q) => q.answer === 'borrow')
    expect(b).toBeDefined()
    expect(b!.options).toContain('lend')
  })
})

describe('pickQuizQuestions', () => {
  const pool = buildQuizPool(data.families)
  test('10 questions, sans doublon de phrase', () => {
    const qs = pickQuizQuestions(pool, 10)
    expect(qs.length).toBe(10)
    const sentences = new Set(qs.map((q) => q.sentence))
    expect(sentences.size).toBe(10)
  })
  test('pas deux fois la meme famille consecutivement', () => {
    for (let seed = 0; seed < 20; seed++) {
      const qs = pickQuizQuestions(pool, 10, () => seed / 23)
      for (let i = 1; i < qs.length; i++) {
        expect(qs[i].familyId).not.toBe(qs[i - 1].familyId)
      }
    }
  })
})
