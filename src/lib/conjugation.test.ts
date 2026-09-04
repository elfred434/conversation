import { describe, expect, test } from 'vitest'
import { conjugate, ingForm, isIrregular, IRREG, pastForm, TENSE_RULES, thirdPerson, VERBS, verbParts } from './conjugation'
import { MODALS, PERSONS, SUGGESTED, TENSES } from './conjugation'

describe('formes generees', () => {
  test('troisieme personne : -s, -es, -ies et irreguliers', () => {
    expect(thirdPerson('work')).toBe('works')
    expect(thirdPerson('study')).toBe('studies')
    expect(thirdPerson('watch')).toBe('watches')
    expect(thirdPerson('go')).toBe('goes')
    expect(thirdPerson('have')).toBe('has')
    expect(thirdPerson('be')).toBe('is')
    expect(thirdPerson('play')).toBe('plays')
  })
  test('passe simple : -ed, -ied, doubling et irreguliers', () => {
    expect(pastForm('work')).toBe('worked')
    expect(pastForm('live')).toBe('lived')
    expect(pastForm('study')).toBe('studied')
    expect(pastForm('stop')).toBe('stopped')
    expect(pastForm('play')).toBe('played')
    expect(pastForm('die')).toBe('died')
    expect(pastForm('travel')).toBe('traveled')
    expect(pastForm('go')).toBe('went')
    expect(pastForm('begin')).toBe('began')
    expect(pastForm('be')).toBe('was / were')
  })
  test('forme en -ing : e muet, doubling, ie->ying, exceptions', () => {
    expect(ingForm('work')).toBe('working')
    expect(ingForm('make')).toBe('making')
    expect(ingForm('run')).toBe('running')
    expect(ingForm('begin')).toBe('beginning')
    expect(ingForm('visit')).toBe('visiting')
    expect(ingForm('open')).toBe('opening')
    expect(ingForm('be')).toBe('being')
    expect(ingForm('see')).toBe('seeing')
    expect(ingForm('lie')).toBe('lying')
    expect(ingForm('die')).toBe('dying')
    expect(ingForm('travel')).toBe('traveling')
  })
})

describe('conjugate', () => {
  test('present simple : be special, -s sur il/elle seulement', () => {
    const be = conjugate('be', 'present-simple')
    expect(be).toHaveLength(6)
    expect(be[0].form).toBe('am')
    expect(be[2].form).toBe('is')
    expect(be[5].form).toBe('are')
    const work = conjugate('work', 'present-simple')
    expect(work[0].form).toBe('work')
    expect(work[2].form).toBe('works')
  })
  test('passe simple : was / were pour be', () => {
    const be = conjugate('be', 'past-simple')
    expect(be[0].form).toBe('was')
    expect(be[1].form).toBe('were')
    expect(be[2].form).toBe('was')
    expect(be[5].form).toBe('were')
  })
  test('continus : am/is/are + ing, was/were + ing', () => {
    const pres = conjugate('work', 'present-continuous')
    expect(pres[0].form).toBe('am working')
    expect(pres[2].form).toBe('is working')
    expect(pres[5].form).toBe('are working')
    const past = conjugate('stop', 'past-continuous')
    expect(past[0].form).toBe('was stopping')
    expect(past[5].form).toBe('were stopping')
  })
  test('modaux : 9 lignes, modal + verbe nu, sens en francais', () => {
    const rows = conjugate('work', 'modals')
    expect(rows).toHaveLength(9)
    expect(rows[0]).toEqual({ p: 'can', fr: expect.stringContaining('pouvoir'), form: 'can work' })
    expect(rows[4].form).toBe('must work')
  })
})

describe('donnees', () => {
  test('5 temps, 6 personnes, 9 modaux, verbes suggere uniques', () => {
    expect(TENSES).toHaveLength(5)
    expect(PERSONS).toHaveLength(6)
    expect(MODALS).toHaveLength(9)
    const vs = SUGGESTED.map((s) => s.v)
    expect(new Set(vs).size).toBe(vs.length)
    expect(vs.length).toBeGreaterThanOrEqual(20)
  })
  test('irreguliers : past et pp toujours renseignes, etiquettes dispo', () => {
    expect(isIrregular('go')).toBe(true)
    expect(isIrregular('work')).toBe(false)
    expect(verbParts('go')).toEqual({ base: 'go', past: 'went', pp: 'gone' })
    expect(verbParts('travel')).toBeNull()
    for (const [base, ir] of Object.entries(IRREG)) {
      expect(ir.past.length, base).toBeGreaterThan(0)
      expect(ir.pp.length, base).toBeGreaterThan(0)
    }
  })
  test('TENSE_RULES : chaque temps a ses regles, une idee par ligne', () => {
    for (const t of TENSES) {
      const lines = TENSE_RULES[t.id]
      expect(lines.length, t.id).toBeGreaterThanOrEqual(5)
      for (const line of lines) expect(line.trim().length, t.id).toBeGreaterThan(5)
    }
    expect(TENSE_RULES['past-simple'].some((l) => l.includes('didn’t'))).toBe(true)
    expect(TENSE_RULES.modals.some((l) => l.includes('verbe nu'))).toBe(true)
  })
  test('VERBS : liste unique et suffisante pour le select', () => {
    const vs = VERBS.map((x) => x.v)
    expect(new Set(vs).size).toBe(vs.length)
    expect(vs.length).toBeGreaterThanOrEqual(60)
    for (const must of ['be', 'have', 'go', 'work']) expect(vs).toContain(must)
    expect(VERBS.find((x) => x.v === 'go')?.fr).toBe('aller')
  })
})
