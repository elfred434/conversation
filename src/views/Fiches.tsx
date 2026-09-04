import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, Loader2, Volume2 } from 'lucide-react'
import { loadCheatSheets, searchCheatSheets } from '../lib/cheatsheets'
import type { CheatSheet } from '../lib/cheatsheets'
import { speak } from '../lib/tts'
import { useApp } from '../state/store'

/** Une ligne de fiche : premiere cellule en valeur, les suivantes en detail. */
function Row({ cells, onClick }: { cells: string[]; onClick: () => void }): JSX.Element {
  return (
    <button className="fiche-row" onClick={onClick} title="Écouter">
      <span className="fiche-term">{cells[0]}</span>
      {cells.slice(1).map((c, i) => (
        <span key={i} className="fiche-cell">
          {c}
        </span>
      ))}
      <Volume2 size={14} className="fiche-vol" />
    </button>
  )
}

/** Fiches express : les aide-memoires du site,cherchables, 100 % hors-ligne. */
export default function Fiches(): JSX.Element {
  const { go, settings } = useApp()
  const [sheets, setSheets] = useState<CheatSheet[]>([])
  const [error, setError] = useState('')
  const [sel, setSel] = useState('')
  const [q, setQ] = useState('')

  useEffect(() => {
    loadCheatSheets()
      .then((s) => {
        setSheets(s)
        if (s.length > 0) setSel(s[0].id)
      })
      .catch(() => setError('Fiches indisponibles — recharge la page.'))
  }, [])

  const current = sheets.find((s) => s.id === sel)
  const hits = useMemo(() => searchCheatSheets(sheets, q), [sheets, q])
  const say = (t: string): void => speak(t, settings.voiceURI, settings.rate)

  return (
    <div>
      <button className="back" onClick={() => go('home')}>
        <ArrowLeft size={16} /> Accueil
      </button>
      <h1 className="title center">Fiches express</h1>
      <p className="subtitle center">
        Les aide-mémoires de l'anglais : antonymes, question words, amorces, TO BE… Clique sur une
        ligne pour l'écouter.
      </p>

      {error && <div className="card">{error}</div>}
      {!error && sheets.length === 0 && (
        <div className="card center" style={{ padding: '40px 20px' }}>
          <Loader2 className="spin" size={26} />
        </div>
      )}

      {sheets.length > 0 && (
        <>
          <div className="card">
            <label className="field fiche-search">
              <span>Chercher dans toutes les fiches</span>
              <input
                type="search"
                value={q}
                placeholder="Ex : furious, since, pourquoi, roundabout…"
                onChange={(e) => setQ(e.target.value)}
              />
            </label>
          </div>

          {q.trim() ? (
            <div className="fiche-results">
              <p className="muted">
                {hits.length} résultat{hits.length > 1 ? 's' : ''} pour « {q.trim()} »
              </p>
              {hits.map((h, i) => (
                <div key={i} className="card fiche-hit">
                  <span className="tag-chip">{h.sheet.title}</span>
                  <Row cells={h.row} onClick={() => say(h.row[0])} />
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="fiche-tabs">
                {sheets.map((s) => (
                  <button
                    key={s.id}
                    className={`chip ${sel === s.id ? 'active' : ''}`}
                    onClick={() => setSel(s.id)}
                  >
                    {s.title}
                  </button>
                ))}
              </div>

              {current && (
                <div className="card fiche-card">
                  <div className="conj-head">
                    <strong>{current.title}</strong>
                    <span className="muted" style={{ fontSize: '0.9rem' }}>
                      {current.subtitle}
                    </span>
                  </div>
                  {current.groups.map((grp, gi) => (
                    <div key={gi} className="fiche-group">
                      {grp.title && <div className="fiche-group-title">{grp.title}</div>}
                      {grp.note && <p className="muted fiche-note">{grp.note}</p>}
                      <div className="fiche-rows">
                        {grp.rows.map((row, ri) => (
                          <Row key={ri} cells={row} onClick={() => say(row[0])} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}
