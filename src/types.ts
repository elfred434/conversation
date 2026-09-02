export type CefrLevel = 'a1' | 'a2' | 'b1' | 'b2' | 'c1' | 'c2'

export type ProviderId = 'openai' | 'openrouter' | 'gemini' | 'groq' | 'cerebras' | 'ollama' | 'webllm'

export interface Settings {
  provider: ProviderId
  apiKey: string
  model: string
  /** Sert uniquement pour Ollama (URL locale) ou pour surcharger un fournisseur. */
  baseUrl: string
  /** Cles de secours par fournisseur (bascule automatique anti-limites). */
  keys: Partial<Record<ProviderId, string>>
  /** En dernier recours de la bascule, utiliser l'IA integree (telechargement ~700 Mo). */
  useBrowserFallback: boolean
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
