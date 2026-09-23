import { describe, expect, test } from 'vitest'
import {
  isAnswerCloseEnough,
  isCopiedFromQuestion,
  pronunciationScore,
  wordOrderRatio,
} from './similarity'
import { EXERCISES, pickTargetedExercises } from './exercises'
import { friendlyHttpError } from './llm'
import { CORRECTION_MARKER } from './prompts'
import { extractCorrectionTrailer } from './correctionTrailer'

describe('reponses : la grammaire n est plus devinee', () => {
  test('confusions classiques refusees (has/have, was/were...)', () => {
    expect(isAnswerCloseEnough('has already eaten', 'had already eaten')).toBe(false)
    expect(isAnswerCloseEnough('have just finished', 'has just finished')).toBe(false)
    expect(isAnswerCloseEnough('was', 'were')).toBe(false)
    expect(isAnswerCloseEnough('more interesting', 'most interesting')).toBe(false)
    expect(isAnswerCloseEnough('I said him the truth.', 'I told him the truth.')).toBe(false)
  })

  test('la bonne reponse reste acceptee (casse, ponctuation, espaces)', () => {
    expect(isAnswerCloseEnough(' Had  already EATEN ', 'had already eaten')).toBe(true)
    expect(isAnswerCloseEnough('She speaks English fluently', 'She speaks English fluently.')).toBe(true)
  })

  test('faute de frappe tolerée uniquement sur un mot long', () => {
    expect(isAnswerCloseEnough('definiteli', 'definitely')).toBe(true) // 1 lettre
    expect(isAnswerCloseEnough('recieved', 'received')).toBe(false) // 2 lettres
    expect(isAnswerCloseEnough('go', 'went')).toBe(false)
  })

  test('recopier la faute de l enonce est bloqué', () => {
    const q = "It's a beautifull city. (mot mal orthographié ?)"
    expect(isCopiedFromQuestion('beautifull', q)).toBe(true)
    expect(isCopiedFromQuestion('beautiful', q)).toBe(false)
    const reorder = 'He always is late. (remets la phrase en ordre)'
    expect(isCopiedFromQuestion('He is always late.', reorder)).toBe(false)
  })
})

describe('prononciation : l ordre des mots compte', () => {
  const target = 'I need to wake up early tomorrow morning'
  test('phrase dite dans le desordre : score quasi nul', () => {
    const scrambled = 'morning tomorrow early up wake to need I'
    expect(pronunciationScore(target, scrambled)).toBeLessThan(0.2)
    expect(wordOrderRatio(target, scrambled)).toBeLessThan(0.3)
  })
  test('phrase correcte : score maximal', () => {
    expect(pronunciationScore(target, target)).toBe(1)
    expect(wordOrderRatio(target, target)).toBe(1)
  })
})

describe('banque d exercices : les series changent', () => {
  test('sans statistiques, toutes les categories apparaissent', () => {
    const out = pickTargetedExercises(EXERCISES, { total: 0, byCategory: {}, messages: 0, byDay: {}, scores: [] }, 10)
    const cats = new Set(out.map((e) => e.category))
    expect(cats.size).toBe(6)
  })
  test('deux series consecutives different', () => {
    const stats = { total: 0, byCategory: {}, messages: 0, byDay: {}, scores: [] }
    let different = false
    for (let i = 0; i < 5 && !different; i++) {
      const a = pickTargetedExercises(EXERCISES, stats, 10).map((e) => e.question)
      const b = pickTargetedExercises(EXERCISES, stats, 10).map((e) => e.question)
      if (JSON.stringify(a) !== JSON.stringify(b)) different = true
    }
    expect(different).toBe(true)
  })
})

describe('erreurs IA en francais clair', () => {
  test('401 : message compréhensible, sans jargon', () => {
    const msg = friendlyHttpError(401, 'openai').message
    expect(msg).toContain('refuse ta clé')
    expect(msg).not.toContain('HTTP')
    expect(msg).not.toContain('{')
  })
  test('429 et 500 : messages clairs', () => {
    expect(friendlyHttpError(429, 'gemini').message).toContain('Limite atteinte')
    expect(friendlyHttpError(503, 'groq').message).toContain('Panne temporaire')
  })
  test('lexplication de correction est conservée', () => {
    const reply = `Good try! ${CORRECTION_MARKER}{"corrected":"I went","category":"tense","explanation":"Use the past tense here."}`
    const r = extractCorrectionTrailer(reply)
    expect(r.correction?.explanation).toBe('Use the past tense here.')
  })
})
