import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, BookOpen, ChevronRight, Loader2, Puzzle, RefreshCw, Search, Shuffle, Volume2 } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { familyMatches, loadWordRules, pickQuizQuestions, splitExample, buildQuizPool } from '../lib/wordRules'
import type { WordRuleFamily, WordRuleItem, WordQuizQuestion } from '../lib/wordRules'
import { lookupWord } from '../lib/dictionary'
import { speak } from '../lib/tts'
import RuleText from './RuleText'
import { useApp } from '../state/store'

type Mode = 'guide' | 'quiz' | 'cards'

const MODES: { id: Mode; icon: LucideIcon; label: string }[] = [
  { id: 'guide', icon: BookOpen, label: 'Guide' },
  { id: 'quiz', icon: Puzzle, label: 'Quiz' },
  { id: 'cards', icon: RefreshCw, label: 'Cartes' },
]

/** Petit bouton audio : voix TTS, ou audio natif du dictionnaire si dispo. */
function WordAudio({ word }: { word: string }): JSX.Element {
  const { settings } = useApp()
  const [audioUrl, setAudioUrl] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    void lookupWord(word).then((e) => {
      if (alive && e?.audio) setAudioUrl(e.audio)
    })
    return () => {
      alive = false
    }
  }, [word])

  return (
    <button
      className="icon-btn"
      style={{ width: 30, height: 30, padding: 0 }}
      onClick={() => {
        if (audioUrl) void new Audio(audioUrl).play()
        else speak(word, settings.voiceURI, settings.rate)
      }}
      title="Écouter"
    >
      <Volume2 size={14} />
    </button>
  )
}

// ==================== Guide ====================

function ItemBlock({ item }: { item: WordRuleItem }): JSX.Element {
  return (
    <div className="word-rule-item">
      <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
        <strong style={{ fontSize: '1.05rem' }}>{item.word}</strong>
        <span className="tag-chip">{item.pos}</span>
        <WordAudio word={item.word} />
      </div>
      <p className="muted" style={{ margin: '2px 0 6px' }}>
        = {item.meaning}
      </p>
      <div className="word-rule-box">
        <span className="field-label" style={{ marginBottom: 2 }}>
          Quand l'utiliser
        </span>
        <RuleText rule={item.rule} />
      </div>
      {item.examples.map((ex, i) => {
        const { en, fr } = splitExample(ex)
        return (
          <p key={i} style={{ margin: '6px 0 0', fontSize: '0.95rem' }}>
            {en} <span className="muted">— {fr}</span>
          </p>
        )
      })}
    </div>
  )
}

function GuideTab({ families, q, setQ }: { families: WordRuleFamily[]; q: string; setQ: (s: string) => void }): JSX.Element {
  const filtered = useMemo(() => families.filter((f) => familyMatches(f, q)), [families, q])
  return (
    <>
      <div className="card">
        <div className="key-row">
          <Search size={17} style={{ color: 'var(--muted)', flex: 'none', alignSelf: 'center' }} />
          <input
            type="text"
            placeholder="Rechercher un mot (borrow, since, actually…)"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <p className="note" style={{ marginTop: 6 }}>
          {filtered.length} famille{filtered.length > 1 ? 's' : ''} · chargées depuis le dépôt du site
        </p>
      </div>
      {filtered.map((f) => (
        <details key={f.id} className="lesson">
          <summary>
            <span className="lesson-emoji">
              <Puzzle size={20} />
            </span>
            <span className="lesson-titles">
              <strong>{f.title}</strong>
              {f.hint && (
                <span className="lesson-tags">
                  <span className="tag-chip">{f.hint}</span>
                </span>
              )}
            </span>
            <ChevronRight size={18} className="chev" />
          </summary>
          <div style={{ paddingBottom: 12 }}>
            {f.items.map((it) => (
              <ItemBlock key={it.word} item={it} />
            ))}
          </div>
        </details>
      ))}
      {filtered.length === 0 && (
        <p className="muted center" style={{ marginTop: 20 }}>
          Aucune famille ne correspond à « {q} ».
        </p>
      )}
    </>
  )
}

// ==================== Quiz ====================

