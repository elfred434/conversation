import { describe, expect, test, vi } from 'vitest'
import { renderToString } from 'react-dom/server'
import App from './App'

// Stub localStorage (absent sous node) avant tout rendu.
const stub = vi.hoisted(() => {
  const store = new Map<string, string>()
  globalThis.localStorage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
    clear: () => store.clear(),
  } as unknown as Storage
  return store
})

describe('rendu SSR de l app (anti-crash)', () => {
  test('l onboarding se rend sans crash', () => {
    void stub
    const html = renderToString(<App />)
    expect(html).toContain('Bienvenue sur FluentFlow')
    expect(html).toContain('A1')
    expect(html).toContain('Continuer')
  })

  test('l accueil (niveau choisi) affiche les icones lucide', () => {
    stub.set('ff_level', 'b1')
    const html = renderToString(<App />)
    expect(html).toContain('Prêt à parler anglais ?')
    expect(html).toContain('Choisis un scénario')
    // les icones lucide sont des <svg class="lucide ...">
    expect(html).toContain('lucide')
  })

  test('aucun emoji ne subsiste dans l interface rendue', () => {
    stub.set('ff_level', 'b1')
    const html = renderToString(<App />)
    const emoji = html.match(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu)
    expect(emoji).toBeNull()
  })
})
