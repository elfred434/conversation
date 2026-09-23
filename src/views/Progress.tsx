import { useMemo, type CSSProperties } from 'react'
import { CalendarDays, Medal, RotateCcw, Target, TrendingUp } from 'lucide-react'
import { CATEGORY_LABELS } from '../lib/exercises'
import { useApp } from '../state/store'

/** Paliers bases sur la PRATIQUE (messages envoyes), pas sur le nombre de fautes. */
const STEPS = [
  { n: 20, label: 'Bronze', color: '#E29A5C' },
  { n: 100, label: 'Argent', color: '#C9D3E8' },
  { n: 250, label: 'Or', color: '#F5C86B' },
]

const DAYS_SHOWN = 14

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
      <div className="hist-meta">{target} messages</div>
    </div>
  )
}

/** Les DAYS_SHOWN derniers jours, du plus ancien au plus recent. */
function lastDays(count: number): { key: string; label: string }[] {
  const out: { key: string; label: string }[] = []
  const d = new Date()
  d.setDate(d.getDate() - (count - 1))
  for (let i = 0; i < count; i++) {
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
      d.getDate(),
    ).padStart(2, '0')}`
    out.push({ key, label: `${String(d.getDate()).padStart(2, '0')}` })
    d.setDate(d.getDate() + 1)
  }
  return out
}

export default function Progress(): JSX.Element {
  const { progress, resetProgress, go } = useApp()
  const entries = Object.entries(progress.byCategory).sort((a, b) => b[1] - a[1])
  const max = Math.max(1, ...entries.map(([, n]) => n))
  const messages = progress.messages ?? progress.total

  const days = useMemo(() => {
    const byDay = progress.byDay ?? {}
    const list = lastDays(DAYS_SHOWN)
    const peak = Math.max(1, ...list.map((d) => byDay[d.key] ?? 0))
    return { list, peak }
  }, [progress.byDay])

  return (
    <div>
      <button className="back" onClick={() => go('home')}>
        ← Accueil
      </button>
      <h1 className="title center">Ma progression</h1>
      <p className="subtitle center">
        {messages} message{messages > 1 ? 's' : ''} envoyé{messages > 1 ? 's' : ''} ·{' '}
        {progress.total} correction{progress.total > 1 ? 's' : ''} reçue{progress.total > 1 ? 's' : ''} —
        on récompense ta pratique, pas tes fautes.
      </p>

      <div className="medals">
        {STEPS.map((s) => (
          <MedalRing key={s.n} color={s.color} label={s.label} target={s.n} total={messages} />
        ))}
      </div>

      <div className="card">
        <div className="card-head">
          <span className="card-icon">
            <CalendarDays size={20} />
          </span>
          <span>
            <div className="card-title">Activité récente</div>
            <div className="card-sub">Corrections des {DAYS_SHOWN} derniers jours</div>
          </span>
        </div>
        <div className="day-bars" role="img" aria-label="Corrections par jour sur les derniers jours">
          {days.list.map((d) => {
            const n = (progress.byDay ?? {})[d.key] ?? 0
            return (
              <div key={d.key} className="day-col" title={`${d.key} : ${n}`}>
                <span className="day-num">{n > 0 ? n : ''}</span>
                <i style={{ height: `${Math.round((n / days.peak) * 100)}%` }} data-on={n > 0} />
                <span className="day-lab">{d.label}</span>
              </div>
            )
          })}
        </div>
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

      <div className="card">
        <div className="card-head">
          <span className="card-icon">
            <Target size={20} />
          </span>
          <span>
            <div className="card-title">Derniers entraînements</div>
            <div className="card-sub">Exercices, quiz et prononciation</div>
          </span>
        </div>
        {(progress.scores ?? []).length === 0 && (
          <p className="muted">
            Tes scores d'exercices, de quiz et de prononciation apparaîtront ici.
          </p>
        )}
        {(progress.scores ?? []).map((s, i) => (
          <div key={i} className="statline">
            <span className="label">{s.tool}</span>
            <span className="bar">
              <i style={{ '--p': String(s.total > 0 ? s.score / s.total : 0) } as CSSProperties} />
            </span>
            <span className="n">
              {s.score}/{s.total}
            </span>
          </div>
        ))}
      </div>

      <button
        className="btn btn-danger btn-block"
        onClick={() => {
          if (window.confirm('Réinitialiser toute ta progression ? Cette action est irréversible.'))
            resetProgress()
        }}
      >
        <RotateCcw size={17} /> Réinitialiser la progression
      </button>
    </div>
  )
}
