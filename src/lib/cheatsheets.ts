/** Fiches express : aide-memoires charges depuis data/cheatsheets.json (hors bundle). */

export interface CheatGroup {
  title?: string
  note?: string
  rows: string[][]
}

export interface CheatSheet {
  id: string
  title: string
  subtitle: string
  columns: string[]
  groups: CheatGroup[]
}

export interface CheatData {
  meta: { version: number }
  sheets: CheatSheet[]
}

export interface CheatHit {
  sheet: CheatSheet
  group: CheatGroup
  row: string[]
}

let cache: CheatSheet[] | null = null

/** Charge les fiches (fetch a la demande + cache memoire). */
export async function loadCheatSheets(path = 'data/cheatsheets.json'): Promise<CheatSheet[]> {
  if (cache) return cache
  const r = await fetch(path)
  if (!r.ok) throw new Error(`Fiches indisponibles (${r.status})`)
  const data = (await r.json()) as CheatData
  if (!Array.isArray(data.sheets)) throw new Error('Fichier de fiches invalide')
  cache = data.sheets
  return cache
}

/** Recherche globale : toutes les lignes dont une cellule contient la requete. */
export function searchCheatSheets(sheets: CheatSheet[], query: string): CheatHit[] {
  const q = query.trim().toLowerCase()
  if (!q) return []
  const hits: CheatHit[] = []
  for (const sheet of sheets) {
    for (const group of sheet.groups) {
      for (const row of group.rows) {
        if (row.some((cell) => cell.toLowerCase().includes(q))) {
          hits.push({ sheet, group, row })
        }
      }
    }
  }
  return hits
}
