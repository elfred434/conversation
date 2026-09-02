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

/** Diffuse la reponse du tuteur morceau par morceau (messages inclut le tour user). */
export function streamChat(
  s: Settings,
  system: string,
  messages: ChatMsg[],
  signal?: AbortSignal,
): AsyncGenerator<string> {
  return s.provider === 'gemini'
    ? streamGemini(s, system, messages, signal)
    : streamOpenAi(s, system, messages, signal)
}
