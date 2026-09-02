import type { CefrLevel } from '../types'

/** Marqueur que le LLM ajoute en fin de reponse quand l'utilisateur a fait une faute. */
export const CORRECTION_MARKER = '@@CORRECTION@@'

export const LEVELS: Record<CefrLevel, { label: string; instruction: string }> = {
  a1: {
    label: 'A1 · Débutant',
    instruction:
      'The learner is a complete beginner (A1). Use very simple words and very short sentences. Be patient and encouraging.',
  },
  a2: {
    label: 'A2 · Élémentaire',
    instruction: 'The learner is elementary (A2). Use simple, everyday vocabulary and short sentences.',
  },
  b1: {
    label: 'B1 · Intermédiaire',
    instruction: 'The learner is intermediate (B1). Use natural conversation and gently correct grammar mistakes.',
  },
  b2: {
    label: 'B2 · Intermédiaire avancé',
    instruction:
      'The learner is upper-intermediate (B2). Use natural, fluent English, introduce some idioms, and correct mistakes subtly.',
  },
  c1: {
    label: 'C1 · Autonome',
    instruction:
      'The learner is advanced (C1). Use rich vocabulary and natural phrasing, and challenge them with nuance.',
  },
  c2: {
    label: 'C2 · Maîtrise',
    instruction: 'The learner is near-native (C2). Use sophisticated, idiomatic English.',
  },
}

export interface Scenario {
  id: string
  title: string
  description: string
  prompt: string
  correct: boolean
}

export const SCENARIOS: Scenario[] = [
  {
    id: 'daily',
    title: 'La vie quotidienne',
    description: 'Parler de ta journée et de tes habitudes.',
    prompt: 'Talk about daily life, routines and habits with the learner.',
    correct: true,
  },
  {
    id: 'travel',
    title: 'Voyager',
    description: 'Réserver, demander son chemin, à l’aéroport.',
    prompt: 'Practice travel English: booking, asking for directions, at the airport.',
    correct: true,
  },
  {
    id: 'work',
    title: 'Au travail',
    description: 'Réunions, e-mails, small talk.',
    prompt: 'Practice professional and workplace English: meetings, emails, small talk.',
    correct: true,
  },
  {
    id: 'myday',
    title: 'Raconte ta journée',
    description: 'Le tuteur t’écoute, sans correction.',
    prompt:
      'The user is practicing English by telling you about their day. Be a warm, attentive listener. ' +
      'Respond naturally and encouragingly in simple English, and ask follow-up questions to keep ' +
      'the conversation going. Do NOT correct their grammar or spelling; your goal is to let them express themselves freely.',
    correct: false,
  },
]

/** System prompt : niveau + scenario + instruction de correction fusionnee (1 seul appel LLM). */
export function buildSystemPrompt(
  level: CefrLevel,
  scenarioPrompt?: string,
  correct = true,
): string {
  const correctionNote = correct
    ? `If the user's last message contains a mistake (grammar, spelling, tense, article, preposition or word order), end your ENTIRE reply with exactly one extra line in this strict JSON format, with nothing after it:\n` +
      `${CORRECTION_MARKER}{"corrected":"<the user's sentence, corrected>","category":"<article|preposition|tense|spelling|word_order|other>","explanation":"<very short explanation in English>"}\n` +
      `Only add that line when there is a genuine mistake; if the sentence is already correct, do not add it. You may also mention the correction briefly and kindly in your reply.`
    : `Listen more than you teach: respond naturally and encouragingly, ask follow-up questions, and do NOT correct grammar or spelling. Let the user express themselves freely.`

  const base =
    `You are a friendly English conversation partner helping the user practice spoken English.\n` +
    `${LEVELS[level].instruction}\n` +
    `Keep replies concise and conversational (2-4 sentences). ${correctionNote}`

  return scenarioPrompt ? `${base}\n\nScenario: ${scenarioPrompt}` : base
}
