import { useMemo, useState } from 'react'
import { ArrowLeft, BookOpen, Check, CheckCircle2, ChevronRight, Lightbulb, Lock, Play, RotateCcw, Sparkles, Star, X } from 'lucide-react'
import type { CSSProperties } from 'react'
import { GRAMMAR_TIERS, flattenRules, isRuleUnlocked, requiredForPass, starsForFirstTry, QUIZ_SIZE } from '../lib/grammar'
import type { GrammarQuestion, GrammarRule } from '../lib/grammar'
import { generateGrammarQuestions } from '../lib/grammarAI'
import { NO_KEY_MSG } from '../lib/llm'
import { isAnswerCloseEnough } from '../lib/similarity'
import { loadGrammar, saveGrammar } from '../lib/storage'
import { useApp } from '../state/store'
import RuleText from './RuleText'

type Phase = 'path' | 'lesson' | 'loading' | 'quiz' | 'result'

/** Nuage de points de progression (une pastille par question). */
function Dots({ total, done, firsts }: { total: number; done: number; firsts: boolean[] }): JSX.Element {
  return (
    <span className="dots" aria-label={`${done} sur ${total} questions`}>
      {Array.from({ length: total }, (_, i) => (
        <i
          key={i}
          className={i < firsts.length ? (firsts[i] ? 'ok' : 'mid') : i === done ? 'cur' : ''}
          style={i < firsts.length ? (firsts[i] ? undefined : ({ background: '#F5C86B' } as CSSProperties)) : undefined}
        />
      ))}
    </span>
  )
}

function StarRow({ n, size = 22 }: { n: number; size?: number }): JSX.Element {
  return (
    <span className="stars">
      {[1, 2, 3].map((i) => (
        <Star key={i} size={size} className={i <= n ? 'on' : ''} style={{ animationDelay: `${i * 160}ms` }} />
      ))}
    </span>
  )
}

