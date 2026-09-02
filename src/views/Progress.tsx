import type { CSSProperties } from 'react'
import { Medal, RotateCcw, TrendingUp } from 'lucide-react'
import { CATEGORY_LABELS } from '../lib/exercises'
import { useApp } from '../state/store'

const STEPS = [
  { n: 10, label: 'Bronze', color: '#E29A5C' },
  { n: 50, label: 'Argent', color: '#C9D3E8' },
  { n: 100, label: 'Or', color: '#F5C86B' },
]

function MedalRing({ color, label, target, total }: { color: string; label: string; target: number; total: number }): JSX.Element {
  const R = 30
  const C = 2 * Math.PI * R
  const p = Math.min(1, total / target)
  const earned = total >= target
  return (
    <div className={`medal ${earned ? 'earned' : 'locked'}`}>
      <div className="mwrap">
        <svg viewBox="0 0 72 72">
          <defs>
            <linearGradient id="medGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#2563EB" />
              <stop offset="100%" stopColor="#22D3EE" />
            </linearGradient>
          </defs>
          <circle className="mtrack" cx="36" cy="36" r={R} />
          <circle
            className="marc"
            cx="36"
            cy="36"
            r={R}
            style={{ '--c': C, strokeDasharray: C, strokeDashoffset: C * (1 - p) } as CSSProperties}
          />
        </svg>
        <span className="medal-icon" style={{ color: earned ? color : 'var(--muted)' }}>
          <Medal size={28} strokeWidth={1.8} />
        </span>
      </div>
      <div className="medal-label">{label}</div>
      <div className="hist-meta">{target} corrections</div>
    </div>
  )
}

export default function Progress(): JSX.Element {
  const { progress, resetProgress, go } = useApp()
  const entries = Object.entries(progress.byCategory).sort((a, b) => b[1] - a[1])
  const max = Math.max(1, ...entries.map(([, n]) => n))

  return (
    <div>
      <button className="back" onClick={() => go('home')}>
        ← Accueil
      </button>
      <h1 className="title center">Ma progression</h1>
      <p className="subtitle center">
        {progress.total} correction{progress.total > 1 ? 's' : ''} reçue{progress.total > 1 ? 's' : ''} au
        total — ton apprentissage s'écoule à son propre rythme.
      </p>

      <div className="medals">
        {STEPS.map((s) => (
          <MedalRing key={s.n} color={s.color} label={s.label} target={s.n} total={progress.total} />
        ))}
      </div>

      <div className="card">
        <div className="card-head">
          <span className="card-icon">
            <TrendingUp size={20} />
          </span>
          <span>
            <div className="card-title">Types d'erreurs</div>
            <div className="card-sub">Chaque faute corrigée compte</div>
          </span>
        </div>
        {entries.length === 0 && (
          <p className="muted">Discute avec le tuteur : chaque faute corrigée apparaîtra ici.</p>
        )}
        {entries.map(([cat, n]) => (
          <div key={cat} className="statline">
            <span className="label">{CATEGORY_LABELS[cat] ?? cat}</span>
            <span className="bar">
              <i style={{ '--p': String(n / max) } as CSSProperties} />
            </span>
            <span className="n">{n}</span>
          </div>
        ))}
      </div>

      <button className="btn btn-danger btn-block" onClick={resetProgress}>
        <RotateCcw size={17} /> Réinitialiser la progression
      </button>
    </div>
  )
}
