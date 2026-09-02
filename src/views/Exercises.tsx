import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { ArrowLeft, ArrowRight, Check, Lightbulb, RotateCcw, Settings2, Sparkles, WifiOff, X } from 'lucide-react'
import { CATEGORY_LABELS, EXERCISES, pickTargetedExercises } from '../lib/exercises'
import { generateExercises } from '../lib/aiExercises'
import { NO_KEY_MSG } from '../lib/llm'
import { isAnswerCloseEnough } from '../lib/similarity'
import { useApp } from '../state/store'
import type { Exercise } from '../lib/exercises'

const COUNT = 10

type Phase = 'loading' | 'active' | 'result'
type Source = 'ai' | 'bank'

export default function Exercises(): JSX.Element {
  const { progress, level, settings, go } = useApp()
  const [round, setRound] = useState(0)
  const [phase, setPhase] = useState<Phase>('loading')
  const [source, setSource] = useState<Source>('bank')
  const [genError, setGenError] = useState<string | null>(null)
  const [list, setList] = useState<Exercise[]>([])
  const [index, setIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [checked, setChecked] = useState(false)
  const [wasCorrect, setWasCorrect] = useState(false)
  const [answer, setAnswer] = useState('')

  // Miroirs pour l'effet (on ne regenere PAS quand l'utilisateur touche un reglage).
  const settingsRef = useRef(settings)
  settingsRef.current = settings
  const levelRef = useRef(level)
  levelRef.current = level
  const progressRef = useRef(progress)
  progressRef.current = progress
  const previousRef = useRef<string[]>([])

  useEffect(() => {
    let cancelled = false
    const ac = new AbortController()
    setPhase('loading')
    setGenError(null)
    setIndex(0)
    setScore(0)
    setChecked(false)
    setWasCorrect(false)
    setAnswer('')

    const run = async (): Promise<void> => {
      try {
        const lvl = levelRef.current ?? 'b1'
        const generated = await generateExercises(
          settingsRef.current,
          lvl,
          progressRef.current,
          COUNT,
          previousRef.current,
          ac.signal,
        )
        if (cancelled) return
        previousRef.current = generated.map((e) => e.question)
        setList(generated)
        setSource('ai')
        setGenError(null)
        setPhase('active')
      } catch (e) {
        if (cancelled || ac.signal.aborted) return
        const msg = e instanceof Error ? e.message : String(e)
        setList(pickTargetedExercises(EXERCISES, progressRef.current, COUNT))
        setSource('bank')
        setGenError(msg === NO_KEY_MSG ? null : msg)
        setPhase('active')
      }
    }
    void run()
    return () => {
      cancelled = true
      ac.abort()
    }
    // Only regenerates to a new "round".
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round])

  const ex = list[index]
  const blankParts = ex ? ex.question.split('___') : []
  const isBlank = blankParts.length === 2

  const check = (): void => {
    if (checked || !ex) return
    const ok = isAnswerCloseEnough(answer, ex.answer)
    setChecked(true)
    setWasCorrect(ok)
    if (ok) setScore((s) => s + 1)
  }

  const next = (): void => {
    if (index + 1 >= list.length) {
      setPhase('result')
      return
    }
    setIndex((i) => i + 1)
    setChecked(false)
    setWasCorrect(false)
    setAnswer('')
  }

  const restart = (): void => setRound((r) => r + 1)

  if (phase === 'loading') {
    return (
      <div>
        <button className="back" onClick={() => go('home')}>
          <ArrowLeft size={16} /> Accueil
        </button>
        <h1 className="title">Exercices ciblés</h1>
        <p className="subtitle">Priorisés selon tes erreurs les plus fréquentes en conversation.</p>
        <div className="card center ex-loading">
          <span className="typing" aria-label="Génération en cours">
            <i />
            <i />
            <i />
          </span>
          <p style={{ margin: '8px 0 0' }}>
            <Sparkles size={15} style={{ verticalAlign: '-2px', color: 'var(--cyan)' }} /> L'IA prépare des
            exercices sur mesure…
          </p>
          <p className="muted" style={{ margin: '4px 0 0', fontSize: '0.85rem' }}>
            d'après tes {progress.total} erreur{progress.total > 1 ? 's' : ''} corrigée
            {progress.total > 1 ? 's' : ''} en conversation
          </p>
        </div>
      </div>
    )
  }

  if (phase === 'result') {
    const ratio = score / Math.max(1, list.length)
    return (
      <div>
        <button className="back" onClick={() => go('home')}>
          <ArrowLeft size={16} /> Accueil
        </button>
        <h1 className="title center">Terminé !</h1>
        <div className="card center ex-result">
          <ScoreBig score={score} total={list.length} />
          <p className="muted">
            {ratio >= 0.8
              ? 'Excellent, continue comme ça !'
              : ratio >= 0.5
                ? 'Bien ! Encore un petit effort.'
                : 'Chaque erreur corrigée te fait progresser.'}
          </p>
          <button className="btn" onClick={restart}>
            <Sparkles size={17} /> Nouvelle série par l'IA
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <button className="back" onClick={() => go('home')}>
        <ArrowLeft size={16} /> Accueil
      </button>
      <h1 className="title">Exercices ciblés</h1>
      <p className="subtitle">Priorisés selon tes erreurs les plus fréquentes en conversation.</p>

      <div className="gen-note">
        {source === 'ai' ? (
          <>
            <Sparkles size={14} /> Série personnalisée générée par l'IA
            <button
              className="icon-btn"
              style={{ marginLeft: 'auto', width: 32, height: 32, padding: 0 }}
              onClick={restart}
              title="Régénérer une nouvelle série"
            >
              <RotateCcw size={14} />
            </button>
          </>
        ) : (
          <>
            <WifiOff size={14} /> Banque hors-ligne intégrée
          </>
        )}
      </div>

      {source === 'bank' && (
        <p className="note">
          {genError ? (
            <>IA indisponible ({genError}) — exercices de la banque intégrée.</>
          ) : (
            <>
              Ajoute une clé API dans{' '}
              <button className="back" style={{ display: 'inline', padding: 0 }} onClick={() => go('settings')}>
                Paramètres
              </button>{' '}
              pour des exercices générés par IA.
            </>
          )}
        </p>
      )}

      <div className={`card ${checked && wasCorrect ? 'glow' : ''}`}>
        <div className="ex-top">
          <span className="cat-chip">{CATEGORY_LABELS[ex.category] ?? ex.category}</span>
          <span className="q-count">
            Question {index + 1} / {list.length} · Score : {score}
          </span>
        </div>
        <div className="progressbar">
          <i style={{ '--p': String(index / list.length) } as CSSProperties} />
        </div>

        {isBlank ? (
          <p className="ex-sentence">
            {blankParts[0]}
            <input
              className={`blank-input ${checked && !wasCorrect ? 'bad' : ''}`}
              style={{ width: `${Math.max(ex.answer.length, answer.length, 6)}ch` }}
              placeholder="▁▁▁"
              value={answer}
              disabled={checked}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (checked ? next() : check())}
            />
            {blankParts[1]}
          </p>
        ) : (
          <p className="ex-sentence">{ex.question}</p>
        )}

        {!isBlank && !checked && (
          <input
            type="text"
            placeholder="Ta réponse…"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && check()}
          />
        )}

        {checked ? (
          <div className="answer-feedback">
            <span className={`verdict ${wasCorrect ? 'ok' : 'ko'}`}>
              {wasCorrect ? <Check size={17} /> : <X size={17} />}
              {wasCorrect ? 'Bravo, c\'est correct !' : 'Pas tout à fait.'}
            </span>
            {!wasCorrect && (
              <>
                <div>
                  Bonne réponse : <strong>{ex.answer}</strong>
                </div>
                {ex.hint && (
                  <div className="hint">
                    <Lightbulb size={15} /> {ex.hint}
                  </div>
                )}
              </>
            )}
            {wasCorrect && ex.hint && (
              <div className="hint">
                <Lightbulb size={15} /> {ex.hint}
              </div>
            )}
            <button className="btn btn-block" style={{ marginTop: 14 }} onClick={next}>
              {index + 1 >= list.length ? (
                'Voir le résultat'
              ) : (
                <>
                  Suivant <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        ) : (
          <button
            className="btn btn-outline btn-block caps-btn"
            style={{ marginTop: 16 }}
            onClick={check}
            disabled={!answer.trim()}
          >
            Vérifier <ArrowRight size={15} />
          </button>
        )}
      </div>

      <p className="note center" style={{ marginTop: 4 }}>
        <Settings2 size={13} style={{ verticalAlign: '-2px' }} /> La vérification des réponses reste locale et
        instantanée (similarité) — seul le contenu est généré par l'IA.
      </p>
    </div>
  )
}

/** Compteur final anime (0 -> score) dans le style anneau de score. */
function ScoreBig({ score, total }: { score: number; total: number }): JSX.Element {
  const [shown, setShown] = useState(0)
  useEffect(() => {
    const start = performance.now()
    let raf = 0
    const tick = (now: number): void => {
      const p = Math.min(1, (now - start) / 1100)
      setShown(Math.round(score * (1 - Math.pow(1 - p, 3))))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [score])
  return (
    <div className="score-num">
      {shown}
      <span> / {total}</span>
    </div>
  )
}
