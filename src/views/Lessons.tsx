import { LESSONS } from '../lib/lessons'
import { useApp } from '../state/store'
import { speak } from '../lib/tts'

export default function Lessons(): JSX.Element {
  const { settings, setPracticePhrase, go } = useApp()

  return (
    <div>
      <button className="back" onClick={() => go('home')}>
        ← Accueil
      </button>
      <h1 className="title">Leçons</h1>
      <p className="subtitle">Embarquées dans l'app — aucun réseau requis.</p>

      {LESSONS.map((lesson) => (
        <details key={lesson.id} className="lesson">
          <summary>
            {lesson.title} <span className="muted">· {lesson.description}</span>
          </summary>
          {lesson.phrases.map((p, i) => (
            <div key={i} className="phrase">
              <div className="grow">
                <div className="en">{p.en}</div>
                <div className="fr">{p.fr}</div>
              </div>
              <button
                className="btn btn-outline btn-sm"
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
