import type { ProviderId, Settings } from '../types'

export interface ProviderMeta {
  label: string
  baseUrl: string
  defaultModel: string
  needsKey: boolean
  hint: string
}

export const PROVIDERS: Record<ProviderId, ProviderMeta> = {
  openai: {
    label: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    defaultModel: 'gpt-4o-mini',
    needsKey: true,
    hint: 'Clé sur platform.openai.com',
  },
  openrouter: {
    label: 'OpenRouter',
    baseUrl: 'https://openrouter.ai/api/v1',
    defaultModel: 'meta-llama/llama-3.3-70b-instruct:free',
    needsKey: true,
    hint: 'Des modèles gratuits existent sur openrouter.ai',
  },
  gemini: {
    label: 'Google AI Studio (Gemini)',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    defaultModel: 'gemini-1.5-flash',
    needsKey: true,
    hint: 'Clé gratuite sur aistudio.google.com',
  },
  groq: {
    label: 'Groq',
    baseUrl: 'https://api.groq.com/openai/v1',
    defaultModel: 'llama-3.3-70b-versatile',
    needsKey: true,
    hint: 'Clé gratuite sur console.groq.com',
  },
  ollama: {
    label: 'Ollama (local)',
    baseUrl: 'http://localhost:11434/v1',
    defaultModel: 'gemma2:2b',
    needsKey: false,
    hint: 'Sur ta machine : OLLAMA_ORIGINS="*" ollama serve (autorise le navigateur)',
  },
  cerebras: {
    label: 'Cerebras (gratuit)',
    baseUrl: 'https://api.cerebras.ai/v1',
    defaultModel: 'llama-3.3-70b',
    needsKey: true,
    hint: 'Cle gratuite sur cloud.cerebras.ai — 1M de tokens/jour',
  },
  webllm: {
    label: 'IA intégrée (navigateur)',
    baseUrl: '',
    defaultModel: 'Llama-3.2-1B-Instruct-q4f16_1-MLC',
    needsKey: false,
    hint: 'Tourne dans le navigateur, sans clé — Gemini Nano (Chrome) ou modèle WebGPU téléchargé une seule fois (~700 Mo)',
  },
}

export interface ChatMsg {
  role: 'user' | 'assistant'
  content: string
}

