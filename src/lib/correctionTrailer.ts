import { CORRECTION_MARKER } from './prompts'

export interface CorrectionResult {
  corrected: string
  explanation?: string
  category: string
}

export interface ParsedReply {
  /** Texte a afficher (balise retiree). */
  content: string
  /** Correction extraite (null si absente ou illisible). */
  correction: CorrectionResult | null
  hasTrailer: boolean
}

export const CATEGORIES = ['article', 'preposition', 'tense', 'spelling', 'word_order', 'other']

/** Extrait la balise de correction d'une reponse complete du tuteur (tolerant aux fences). */
export function extractCorrectionTrailer(full: string): ParsedReply {
  const idx = full.lastIndexOf(CORRECTION_MARKER)
  if (idx === -1) return { content: full, correction: null, hasTrailer: false }

  const content = full.slice(0, idx).trim()
  const tail = full.slice(idx + CORRECTION_MARKER.length)

  let correction: CorrectionResult | null = null
  const start = tail.indexOf('{')
  const end = tail.lastIndexOf('}')
  if (start !== -1 && end > start) {
    try {
      const json = JSON.parse(tail.slice(start, end + 1)) as Record<string, unknown>
      let category = typeof json.category === 'string' ? json.category.trim() : ''
      if (!CATEGORIES.includes(category)) category = 'other'
      const corrected = typeof json.corrected === 'string' ? json.corrected.trim() : ''
      const explanation = typeof json.explanation === 'string' ? json.explanation.trim() : ''
      if (corrected) {
        correction = {
          corrected,
          explanation: explanation || undefined,
          category,
        }
      }
    } catch {
      // JSON casse : on retire quand meme la balise de l'affichage.
    }
  }

  return { content, correction, hasTrailer: true }
}
