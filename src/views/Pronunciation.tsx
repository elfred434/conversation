import { useEffect, useMemo, useState } from 'react'
import { Mic, SkipForward, Volume2 } from 'lucide-react'
import { useApp } from '../state/store'
import { DAILY_PHRASES } from '../lib/lessons'
import { listen, sttSupported } from '../lib/stt'
import { scoreWords, pronunciationScore } from '../lib/similarity'
import { speak } from '../lib/tts'

const R = 78
const CIRC = 2 * Math.PI * R

/** Anneau de score : se dessine en 1,2s pendant que le compteur grimpe. */
function ScoreRing({ value }: { value: number }): JSX.Element {
  const [armed, setArmed] = useState(false)
  const [shown, setShown] = useState(0)

  useEffect(() => {
    const t = window.setTimeout(() => setArmed(true), 40)
    const start = performance.now()
    let raf = 0
    const tick = (now: number): void => {
      const p = Math.min(1, (now - start) / 1100)
      setShown(Math.round(value * 100 * (1 - Math.pow(1 - p, 3))))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      window.clearTimeout(t)
      cancelAnimationFrame(raf)
    }
  }, [value])

  return (
    <div className="score-wrap">
      <svg className="score-ring" viewBox="0 0 190 190">
        <defs>
          <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#22D3EE" />
          </linearGradient>
        </defs>
        <circle className="track" cx="95" cy="95" r={R} />
        <circle
          className="arc"
          cx="95"
          cy="95"
          r={R}
          strokeDasharray={CIRC}
          strokeDashoffset={armed ? CIRC * (1 - value) : CIRC}
        />
      </svg>
      <div className="score-center">
        <div className="score-num">
          {shown}
          <span>%</span>
        </div>
        <div className="score-cap">précision</div>
      </div>
    </div>
  )
}

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
      <h1 className="title center">Prononciation</h1>
      <p className="subtitle center">Écoute la phrase, répète-la au micro, et compare.</p>

      {done && <ScoreRing value={score} />}

      <div className="card center">
        <div className="target" style={{ fontStyle: 'italic' }}>
          « {target} »
        </div>
        {done && (
          <>
            <p className="muted" style={{ margin: '10px 0 0' }}>
              Tu as dit : « {transcript || '—'} »
            </p>
            <div className="words">
              {words.map((w, i) => (
                <span key={i} className={`word ${w.matched ? 'ok' : 'ko'}`} style={{ animationDelay: `${i * 70}ms` }}>
                  {w.word}
                </span>
              ))}
            </div>
          </>
        )}
        <div className="row" style={{ justifyContent: 'center', marginTop: 14 }}>
          <button className="btn btn-outline btn-sm" onClick={() => speak(target, settings.voiceURI, settings.rate)}>
            <Volume2 size={16} /> Écouter
          </button>
        </div>
      </div>

      <div className="card">
        <label className="field">
          <span>Ta phrase (optionnel) — l'app la lit pour te montrer la prononciation</span>
          <div className="key-row">
            <input
              type="text"
              placeholder="Écris une phrase en anglais…"
              value={free}
              onChange={(e) => setFree(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && readMine()}
            />
            <button className="btn btn-outline btn-sm" onClick={readMine} disabled={!free.trim()} aria-label="Lire">
              <Volume2 size={16} />
            </button>
          </div>
        </label>

        <span className="field-label">Ou choisis une phrase du quotidien :</span>
        <div className="chips">
          {DAILY_PHRASES.slice(0, 5).map((p) => (
            <button key={p} className={`chip ${p === target ? 'active' : ''}`} onClick={() => setNewTarget(p)}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="error">{error}</div>}
      {!sttSupported() && <div className="error">Micro non supporté sur ce navigateur — utilise Chrome ou Edge.</div>}

      <div className="row" style={{ justifyContent: 'center', marginTop: 14 }}>
        <button className={`btn ${listening ? 'btn-danger' : ''}`} onClick={toggleMic}>
          <Mic size={17} /> {listening ? 'Arrêter' : 'Répéter au micro'}
        </button>
        <button
          className="btn btn-outline"
          onClick={() => setNewTarget(DAILY_PHRASES[Math.floor(Math.random() * DAILY_PHRASES.length)])}
        >
          Phrase suivante <SkipForward size={16} />
        </button>
      </div>
    </div>
  )
}
