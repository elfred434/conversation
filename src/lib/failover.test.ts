import { describe, expect, test } from 'vitest'
import { failoverChain, NO_KEY_MSG } from './llm'
import type { Settings } from '../types'

const S = (over: Partial<Settings>): Settings => ({
  provider: 'gemini',
  apiKey: '',
  model: '',
  baseUrl: '',
  keys: {},
  useBrowserFallback: false,
  autoSpeak: false,
  voiceURI: '',
  rate: 1,
  ...over,
})

describe('failoverChain', () => {
  test('principal seul si aucune cle de secours', () => {
    expect(failoverChain(S({ provider: 'gemini', apiKey: 'g-key' }))).toEqual(['gemini'])
  })
  test('principal sans cle -> exclut les fournisseurs a cle vides, garde ollama/webllm', () => {
    expect(failoverChain(S({ provider: 'ollama' }))).toEqual(['ollama'])
    expect(failoverChain(S({ provider: 'gemini', apiKey: '' }))).toEqual([])
  })
  test('cascade dans l ordre de preference, principal en tete', () => {
    const s = S({
      provider: 'gemini',
      apiKey: 'g',
      keys: { openrouter: 'or', groq: 'gq', openai: 'oa' },
    })
    expect(failoverChain(s)).toEqual(['gemini', 'groq', 'openrouter', 'openai'])
  })
  test('IA integree en dernier si activee (et pas deja principale)', () => {
    const s = S({ provider: 'groq', apiKey: 'k', useBrowserFallback: true })
    expect(failoverChain(s)).toEqual(['groq', 'webllm'])
    expect(failoverChain(S({ provider: 'webllm', useBrowserFallback: true }))).toEqual(['webllm'])
  })
  test('sans rien : chaine vide -> message clair prevu', () => {
    expect(failoverChain(S({ provider: 'gemini' }))).toEqual([])
    expect(NO_KEY_MSG).toContain('Paramètres')
  })
})
