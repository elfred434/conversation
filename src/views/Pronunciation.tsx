import { useMemo, useState } from 'react'
import { useApp } from '../state/store'
import { DAILY_PHRASES } from '../lib/lessons'
import { listen, sttSupported } from '../lib/stt'
import { scoreWords, pronunciationScore } from '../lib/similarity'
import { speak } from '../lib/tts'

export default function Pronunciation(): JSX.Element {
  const { practicePhrase, settings, go } = useApp()
  const [target, setTarget] = useState<string>(practicePhrase ?? DAILY_PHRASES[0])
  const [free, setFree] = useState('')
  const [transcript, setTranscript] = useState('')
  const [done, setDone] = useState(false)
  const [listening, setListening] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [stopFn, setStopFn] = useState<(() => void) | null>(null)

  const score = useMemo(() => (done ? pronunciationScore(target, transcript) : 0), [done, target, transcript])
  const words = useMemo(() => (done ? scoreWords(target, transcript) : []), [done, target, transcript])

  function setNewTarget(t: string): void {
    setTarget(t)
    setTranscript('')
    setDone(false)
    setError(null)
  }

  const listenTarget = (): void => speak(target, settings.voiceURI, settings.rate)

  const readMine = (): void => {
    const t = free.trim()
    if (!t) return
    setNewTarget(t)
    speak(t, settings.voiceURI, settings.rate)
  }

  const toggleMic = (): void => {
    if (listening) {
      stopFn?.()
      setListening(false)
      return
    }
    setError(null)
    setTranscript('')
    const stop = listen({
      lang: 'en-US',
      onFinal: (t) => {
        setTranscript(t)
        setDone(true)
      },
      onError: (m) => setError(m),
      onEnd: () => setListening(false),
    })
    setStopFn(() => stop)
    setListening(true)
  }

  return (
    <div>
      <button className="back" onClick={() => go('home')}>
        ← Accueil
      </button>
      <h1 className="title">Prononciation</h1>
      <p className="subtitle">Écoute la phrase, répète-la au micro, et compare.</p>

      <div className="card">
        <label className="field">
          <span>Ta phrase (optionnel) — l'app la lit pour te montrer la prononciation</span>
          <div className="row">
            <input
              type="text"
              placeholder="Écris une phrase en anglais…"
              value={free}
              onChange={(e) => setFree(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && readMine()}
            />
            <button className="btn btn-outline btn-sm" onClick={readMine} disabled={!free.trim()}>
              🔊 Lire
            </button>
          </div>
        </label>

        <span className="muted">Ou choisis une phrase du quotidien :</span>
        <div className="chips">
          {DAILY_PHRASES.map((p) => (
            <button key={p} className={`chip ${p === target ? 'active' : ''}`} onClick={() => setNewTarget(p)}>
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="row">
          <div className="grow target">{target}</div>
          <button className="btn btn-outline btn-sm" onClick={listenTarget}>
            🔊 Écouter
          </button>
        </div>
      </div>

      {done && (
        <div className="card center">
          <div className="score">{Math.round(score * 100)} %</div>
          <p className="muted">Tu as dit : « {transcript || '—'} »</p>
          <div className="words">
            {words.map((w, i) => (
              <span key={i} className={w.matched ? 'ok' : 'ko'}>
                {w.word}
              </span>
            ))}
          </div>
        </div>
      )}

      {error && <div className="error">{error}</div>}
      {!sttSupported() && <div className="error">Micro non supporté sur ce navigateur — utilise Chrome ou Edge.</div>}

      <div className="row" style={{ justifyContent: 'center', marginTop: 14 }}>
        <button className={`btn ${listening ? 'btn-danger' : ''}`} onClick={toggleMic}>
          {listening ? '⏹ Arrêter' : '🎤 Répéter au micro'}
        </button>
        <button
          className="btn btn-outline"
          onClick={() => setNewTarget(DAILY_PHRASES[Math.floor(Math.random() * DAILY_PHRASES.length)])}
        >
          ⏭ Phrase suivante
        </button>
      </div>
    </div>
  )
}
