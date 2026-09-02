import { useEffect, useRef, useState } from 'react'
import { useApp } from '../state/store'
import { listen, sttSupported } from '../lib/stt'
import { speak, stopSpeak } from '../lib/tts'
import { wordDiffLabel } from '../lib/similarity'
import { CATEGORY_LABELS } from '../lib/exercises'
import { dayLabel } from '../lib/dayLabel'

export default function Conversation(): JSX.Element {
  const { conv, sessions, sendMessage, stopStreaming, go, settings } = useApp()
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

  const session = sessions.find((s) => s.id === conv.sessionId)

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
      <div className="chat" ref={scrollRef} style={{ maxHeight: '62vh', overflowY: 'auto', padding: '8px 2px' }}>
        {session && <div className="date-pill">{dayLabel(session.ts)}</div>}

        {conv.messages.map((m, i) => {
          const isLast = i === conv.messages.length - 1
          const typing = m.role === 'assistant' && isLast && conv.streaming && !m.content
          const diff =
            m.role === 'user' && m.correction ? wordDiffLabel(m.content, m.correction) : null
          const row =
            m.role === 'user' ? (
              <div key={i} className="msg-row user">
                <div className="bubble user">
                  <span>{m.content}</span>
                  {m.correction && (
                    <div className="correction">
                      ✔️{' '}
                      {diff ? (
                        <>
                          {diff.before && `${diff.before} `}
                          <span className="diff-del">{diff.wrong}</span> {diff.right}
                          {diff.after && ` ${diff.after}`}
                        </>
                      ) : (
                        m.correction
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div key={i} className="msg-row assistant">
                <span className="orb" aria-hidden="true" />
                <div className="bubble assistant">
                  {typing ? (
                    <span className="typing" aria-label="Le tuteur écrit">
                      <i />
                      <i />
                      <i />
                    </span>
                  ) : (
                    <span>{m.content}</span>
                  )}
                  {m.cat && <span className="tag-chip cat-tag">{CATEGORY_LABELS[m.cat] ?? m.cat}</span>}
                  {m.content && (
                    <div className="tools">
                      <button
                        onClick={() => speak(m.content, settings.voiceURI, settings.rate)}
                        title="Écouter"
                      >
                        🔊
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          return row
        })}

        {interim && (
          <div className="msg-row user">
            <div className="bubble user" style={{ opacity: 0.7 }}>
              {interim}…
            </div>
          </div>
        )}
      </div>

      {conv.error && <div className="error">{conv.error}</div>}
      {micError && <div className="error">{micError}</div>}

      <div className="inputbar">
        <div className="pill-bar">
          {sttSupported() && (
            <button className={`mic-btn ${listening ? 'rec' : ''}`} onClick={toggleMic} title="Parler">
              {listening ? '⏹' : '🎤'}
            </button>
          )}
          <input
            type="text"
            placeholder="Écris en anglais…"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
          />
          {conv.streaming ? (
            <button className="send-btn stop" onClick={stopStreaming} title="Interrompre">
              ■
            </button>
          ) : (
            <button className="send-btn" onClick={send} disabled={!text.trim()} title="Envoyer">
              ➤
            </button>
          )}
        </div>
        {(settings.autoSpeak || listening) && (
          <p className="auto-note">
            {settings.autoSpeak && <>🔊 Lecture automatique — <button onClick={() => go('settings')}>régler</button></>}
            {settings.autoSpeak && listening && ' · '}
            {listening && <button onClick={() => stopSpeak()}>couper la voix</button>}
          </p>
        )}
      </div>
    </div>
  )
}