export default function Grammar(): JSX.Element {
  const { go, settings } = useApp()
  const [progress, setProgress] = useState(loadGrammar)
  const [phase, setPhase] = useState<Phase>('path')
  const [rule, setRule] = useState<GrammarRule | null>(null)
  const [ruleIndex, setRuleIndex] = useState(-1)
  const [questions, setQuestions] = useState<GrammarQuestion[]>([])
  const [source, setSource] = useState<'ai' | 'bank'>('ai')
  const [genError, setGenError] = useState<string | null>(null)
  const [qIndex, setQIndex] = useState(0)
  const [firsts, setFirsts] = useState<boolean[]>([]) // une entree par question passee : juste au 1er coup ?
  const [usedRetry, setUsedRetry] = useState(false)
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

  /** Prepare un quiz : IA si possible, banque statique sinon. */
  const play = async (): Promise<void> => {
    if (!rule) return
    setGenError(null)
    setPhase('loading')
    try {
      const previous = [...rule.questions.map((q) => q.q)]
      const generated = await generateGrammarQuestions(settings, rule, QUIZ_SIZE, previous)
      setQuestions(generated)
      setSource('ai')
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      setQuestions(rule.questions)
      setSource('bank')
      setGenError(msg === NO_KEY_MSG ? null : msg)
    }
    setQIndex(0)
    setFirsts([])
    setUsedRetry(false)
    setAnswer('')
    setChecked(null)
    setPhase('quiz')
  }

  const check = (): void => {
    if (!rule || checked !== null || !answer.trim()) return
    const q = questions[qIndex]
    if (!q) return
    const ok = isAnswerCloseEnough(answer, q.a)
    setChecked(ok)
    if (ok && !usedRetry) setFirsts((f) => [...f, true])
    if (!ok) {
      if (!usedRetry) setFirsts((f) => [...f, false])
      setUsedRetry(true)
    }
  }

  const next = (): void => {
    if (checked === false) {
      // nouvelle tentative sur la meme question (ne compte plus au premier coup)
      setAnswer('')
      setChecked(null)
      return
    }
    if (qIndex + 1 >= questions.length) {
      const first = firsts.filter(Boolean).length
      const required = requiredForPass(questions.length)
      if (first >= required) {
        const stars = starsForFirstTry(first, questions.length)
        setStarGain(stars)
        setProgress((prev) => {
          if (!rule) return prev
          const nextG = {
            mastered: prev.mastered.includes(rule.id) ? prev.mastered : [...prev.mastered, rule.id],
            stars: { ...prev.stars, [rule.id]: Math.max(prev.stars[rule.id] ?? 0, stars) },
          }
          saveGrammar(nextG)
          return nextG
        })
      } else {
        setStarGain(0)
      }
      setPhase('result')
      return
    }
    setQIndex((i) => i + 1)
    setUsedRetry(false)
    setAnswer('')
    setChecked(null)
  }

  const backToPath = (): void => {
    setRule(null)
    setRuleIndex(-1)
    setPhase('path')
  }

  // ---------------- Lecon ----------------
  if (phase === 'lesson' && rule) {
    return (
      <div>
        <button className="back" onClick={backToPath}>
          <ArrowLeft size={16} /> Le parcours
        </button>
        <h1 className="title">{rule.title}</h1>
        <p className="subtitle">
          Règle {ruleIndex + 1} / {rules.length}
        </p>
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
        <div className="card" style={{ borderStyle: 'dashed' }}>
          <p style={{ margin: 0, fontWeight: 700 }}>
            <Sparkles size={15} style={{ verticalAlign: '-2px', color: 'var(--cyan)' }} /> Validation : {QUIZ_SIZE}{' '}
            questions générées par l'IA (différentes à chaque fois)
          </p>
          <p className="muted" style={{ margin: '4px 0 0' }}>
            Pour maîtriser la règle et débloquer la suite : au moins{' '}
            <strong style={{ color: 'var(--text)' }}>
              {requiredForPass(QUIZ_SIZE)} bonnes réponses sur {QUIZ_SIZE}, au premier coup
            </strong>
            . Tu peux réessayer chaque question sans limite — seules les réponses du premier coup comptent.
          </p>
        </div>
        <button className="btn btn-block btn-breathe" onClick={() => void play()}>
          <Play size={18} /> Commencer le quiz
        </button>
      </div>
    )
  }

  // ---------------- Chargement du quiz IA ----------------
  if (phase === 'loading' && rule) {
    return (
      <div>
        <button className="back" onClick={backToPath}>
          <ArrowLeft size={16} /> Le parcours
        </button>
        <h1 className="title">{rule.title}</h1>
        <div className="card center ex-loading">
          <span className="typing" aria-label="Génération en cours">
            <i />
            <i />
            <i />
          </span>
          <p style={{ margin: '8px 0 0' }}>
            <Sparkles size={15} style={{ verticalAlign: '-2px', color: 'var(--cyan)' }} /> L'IA prépare des
            questions sur mesure…
          </p>
        </div>
      </div>
    )
  }

  // ---------------- Quiz ----------------
  if (phase === 'quiz' && rule) {
    const q = questions[qIndex]
    if (!q) {
      setPhase('path')
      return <div />
    }
    const parts = q.q.split('___')
    const isBlank = parts.length === 2
    const required = requiredForPass(questions.length)
    const firstSoFar = firsts.filter(Boolean).length
    return (
      <div>
        <button className="back" onClick={backToPath}>
          <ArrowLeft size={16} /> Abandonner
        </button>
        <div className="card">
          <div className="ex-top">
            <span className="cat-chip">{rule.title}</span>
            <Dots total={questions.length} done={qIndex} firsts={firsts} />
          </div>
          <p className="q-count" style={{ margin: '0 0 8px' }}>
            {source === 'ai' ? (
              <>
                <Sparkles size={12} style={{ verticalAlign: '-1px' }} /> Quiz généré par l'IA ·{' '}
              </>
            ) : (
              'Série embarquée · '
            )}
            Validation : {Math.max(required, firstSoFar) === required ? required : firstSoFar}/{questions.length}{' '}
            au premier coup requis
          </p>
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
                {checked
                  ? usedRetry
                    ? 'Exact — mais après un essai (ça ne compte pas au premier coup).'
                    : 'Exact, du premier coup !'
                  : 'Presque — réessaie.'}
              </span>
              {!checked && q.hint && (
                <div className="hint">
                  <Lightbulb size={15} /> {q.hint}
                </div>
              )}
              {!checked && (
                <button className="btn btn-block" onClick={next}>
                  Réessayer
                </button>
              )}
              {checked && (
                <button className="btn btn-block" onClick={next}>
                  {qIndex + 1 >= questions.length ? 'Voir le bilan →' : 'Suivant →'}
                </button>
              )}
            </div>
          )}
        </div>
        {genError && source === 'bank' && (
          <p className="note">IA indisponible ({genError}) — série embarquée de secours.</p>
        )}
      </div>
    )
  }

  // ---------------- Bilan ----------------
  if (phase === 'result' && rule) {
    const idx = rules.findIndex((r) => r.id === rule.id)
    const nextRule = rules[idx + 1]
    const total = questions.length
    const first = firsts.filter(Boolean).length
    const required = requiredForPass(total)
    const passed = first >= required

    return (
      <div>
        <button className="back" onClick={backToPath}>
          <ArrowLeft size={16} /> Le parcours
        </button>
        {passed ? (
          <>
            <h1 className="title center">Règle maîtrisée !</h1>
            <div className="card center glow" style={{ padding: '34px 20px' }}>
              <div className="card-title" style={{ fontSize: '1.3rem', marginBottom: 8 }}>
                {rule.title}
              </div>
              <StarRow n={starGain} size={30} />
              <p className="muted" style={{ margin: '10px 0 4px' }}>
                {first}/{total} du premier coup —{' '}
                {starGain === 3 ? 'sans faute, parfait !' : starGain === 2 ? 'très solide.' : 'validé.'}
              </p>
              <p className="note" style={{ marginBottom: 16 }}>
                {masteredCount}/{rules.length} règles maîtrisées
                {nextRule ? ` · 🔓 ${nextRule.title} débloquée` : ' · 🏆 parcours complet !'}
              </p>
              <div className="row" style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  className="btn btn-outline"
                  onClick={() => {
                    setRule(rule)
                    setRuleIndex(idx)
                    setPhase('lesson')
                  }}
                >
                  <RotateCcw size={16} /> Rejouer (nouveau quiz IA)
                </button>
                <button className="btn" onClick={backToPath}>
                  Continuer le parcours →
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <h1 className="title center">Pas encore — et c'est normal</h1>
            <div className="card center" style={{ padding: '34px 20px' }}>
              <div className="score-num">
                {first}
                <span> / {total}</span>
              </div>
              <p style={{ margin: '10px 0 4px', fontWeight: 700 }}>
                Il faut {required}/{total} bonnes réponses au premier coup pour valider « {rule.title} ».
              </p>
              <p className="muted" style={{ margin: '0 0 18px' }}>
                Relis la règle, puis retente : l'IA générera des questions différentes.
              </p>
              <div className="row" style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  className="btn btn-outline"
                  onClick={() => {
                    setPhase('lesson')
                  }}
                >
                  <BookOpen size={16} /> Revoir la leçon
                </button>
                <button className="btn" onClick={() => void play()}>
                  <Sparkles size={16} /> Nouveau quiz
                </button>
              </div>
            </div>
          </>
        )}
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
        Une règle se valide avec {requiredForPass(QUIZ_SIZE)}/{QUIZ_SIZE} bonnes réponses au premier coup —
        ensuite, la suivante se débloque.{' '}
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
