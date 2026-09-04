import { useMemo, useState } from 'react'
import { ArrowLeft, Volume2 } from 'lucide-react'
import { TENSES, TENSE_RULES, VERBS, conjugate, fromFrench, isIrregular, verbFr, verbParts } from '../lib/conjugation'
import type { TenseId } from '../lib/conjugation'
import { speak } from '../lib/tts'
import { useApp } from '../state/store'

const VALID = /^[a-z-]+$/i

/** Conjugaisons : tableaux hors-ligne pour les temps de base + modaux. */
export default function Conjugaison(): JSX.Element {
  const { go, settings } = useApp()
  const [verb, setVerb] = useState('work')
  const [input, setInput] = useState('')
  const [tense, setTense] = useState<TenseId>('present-simple')

  const v = verb.trim().toLowerCase()
  const rows = useMemo(() => (v && VALID.test(v) ? conjugate(v, tense) : []), [v, tense])
  const parts = verbParts(v)
  const fr = verbFr(v)
  const tenseInfo = TENSES.find((t) => t.id === tense)
  const options = useMemo(
    () => (VERBS.some((x) => x.v === v) ? VERBS : [{ v, fr: verbFr(v) ?? '' }, ...VERBS]),
    [v],
  )

  const pick = (word: string): void => {
    setVerb(word)
    setInput('')
  }

  return (
    <div>
      <button className="back" onClick={() => go('home')}>
        <ArrowLeft size={16} /> Accueil
      </button>
      <h1 className="title center">Conjugaisons</h1>
      <p className="subtitle center">
        Présent simple, passé simple, continus et modaux — tous les tableaux, 100 % hors-ligne.
      </p>

      <div className="card">
        <label className="field">
          <span>Choisis un verbe</span>
          <select value={v} onChange={(e) => pick(e.target.value)}>
            {options.map((s) => (
              <option key={s.v} value={s.v}>
                {s.v}
                {s.fr ? ` — ${s.fr}` : ''}
              </option>
            ))}
          </select>
        </label>
        <form
          className="key-row"
          onSubmit={(e) => {
            e.preventDefault()
            const w = input.trim().toLowerCase()
            if (!w || !VALID.test(w)) return
            // francais accepte : 'voyager' -> travel, 'aller' -> go
            pick(fromFrench(w) ?? w)
          }}
        >
          <input
            type="text"
            value={input}
            placeholder="Verbe en anglais ou en français (ex : travel ou voyager)"
            onChange={(e) => setInput(e.target.value)}
          />
          <button className="btn" type="submit">
            Conjuguer
          </button>
        </form>
        {v && (
          <p className="muted" style={{ margin: '10px 0 0', fontSize: '0.9rem' }}>
            {isIrregular(v) && parts ? (
              <>
                Verbe <strong>irrégulier</strong> — passé : <strong>{parts.past}</strong>, participe
                passé : <strong>{parts.pp}</strong>.
              </>
            ) : (
              <>Verbe régulier — formes construites avec les règles du -s, -ed et -ing.</>
            )}
          </p>
        )}
      </div>

      <div className="filter-bar conj-tenses">
        {TENSES.map((t) => (
          <button key={t.id} className={`chip ${tense === t.id ? 'active' : ''}`} onClick={() => setTense(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {tenseInfo && rows.length > 0 && (
        <div className="card conj-card">
          <div className="conj-head">
            <strong>
              To {v}
              {fr ? <span className="muted"> — {fr}</span> : null}
            </strong>
            <span className="muted" style={{ fontSize: '0.9rem' }}>
              {tenseInfo.label} · {tenseInfo.hint}
            </span>
          </div>
          <div className="conj-table">
            {rows.map((r, i) => (
              <button
                key={i}
                className="conj-row"
                onClick={() => speak(r.form, settings.voiceURI, settings.rate)}
                title="Écouter"
              >
                <span className="conj-p">
                  {r.p} <span className="muted">({r.fr})</span>
                </span>
                <span className="conj-form">{r.form}</span>
                <Volume2 size={15} className="conj-vol" />
              </button>
            ))}
          </div>
          <div className="word-rule-box">
            <span className="field-label" style={{ marginBottom: 2 }}>
              La règle de ce temps
            </span>
            <ul className="rule-lines">
              {TENSE_RULES[tense].map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
