export type CefrLevel = 'a1' | 'a2' | 'b1' | 'b2' | 'c1' | 'c2'

export type ProviderId = 'openai' | 'openrouter' | 'gemini' | 'groq' | 'ollama'

export interface Settings {
  provider: ProviderId
  apiKey: string
  model: string
  /** Sert uniquement pour Ollama (URL locale) ou pour surcharger un fournisseur. */
  baseUrl: string
  autoSpeak: boolean
  voiceURI: string
  rate: number
}

export interface Msg {
  role: 'user' | 'assistant'
  content: string
  /** Correction grammaticale (messages utilisateur uniquement). */
  correction?: string
  /** Categorie de la faute corrigee (message assistant, parse du trailer). */
  cat?: string
}

export interface Session {
  id: string
  title: string
  scenarioId: string
  messages: Msg[]
  ts: number
}

export interface Progress {
  total: number
  byCategory: Record<string, number>
}
