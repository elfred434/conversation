import { useState } from 'react'
import { useApp } from '../state/store'
import { LEVELS } from '../lib/prompts'
import type { CefrLevel } from '../types'

export default function Onboarding(): JSX.Element {
  const { chooseLevel } = useApp()
  const [selected, setSelected] = useState<CefrLevel | null>(null)

  return (
    <div>
      <h1 className="title">Bienvenue sur FluentFlow 👋</h1>
      <p className="subtitle">Quel est ton niveau d'anglais ? (tu pourras le changer plus tard)</p>
      <div className="chips">
        {(Object.keys(LEVELS) as CefrLevel[]).map((l) => (
          <button
            key={l}
            className={`chip ${selected === l ? 'active' : ''}`}
            onClick={() => setSelected(l)}
          >
            {LEVELS[l].label}
          </button>
        ))}
      </div>
      <button className="btn btn-block" disabled={!selected} onClick={() => selected && chooseLevel(selected)}>
        Continuer →
      </button>
    </div>
  )
}
