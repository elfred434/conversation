import { describe, expect, test } from 'vitest'
import { GRAMMAR_TIERS, flattenRules, isRuleUnlocked, starsFor } from './grammar'

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

describe('etoiles', () => {
  test('0 faute = 3, 1 faute = 2, plus = 1', () => {
    expect(starsFor(0)).toBe(3)
    expect(starsFor(1)).toBe(2)
    expect(starsFor(4)).toBe(1)
  })
})
