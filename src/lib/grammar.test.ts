import { describe, expect, test } from 'vitest'
import { GRAMMAR_TIERS, QUIZ_SIZE, flattenRules, isRuleUnlocked, requiredForPass, starsForFirstTry } from './grammar'

describe('curriculum', () => {
  const rules = flattenRules()

  test('5 mondes de 5 regles = 25 regles', () => {
    expect(GRAMMAR_TIERS.length).toBe(5)
    expect(rules.length).toBe(25)
    GRAMMAR_TIERS.forEach((t) => expect(t.rules.length).toBe(5))
  })

  test('ids uniques, >= 3 questions par regle, reponses non vides', () => {
    const ids = new Set(rules.map((r) => r.id))
    expect(ids.size).toBe(rules.length)
    for (const r of rules) {
      expect(r.questions.length).toBeGreaterThanOrEqual(3)
      expect(r.rule.length).toBeGreaterThan(10)
      for (const q of r.questions) {
        expect(q.q).toContain('___')
        expect(q.a.trim().length).toBeGreaterThan(0)
      }
    }
  })

  test('chaque question a un seul trou (___)', () => {
    for (const r of rules) {
      for (const q of r.questions) {
        expect(q.q.split('___').length).toBe(2)
      }
    }
  })
})

describe('deblocage sequentiel', () => {
  const rules = flattenRules()
  test('la premiere regle est toujours debloquee', () => {
    expect(isRuleUnlocked(0, [])).toBe(true)
  })
  test('la regle N+1 demande la maitrise de la N', () => {
    expect(isRuleUnlocked(1, [])).toBe(false)
    expect(isRuleUnlocked(1, [rules[0].id])).toBe(true)
    expect(isRuleUnlocked(2, [rules[0].id])).toBe(false)
    expect(isRuleUnlocked(2, [rules[0].id, rules[1].id])).toBe(true)
  })
  test('le maitriser deux fois ne change rien', () => {
    expect(isRuleUnlocked(1, [rules[0].id, rules[0].id])).toBe(true)
  })
})

describe('validation de maitrise', () => {
  test('seuil de reussite : 70 % arrondi au-dessus', () => {
    expect(requiredForPass(QUIZ_SIZE)).toBe(6)
    expect(requiredForPass(3)).toBe(3)
    expect(requiredForPass(10)).toBe(7)
  })
  test('etoiles sur le premier coup', () => {
    expect(starsForFirstTry(8, 8)).toBe(3)
    expect(starsForFirstTry(7, 8)).toBe(2)
    expect(starsForFirstTry(6, 8)).toBe(1)
    expect(starsForFirstTry(3, 3)).toBe(3)
  })
})



describe('grammarAI', () => {
  const rule = flattenRules()[2] // pluriels

  test('buildGrammarMessages : regle, phrase complete exigee et anti-repetition', () => {
    const { user } = buildGrammarMessages(rule, 8, ['One box, two ___.'])
    expect(user).toContain(rule.title)
    expect(user).toContain('One box, two ___.')
    expect(user).toContain('EXACTLY ONCE')
    expect(user).toContain('8')
  })
  test('maskAnswer : masque le mot, refuse phrase sans le mot ou ambigue', () => {
    expect(maskAnswer('The children are playing in the park.', 'children')).toBe(
      'The ___ are playing in the park.',
    )
    expect(maskAnswer('One box, two boxes.', 'boxes')).toBe('One box, two ___.')
    expect(maskAnswer('She has three child.', 'children')).toBeNull() // mot absent
    expect(maskAnswer('This song is nice. I like this song.', 'song')).toBeNull() // 2 fois
    expect(maskAnswer('Too short.', 'short')).toBeNull() // moins de 4 mots
  })
  test('parseGrammarQuestions : phrase complete masquee, doublons et invalides jetes', () => {
    const text =
      '```json\n' +
      JSON.stringify([
        { full: 'The children are playing in the park.', a: 'children', hint: 'pluriel' },
        { full: 'One box, two boxes.', a: 'boxes' },
        { full: 'The children are playing in the park.', a: 'children' },
        { full: 'She has three child.', a: 'children' },
      ]) +
      '\n```'
    const out = parseGrammarQuestions(text, 2)
    expect(out).toEqual([
      { q: 'The ___ are playing in the park.', a: 'children', hint: 'pluriel' },
      { q: 'One box, two ___.', a: 'boxes', hint: undefined },
    ])
  })
  test('parseGrammarQuestions : ancien format q avec ___ tolere', () => {
    const out = parseGrammarQuestions('[{"q":"One key, two ___.","a":"keys"}]', 1)
    expect(out).toEqual([{ q: 'One key, two ___.', a: 'keys', hint: undefined }])
  })
  test('parseGrammarQuestions : echec si trop peu de questions', () => {
    expect(() => parseGrammarQuestions('[{"q":"a ___ b","a":"x"}]')).toThrow('Pas assez')
  })
  test('le message sans-cle est bien celui compare par la vue', () => {
    expect(NO_KEY_MSG).toContain('Aucune clé API')
  })
})

import { buildGrammarMessages, maskAnswer, parseGrammarQuestions } from './grammarAI'
import { NO_KEY_MSG } from './llm'