/** Retire les secrets des messages d'erreur affiches. */
export function redact(msg: string): string {
  return msg.replace(/key=[^&\s"]+/g, 'key=***').replace(/sk-[A-Za-z0-9_-]{8,}/g, 'sk-***')
}

export function resolveBaseUrl(s: Settings): string {
  return s.baseUrl.trim() || PROVIDERS[s.provider].baseUrl
}

export function resolveModel(s: Settings): string {
  return s.model.trim() || PROVIDERS[s.provider].defaultModel
}

/** Genere les payloads JSON des lignes "data:" d'un flux SSE. */
async function* parseSse(reader: ReadableStreamDefaultReader<Uint8Array>): AsyncGenerator<string> {
  const decoder = new TextDecoder()
  let buffer = ''
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    let nl: number
    while ((nl = buffer.indexOf('\n')) !== -1) {
      const line = buffer.slice(0, nl).trim()
      buffer = buffer.slice(nl + 1)
      if (!line.startsWith('data:')) continue
      const data = line.slice(5).trim()
      if (!data || data === '[DONE]') continue
      yield data
    }
  }
}

async function* streamOpenAi(
  s: Settings,
  system: string,
  messages: ChatMsg[],
  signal?: AbortSignal,
): AsyncGenerator<string> {
  const res = await fetch(`${resolveBaseUrl(s)}/chat/completions`, {
    method: 'POST',
    signal,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${s.apiKey}`,
    },
    body: JSON.stringify({
      model: resolveModel(s),
      stream: true,
      temperature: 0.7,
      messages: [{ role: 'system', content: system }, ...messages],
    }),
  })
  if (!res.ok || !res.body) {
    throw new Error(`HTTP ${res.status} : ${redact(await res.text())}`)
  }
  for await (const data of parseSse(res.body.getReader())) {
    try {
      const json = JSON.parse(data) as {
        choices?: Array<{ delta?: { content?: string } }>
      }
      const delta = json.choices?.[0]?.delta?.content
      if (typeof delta === 'string' && delta) yield delta
    } catch {
      // keep-alive ou ligne partielle
    }
  }
}

async function* streamGemini(
  s: Settings,
  system: string,
  messages: ChatMsg[],
  signal?: AbortSignal,
): AsyncGenerator<string> {
  const url =
    `${resolveBaseUrl(s)}/models/${resolveModel(s)}:streamGenerateContent` +
    `?alt=sse&key=${encodeURIComponent(s.apiKey)}`
  const res = await fetch(url, {
    method: 'POST',
    signal,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: messages.map((m) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }],
      })),
      generationConfig: { temperature: 0.7 },
    }),
  })
  if (!res.ok || !res.body) {
    throw new Error(`HTTP ${res.status} : ${redact(await res.text())}`)
  }
  for await (const data of parseSse(res.body.getReader())) {
    try {
      const json = JSON.parse(data) as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
      }
      for (const p of json.candidates?.[0]?.content?.parts ?? []) {
        if (typeof p.text === 'string' && p.text) yield p.text
      }
    } catch {
      // ligne partielle
    }
  }
}

/** Duree maximale d'attente du premier jet du modele. */
const FIRST_TOKEN_TIMEOUT = 30000

/** Message quand aucun fournisseur utilisable n'est configure. */
export const NO_KEY_MSG =
  'Aucune clé API configurée. Ouvre Paramètres (engrenage) pour en ajouter une, ou choisis le fournisseur « IA intégrée (navigateur) » qui fonctionne sans clé.'

/** Fait echouer le flux si aucun premier jet n'arrive dans les 30 s (modele qui pend). */
async function* guardFirstToken(gen: AsyncGenerator<string>): AsyncGenerator<string> {
  const it = gen[Symbol.asyncIterator]()
  let first = true
  for (;;) {
    if (first) {
      let timer: ReturnType<typeof setTimeout> | undefined
      try {
        const res = await Promise.race([
          it.next(),
          new Promise<never>((_, rej) => {
            timer = setTimeout(
              () =>
                rej(
                  new Error(
                    'Le modèle ne répond pas depuis 30 s. Vérifie ta clé et le modèle, ou choisis « IA intégrée (navigateur) ».',
                  ),
                ),
              FIRST_TOKEN_TIMEOUT,
            )
          }),
        ])
        if (res.done) return
        if (res.value) yield res.value
        first = false
      } finally {
        if (timer) clearTimeout(timer)
      }
    } else {
      const res = await it.next()
      if (res.done) return
      yield res.value
    }
  }
}

/** Ordre de preference de la bascule automatique (hors fournisseur principal). */
const CASCADE_ORDER: ProviderId[] = ['gemini', 'groq', 'cerebras', 'openrouter', 'openai']

/** Chaine de bascule : fournisseur actif (si utilisable), secours avec cle, puis IA integree en option. */
export function failoverChain(s: Settings): ProviderId[] {
  const chain: ProviderId[] = []
  const usable = (p: ProviderId): boolean =>
    p === 'webllm' || !PROVIDERS[p].needsKey || !!(s.keys?.[p] ?? s.apiKey).trim()
  if (usable(s.provider)) chain.push(s.provider)
  for (const p of CASCADE_ORDER) {
    if (p !== s.provider && (s.keys?.[p] ?? '').trim()) chain.push(p)
  }
  if (s.useBrowserFallback && s.provider !== 'webllm') chain.push('webllm')
  return chain
}

/** Reglages reecrits pour appeler un fournisseur donne de la chaine. */
function settingsFor(s: Settings, p: ProviderId): Settings {
  if (p === s.provider) return s
  return { ...s, provider: p, apiKey: (s.keys?.[p] ?? '').trim(), baseUrl: '' }
}

/** Diffuse la reponse du tuteur morceau par morceau, avec bascule automatique :
 *  si le fournisseur actif echoue AVANT le premier jet (limite, cle, timeout 30 s...),
 *  on reessaie avec les secours configures. Une fois le flux commence, on ne change plus. */
export async function* streamChat(
  s: Settings,
  system: string,
  messages: ChatMsg[],
  signal?: AbortSignal,
): AsyncGenerator<string> {
  const chain = failoverChain(s)
  if (chain.length === 0) throw new Error(NO_KEY_MSG)

  let lastErr: unknown
  for (let i = 0; i < chain.length; i++) {
    const p = chain[i]
    const got = { first: false }
    try {
      const gen =
        p === 'webllm'
          ? (async function* () {
              const m = await import('./webllm')
              yield* m.streamBrowserAI(settingsFor(s, p), system, messages, signal)
            })()
          : p === 'gemini'
            ? streamGemini(settingsFor(s, p), system, messages, signal)
            : streamOpenAi(settingsFor(s, p), system, messages, signal)
      for await (const chunk of guardFirstToken(gen)) {
        got.first = true
        yield chunk
      }
      return
    } catch (e) {
      lastErr = e
      // Un jet deja emis : impossible de changer de fournisseur sans dupliquer -> on remonte.
      if (got.first || i === chain.length - 1) throw e
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error(String(lastErr))
}
