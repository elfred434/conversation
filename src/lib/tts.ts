/** TTS navigateur : speechSynthesis — sur Edge/Chrome, les voix naturelles
 * (ex. "Microsoft Aria Online (Natural)") sont selectionnables directement. */

export function ttsSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

export function getVoices(): SpeechSynthesisVoice[] {
  if (!ttsSupported()) return []
  return window.speechSynthesis.getVoices()
}

/** Les voix se chargent de facon asynchrone : s'abonner a voiceschanged. */
export function onVoicesChanged(cb: () => void): () => void {
  if (!ttsSupported()) return () => {}
  window.speechSynthesis.addEventListener('voiceschanged', cb)
  return () => window.speechSynthesis.removeEventListener('voiceschanged', cb)
}

export function speak(text: string, voiceURI?: string, rate = 1): void {
  if (!ttsSupported() || !text.trim()) return
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  const voice = getVoices().find((v) => v.voiceURI === voiceURI)
  if (voice) u.voice = voice
  u.lang = voice?.lang ?? 'en-US'
  u.rate = Math.min(1.6, Math.max(0.6, rate))
  window.speechSynthesis.speak(u)
}

export function stopSpeak(): void {
  if (ttsSupported()) window.speechSynthesis.cancel()
}
