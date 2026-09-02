import { useState } from 'react'
import { useApp } from '../state/store'
import { LEVELS } from '../lib/prompts'
import type { CefrLevel } from '../types'

export default function Onboarding(): JSX.Element {
  const { chooseLevel } = useApp()
  const [selected, setSelected] = useState<CefrLevel | null>(null)

  return (
    <div>
      <div className="welcome-badge">
        <img src="icon.png" alt="FluentFlow" />
      </div>
      <h1 className="title center">Bienvenue sur FluentFlow 👋</h1>
      <p className="subtitle center">Sélectionne ton niveau pour calibrer ton immersion.</p>

      <div className="level-grid">
        {(Object.keys(LEVELS) as CefrLevel[]).map((l) => {
          const code = l.toUpperCase()
          const name = LEVELS[l].label.replace(code, '').replace(/^[·—–-]\s*/, '')
          return (
            <button
              key={l}
              className={`level-card ${selected === l ? 'active' : ''}`}
              onClick={() => setSelected(l)}
            >
              <div className="level-code">{code}</div>
              <div className="level-name">{name}</div>
            </button>
          )
        })}
      </div>

      <button className="btn btn-block btn-breathe" disabled={!selected} onClick={() => selected && chooseLevel(selected)}>
        Continuer →
      </button>
    </div>
  )
}
