import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { CATEGORY_LABELS, EXERCISES, pickTargetedExercises } from '../lib/exercises'
import { isAnswerCloseEnough } from '../lib/similarity'
import { useApp } from '../state/store'

export default function Exercises(): JSX.Element {
  const { progress, go } = useApp()
  const [round, setRound] = useState(0)
  const list = useMemo(
    () => pickTargetedExercises(EXERCISES, progress, 10),
    // Recalcule la file a chaque nouvelle manche (progression a jour).
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [round],
  )
  const [index, setIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [checked, setChecked] = useState(false)
  const [wasCorrect, setWasCorrect] = useState(false)
  const [answer, setAnswer] = useState('')

  const ex = list[index]
  const finished = index >= list.length
  const blankParts = ex && !finished ? ex.question.split('___') : []
  const isBlank = blankParts.length === 2

  const check = (): void => {
    if (checked || !ex) return
    const ok = isAnswerCloseEnough(answer, ex.answer)
    setChecked(true)
    setWasCorrect(ok)
    if (ok) setScore((s) => s + 1)
  }

  const next = (): void => {
    setIndex((i) => i + 1)
    setChecked(false)
    setWasCorrect(false)
    setAnswer('')
  }

  const restart = (): void => {
    setRound((r) => r + 1)
    setIndex(0)
    setScore(0)
    setChecked(false)
    setWasCorrect(false)
    setAnswer('')
  }

  if (finished) {
    const ratio = score / Math.max(1, list.length)
    return (
      <div>
        <button className="back" onClick={() => go('home')}>
          ← Accueil
        </button>
        <h1 className="title center">Terminé !</h1>
        <div className="card center ex-result">
          <ScoreBig score={score} total={list.length} />
          <p className="muted">
            {ratio >= 0.8 ? 'Excellent, continue comme ça ! 🎉' : ratio >= 0.5 ? 'Bien ! Encore un petit effort. 💪' : 'Chaque erreur corrigée te fait progresser. 🌱'}
          </p>
          <button className="btn" onClick={restart}>
            🔄 Recommencer
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <button className="back" onClick={() => go('home')}>
        ← Accueil
      </button>
      <h1 className="title">Exercices ciblés</h1>
      <p className="subtitle">Priorisés selon tes erreurs les plus fréquentes en conversation.</p>

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
              {wasCorrect ? '✔ Bravo, c\'est correct !' : '✗ Pas tout à fait.'}
            </span>
            {!wasCorrect && (
              <>
                <div>
                  Bonne réponse : <strong>{ex.answer}</strong>
                </div>
                {ex.hint && <div className="hint">💡 {ex.hint}</div>}
              </>
            )}
            {wasCorrect && ex.hint && <div className="hint">💡 {ex.hint}</div>}
            <button className="btn btn-block" style={{ marginTop: 14 }} onClick={next}>
              {index + 1 >= list.length ? 'Voir le résultat' : 'Suivant →'}
            </button>
          </div>
        ) : (
          <button
            className="btn btn-outline btn-block caps-btn"
            style={{ marginTop: 16 }}
            onClick={check}
            disabled={!answer.trim()}
          >
            Vérifier →
          </button>
        )}
      </div>
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
