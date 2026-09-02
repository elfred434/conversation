import { CATEGORY_LABELS } from '../lib/exercises'
import { useApp } from '../state/store'

const STEPS = [
  { n: 10, medal: '🥉', label: '10 corrections' },
  { n: 50, medal: '🥈', label: '50 corrections' },
  { n: 100, medal: '🥇', label: '100 corrections' },
]

export default function Progress(): JSX.Element {
  const { progress, resetProgress, go } = useApp()
  const entries = Object.entries(progress.byCategory).sort((a, b) => b[1] - a[1])
  const max = Math.max(1, ...entries.map(([, n]) => n))

  return (
    <div>
      <button className="back" onClick={() => go('home')}>
        ← Accueil
      </button>
      <h1 className="title">Ma progression</h1>
      <p className="subtitle">{progress.total} correction{progress.total > 1 ? 's' : ''} reçue{progress.total > 1 ? 's' : ''} au total</p>

      <div className="badges">
        {STEPS.map((s) => (
          <div key={s.n} className={`badge ${progress.total >= s.n ? 'earned' : ''}`}>
            <div className="big">{s.medal}</div>
            <div className="muted">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Types d'erreurs</h3>
        {entries.length === 0 && <p className="muted">Discute avec le tuteur : chaque faute corrigée est comptée ici.</p>}
        {entries.map(([cat, n]) => (
          <div key={cat} className="statline">
            <span className="label">{CATEGORY_LABELS[cat] ?? cat}</span>
            <div className="progressbar grow">
              <div style={{ width: `${(n * 100) / max}%` }} />
            </div>
            <span className="n">{n}</span>
          </div>
        ))}
      </div>

      <button className="btn btn-danger btn-block" onClick={resetProgress}>
        Réinitialiser la progression
      </button>
    </div>
  )
}