function QuizTab({ families }: { families: WordRuleFamily[] }): JSX.Element {
  const pool = useMemo(() => buildQuizPool(families), [families])
  const [questions, setQuestions] = useState<WordQuizQuestion[] | null>(null)
  const [index, setIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [chosen, setChosen] = useState<string | null>(null)

  const start = (): void => {
    setQuestions(pickQuizQuestions(pool, 10))
    setIndex(0)
    setScore(0)
    setChosen(null)
  }

  if (!questions) {
    return (
      <div className="card center" style={{ padding: '34px 20px' }}>
        <p style={{ margin: '0 0 8px', fontSize: '1.05rem' }}>10 phrases à trous, le bon mot parmi sa famille.</p>
        <p className="muted" style={{ margin: '0 0 18px' }}>
          À chaque réponse, la règle s'affiche — on apprend, on ne devine pas dans le vide.
        </p>
        <button className="btn btn-breathe" onClick={start}>
          Commencer
        </button>
      </div>
    )
  }

  if (index >= questions.length) {
    return (
      <div className="card center glow" style={{ padding: '34px 20px' }}>
        <div className="score-num">
          {score}
          <span> / {questions.length}</span>
        </div>
        <p className="muted" style={{ margin: '8px 0 18px' }}>
          {score >= 8 ? 'Excellent — les nuances sont claires !' : score >= 5 ? 'Bien — relis les familles ratées dans le Guide.' : 'Ouvre le Guide ci-dessus, puis retente : la répétition fait l’acquis.'}
        </p>
        <div className="row" style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn" onClick={start}>
            Nouvelle série
          </button>
        </div>
      </div>
    )
  }

  const q = questions[index]
  const parts = q.sentence.split('___')
  const ok = chosen !== null && chosen === q.answer

  const choose = (opt: string): void => {
    if (chosen !== null) return
    setChosen(opt)
    if (opt === q.answer) setScore((s) => s + 1)
  }

  return (
    <div>
      <div className="ex-top" style={{ marginTop: 4 }}>
        <span className="tag-chip">{q.familyTitle}</span>
        <span className="q-count">
          {index + 1} / {questions.length} · Score : {score}
        </span>
      </div>
      <div className={`card ${chosen && ok ? 'glow' : ''}`}>
        <p className="ex-sentence">
          {parts[0]}
          <span className={`blank-chip ${chosen ? (ok ? 'ok' : 'ko') : ''}`}>
            {chosen ?? '___'}
          </span>
          {parts[1]}
        </p>

        <div className="chips" style={{ justifyContent: 'center', margin: '18px 0 0' }}>
          {q.options.map((opt) => {
            const isAnswer = opt === q.answer
            const isChosen = opt === chosen
            return (
              <button
                key={opt}
                className={`chip quiz-opt ${chosen ? (isAnswer ? 'ok' : isChosen ? 'ko' : '') : ''}`}
                onClick={() => choose(opt)}
                disabled={chosen !== null}
              >
                {opt}
              </button>
            )
          })}
        </div>

        {chosen !== null && (
          <div className="answer-feedback">
            <span className={`verdict ${ok ? 'ok' : 'ko'}`}>{ok ? 'Exact !' : `C'était « ${q.answer} ».`}</span>
            <div className="word-rule-box">
              <span className="field-label" style={{ marginBottom: 2 }}>
                Règle — {q.answer} (= {q.meaning})
              </span>
              <RuleText rule={q.rule} />
            </div>
            <p style={{ margin: '6px 0 0', fontSize: '0.95rem' }}>
              {q.fullExample.en} <span className="muted">— {q.fullExample.fr}</span>
            </p>
            <button
              className="btn btn-block"
              style={{ marginTop: 14 }}
              onClick={() => {
                setIndex((i) => i + 1)
                setChosen(null)
              }}
            >
              {index + 1 >= questions.length ? 'Voir le résultat' : 'Suivant →'}
            </button>
          </div>
        )}
      </div>
      <p className="note center" style={{ marginTop: 4 }}>
        La règle s'affiche après chaque réponse — même quand c'est juste.
      </p>
    </div>
  )
}

// ==================== Cartes ====================

function CardsTab({ families }: { families: WordRuleFamily[] }): JSX.Element {
  const [famIndex, setFamIndex] = useState(0)
  const [order, setOrder] = useState<number[]>(() => families[0]?.items.map((_, i) => i) ?? [])
  const [card, setCard] = useState(0)
  const [flipped, setFlipped] = useState(false)

  const family = families[famIndex]

  const selectFamily = (i: number): void => {
    setFamIndex(i)
    setOrder(families[i].items.map((_, k) => k))
    setCard(0)
    setFlipped(false)
  }

  const reshuffle = (): void => {
    setOrder((o) => [...o].sort(() => Math.random() - 0.5))
    setCard(0)
    setFlipped(false)
  }

  if (!family) return <p className="muted">Aucune famille disponible.</p>
  const item = family.items[order[card]]

  return (
    <>
      <div className="chips" style={{ marginTop: 4 }}>
        {families.map((f, i) => (
          <button key={f.id} className={`chip ${i === famIndex ? 'active' : ''}`} onClick={() => selectFamily(i)}>
            {f.title.split('—')[0].trim()}
          </button>
        ))}
      </div>

      {item ? (
        <>
          <div className={`flip-card ${flipped ? 'flipped' : ''}`} onClick={() => setFlipped((f) => !f)} role="button" aria-label="Retourner la carte">
            <div className="flip-inner">
              <div className="flip-face flip-front">
                <div className="row" style={{ justifyContent: 'center', gap: 10 }}>
                  <span style={{ fontSize: '2rem', fontWeight: 800 }}>{item.word}</span>
                </div>
                <span className="tag-chip">{item.pos}</span>
                <p className="muted" style={{ margin: '14px 0 0', fontSize: '0.85rem' }}>
                  Pense au sens et à la règle… puis touche la carte.
                </p>
              </div>
              <div className="flip-face flip-back">
                <p style={{ margin: '4px 0', fontWeight: 700 }}>{item.meaning}</p>
                <div className="word-rule-box" style={{ textAlign: 'left' }}>
                  <span className="field-label" style={{ marginBottom: 2 }}>
                    Quand l'utiliser
                  </span>
                  <RuleText rule={item.rule} />
                </div>
                {item.examples[0] && (
                  <p style={{ margin: '8px 0 0', fontSize: '0.92rem' }}>
                    {(() => {
                      const { en, fr } = splitExample(item.examples[0])
                      return (
                        <>
                          {en} <span className="muted">— {fr}</span>
                        </>
                      )
                    })()}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="row" style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              className="btn btn-outline"
              onClick={() => {
                setCard((c) => (c - 1 + order.length) % order.length)
                setFlipped(false)
              }}
            >
              ← Précédente
            </button>
            <WordAudio word={item.word} />
            <button
              className="btn"
              onClick={() => {
                setCard((c) => (c + 1) % order.length)
                setFlipped(false)
              }}
            >
              Suivante →
            </button>
          </div>
          <div className="row" style={{ justifyContent: 'center', marginTop: 10 }}>
            <button className="btn btn-outline btn-sm" onClick={reshuffle}>
              <Shuffle size={14} /> Mélanger
            </button>
            <span className="q-count">
              {card + 1} / {order.length}
            </span>
          </div>
        </>
      ) : (
        <p className="muted">Famille vide.</p>
      )}
    </>
  )
}

// ==================== Vue ====================

export default function WordRules(): JSX.Element {
  const { go } = useApp()
  const [mode, setMode] = useState<Mode>('guide')
  const [data, setData] = useState<WordRuleFamily[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [q, setQ] = useState('')

  useEffect(() => {
    void loadWordRules()
      .then((d) => setData(d.families))
      .catch((e) => setError(e instanceof Error ? e.message : String(e)))
  }, [])

  return (
    <div>
      <button className="back" onClick={() => go('home')}>
        <ArrowLeft size={16} /> Accueil
      </button>
      <h1 className="title">Mots qui se ressemblent</h1>
      <p className="subtitle">
        Même sens, usages différents — le guide pour comprendre, le quiz et les cartes pour retenir.
      </p>

      <div className="sticky-tabs" role="tablist" aria-label="Modes">
        {MODES.map((m) => {
          const Icon = m.icon
          return (
            <button
              key={m.id}
              role="tab"
              aria-selected={mode === m.id}
              className={`filter-tab ${mode === m.id ? 'active' : ''}`}
              onClick={() => setMode(m.id)}
            >
              <Icon size={16} /> {m.label}
            </button>
          )
        })}
      </div>

      {error && <div className="error">Impossible de charger la base : {error}</div>}
      {!data && !error && (
        <div className="card center" style={{ padding: 30 }}>
          <Loader2 className="spin" size={24} style={{ color: 'var(--cyan)' }} />
          <p className="muted" style={{ margin: '10px 0 0' }}>
            Chargement de la base depuis le dépôt…
          </p>
        </div>
      )}

      {data && mode === 'guide' && <GuideTab families={data} q={q} setQ={setQ} />}
      {data && mode === 'quiz' && <QuizTab families={data} />}
      {data && mode === 'cards' && <CardsTab families={data} />}
    </div>
  )
}
