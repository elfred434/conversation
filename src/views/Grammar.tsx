import { useMemo, useState } from 'react'
import { ArrowLeft, Check, CheckCircle2, ChevronRight, Lightbulb, Lock, Play, RotateCcw, Star, X } from 'lucide-react'
import type { CSSProperties } from 'react'
import { GRAMMAR_TIERS, flattenRules, isRuleUnlocked, starsFor } from '../lib/grammar'
import type { GrammarRule } from '../lib/grammar'
import { isAnswerCloseEnough } from '../lib/similarity'
import { loadGrammar, saveGrammar } from '../lib/storage'
import { useApp } from '../state/store'
import RuleText from './RuleText'

type Phase = 'path' | 'lesson' | 'quiz' | 'result'

/** Nuage de points de progression (une pastille par question). */
function Dots({ total, done, active }: { total: number; done: number; active: boolean }): JSX.Element {
  return (
    <span className="dots" aria-label={`${done} sur ${total} questions`}>
      {Array.from({ length: total }, (_, i) => (
        <i key={i} className={i < done ? 'ok' : i === done && active ? 'cur' : ''} />
      ))}
    </span>
  )
}

function StarRow({ n, size = 22 }: { n: number; size?: number }): JSX.Element {
  return (
    <span className="stars">
      {[1, 2, 3].map((i) => (
        <Star
          key={i}
          size={size}
          className={i <= n ? 'on' : ''}
          style={{ animationDelay: `${i * 160}ms` }}
        />
      ))}
    </span>
  )
}

