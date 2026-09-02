import { useEffect, useState } from 'react'
import { PROVIDERS } from '../lib/llm'
import { onVoicesChanged, getVoices, speak, ttsSupported } from '../lib/tts'
import { useApp } from '../state/store'
import type { ProviderId } from '../types'

export default function Settings(): JSX.Element {
  const { settings, updateSettings, clearSessions, go } = useApp()
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const refresh = () => {
      const all = getVoices()
      setVoices([...all].sort((a, b) => Number(b.lang.startsWith('en')) - Number(a.lang.startsWith('en'))))
    }
    refresh()
    return onVoicesChanged(refresh)
  }, [])

  const meta = PROVIDERS[settings.provider]

  return (
    <div>
      <button className="back" onClick={() => go('home')}>
        ← Accueil
      </button>
      <h1 className="title">Paramètres</h1>
      <p className="subtitle">Tout est stocké localement dans ton navigateur.</p>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Tuteur IA</h3>
        <label className="field">
          <span>Fournisseur</span>
          <select
            value={settings.provider}
            onChange={(e) => updateSettings({ provider: e.target.value as ProviderId })}
          >
            {(Object.keys(PROVIDERS) as ProviderId[]).map((id) => (
              <option key={id} value={id}>
                {PROVIDERS[id].label}
              </option>
            ))}
          </select>
        </label>

        {meta.needsKey && (
          <label className="field">
            <span>Clé API</span>
            <input
              type="password"
              placeholder="sk-… / AIza…"
              value={settings.apiKey}
              onChange={(e) => updateSettings({ apiKey: e.target.value })}
            />
          </label>
        )}

        <label className="field">
          <span>Modèle</span>
          <input
            type="text"
            placeholder={meta.defaultModel}
            value={settings.model}
            onChange={(e) => updateSettings({ model: e.target.value })}
          />
        </label>

        {settings.provider === 'ollama' && (
          <label className="field">
            <span>URL Ollama</span>
            <input
              type="text"
              placeholder="http://192.168.1.20:11434/v1"
              value={settings.baseUrl}
              onChange={(e) => updateSettings({ baseUrl: e.target.value })}
            />
          </label>
        )}
        <p className="muted">{meta.hint}</p>
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Voix du tuteur {ttsSupported() ? '' : '(non supportée ici)'}</h3>
        <label className="field">
          <span>Voix (les voix « Natural » d'Edge sont les plus naturelles)</span>
          <select value={settings.voiceURI} onChange={(e) => updateSettings({ voiceURI: e.target.value })}>
            <option value="">Voix par défaut du système</option>
            {voices.map((v) => (
              <option key={v.voiceURI} value={v.voiceURI}>
                {v.name} — {v.lang}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Vitesse : x{settings.rate.toFixed(1)}</span>
          <input
            type="range"
            min={0.6}
            max={1.4}
            step={0.1}
            value={settings.rate}
            onChange={(e) => updateSettings({ rate: Number(e.target.value) })}
          />
        </label>
        <button
          className="btn btn-outline btn-sm"
          onClick={() => speak("Hello! I'm your FluentFlow tutor. Let's practice English together!", settings.voiceURI, settings.rate)}
        >
          🔊 Tester la voix
        </button>

        <label className="field" style={{ marginTop: 16 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="checkbox"
              checked={settings.autoSpeak}
              onChange={(e) => updateSettings({ autoSpeak: e.target.checked })}
            />
            Lecture automatique des réponses du tuteur
          </span>
        </label>
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Données</h3>
        <button
          className="btn btn-danger btn-block"
          onClick={() => {
            clearSessions()
            setSaved(false)
            alert('Historique effacé.')
          }}
        >
          🗑 Effacer toutes les conversations
        </button>
      </div>

      <p className="muted center">
        Les réglages sont enregistrés automatiquement à chaque modification.
        {saved ? ' ✅' : ''}
      </p>
    </div>
  )
}
