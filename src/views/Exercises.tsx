import { useMemo, useState } from 'react'
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

  return (
    <div>
      <button className="back" onClick={() => go('home')}>
        ← Accueil
      </button>
      <h1 className="title">Exercices ciblés</h1>
      <p className="subtitle">Priorisés selon tes erreurs les plus fréquentes en conversation.</p>

      {finished ? (
        <div className="card center">
          <h2>Terminé !</h2>
          <div className="score">
            {score} / {list.length}
          </div>
          <p className="muted">
            {score / Math.max(1, list.length) >= 0.8
              ? 'Excellent, continue comme ça ! 🎉'
              : score / Math.max(1, list.length) >= 0.5
                ? 'Bien ! Encore un petit effort. 💪'
                : 'Chaque erreur corrigée te fait progresser. 🌱'}
          </p>
          <button className="btn" onClick={restart}>
            🔄 Recommencer
          </button>
        </div>
      ) : (
        <div className="card">
          <div className="progressbar">
            <div style={{ width: `${(index * 100) / list.length}%` }} />
          </div>
          <p className="muted">
            Question {index + 1} / {list.length} · Score : {score} ·{' '}
            <span className="chip" style={{ padding: '2px 10px', display: 'inline-block' }}>
              {CATEGORY_LABELS[ex.category] ?? ex.category}
            </span>
          </p>
          <p className="target">{ex.question}</p>
          <input
            type="text"
            placeholder="Ta réponse…"
            value={answer}
            disabled={checked}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (checked ? next() : check())}
          />

          {checked ? (
            <div className="answer-feedback">
              <div className={wasCorrect ? 'ok' : 'ko'}>
                {wasCorrect ? '✅ Bravo, c’est correct !' : '❌ Pas tout à fait.'}
              </div>
              {!wasCorrect && (
                <>
                  <div>
                    Bonne réponse : <strong>{ex.answer}</strong>
                  </div>
                  {ex.hint && <div className="muted">💡 {ex.hint}</div>}
                </>
              )}
              <button className="btn btn-block" style={{ marginTop: 12 }} onClick={next}>
                {index + 1 >= list.length ? 'Voir le résultat' : 'Suivant →'}
              </button>
            </div>
          ) : (
            <button className="btn btn-block" style={{ marginTop: 12 }} onClick={check} disabled={!answer.trim()}>
              Vérifier
            </button>
          )}
        </div>
      )}
    </div>
  )
}