export default function Grammar(): JSX.Element {
  const { go } = useApp()
  const [progress, setProgress] = useState(loadGrammar)
  const [phase, setPhase] = useState<Phase>('path')
  const [rule, setRule] = useState<GrammarRule | null>(null)
  const [ruleIndex, setRuleIndex] = useState(-1)
  const [qIndex, setQIndex] = useState(0)
  const [mistakes, setMistakes] = useState(0)
  const [retries, setRetries] = useState(0)
  const [answer, setAnswer] = useState('')
  const [checked, setChecked] = useState<null | boolean>(null)
  const [starGain, setStarGain] = useState(0)

  const rules = useMemo(() => flattenRules(), [])
  const masteredCount = progress.mastered.length
  const totalStars = Object.values(progress.stars).reduce((a, b) => a + b, 0)

  const startRule = (r: GrammarRule, index: number): void => {
    setRule(r)
    setRuleIndex(index)
    setPhase('lesson')
  }

  const play = (): void => {
    setQIndex(0)
    setMistakes(0)
    setRetries(0)
    setAnswer('')
    setChecked(null)
    setPhase('quiz')
  }

  const check = (): void => {
    if (!rule || checked !== null || !answer.trim()) return
    const ok = isAnswerCloseEnough(answer, rule.questions[qIndex].a)
    setChecked(ok)
    if (!ok) {
      setMistakes((m) => m + 1)
      setRetries((r) => r + 1)
    }
  }

  const next = (): void => {
    if (!rule) return
    if (checked === false) {
      // nouvelle tentative sur la meme question
      setAnswer('')
      setChecked(null)
      return
    }
    if (qIndex + 1 >= rule.questions.length) {
      const stars = starsFor(mistakes)
      setStarGain(stars)
      setProgress((prev) => {
        const nextG = {
          mastered: prev.mastered.includes(rule.id) ? prev.mastered : [...prev.mastered, rule.id],
          stars: { ...prev.stars, [rule.id]: Math.max(prev.stars[rule.id] ?? 0, stars) },
        }
        saveGrammar(nextG)
        return nextG
      })
      setPhase('result')
      return
    }
    setQIndex((i) => i + 1)
    setRetries(0)
    setAnswer('')
    setChecked(null)
  }

  const backToPath = (): void => {
    setRule(null)
    setRuleIndex(-1)
    setPhase('path')
  }

  // ---------------- Leçon ----------------
  if (phase === 'lesson' && rule) {
    return (
      <div>
        <button className="back" onClick={backToPath}>
          <ArrowLeft size={16} /> Le parcours
        </button>
        <h1 className="title">{rule.title}</h1>
        <p className="subtitle">Règle {ruleIndex + 1} / {rules.length} · Monde en cours</p>
        <div className="card">
          <div style={{ margin: '4px 0 12px', fontSize: '1.1rem' }}>
            <RuleText rule={rule.rule} />
          </div>
          {rule.examples?.map((e, i) => (
            <div key={i} className="phrase">
              <span className="grow">
                <div className="en">{e.en}</div>
                <div className="fr">{e.fr}</div>
              </span>
            </div>
          ))}
        </div>
        <p className="muted" style={{ margin: '0 0 12px' }}>
          À toi de jouer : {rule.questions.length} questions, les fautes ne coûtent que des étoiles.
        </p>
        <button className="btn btn-block btn-breathe" onClick={play}>
          <Play size={18} /> Jouer
        </button>
      </div>
    )
  }

  // ---------------- Quiz ----------------
  if (phase === 'quiz' && rule) {
    const q = rule.questions[qIndex]
    const parts = q.q.split('___')
    const isBlank = parts.length === 2
    return (
      <div>
        <button className="back" onClick={backToPath}>
          <ArrowLeft size={16} /> Abandonner
        </button>
        <div className="card">
          <div className="ex-top">
            <span className="cat-chip">{rule.title}</span>
            <Dots total={rule.questions.length} done={qIndex} active />
          </div>
          {isBlank ? (
            <p className="ex-sentence">
              {parts[0]}
              <input
                className={`blank-input ${checked === false ? 'bad' : ''}`}
                style={{ width: `${Math.max(q.a.length, answer.length, 6)}ch` }}
                placeholder="▁▁▁"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (checked ? next() : check())}
                disabled={checked === true}
              />
              {parts[1]}
            </p>
          ) : (
            <p className="ex-sentence">{q.q}</p>
          )}
          {!isBlank && checked !== true && (
            <input
              type="text"
              placeholder="Ta réponse…"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (checked ? next() : check())}
            />
          )}
          {checked === null ? (
            <button className="btn btn-outline btn-block caps-btn" style={{ marginTop: 16 }} onClick={check} disabled={!answer.trim()}>
              Vérifier <ChevronRight size={15} />
            </button>
          ) : (
            <div className="answer-feedback">
              <span className={`verdict ${checked ? 'ok' : 'ko'}`}>
                {checked ? <CheckCircle2 size={17} /> : <X size={17} />}
                {checked ? 'Exact !' : 'Presque — réessaie.'}
              </span>
              {!checked && (
                <>
                  {q.hint && (
                    <div className="hint">
                      <Lightbulb size={15} /> {q.hint}
                    </div>
                  )}
                  <button className="btn btn-block" onClick={next}>
                    Réessayer
                  </button>
                </>
              )}
              {checked && (
                <button className="btn btn-block" onClick={next}>
                  {qIndex + 1 >= rule.questions.length ? 'Terminer ✓' : 'Suivant →'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  // ---------------- Resultat ----------------
  if (phase === 'result' && rule) {
    const idx = rules.findIndex((r) => r.id === rule.id)
    const nextRule = rules[idx + 1]
    return (
      <div>
        <button className="back" onClick={backToPath}>
          <ArrowLeft size={16} /> Le parcours
        </button>
        <h1 className="title center">Règle maîtrisée !</h1>
        <div className="card center glow" style={{ padding: '34px 20px' }}>
          <div className="card-title" style={{ fontSize: '1.3rem', marginBottom: 8 }}>
            {rule.title}
          </div>
          <StarRow n={starGain} size={30} />
          <p className="muted" style={{ margin: '10px 0 4px' }}>
            {starGain === 3 ? 'Sans faute — parfait !' : starGain === 2 ? 'Presque parfait, rejoue pour 3 étoiles.' : 'Acquis ! Rejoue quand tu veux pour étoffer.'}
          </p>
          <p className="note" style={{ marginBottom: 16 }}>
            {masteredCount}/{rules.length} règles maîtrisées
          </p>
          {nextRule ? (
            <p className="note" style={{ marginBottom: 16 }}>
              🔓 <strong>{nextRule.title}</strong> est débloquée.
            </p>
          ) : (
            <p className="note" style={{ marginBottom: 16 }}>
              🏆 Dernière règle du parcours — tu as tout maîtrisé !
            </p>
          )}
          <div className="row" style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-outline" onClick={() => startRule(rule, idx)}>
              <RotateCcw size={16} /> Rejouer
            </button>
            <button className="btn" onClick={backToPath}>
              Continuer le parcours →
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ---------------- Parcours ----------------
  let counter = -1
  return (
    <div>
      <button className="back" onClick={() => go('home')}>
        <ArrowLeft size={16} /> Accueil
      </button>
      <h1 className="title">Grammaire — le jeu des règles</h1>
      <p className="subtitle">
        Maîtrise une règle, débloque la suivante.{' '}
        <strong style={{ color: 'var(--text)' }}>
          {masteredCount}/{rules.length}
        </strong>{' '}
        maîtrisées · <Star size={13} style={{ verticalAlign: '-2px', color: '#F5C86B' }} /> {totalStars}
      </p>

      {GRAMMAR_TIERS.map((tier) => (
        <section key={tier.id} style={{ marginBottom: 22 }}>
          <h2 className="panel-label">{tier.title}</h2>
          <div className="gram-path">
            {tier.rules.map((r) => {
              counter += 1
              const globalIndex = counter
              const unlocked = isRuleUnlocked(globalIndex, progress.mastered)
              const isMastered = progress.mastered.includes(r.id)
              const stars = progress.stars[r.id] ?? 0
              return (
                <button
                  key={r.id}
                  className={`gram-node ${isMastered ? 'mastered' : unlocked ? 'current' : 'locked'}`}
                  disabled={!unlocked}
                  onClick={() => unlocked && startRule(r, globalIndex)}
                  title={unlocked ? r.title : `Termine la règle précédente pour débloquer « ${r.title} »`}
                >
                  <span className="gram-dot">
                    {isMastered ? <Check size={18} /> : unlocked ? <Play size={14} /> : <Lock size={14} />}
                    {isMastered && stars > 0 && <span className="gram-stars-badge">{stars}</span>}
                  </span>
                  <span className="gram-node-title">{r.title}</span>
                </button>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
