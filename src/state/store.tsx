import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { CefrLevel, Msg, Progress, Session, Settings } from '../types'
import type { PracticeScore } from '../types'
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
import { redact, streamChat, type ChatMsg } from '../lib/llm'
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
  | 'conjugaison'
  | 'fiches'
  | 'legal'
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
  saveScore: (tool: string, score: number, total: number) => void
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

/** Jour local 'AAAA-MM-JJ' pour l'activite recente. */
function todayKey(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const ALL_VIEWS: View[] = [
  'home',
  'conversation',
  'progress',
  'pronunciation',
  'lessons',
  'exercises',
  'phrases',
  'grammar',
  'wordrules',
  'conjugaison',
  'fiches',
  'legal',
  'settings',
  'onboarding',
]

/** Lecture de l'ecran demande par l'URL (#/lecons, #/parametres...) — sans risque hors navigateur. */
function viewFromHash(): View | null {
  if (typeof window === 'undefined') return null
  const h = window.location.hash.replace(/^#\/?/, '')
  return (ALL_VIEWS as string[]).includes(h) ? (h as View) : null
}

function writeHash(v: View): void {
  if (typeof window === 'undefined') return
  const target = v === 'home' ? '' : `#/${v}`
  if ((window.location.hash || '') === target) return
  window.history.pushState(null, '', window.location.pathname + window.location.search + target)
}

/** Les ecrans sans contenu garanti au rechargement ramenent a l'accueil. */
function initialView(): View {
  const fromHash = viewFromHash()
  if (fromHash && fromHash !== 'conversation') return fromHash
  return loadLevel() ? 'home' : 'onboarding'
}

/** Erreur d'affichage : jamais de jargon reseau brut, toujours du francais clair. */
function friendlyError(e: unknown): string {
  const msg = e instanceof Error ? e.message : String(e)
  if (/failed to fetch|network|load failed|fetch|econnrefused|timed? ?out/i.test(msg)) {
    return "Impossible de joindre le service d'IA. Vérifie ta connexion internet, puis réessaie."
  }
  return redact(msg)
}

function titleFor(scenarioId: string | null): string {
  return SCENARIOS.find((s) => s.id === scenarioId)?.title ?? 'Conversation libre'
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [view, setView] = useState<View>(initialView)
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

  const go = (v: View): void => {
    setView(v)
    writeHash(v)
  }

  // Boutons precedent / suivant du navigateur : suivre l'URL.
  useEffect(() => {
    if (typeof window === 'undefined') return
    const onPop = (): void => {
      const v = viewFromHash()
      setView(v ?? 'home')
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

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
    go('home')
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
        c.sessionId !== sid ? c : { ...c, streaming: false, error: friendlyError(e) },
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
        msgs[userIdx] = {
          ...msgs[userIdx],
          correction: parsed.correction.corrected,
          ...(parsed.correction.explanation ? { explanation: parsed.correction.explanation } : {}),
        }
      }
      return { ...c, messages: msgs, streaming: false }
    })

    if (parsed.correction && userIdx !== null) {
      const cat = parsed.correction.category
      const day = todayKey()
      const p = progressRef.current
      const byDay = p.byDay ?? {}
      const next: Progress = {
        ...p,
        total: p.total + 1,
        byCategory: { ...p.byCategory, [cat]: (p.byCategory[cat] ?? 0) + 1 },
        byDay: { ...byDay, [day]: (byDay[day] ?? 0) + 1 },
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
      go('onboarding')
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
    go('conversation')
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
    go('conversation')
  }

  /** Compteur de pratique : un message envoye = un pas vers les medailles. */
  function bumpMessageCount(): void {
    const p = progressRef.current
    const next: Progress = { ...p, messages: (p.messages ?? 0) + 1 }
    progressRef.current = next
    setProgress(next)
    saveProgress(next)
  }

  function sendMessage(text: string): void {
    const c0 = convRef.current
    if (!c0 || c0.streaming) return
    const trimmed = text.trim()
    if (!trimmed) return
    bumpMessageCount()
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
    const p: Progress = { total: 0, byCategory: {}, messages: 0, byDay: {}, scores: [] }
    progressRef.current = p
    setProgress(p)
    saveProgress(p)
  }

  /** Garde les 12 scores d'entrainement les plus recents, du plus recent au plus ancien. */
  function saveScore(tool: string, score: number, total: number): void {
    const entry: PracticeScore = { tool, score, total, ts: Date.now() }
    const p = progressRef.current
    const next: Progress = { ...p, scores: [entry, ...(p.scores ?? [])].slice(0, 12) }
    progressRef.current = next
    setProgress(next)
    saveProgress(next)
  }

  function setPracticePhrase(p: string): void {
    setPracticePhraseState(p)
    go('pronunciation')
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
    saveScore,
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
