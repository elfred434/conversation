/** STT navigateur : Web Speech API (Chrome/Edge desktop + Android).
 * Firefox ne la supporte pas -> sttSupported() permet d'afficher un repli. */

export interface ListenOpts {
  onInterim?: (text: string) => void
  onFinal?: (text: string) => void
  onEnd?: () => void
  onError?: (message: string) => void
  lang?: string
}

export function sttSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    !!((window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition)
  )
}

/** Demarre l'ecoute ; renvoie une fonction stop. */
export function listen(opts: ListenOpts): () => void {
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike
    webkitSpeechRecognition?: new () => SpeechRecognitionLike
  }
  const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition
  if (!Ctor) {
    opts.onError?.('Reconnaissance vocale non supportée par ce navigateur (utilise Chrome ou Edge).')
    opts.onEnd?.()
    return () => {}
  }
  const rec = new Ctor()
  rec.lang = opts.lang ?? 'en-US'
  rec.interimResults = true
  rec.continuous = false
  let finalText = ''
  rec.onresult = (e) => {
    let interim = ''
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const r = e.results[i]
      if (r.isFinal) finalText += r[0].transcript
      else interim += r[0].transcript
    }
    if (interim) opts.onInterim?.(interim)
    if (finalText.trim()) opts.onFinal?.(finalText.trim())
  }
  rec.onerror = (e) => opts.onError?.(e.error ?? 'erreur micro')
  rec.onend = () => opts.onEnd?.()
  rec.start()
  return () => {
    try {
      rec.stop()
    } catch {
      // deja arrete
    }
  }
}

interface SpeechRecognitionLike {
  lang: string
  continuous: boolean
  interimResults: boolean
  start(): void
  stop(): void
  onresult: ((e: SpeechRecognitionEventLike) => void) | null
  onerror: ((e: { error: string }) => void) | null
  onend: (() => void) | null
}

interface SpeechRecognitionEventLike {
  resultIndex: number
  results: { length: number; [i: number]: { isFinal: boolean; 0: { transcript: string } } }
}
