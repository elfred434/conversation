import { LEVELS, SCENARIOS } from '../lib/prompts'
import { useApp } from '../state/store'

export default function Home(): JSX.Element {
  const { level, startConversation, resumeSession, sessions, deleteSession, go, setPracticePhrase } = useApp()

  return (
    <div>
      <h1 className="title">Prêt à parler anglais ?</h1>
      <p className="subtitle">
        Niveau : {level ? LEVELS[level].label : '—'} · <button className="back" onClick={() => go('onboarding')}>changer</button>
      </p>

      <h3 style={{ margin: '4px 0 10px' }}>Choisis un scénario</h3>
      {SCENARIOS.map((s) => (
        <div key={s.id} className="card clickable" onClick={() => startConversation(s.id)}>
          <div className="row">
            <div className="grow">
              <strong>{s.title}</strong>
              <div className="muted">{s.description}</div>
            </div>
            <span className="muted">›</span>
          </div>
        </div>
      ))}

      <button className="btn btn-block" onClick={() => startConversation(null)}>
        💬 Conversation libre
      </button>

      <div className="chips">
        <button className="chip" onClick={() => go('pronunciation')}>🎤 Prononciation</button>
        <button className="chip" onClick={() => go('lessons')}>📚 Leçons</button>
        <button className="chip" onClick={() => go('exercises')}>🎯 Exercices ciblés</button>
        <button className="chip" onClick={() => go('progress')}>🏅 Ma progression</button>
      </div>

      {sessions.length > 0 && (
        <>
          <h3 style={{ margin: '18px 0 10px' }}>Mes conversations</h3>
          {sessions.map((s) => (
            <div key={s.id} className="card">
              <div className="row">
                <div
                  className="grow clickable"
                  style={{ cursor: 'pointer' }}
                  onClick={() => resumeSession(s.id)}
                  title="Reprendre"
                >
                  <strong>{s.title}</strong>
                  <div className="muted">
                    {s.messages[s.messages.length - 1]?.content.slice(0, 70) || '…'}
                  </div>
                </div>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => deleteSession(s.id)}
                  aria-label="Supprimer"
                >
                  🗑
                </button>
              </div>
            </div>
          ))}
        </>
      )}

      <p className="muted center" style={{ marginTop: 20 }}>
        Astuce : pour reprendre une conversation existante, le tuteur récupère tout l'historique.
      </p>
      <button className="btn btn-outline btn-block" onClick={() => setPracticePhrase(DAILY_FIRST)}>
        🎤 Pratiquer une phrase du jour
      </button>
    </div>
  )
}

const DAILY_FIRST = 'Could you pass me the salt, please?'
