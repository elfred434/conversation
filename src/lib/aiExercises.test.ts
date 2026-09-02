import { describe, expect, test } from 'vitest'
import { buildExerciseMessages, parseExercises } from './aiExercises'

describe('parseExercises', () => {
  test('tableau JSON propre', () => {
    const out = parseExercises(
      '[{"category":"tense","question":"She ___ yesterday.","answer":"went","hint":"prétérit"}]',
      10,
    )
    expect(out).toEqual([{ category: 'tense', question: 'She ___ yesterday.', answer: 'went', hint: 'prétérit' }])
  })
  test('tolere les fences markdown et le texte autour', () => {
    const out = parseExercises('Voici les exos :\n```json\n[{"category":"weird","question":"Q1","answer":"A1"}]\n```\nBonne chance !')
    expect(out).toEqual([{ category: 'other', question: 'Q1', answer: 'A1' }])
  })
  test('filtre les items invalides et les doublons', () => {
    const out = parseExercises(
      '[{"question":"","answer":"A"},{"question":"Q","answer":"  "},{"question":"Q2","answer":"A2"},{"question":"Q2","answer":"A2 bis"},{"category":"spelling","question":"Q3","answer":"A3"}]',
    )
    expect(out.map((e) => e.question)).toEqual(['Q2', 'Q3'])
  })
  test('echec net si aucun tableau / rien d exploitable', () => {
    expect(() => parseExercises('pas de json ici')).toThrow()
    expect(() => parseExercises('[{"question":"Q"}]')).toThrow('Aucun exercice exploitable')
  })
  test('respecte la limite demandee', () => {
    const items = Array.from({ length: 15 }, (_, i) => `{"question":"Q${i}","answer":"A${i}"}`).join(',')
    expect(parseExercises(`[${items}]`, 10).length).toBe(10)
  })
})

describe('buildExerciseMessages', () => {
  test('contient niveau, stats triees et consignes de format', () => {
    const { system, user } = buildExerciseMessages(
      'b1',
      { total: 9, byCategory: { tense: 6, article: 3 } },
      10,
      ['She ___ yesterday.'],
    )
    expect(system).toContain('JSON array')
    expect(user).toContain('B1')
    expect(user.indexOf('tense: 6')).toBeLessThan(user.indexOf('article: 3'))
    expect(user).toContain('___')
    expect(user).toContain('She ___ yesterday.')
  })
  test('sans stats : repartition uniforme demandee', () => {
    const { user } = buildExerciseMessages('a1', { total: 0, byCategory: {} }, 10, [])
    expect(user).toContain('none yet')
    expect(user).toContain('spread evenly')
  })
})
