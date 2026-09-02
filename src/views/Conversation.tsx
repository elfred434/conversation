import { useEffect, useRef, useState } from 'react'
import { useApp } from '../state/store'
import { listen, sttSupported } from '../lib/stt'
import { speak, stopSpeak } from '../lib/tts'

export default function Conversation(): JSX.Element {
  const { conv, sendMessage, stopStreaming, go, settings } = useApp()
  const [text, setText] = useState('')
  const [listening, setListening] = useState(false)
  const [interim, setInterim] = useState('')
  const [micError, setMicError] = useState<string | null>(null)
  const stopListenRef = useRef<(() => void) | null>(null)
  const scrollRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [conv?.messages, interim])

  useEffect(() => () => stopListenRef.current?.(), [])

  if (!conv) {
    return (
      <div>
        <p className="subtitle">Aucune conversation active.</p>
        <button className="btn" onClick={() => go('home')}>
          ← Accueil
        </button>
      </div>
    )
  }

  const send = (): void => {
    if (!text.trim() || conv.streaming) return
    sendMessage(text)
    setText('')
  }

  const toggleMic = (): void => {
    if (listening) {
      stopListenRef.current?.()
      setListening(false)
      return
    }
    setMicError(null)
    setInterim('')
    stopListenRef.current = listen({
      lang: 'en-US',
      onInterim: setInterim,
      onFinal: (t) => {
        if (!conv.streaming) sendMessage(t)
      },
      onError: (m) => setMicError(m),
      onEnd: () => setListening(false),
    })
    setListening(true)
  }

  return (
    <div>
      <button className="back" onClick={() => go('home')}>
        ← Accueil
      </button>
      <div className="chat" ref={scrollRef} style={{ maxHeight: '60vh', overflowY: 'auto', padding: '4px 2px' }}>
        {conv.messages.map((m, i) => {
          const isLast = i === conv.messages.length - 1
          const typing = m.role === 'assistant' && isLast && conv.streaming && !m.content
          return (
            <div key={i} className={`bubble ${m.role}`}>
              <span className={typing ? 'typing' : ''}>{m.content || ' '}</span>
              {m.correction && <div className="correction">✔️ {m.correction}</div>}
              {m.role === 'assistant' && m.content && (
                <div className="tools">
                  <button onClick={() => speak(m.content, settings.voiceURI, settings.rate)} title="Écouter">
                    🔊
                  </button>
                </div>
              )}
            </div>
          )
        })}
        {interim && <div className="bubble user" style={{ opacity: 0.7 }}>{interim}…</div>}
      </div>

      {conv.error && <div className="error">{conv.error}</div>}
      {micError && <div className="error">{micError}</div>}

      <div className="inputbar">
        <input
          type="text"
          placeholder="Écris en anglais…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
        />
        {sttSupported() && (
          <button className={`mic-btn ${listening ? 'rec' : ''}`} onClick={toggleMic} title="Parler">
            {listening ? '⏹' : '🎤'}
          </button>
        )}
        {conv.streaming ? (
          <button className="btn" onClick={stopStreaming}>
            Stop
          </button>
        ) : (
          <button className="btn" onClick={send} disabled={!text.trim()}>
            Envoyer
          </button>
        )}
      </div>
      {settings.autoSpeak && (
        <p className="muted center" style={{ margin: '4px 0' }}>
          🔊 Lecture automatique active — <button className="back" onClick={() => go('settings')}>régler</button>
        </p>
      )}
      {listening && (
        <button className="back center" style={{ display: 'block', margin: '0 auto' }} onClick={() => stopSpeak()}>
          couper la voix
        </button>
      )}
    </div>
  )
}
