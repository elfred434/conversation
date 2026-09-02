import { useEffect, useState, type CSSProperties } from 'react'
import { Eye, EyeOff, MessageCircle, Play, ShieldCheck, Trash2, TriangleAlert, Volume2 } from 'lucide-react'
import { PROVIDERS } from '../lib/llm'
import { onVoicesChanged, getVoices, speak, ttsSupported } from '../lib/tts'
import { useApp } from '../state/store'
import type { ProviderId, Settings as SettingsData } from '../types'
import { ensureBrowserAI, nativeAIAvailable, webgpuSupported } from '../lib/webllm'

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
      <p className="subtitle">
        <span className="sub-inline">
          <ShieldCheck size={15} /> Tout est stocké localement dans ton navigateur
        </span>
      </p>

      <div className="card">
        <div className="card-head">
          <span className="card-icon"><MessageCircle size={20} /></span>
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
                {showKey ? <EyeOff size={17} /> : <Eye size={17} />}
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
        {settings.provider === 'webllm' && <BrowserAIStatus settings={settings} />}
      </div>

      <div className="card">
        <div className="card-head">
          <span className="card-icon"><Volume2 size={20} /></span>
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
          <Play size={15} /> Tester la voix
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
        <p className="danger-title">
          <TriangleAlert size={18} /> Données locales
        </p>
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
          <Trash2 size={16} /> Effacer les données
        </button>
      </div>

      <p className="note center" style={{ marginTop: 18 }}>
        Les réglages sont enregistrés automatiquement à chaque modification.
      </p>
    </div>
  )
}

/** Etat + preparation du modele IA integre (Gemini Nano ou WebLLM/WebGPU). */
function BrowserAIStatus({ settings }: { settings: SettingsData }): JSX.Element {
  const [txt, setTxt] = useState<string>(
    nativeAIAvailable()
      ? 'Gemini Nano de Chrome détecté — gratuit, déjà dans le navigateur.'
      : webgpuSupported()
        ? 'Un modèle (~700 Mo) sera téléchargé une seule fois, puis 100 % hors-ligne.'
        : "Indisponible : ce navigateur n'a pas WebGPU (utilise Chrome ou Edge récent).",
  )
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [pct, setPct] = useState<number | null>(null)

  useEffect(() => {
    const h = (e: Event): void => {
      const d = (e as CustomEvent<{ progress?: number; done?: boolean }>).detail
      if (d?.done) setPct(null)
      else if (typeof d?.progress === 'number' && d.progress > 0 && d.progress <= 1)
        setPct(Math.round(d.progress * 100))
    }
    window.addEventListener('ff-ai-progress', h)
    return () => window.removeEventListener('ff-ai-progress', h)
  }, [])

  const prepare = async (): Promise<void> => {
    setBusy(true)
    setErr(null)
    try {
      const engine = await ensureBrowserAI(settings)
      setTxt(`IA intégrée prête ✓ (${engine})`)
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="browser-ai">
      <p className="note" style={{ marginBottom: 8 }}>{txt}</p>
      {pct !== null && (
        <div className="progressbar" style={{ marginBottom: 10 }}>
          <i style={{ '--p': String(pct / 100) } as CSSProperties} />
        </div>
      )}
      {pct !== null && <p className="note">Téléchargement : {pct} %</p>}
      {err && <div className="error">{err}</div>}
      <button className="btn btn-outline btn-sm" onClick={prepare} disabled={busy || !webgpuSupported()}>
        {busy ? 'Préparation…' : 'Préparer le modèle maintenant'}
      </button>
    </div>
  )
}
