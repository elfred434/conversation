import type { Settings } from '../types'
import type { ChatMsg } from './llm'
import { resolveModel } from './llm'

/** IA integree : tourne DANS le navigateur, sans cle API ni serveur.
 *  1) Gemini Nano via l'API LanguageModel de Chrome si disponible (gratuit, deja la)
 *  2) sinon un modele WebLLM (WebGPU) telecharge une seule fois puis mis en cache. */

export const BROWSER_MODEL = 'Llama-3.2-1B-Instruct-q4f16_1-MLC'

export interface AiProgress {
  progress?: number
  text?: string
  done?: boolean
}

export function emitProgress(detail: AiProgress): void {
  window.dispatchEvent(new CustomEvent<AiProgress>('ff-ai-progress', { detail }))
}

export function webgpuSupported(): boolean {
  return typeof navigator !== 'undefined' && 'gpu' in navigator
}

export function nativeAIAvailable(): boolean {
  return typeof window !== 'undefined' && 'LanguageModel' in window
}

interface NativeSession {
  promptStreaming: (text: string) => AsyncIterable<string>
}
interface NativeLM {
  create: (opts: unknown) => Promise<NativeSession>
  availability?: () => Promise<string>
}
function nativeLM(): NativeLM | null {
  return typeof window !== 'undefined'
    ? ((window as unknown as { LanguageModel?: NativeLM }).LanguageModel ?? null)
    : null
}

interface DownloadMonitor {
  monitor: (m: { addEventListener: (t: string, cb: (e: { loaded: number }) => void) => void }) => void
}

function dlMonitor(onProg: (d: AiProgress) => void): DownloadMonitor {
  return {
    monitor: (m) =>
      m.addEventListener('downloadprogress', (e) =>
        onProg({ progress: e.loaded, text: 'Téléchargement de Gemini Nano…' }),
      ),
  }
}

async function* nativeStream(
  system: string,
  messages: ChatMsg[],
  onProg: (d: AiProgress) => void,
): AsyncGenerator<string> {
  const LM = nativeLM()
  if (!LM) throw new Error('LanguageModel indisponible')
  const prior = messages.slice(0, -1).map((m) => ({
    role: m.role === 'user' ? 'user' : 'assistant',
    content: m.content,
  }))
  const session = await LM.create({
    initialPrompts: [{ role: 'system', content: system }, ...prior],
    ...dlMonitor(onProg),
  })
  yield* session.promptStreaming(messages[messages.length - 1].content)
}

interface WebLlmChunk {
  choices?: Array<{ delta?: { content?: string } }>
}
interface WebLlmEngine {
  chat: { completions: { create: (opts: unknown) => Promise<AsyncIterable<WebLlmChunk>> } }
}

let enginePromise: Promise<WebLlmEngine> | null = null

async function getWebLlmEngine(
  model: string,
  onProg: (d: AiProgress) => void,
): Promise<WebLlmEngine> {
  if (!enginePromise) {
    enginePromise = (async () => {
      const webllm = await import('@mlc-ai/web-llm')
      const engine = await webllm.CreateMLCEngine(model, {
        initProgressCallback: (r) => onProg({ progress: r.progress, text: r.text }),
      })
      return engine as unknown as WebLlmEngine
    })()
    enginePromise.catch(() => {
      enginePromise = null
    })
  }
  return enginePromise
}

async function* webllmStream(
  s: Settings,
  system: string,
  messages: ChatMsg[],
  onProg: (d: AiProgress) => void,
): AsyncGenerator<string> {
  const engine = await getWebLlmEngine(resolveModel(s), onProg)
  const chunks = await engine.chat.completions.create({
    messages: [{ role: 'system', content: system }, ...messages],
    stream: true,
    temperature: 0.7,
  })
  for await (const c of chunks) {
    const d = c.choices?.[0]?.delta?.content
    if (typeof d === 'string' && d) yield d
  }
}

/** Flux du tuteur via l'IA du navigateur (prefere Gemini Nano, repli WebLLM). */
export async function* streamBrowserAI(
  s: Settings,
  system: string,
  messages: ChatMsg[],
  _signal?: AbortSignal,
): AsyncGenerator<string> {
  try {
    if (nativeAIAvailable()) {
      yield* nativeStream(system, messages, emitProgress)
      return
    }
  } catch {
    // Gemini Nano a echoue (pas telecharge, quota...) -> repli WebLLM
  }
  if (!webgpuSupported()) {
    throw new Error(
      "IA intégrée indisponible : ce navigateur n'a pas WebGPU. Utilise Chrome ou Edge récent, ou un fournisseur avec clé API.",
    )
  }
  yield* webllmStream(s, system, messages, emitProgress)
}

/** Prepare le modele a l'avance (bouton Reglages) et renvoie quel moteur est utilise. */
export async function ensureBrowserAI(s: Settings): Promise<string> {
  if (nativeAIAvailable()) {
    const LM = nativeLM()
    const session = await LM!.create(dlMonitor(emitProgress))
    for await (const chunk of session.promptStreaming('Say "ready".')) void chunk
    emitProgress({ done: true })
    return 'Gemini Nano (Chrome)'
  }
  if (!webgpuSupported()) {
    throw new Error('WebGPU indisponible sur ce navigateur')
  }
  await getWebLlmEngine(resolveModel(s), emitProgress)
  emitProgress({ done: true })
  return 'Modèle WebLLM téléchargé (WebGPU)'
}
