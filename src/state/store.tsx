import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { CefrLevel, Msg, Progress, Session, Settings } from '../types'
import {
  loadLevel,
  loadProgress,
  loadSessions,
  loadSettings,
  saveLevel,
  saveProgress,
  saveSessions,
  saveSettings,
} from '../lib/storage'
import { SCENARIOS, buildSystemPrompt } from '../lib/prompts'
import { PROVIDERS, redact, streamChat, type ChatMsg } from '../lib/llm'
import { extractCorrectionTrailer } from '../lib/correctionTrailer'
import { speak } from '../lib/tts'

export type View =
  | 'home'
  | 'conversation'
  | 'progress'
  | 'pronunciation'
  | 'lessons'
  | 'exercises'
  | 'phrases'
  | 'grammar'
  | 'wordrules'
  | 'settings'
  | 'onboarding'

export interface ConvState {
  sessionId: string
  scenarioId: string | null
  messages: Msg[]
  streaming: boolean
  error?: string
}

interface AppCtx {
  view: View
  go: (v: View) => void
  settings: Settings
  updateSettings: (patch: Partial<Settings>) => void
  level: CefrLevel | null
  chooseLevel: (l: CefrLevel) => void
  sessions: Session[]
  deleteSession: (id: string) => void
  clearSessions: () => void
  progress: Progress
  resetProgress: () => void
  conv: ConvState | null
  startConversation: (scenarioId: string | null) => void
  resumeSession: (id: string) => void
  sendMessage: (text: string) => void
  stopStreaming: () => void
  practicePhrase: string | null
  setPracticePhrase: (p: string) => void
}

const Ctx = createContext<AppCtx | null>(null)

export function useApp(): AppCtx {
  const v = useContext(Ctx)
  if (!v) throw new Error('useApp hors AppProvider')
  return v
}

