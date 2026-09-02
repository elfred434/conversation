import { LEVELS, SCENARIOS } from '../lib/prompts'
import { dayLabel } from '../lib/dayLabel'
import { useApp } from '../state/store'
import type { Scenario } from '../lib/prompts'

const SC_EMOJI: Record<string, string> = { daily: '☀️', travel: '✈️', work: '💼', myday: '🌙' }

function WaveDivider(): JSX.Element {
  return (
    <svg className="wave-divider" viewBox="0 0 400 16" preserveAspectRatio="none" aria-hidden="true">
      <path d="M0 8 Q 25 0 50 8 T 100 8 T 150 8 T 200 8 T 250 8 T 300 8 T 350 8 T 400 8" />
    </svg>
  )
}

function ScenarioCard({ s, onOpen }: { s: Scenario; onOpen: () => void }): JSX.Element {
  return (
    <div className="card clickable sc-card" onClick={onOpen}>
      <span className="sc-icon">{SC_EMOJI[s.id] ?? '💬'}</span>
      <span className="grow">
        <strong>{s.title}</strong>
        <div className="muted">{s.description}</div>
      </span>
      <span className="muted">›</span>
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
        {level && <> </>}
        {!level && <button className="back" onClick={() => go('onboarding')}>choisir un niveau</button>}
      </p>

      {SCENARIOS.map((s) => (
        <ScenarioCard key={s.id} s={s} onOpen={() => startConversation(s.id)} />
      ))}

      <button className="btn btn-block btn-breathe" onClick={() => startConversation(null)}>
        💬 Conversation libre
      </button>

      <WaveDivider />

      <div className="chips" style={{ justifyContent: 'center' }}>
        <button className="chip" onClick={() => go('pronunciation')}>🎤 Prononciation</button>
        <button className="chip" onClick={() => go('lessons')}>📚 Leçons</button>
        <button className="chip" onClick={() => go('exercises')}>🎯 Exercices ciblés</button>
        <button className="chip" onClick={() => go('progress')}>🏅 Ma progression</button>
      </div>

      {sessions.length > 0 && (
        <>
          <h3 style={{ margin: '18px 0 12px' }}>Mes conversations</h3>
          {sessions.map((s) => (
            <div key={s.id} className="card clickable hist-card" onClick={() => resumeSession(s.id)} title="Reprendre">
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
                🗑
              </button>
            </div>
          ))}
        </>
      )}
    </div>
  )
}
