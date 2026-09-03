import { useRef, useState } from 'react'
import { ArrowLeft, BookOpen, Search, Sparkles, Volume2 } from 'lucide-react'
import { PHRASE_PACKS, generatePhrases, type CommonPhrase } from '../lib/phrases'
import { interestingWords, lookupWord, type DictEntry } from '../lib/dictionary'
import { NO_KEY_MSG } from '../lib/llm'
import { speak } from '../lib/tts'
import { useApp } from '../state/store'

type Source = 'pack' | 'ai' | 'loading'
interface DictState {
  loading: boolean
  entries: (DictEntry | null)[]
  words: string[]
  error?: string
}

/** Dico par phrase : charge les mots interessants depuis dictionaryapi.dev. */
function DictBlock({ phrase }: { phrase: CommonPhrase }): JSX.Element {
  const [state, setState] = useState<DictState | null>(null)

  const load = async (): Promise<void> => {
    const words = interestingWords(phrase.en, 2)
    setState({ loading: true, entries: words.map(() => null), words })
    try {
      const entries = await Promise.all(words.map((w) => lookupWord(w)))
      setState({ loading: false, entries, words })
    } catch {
      setState({ loading: false, entries: [], words, error: 'Dictionnaire indisponible' })
    }
  }

  if (!state) {
    return (
      <button className="chip" onClick={() => void load()}>
        <BookOpen size={14} /> Dictionnaire
      </button>
    )
  }
  if (state.loading) {
    return (
      <span className="typing" aria-label="Recherche dans le dictionnaire">
        <i />
        <i />
        <i />
      </span>
    )
  }
  return (
    <div className="dict-results">
      {state.entries.map((e, i) => (
        <div key={i} className="dict-entry">
          {e ? (
            <>
              <div className="row">
                <strong>{e.word}</strong>
                {e.phonetic && <span className="phon-ipa">{e.phonetic}</span>}
                {e.audio && (
                  <button className="icon-btn" style={{ width: 30, height: 30, padding: 0 }} title="Audio natif" onClick={() => void new Audio(e.audio).play()}>
                    <Volume2 size={14} />
                  </button>
                )}
              </div>
              {e.defs[0] && (
                <p className="muted" style={{ margin: '2px 0 0', fontSize: '0.85rem' }}>
                  {e.defs[0].pos && <em>({e.defs[0].pos}) </em>}
                  {e.defs[0].def}
                </p>
              )}
            </>
          ) : (
            <span className="muted" style={{ fontSize: '0.85rem' }}>
              {state.words[i]} : introuvable dans le dictionnaire
            </span>
          )}
        </div>
      ))}
      {state.error && <div className="error">{state.error}</div>}
    </div>
  )
}

export default function Phrases(): JSX.Element {
  const { settings, level, setPracticePhrase, go } = useApp()
  const [packId, setPackId] = useState<string>(PHRASE_PACKS[0].id)
  const [list, setList] = useState<CommonPhrase[]>(PHRASE_PACKS[0].phrases)
  const [source, setSource] = useState<Source>('pack')
  const [genError, setGenError] = useState<string | null>(null)
  const [topic, setTopic] = useState('')
  const previousRef = useRef<string[]>([])

  const showPack = (id: string): void => {
    const pack = PHRASE_PACKS.find((p) => p.id === id)
    if (!pack) return
    setPackId(id)
    setList(pack.phrases)
    setSource('pack')
    setGenError(null)
  }

  const search = async (): Promise<void> => {
    const t = topic.trim()
    if (!t || source === 'loading') return
    setSource('loading')
    setGenError(null)
    try {
      const generated = await generatePhrases(settings, level ?? 'b1', t, 10, previousRef.current)
      previousRef.current = generated.map((p) => p.en)
      setList(generated)
      setSource('ai')
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      setGenError(msg)
      setSource('pack')
    }
  }

  return (
    <div>
      <button className="back" onClick={() => go('home')}>
        <ArrowLeft size={16} /> Accueil
      </button>
      <h1 className="title center">Phrases courantes</h1>
      <p className="subtitle center">Les phrases que les natifs utilisent vraiment — sens et prononciation.</p>

      <div className="card">
        <label className="field">
          <span>Une situation ? L'IA te liste les phrases les plus courantes</span>
          <div className="key-row">
            <input
              type="text"
              placeholder="Ex : au restaurant, chez le coiffeur, rendre visite à un ami…"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && void search()}
            />
            <button className="btn btn-sm" onClick={() => void search()} disabled={!topic.trim() || source === 'loading'}>
              <Search size={15} />
            </button>
          </div>
        </label>
        <div className="chips" style={{ margin: 0 }}>
          {PHRASE_PACKS.map((p) => (
            <button key={p.id} className={`chip ${packId === p.id && source === 'pack' ? 'active' : ''}`} onClick={() => showPack(p.id)}>
              {p.title}
            </button>
          ))}
        </div>
      </div>

      {source === 'loading' && (
        <div className="card center ex-loading">
          <span className="typing" aria-label="Recherche en cours">
            <i />
            <i />
            <i />
          </span>
          <p style={{ margin: '8px 0 0' }}>
            <Sparkles size={15} style={{ verticalAlign: '-2px', color: 'var(--cyan)' }} /> Recherche des phrases
            les plus courantes…
          </p>
        </div>
      )}

      {source === 'pack' && genError && (
        <p className="note">
          {genError === NO_KEY_MSG ? (
            <>
              IA indisponible sans clé ({' '}
              <button className="back" style={{ display: 'inline', padding: 0 }} onClick={() => go('settings')}>
                Paramètres
              </button>{' '}
              ) — voici les packs embarqués, 100 % hors-ligne.
            </>
          ) : (
            <>IA indisponible ({genError}) — voici un pack embarqué.</>
          )}
        </p>
      )}
      {source === 'ai' && (
        <p className="gen-note">
          <Sparkles size={14} /> Sélection IA pour « {topic} » — prononciation approchée en syllabes françaises
        </p>
      )}
      {source === 'pack' && !genError && (
        <p className="gen-note">
          <BookOpen size={14} /> {PHRASE_PACKS.find((p) => p.id === packId)?.title} — embarqué, hors-ligne
        </p>
      )}

      {list.map((p, i) => (
        <div key={p.en + i} className="card" style={{ animationDelay: `${Math.min(i, 10) * 70}ms` }}>
          <div className="card-title" style={{ fontSize: '1.1rem' }}>
            {p.en}
          </div>
          {p.phon && <div className="phon-hint">🗣 {p.phon}</div>}
          <div className="muted" style={{ margin: '4px 0 10px' }}>
            {p.fr}
          </div>
          <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
            <button className="btn btn-outline btn-sm" onClick={() => speak(p.en, settings.voiceURI, settings.rate)}>
              <Volume2 size={15} /> Écouter
            </button>
            <button className="btn btn-sm" onClick={() => setPracticePhrase(p.en)}>
              Pratiquer au micro
            </button>
            <DictBlock phrase={p} />
          </div>
        </div>
      ))}
    </div>
  )
}
