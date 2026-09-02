import { BookOpen, MessageCircle, Mic, Plane, Sun, Moon, Briefcase, Target, Award, Trash2, ChevronRight } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { LEVELS, SCENARIOS } from '../lib/prompts'
import { dayLabel } from '../lib/dayLabel'
import { useApp } from '../state/store'
import type { Scenario } from '../lib/prompts'

const SC_ICONS: Record<string, LucideIcon> = { daily: Sun, travel: Plane, work: Briefcase, myday: Moon }

function WaveDivider(): JSX.Element {
  return (
    <svg className="wave-divider" viewBox="0 0 400 16" preserveAspectRatio="none" aria-hidden="true">
      <path d="M0 8 Q 25 0 50 8 T 100 8 T 150 8 T 200 8 T 250 8 T 300 8 T 350 8 T 400 8" />
    </svg>
  )
}

function ScenarioCard({ s, onOpen }: { s: Scenario; onOpen: () => void }): JSX.Element {
  const Icon = SC_ICONS[s.id] ?? MessageCircle
  return (
    <div className="card clickable sc-card" onClick={onOpen}>
      <span className="sc-icon">
        <Icon size={22} />
      </span>
      <span className="grow">
        <strong>{s.title}</strong>
        <div className="muted">{s.description}</div>
      </span>
      <ChevronRight size={18} style={{ color: 'var(--muted)', flex: 'none' }} />
    </div>
  )
}

export default function Home(): JSX.Element {
  const { level, startConversation, resumeSession, sessions, deleteSession, go } = useApp()

  return (
    <div>
      <div className="center" style={{ marginBottom: 6 }}>
        {level && <span className="level-pill">Niveau : {LEVELS[level].label}</span>}
      </div>
      <h1 className="title center">Prêt à parler anglais ?</h1>
      <p className="subtitle center">
        Choisis un scénario ou lance-toi dans une conversation libre, à ton rythme.
        {!level && (
          <>
 {' '}
          <button className="back" onClick={() => go('onboarding')}>
            choisir un niveau
          </button>
        </>
        )}
      </p>

      {SCENARIOS.map((s) => (
        <ScenarioCard key={s.id} s={s} onOpen={() => startConversation(s.id)} />
      ))}

      <button className="btn btn-block btn-breathe" onClick={() => startConversation(null)}>
        <MessageCircle size={19} /> Conversation libre
      </button>

      <WaveDivider />

      <div className="chips" style={{ justifyContent: 'center' }}>
        <button className="chip" onClick={() => go('pronunciation')}>
          <Mic size={15} /> Prononciation
        </button>
        <button className="chip" onClick={() => go('lessons')}>
          <BookOpen size={15} /> Leçons
        </button>
        <button className="chip" onClick={() => go('exercises')}>
          <Target size={15} /> Exercices ciblés
        </button>
        <button className="chip" onClick={() => go('progress')}>
          <Award size={15} /> Ma progression
        </button>
      </div>

      {sessions.length > 0 && (
        <>
          <h3 style={{ margin: '18px 0 12px' }}>Mes conversations</h3>
          {sessions.map((s) => {
            const Icon = SC_ICONS[s.scenarioId] ?? MessageCircle
            return (
              <div key={s.id} className="card clickable hist-card" onClick={() => resumeSession(s.id)} title="Reprendre">
                <span className="sc-icon" style={{ width: 38, height: 38 }}>
                  <Icon size={18} />
                </span>
                <span className="grow">
                  <strong>{s.title}</strong>
                  <div className="hist-meta">
                    {dayLabel(s.ts)} · {s.messages.length} messages
                  </div>
                </span>
                <button
                  className="trash-btn"
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteSession(s.id)
                  }}
                  aria-label={`Supprimer ${s.title}`}
                >
                  <Trash2 size={17} />
                </button>
              </div>
            )
          })}
        </>
      )}
    </div>
  )
}