function uid(): string {
  return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

function titleFor(scenarioId: string | null): string {
  return SCENARIOS.find((s) => s.id === scenarioId)?.title ?? 'Conversation libre'
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [view, setView] = useState<View>(() => (loadLevel() ? 'home' : 'onboarding'))
  const [settings, setSettings] = useState<Settings>(loadSettings)
  const [level, setLevel] = useState<CefrLevel | null>(loadLevel)
  const [sessions, setSessions] = useState<Session[]>(loadSessions)
  const [progress, setProgress] = useState<Progress>(loadProgress)
  const [conv, setConv] = useState<ConvState | null>(null)
  const [practicePhrase, setPracticePhraseState] = useState<string | null>(null)

  // Refs miroirs pour les boucles asynchrones (streaming).
  const settingsRef = useRef(settings)
  const levelRef = useRef(level)
  const convRef = useRef<ConvState | null>(null)
  const sessionsRef = useRef(sessions)
  const progressRef = useRef(progress)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    settingsRef.current = settings
  }, [settings])
  useEffect(() => {
    levelRef.current = level
  }, [level])

  const go = (v: View): void => setView(v)

  function updateSettings(patch: Partial<Settings>): void {
    setSettings((prev) => {
      const next = { ...prev, ...patch }
      saveSettings(next)
      return next
    })
  }

  function chooseLevel(l: CefrLevel): void {
    setLevel(l)
    saveLevel(l)
    setView('home')
  }

  function applyConv(updater: (c: ConvState) => ConvState): ConvState | null {
    const cur = convRef.current
    if (!cur) return null
    const next = updater(cur)
    convRef.current = next
    setConv(next)
    return next
  }

  function persistSession(c: ConvState): void {
    const list = [...sessionsRef.current]
    const idx = list.findIndex((s) => s.id === c.sessionId)
    const session: Session = {
      id: c.sessionId,
      title: titleFor(c.scenarioId),
      scenarioId: c.scenarioId ?? '',
      messages: c.messages,
      ts: idx >= 0 ? list[idx].ts : Date.now(),
    }
    if (idx >= 0) list[idx] = session
    else list.unshift(session)
    sessionsRef.current = list
    setSessions(list)
    saveSessions(list)
  }

  /** Diffuse la reponse du tuteur dans le dernier message (placeholder). */
  async function streamInto(
    sid: string,
    scenarioId: string | null,
    history: ChatMsg[],
    userIdx: number | null,
  ): Promise<void> {
    const s = settingsRef.current
    const lvl = levelRef.current
    if (!lvl) return
    const scenario = SCENARIOS.find((x) => x.id === scenarioId)
    const system = buildSystemPrompt(lvl, scenario?.prompt, scenario?.correct ?? true)

    const setLast = (content: string): void => {
      applyConv((c) =>
        c.sessionId !== sid
          ? c
          : {
              ...c,
              messages: [
                ...c.messages.slice(0, -1),
                { ...c.messages[c.messages.length - 1], content },
              ],
            },
      )
    }

    const ac = new AbortController()
    abortRef.current?.abort()
    abortRef.current = ac

    let full = ''
    try {
      for await (const chunk of streamChat(s, system, history, ac.signal)) {
        full += chunk
        setLast(full)
      }
    } catch (e) {
      if (ac.signal.aborted) return
      applyConv((c) =>
        c.sessionId !== sid ? c : { ...c, streaming: false, error: redact(String(e)) },
      )
      return
    }

    // Finalisation : correction extraite de la balise (1 seul appel LLM).
    const parsed = extractCorrectionTrailer(full)
    const display = (parsed.hasTrailer ? parsed.content : full).trim()

    const finalConv = applyConv((c) => {
      if (c.sessionId !== sid) return c
      const msgs = [...c.messages]
      msgs[msgs.length - 1] = {
        ...msgs[msgs.length - 1],
        content: display || '…',
        ...(parsed.correction ? { cat: parsed.correction.category } : {}),
      }
      if (parsed.correction && userIdx !== null && msgs[userIdx]) {
        msgs[userIdx] = { ...msgs[userIdx], correction: parsed.correction.corrected }
      }
      return { ...c, messages: msgs, streaming: false }
    })

    if (parsed.correction && userIdx !== null) {
      const cat = parsed.correction.category
      const p = progressRef.current
      const next: Progress = {
        total: p.total + 1,
        byCategory: { ...p.byCategory, [cat]: (p.byCategory[cat] ?? 0) + 1 },
      }
      progressRef.current = next
      setProgress(next)
      saveProgress(next)
    }

    if (finalConv) persistSession(finalConv)

    if (settingsRef.current.autoSpeak && display) {
      speak(display, settingsRef.current.voiceURI, settingsRef.current.rate)
    }
  }

  function startConversation(scenarioId: string | null): void {
    if (!levelRef.current) {
      setView('onboarding')
      return
    }
    const sessionId = uid()
    const fresh: ConvState = {
      sessionId,
      scenarioId,
      messages: [{ role: 'assistant', content: '' }],
      streaming: true,
    }
    convRef.current = fresh
    setConv(fresh)
    setView('conversation')
    void streamInto(sessionId, scenarioId, [{ role: 'user', content: "Hello! I'm ready to practice." }], null)
  }

  function resumeSession(id: string): void {
    const s = sessionsRef.current.find((x) => x.id === id)
    if (!s) return
    const restored: ConvState = {
      sessionId: s.id,
      scenarioId: s.scenarioId || null,
      messages: s.messages,
      streaming: false,
    }
    convRef.current = restored
    setConv(restored)
    setView('conversation')
  }

  function sendMessage(text: string): void {
    const c0 = convRef.current
    if (!c0 || c0.streaming) return
    const trimmed = text.trim()
    if (!trimmed) return
    const userIdx = c0.messages.length
    const messages: Msg[] = [
      ...c0.messages,
      { role: 'user', content: trimmed },
      { role: 'assistant', content: '' },
    ]
    const next: ConvState = { ...c0, messages, streaming: true, error: undefined }
    convRef.current = next
    setConv(next)
    const history: ChatMsg[] = messages.slice(0, userIdx + 1).map((m) => ({ role: m.role, content: m.content }))
    void streamInto(next.sessionId, next.scenarioId, history, userIdx)
  }

  function stopStreaming(): void {
    abortRef.current?.abort()
    applyConv((c) => ({ ...c, streaming: false }))
  }

  function deleteSession(id: string): void {
    const list = sessionsRef.current.filter((s) => s.id !== id)
    sessionsRef.current = list
    setSessions(list)
    saveSessions(list)
  }

  function clearSessions(): void {
    sessionsRef.current = []
    setSessions([])
    saveSessions([])
  }

  function resetProgress(): void {
    const p: Progress = { total: 0, byCategory: {} }
    progressRef.current = p
    setProgress(p)
    saveProgress(p)
  }

  function setPracticePhrase(p: string): void {
    setPracticePhraseState(p)
    setView('pronunciation')
  }

  const ctx: AppCtx = {
    view,
    go,
    settings,
    updateSettings,
    level,
    chooseLevel,
    sessions,
    deleteSession,
    clearSessions,
    progress,
    resetProgress,
    conv,
    startConversation,
    resumeSession,
    sendMessage,
    stopStreaming,
    practicePhrase,
    setPracticePhrase,
  }

  return <Ctx.Provider value={ctx}>{children}</Ctx.Provider>
}
