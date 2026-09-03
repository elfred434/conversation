import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, ChevronRight, Loader2, Puzzle, Search, Volume2 } from 'lucide-react'
import { familyMatches, loadWordRules, splitExample } from '../lib/wordRules'
import type { WordRuleFamily, WordRuleItem } from '../lib/wordRules'
import { lookupWord } from '../lib/dictionary'
import { speak } from '../lib/tts'
import { useApp } from '../state/store'

/** Petit bouton audio : joue la voix TTS, ou l'audio natif du dictionnaire si dispo. */
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

  const play = (): void => {
    if (audioUrl) void new Audio(audioUrl).play()
    else speak(word, settings.voiceURI, settings.rate)
  }

  return (
    <button className="icon-btn" style={{ width: 30, height: 30, padding: 0 }} onClick={play} title="Écouter">
      <Volume2 size={14} />
    </button>
  )
}

function FamilyCard({ family }: { family: WordRuleFamily }): JSX.Element {
  const [open, setOpen] = useState(false)
  return (
    <details className="lesson" open={open} onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}>
      <summary>
        <span className="lesson-emoji">
          <Puzzle size={20} />
        </span>
        <span className="lesson-titles">
          <strong>{family.title}</strong>
          {family.hint && <span className="lesson-tags"><span className="tag-chip">{family.hint}</span></span>}
        </span>
        <ChevronRight size={18} className="chev" style={{ transform: open ? 'rotate(90deg)' : 'none' }} />
      </summary>
      <div style={{ paddingBottom: 12 }}>
        {family.items.map((it) => (
          <ItemBlock key={it.word} item={it} />
        ))}
      </div>
    </details>
  )
}

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
        {item.rule}
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

export default function WordRules(): JSX.Element {
  const { go } = useApp()
  const [data, setData] = useState<WordRuleFamily[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [q, setQ] = useState('')

  useEffect(() => {
    void loadWordRules()
      .then((d) => setData(d.families))
      .catch((e) => setError(e instanceof Error ? e.message : String(e)))
  }, [])

  const filtered = useMemo(() => {
    if (!data) return []
    return data.filter((f) => familyMatches(f, q))
  }, [data, q])

  return (
    <div>
      <button className="back" onClick={() => go('home')}>
        <ArrowLeft size={16} /> Accueil
      </button>
      <h1 className="title">Mots qui se ressemblent</h1>
      <p className="subtitle">
        Ces mots veulent dire « la même chose » mais ne s'utilisent pas dans les mêmes cas — avec la règle
        d'usage de chacun.
      </p>

      <div className="card" style={{ position: 'sticky', top: 64, zIndex: 5 }}>
        <div className="key-row">
          <Search size={17} style={{ color: 'var(--muted)', flex: 'none', alignSelf: 'center' }} />
          <input
            type="text"
            placeholder="Rechercher un mot (borrow, since, actually…)"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        {data && (
          <p className="note" style={{ marginTop: 6 }}>
            {filtered.length} famille{filtered.length > 1 ? 's' : ''} · chargées depuis le dépôt du site (à la
            demande, sans alourdir l'app)
          </p>
        )}
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

      {data && filtered.length === 0 && (
        <p className="muted center" style={{ marginTop: 20 }}>
          Aucune famille ne correspond à « {q} ».
        </p>
      )}

      {filtered.map((f) => (
        <FamilyCard key={f.id} family={f} />
      ))}
    </div>
  )
}
