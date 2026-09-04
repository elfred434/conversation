import { useState } from 'react'
import { BookOpen, MessageCircle, MessagesSquare, Mic, Plane, Sun, Moon, Briefcase, Target, Award, Trash2, ChevronRight, LayoutGrid, Dumbbell, History, Puzzle, Scale, Clock, ClipboardList } from 'lucide-react'
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
  { view: 'grammar', icon: Puzzle, label: 'Grammaire', desc: 'Le jeu des règles : 25 règles à maîtriser' },
  { view: 'wordrules', icon: Scale, label: 'Mots qui se ressemblent', desc: 'Borrow/lend, say/tell… et leurs règles' },
  { view: 'conjugaison', icon: Clock, label: 'Conjugaisons', desc: 'Présent, passé, continu, modaux : tous les tableaux' },
  { view: 'fiches', icon: ClipboardList, label: 'Fiches express', desc: 'Antonymes, question words, amorces, TO BE… les aide-mémoires' },
  { view: 'exercises', icon: Target, label: 'Exercices ciblés', desc: "Générés par l'IA selon tes erreurs" },
  { view: 'phrases', icon: MessagesSquare, label: 'Phrases courantes', desc: 'Les plus utilisées + dictionnaire' },
  { view: 'progress', icon: Award, label: 'Ma progression', desc: 'Badges et statistiques' },
]

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

type Tab = 'scenarios' | 'train' | 'history'

const TABS: { id: Tab; icon: LucideIcon; label: string }[] = [
  { id: 'scenarios', icon: LayoutGrid, label: 'Scénarios' },
  { id: 'train', icon: Dumbbell, label: "S'entraîner" },
  { id: 'history', icon: History, label: 'Mes conversations' },
]

export default function Home(): JSX.Element {
  const { level, startConversation, resumeSession, sessions, deleteSession, go } = useApp()
  const [tab, setTab] = useState<Tab>('scenarios')

  return (
    <div>
      <div style={{ marginBottom: 6 }}>
        {level && <span className="level-pill">Niveau : {LEVELS[level].label}</span>}
      </div>
      <h1 className="title">Prêt à parler anglais ?</h1>
      <p className="subtitle">
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

      <div className="filter-bar" role="tablist" aria-label="Sections de l'accueil">
        {TABS.map((t) => {
          const Icon = t.icon
          const count = t.id === 'history' ? sessions.length : null
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              className={`filter-tab ${tab === t.id ? 'active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              <Icon size={16} /> {t.label}
              {count ? <span className="tab-count">{count}</span> : null}
            </button>
          )
        })}
      </div>

      {tab === 'scenarios' && (
        <section>
          <div className="sc-grid">
            {SCENARIOS.map((s) => (
              <ScenarioCard key={s.id} s={s} onOpen={() => startConversation(s.id)} />
            ))}
          </div>
          <button className="btn btn-block btn-breathe" onClick={() => startConversation(null)}>
            <MessageCircle size={19} /> Conversation libre
          </button>
        </section>
      )}

      {tab === 'train' && (
        <section className="tools-grid">
          {TOOLS.map((t) => (
            <ToolTile key={t.view} tool={t} onOpen={() => go(t.view)} />
          ))}
        </section>
      )}

      {tab === 'history' && (
        <section>
          {sessions.length === 0 ? (
            <div className="card center" style={{ padding: '40px 20px' }}>
              <History size={26} style={{ color: 'var(--muted)' }} />
              <p className="muted" style={{ margin: '10px 0 14px' }}>
                Aucune conversation pour l'instant — lance un scénario, elle apparaîtra ici.
              </p>
              <button className="btn" onClick={() => setTab('scenarios')}>
                Voir les scénarios
              </button>
            </div>
          ) : (
            sessions.map((s) => {
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
          })
          )}
        </section>
      )}
    </div>
  )
}
