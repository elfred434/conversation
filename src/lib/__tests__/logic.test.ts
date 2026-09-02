import { describe, expect, test } from 'vitest'
import { extractCorrectionTrailer } from '../correctionTrailer'
import {
  isAnswerCloseEnough,
  levenshteinDistance,
  normalizeText,
  pronunciationScore,
  stringSimilarity,
} from '../similarity'
import { EXERCISES, pickTargetedExercises } from '../exercises'
import { buildSystemPrompt, CORRECTION_MARKER } from '../prompts'

describe('extractCorrectionTrailer', () => {
  test('sans balise : texte intact', () => {
    const r = extractCorrectionTrailer('Great job! Tell me more.')
    expect(r.hasTrailer).toBe(false)
    expect(r.content).toBe('Great job! Tell me more.')
    expect(r.correction).toBeNull()
  })

  test('avec balise : texte épuré + correction', () => {
    const reply =
      'Good try! @@CORRECTION@@{"corrected":"I went to school yesterday","category":"tense","explanation":"Use past tense"}'
    const r = extractCorrectionTrailer(reply)
    expect(r.hasTrailer).toBe(true)
    expect(r.content).toBe('Good try!')
    expect(r.correction?.corrected).toBe('I went to school yesterday')
    expect(r.correction?.category).toBe('tense')
  })

  test('catégorie inconnue -> other', () => {
    const r = extractCorrectionTrailer('Nice! @@CORRECTION@@{"corrected":"Hello","category":"weird"}')
    expect(r.correction?.category).toBe('other')
  })

  test('JSON cassé : balise retirée, correction nulle', () => {
    const r = extractCorrectionTrailer('Hmm @@CORRECTION@@{"corrected": broken')
    expect(r.hasTrailer).toBe(true)
    expect(r.correction).toBeNull()
  })
})

describe('similarity', () => {
  test('normalizeText', () => {
    expect(normalizeText('  Hello,   World! ')).toBe('hello world')
  })
  test('levenshtein', () => {
    expect(levenshteinDistance('world', 'word')).toBe(1)
    expect(levenshteinDistance('', 'abc')).toBe(3)
  })
  test('stringSimilarity bornes', () => {
    expect(stringSimilarity('abc', 'abc')).toBe(1)
    expect(stringSimilarity('world', 'word')).toBeCloseTo(0.8, 5)
  })
  test('isAnswerCloseEnough', () => {
    expect(isAnswerCloseEnough('  Went  ', 'went')).toBe(true)
    expect(isAnswerCloseEnough('have lived.', 'have lived')).toBe(true)
    expect(isAnswerCloseEnough('went', 'gone')).toBe(false)
  })
  test('pronunciationScore', () => {
    expect(pronunciationScore('hello world', 'hello world')).toBe(1)
    expect(pronunciationScore('hello world', 'hello')).toBeCloseTo(0.5, 5)
  })
})

describe('pickTargetedExercises', () => {
  test('priorise les catégories avec le plus d’erreurs', () => {
    const out = pickTargetedExercises(
      EXERCISES,
      { total: 5, byCategory: { tense: 3, article: 2 } },
      10,
    )
    expect(out[0].category).toBe('tense')
    expect(out.slice(0, 4).every((e) => e.category === 'tense')).toBe(true)
    const cats = out.map((e) => e.category)
    expect(cats.indexOf('tense')).toBeLessThan(cats.indexOf('article'))
    expect(out.length).toBe(10)
  })
  test('respecte la limite', () => {
    expect(pickTargetedExercises(EXERCISES, { total: 0, byCategory: {} }, 5).length).toBe(5)
  })
})

describe('buildSystemPrompt', () => {
  test('mode correction : balise présente', () => {
    expect(buildSystemPrompt('b1')).toContain(CORRECTION_MARKER)
  })
  test('mode écoute : pas de correction', () => {
    const p = buildSystemPrompt('b1', undefined, false)
    expect(p).not.toContain(CORRECTION_MARKER)
    expect(p).toContain('do NOT correct')
  })
  test('le niveau est injecté', () => {
    expect(buildSystemPrompt('a1')).toContain('complete beginner (A1)')
    expect(buildSystemPrompt('c2')).toContain('near-native (C2)')
  })
})
