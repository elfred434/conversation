import { useEffect, useState } from 'react'
import { PROVIDERS } from '../lib/llm'
import { onVoicesChanged, getVoices, speak, ttsSupported } from '../lib/tts'
import { useApp } from '../state/store'
import type { ProviderId } from '../types'

export default function Settings(): JSX.Element {
  const { settings, updateSettings, clearSessions, go } = useApp()
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [showKey, setShowKey] = useState(false)

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
      <p className="subtitle">🛡 Tout est stocké localement dans ton navigateur.</p>

      <div className="card">
        <div className="card-head">
          <span className="card-emoji">🤖</span>
          <span>
            <div className="card-title">Tuteur IA</div>
            <div className="card-sub">Configuration du modèle</div>
          </span>
        </div>

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
            <span>Clé d'API</span>
            <div className="key-row">
              <input
                type={showKey ? 'text' : 'password'}
                placeholder="sk-… / AIza…"
                value={settings.apiKey}
                onChange={(e) => updateSettings({ apiKey: e.target.value })}
              />
              <button
                className="eye-btn"
                onClick={() => setShowKey((v) => !v)}
                aria-label={showKey ? 'Masquer la clé' : 'Afficher la clé'}
              >
                {showKey ? '🙈' : '👁'}
              </button>
            </div>
            <p className="note">Clé stockée uniquement dans ce navigateur (LocalStorage).</p>
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
        <p className="note">{meta.hint}</p>
      </div>

      <div className="card">
        <div className="card-head">
          <span className="card-emoji">🔊</span>
          <span>
            <div className="card-title">Voix {ttsSupported() ? '' : '(non supportée ici)'}</div>
            <div className="card-sub">Les voix « Natural » d'Edge sont les plus naturelles</div>
          </span>
        </div>

        <label className="field">
          <span>Type de voix</span>
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
          <span>Vitesse : ×{settings.rate.toFixed(1)}</span>
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
          ▶ Tester la voix
        </button>

        <div className="switch-row">
          <span>Lecture automatique des réponses du tuteur</span>
          <label className="switch">
            <input
              type="checkbox"
              checked={settings.autoSpeak}
              onChange={(e) => updateSettings({ autoSpeak: e.target.checked })}
            />
            <span className="track">
              <span className="knob" />
            </span>
          </label>
        </div>
      </div>

      <div className="danger-card">
        <p className="danger-title">⚠️ Données locales</p>
        <p className="muted" style={{ marginTop: 0 }}>
          Supprime tout l'historique de tes conversations et ta progression. Cette action est irréversible.
        </p>
        <button
          className="btn btn-danger"
          onClick={() => {
            clearSessions()
            alert('Historique effacé.')
          }}
        >
          🗑 Effacer les données
        </button>
      </div>

      <p className="note center" style={{ marginTop: 18 }}>
        Les réglages sont enregistrés automatiquement à chaque modification.
      </p>
    </div>
  )
}
