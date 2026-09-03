import { BookOpen, MessageCircle, MessagesSquare, Mic, Plane, Sun, Moon, Briefcase, Target, Award, Trash2, ChevronRight } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { LEVELS, SCENARIOS } from '../lib/prompts'
import { dayLabel } from '../lib/dayLabel'
import { useApp } from '../state/store'
import type { Scenario } from '../lib/prompts'
import type { View } from '../state/store'

const SC_ICONS: Record<string, LucideIcon> = { daily: Sun, travel: Plane, work: Briefcase, myday: Moon }

interface Tool {
  view: View
  icon: LucideIcon
  label: string
  desc: string
}

const TOOLS: Tool[] = [
  { view: 'pronunciation', icon: Mic, label: 'Prononciation', desc: 'Écoute, répète, compare' },
  { view: 'lessons', icon: BookOpen, label: 'Leçons', desc: 'Mini-leçons hors-ligne' },
  { view: 'exercises', icon: Target, label: 'Exercices ciblés', desc: "Générés par l'IA selon tes erreurs" },
  { view: 'phrases', icon: MessagesSquare, label: 'Phrases courantes', desc: 'Les plus utilisées + dictionnaire' },
  { view: 'progress', icon: Award, label: 'Ma progression', desc: 'Badges et statistiques' },
]

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
        <Icon size={20} />
      </span>
      <span className="grow">
        <strong>{s.title}</strong>
        <div className="muted">{s.description}</div>
      </span>
      <ChevronRight size={18} style={{ color: 'var(--muted)', flex: 'none' }} />
    </div>
  )
}

function ToolTile({ tool, onOpen }: { tool: Tool; onOpen: () => void }): JSX.Element {
  const Icon = tool.icon
  return (
    <div className="card clickable tool-tile" onClick={onOpen}>
      <span className="tool-icon">
        <Icon size={18} />
      </span>
      <span className="grow">
        <strong>{tool.label}</strong>
        <div className="muted">{tool.desc}</div>
      </span>
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

      <div className="home-grid">
        {/* ——— Panneau scénarios ——— */}
        <section>
          <h2 className="panel-label">Scénarios de conversation</h2>
          {SCENARIOS.map((s) => (
            <ScenarioCard key={s.id} s={s} onOpen={() => startConversation(s.id)} />
          ))}
          <button className="btn btn-block btn-breathe" onClick={() => startConversation(null)}>
            <MessageCircle size={19} /> Conversation libre
          </button>
        </section>

        {/* ——— Panneau ateliers ——— */}
        <section>
          <h2 className="panel-label">S'entraîner</h2>
          {TOOLS.map((t) => (
            <ToolTile key={t.view} tool={t} onOpen={() => go(t.view)} />
          ))}
        </section>
      </div>

      <WaveDivider />

      {sessions.length > 0 && (
        <>
          <h3 style={{ margin: '0 0 12px' }}>Mes conversations</h3>
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
