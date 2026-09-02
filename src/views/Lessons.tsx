import { LESSONS } from '../lib/lessons'
import { useApp } from '../state/store'
import { speak } from '../lib/tts'

const LESSON_EMOJI: Record<string, string> = { daily: '🌅', travel: '✈️', smalltalk: '🗣️' }
const LESSON_LEVEL: Record<string, string> = { daily: 'Bases', travel: 'Intermédiaire', smalltalk: 'Avancé' }

export default function Lessons(): JSX.Element {
  const { settings, setPracticePhrase, go } = useApp()

  return (
    <div>
      <button className="back" onClick={() => go('home')}>
        ← Accueil
      </button>
      <h1 className="title center">Leçons</h1>
      <p className="subtitle center">Embarquées dans l'app — aucun réseau requis.</p>

      {LESSONS.map((lesson, idx) => (
        <details key={lesson.id} className="lesson" open={idx === 0}>
          <summary>
            <span className="lesson-emoji">{LESSON_EMOJI[lesson.id] ?? '📘'}</span>
            <span className="lesson-titles">
              <strong>{lesson.title}</strong>
              <span className="lesson-tags">
                <span className="tag-chip">{LESSON_LEVEL[lesson.id] ?? 'Libre'}</span>
                <span className="tag-chip">{lesson.phrases.length} phrases</span>
              </span>
            </span>
            <span className="chev">⌄</span>
          </summary>
          {lesson.phrases.map((p, i) => (
            <div key={i} className="phrase">
              <span className="grow">
                <div className="en">{p.en}</div>
                <div className="fr">{p.fr}</div>
              </span>
              <button
                className="icon-btn"
                style={{ flex: 'none' }}
                onClick={() => speak(p.en, settings.voiceURI, settings.rate)}
                title="Écouter"
              >
                🔊
              </button>
              <button className="btn btn-sm" onClick={() => setPracticePhrase(p.en)}>
                Pratiquer
              </button>
            </div>
          ))}
        </details>
      ))}
    </div>
  )
}
