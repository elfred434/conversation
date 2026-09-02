import type { CefrLevel, Progress, Session, Settings } from '../types'

const KEYS = {
  settings: 'ff_settings',
  level: 'ff_level',
  sessions: 'ff_sessions',
  progress: 'ff_progress',
}

export const DEFAULT_SETTINGS: Settings = {
  provider: 'openai',
  apiKey: '',
  model: '',
  baseUrl: '',
  keys: {},
  useBrowserFallback: false,
  autoSpeak: false,
  voiceURI: '',
  rate: 1,
}

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(KEYS.settings)
    if (!raw) return { ...DEFAULT_SETTINGS }
    return { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<Settings>) }
  } catch {
    return { ...DEFAULT_SETTINGS }
  }
}

export function saveSettings(s: Settings): void {
  localStorage.setItem(KEYS.settings, JSON.stringify(s))
}

export function loadLevel(): CefrLevel | null {
  return (localStorage.getItem(KEYS.level) as CefrLevel | null) ?? null
}

export function saveLevel(l: CefrLevel): void {
  localStorage.setItem(KEYS.level, l)
}

export function loadSessions(): Session[] {
  try {
    return JSON.parse(localStorage.getItem(KEYS.sessions) ?? '[]') as Session[]
  } catch {
    return []
  }
}

export function saveSessions(s: Session[]): void {
  localStorage.setItem(KEYS.sessions, JSON.stringify(s))
}

const EMPTY_PROGRESS: Progress = { total: 0, byCategory: {} }

export function loadProgress(): Progress {
  try {
    return { ...EMPTY_PROGRESS, ...(JSON.parse(localStorage.getItem(KEYS.progress) ?? '{}') as Progress) }
  } catch {
    return { ...EMPTY_PROGRESS }
  }
}

export function saveProgress(p: Progress): void {
  localStorage.setItem(KEYS.progress, JSON.stringify(p))
}

export function clearAllData(): void {
  for (const k of Object.values(KEYS)) localStorage.removeItem(k)
}
