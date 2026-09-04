import { describe, expect, test } from 'vitest'
import data from '../../public/data/cheatsheets.json'
import { searchCheatSheets } from './cheatsheets'
import type { CheatSheet } from './cheatsheets'

const sheets = data.sheets as CheatSheet[]

describe('cheatsheets.json', () => {
  test('au moins 11 fiches, ids et titres uniques', () => {
    expect(sheets.length).toBeGreaterThanOrEqual(11)
    const ids = sheets.map((s) => s.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const s of sheets) {
      expect(s.title.trim().length).toBeGreaterThan(2)
      expect(s.subtitle.trim().length).toBeGreaterThan(2)
      expect(s.groups.length).toBeGreaterThan(0)
    }
  })
  test('lignes valides et compatibles avec les colonnes', () => {
    for (const s of sheets) {
      for (const grp of s.groups) {
        expect(grp.rows.length, s.id).toBeGreaterThan(0)
        for (const row of grp.rows) {
          expect(Array.isArray(row), s.id).toBe(true)
          expect(row.length, `${s.id}: ${row[0]}`).toBe(s.columns.length)
          for (const cell of row) expect(cell.trim().length, `${s.id}`).toBeGreaterThan(0)
        }
      }
    }
  })
  test('contenu attendu : antonymes sans doublon, stop-very riche, TO BE complet', () => {
    const ant = sheets.find((s) => s.id === 'antonyms')
    expect(ant && ant.groups[0].rows.length).toBeGreaterThanOrEqual(90)
    const pairs = ant!.groups[0].rows.map((r) => `${r[0]}-${r[1]}`.toLowerCase())
    expect(new Set(pairs).size).toBe(pairs.length)
    const very = sheets.find((s) => s.id === 'stop-very')
    expect(very && very.groups[0].rows.length).toBeGreaterThanOrEqual(45)
    const be = sheets.find((s) => s.id === 'verb-to-be')
    expect(be && be.groups.length).toBe(9)
    const qw = sheets.find((s) => s.id === 'question-words')
    expect(qw && qw.groups[0].rows.length).toBe(13)
  })
  test('recherche globale : trouve dans n importe quelle cellule', () => {
    expect(searchCheatSheets(sheets, 'furious').length).toBeGreaterThan(0)
    expect(searchCheatSheets(sheets, 'pourquoi').length).toBeGreaterThan(0) // cellule FR
    expect(searchCheatSheets(sheets, 'roundabout').length).toBeGreaterThan(0)
    expect(searchCheatSheets(sheets, 'zzzz').length).toBe(0)
    expect(searchCheatSheets(sheets, '   ')).toEqual([])
  })
})
