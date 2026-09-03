import type { CefrLevel, Settings } from '../types'
import { streamChat } from './llm'
import { LEVELS } from './prompts'

/** Phrases courantes : packs hors-ligne embarques + recherche LLM
 *  (les phrases les plus courantes d'une situation, avec sens FR et
 *  prononciation approchee en syllabes francaises). */

export interface CommonPhrase {
  en: string
  fr: string
  /** Prononciation approchee (syllabes a la francaise) — indicatif, pas de l'IPA. */
  phon: string
}

export interface PhrasePack {
  id: string
  title: string
  phrases: CommonPhrase[]
}

export const PHRASE_PACKS: PhrasePack[] = [
  {
    id: 'greetings',
    title: 'Salutations & politesse',
    phrases: [
      { en: 'Hello! How are you?', fr: 'Salut ! Comment ça va ?', phon: 'hè-loou · haou ar you' },
      { en: 'Nice to meet you', fr: 'Enchanté', phon: 'naïs tou mite you' },
      { en: 'Thank you so much', fr: 'Merci beaucoup', phon: 'tank you sou match' },
      { en: "You're welcome", fr: 'De rien, je t’en prie', phon: 'yor ouel-kem' },
      { en: 'Excuse me, please', fr: 'Excusez-moi, s’il vous plaît', phon: 'eks-kiouz mi · pliz' },
      { en: "I'm sorry", fr: 'Je suis désolé', phon: 'aïm so-ri' },
      { en: 'See you later', fr: 'À plus tard', phon: 'si you laï-ter' },
      { en: 'Have a nice day', fr: 'Bonne journée', phon: 'hav a naïs déï' },
      { en: "How's it going?", fr: 'Ça se passe comment ?', phon: 'haouz it go-in' },
      { en: 'No worries', fr: 'Pas de problème', phon: 'no oue-ris' },
    ],
  },
  {
    id: 'restaurant',
    title: 'Au restaurant',
    phrases: [
      { en: 'Could I see the menu, please?', fr: 'Puis-je voir la carte ?', phon: 'koud aï si ze mé-nou · pliz' },
      { en: 'I would like a coffee', fr: 'Je voudrais un café', phon: 'aï oud laïk a ko-fi' },
      { en: 'The bill, please', fr: 'L’addition, s’il vous plaît', phon: 'ze bil · pliz' },
      { en: 'Is service included?', fr: 'Le service est-il inclus ?', phon: 'iz se-viss in-klu-did' },
      { en: 'It was delicious!', fr: 'C’était délicieux !', phon: 'it ouaz dé-li-chess' },
      { en: 'A table for two, please', fr: 'Une table pour deux', phon: 'a té-bl fo tou · pliz' },
      { en: "I'm allergic to…", fr: 'Je suis allergique à…', phon: 'aïm a-lèr-jik tou' },
      { en: 'Could I have some water?', fr: 'Puis-je avoir de l’eau ?', phon: 'koud aï hav sem wo-ter' },
      { en: 'What do you recommend?', fr: 'Que recommandez-vous ?', phon: 'ouat dou you rè-ko-mend' },
      { en: 'To stay or to go?', fr: 'Sur place ou à emporter ?', phon: 'tou sté o tou go' },
    ],
  },
  {
    id: 'travel',
    title: 'En voyage',
    phrases: [
      { en: 'Where is the train station?', fr: 'Où est la gare ?', phon: 'ouèr iz ze tréin sté-chion' },
      { en: 'How much is the ticket?', fr: 'Combien coûte le billet ?', phon: 'haou match iz ze ti-ket' },
      { en: 'Could you call a taxi?', fr: 'Pouvez-vous appeler un taxi ?', phon: 'koud you kol a tak-si' },
      { en: "I'm lost", fr: 'Je suis perdu', phon: 'aïm lost' },
      { en: 'Is it far from here?', fr: 'Est-ce loin d’ici ?', phon: 'iz it far from hièr' },
      { en: 'What time does it open?', fr: 'À quelle heure ça ouvre ?', phon: 'ouat taïm daz it o-pen' },
      { en: 'One ticket to London, please', fr: 'Un billet pour Londres', phon: 'ouan ti-ket tou lan-den · pliz' },
      { en: 'Where can I find a hotel?', fr: 'Où trouver un hôtel ?', phon: 'ouèr kan aï faïnd a ho-tel' },
      { en: 'Do you speak French?', fr: 'Parlez-vous français ?', phon: 'dou you spik fren-ch' },
      { en: "I don't understand", fr: 'Je ne comprends pas', phon: 'aï dont an-der-stand' },
    ],
  },
  {
    id: 'shopping',
    title: 'Shopping & argent',
    phrases: [
      { en: 'How much does it cost?', fr: 'Combien ça coûte ?', phon: 'haou match daz it kost' },
      { en: "It's too expensive", fr: 'C’est trop cher', phon: 'its tou eks-pen-siv' },
      { en: 'Do you have this in blue?', fr: 'L’avez-vous en bleu ?', phon: 'dou you hav ziss in blou' },
      { en: 'Can I try it on?', fr: 'Puis-je l’essayer ?', phon: 'kan aï traï it on' },
      { en: "I'm just looking, thanks", fr: 'Je regarde juste, merci', phon: 'aïm djoust lou-king · tanks' },
      { en: 'Do you take credit cards?', fr: 'Prenez-vous la carte ?', phon: 'dou you téïk kré-dit kards' },
      { en: 'Can I get a refund?', fr: 'Puis-je être remboursé ?', phon: 'kan aï guet a ri-fand' },
      { en: "It's on sale", fr: 'C’est en solde', phon: 'its on séïl' },
      { en: "I'll take it", fr: 'Je le prends', phon: 'aïl téïk it' },
      { en: 'Could I have a bag?', fr: 'Puis-je avoir un sac ?', phon: 'koud aï hav a bag' },
    ],
  },
  {
    id: 'smalltalk',
    title: 'Small talk',
    phrases: [
      { en: 'Where are you from?', fr: 'Vous venez d’où ?', phon: 'ouèr ar you from' },
      { en: 'What do you do for a living?', fr: 'Que faites-vous dans la vie ?', phon: 'ouat dou you dou for a li-ving' },
      { en: 'The weather is lovely today', fr: 'Il fait beau aujourd’hui', phon: 'ze ouè-zer iz lov-li tou-déï' },
      { en: 'Any plans for the weekend?', fr: 'Des projets pour le week-end ?', phon: 'é-ni plans fo ze ouï-kend' },
      { en: 'I love this city', fr: 'J’adore cette ville', phon: 'aï lov ziss si-ti' },
      { en: 'That sounds great!', fr: 'Ça a l’air génial !', phon: 'zat saounds gréït' },
      { en: 'Really? Tell me more!', fr: 'Vraiment ? Raconte !', phon: 'ri-a-li · tel mi mor' },
      { en: 'Long time no see!', fr: 'Ça fait longtemps !', phon: 'long taïm no si' },
      { en: "What's new with you?", fr: 'Quoi de neuf ?', phon: 'ouats niou with you' },
      { en: 'Take care!', fr: 'Prends soin de toi !', phon: 'téïk kèr' },
    ],
  },
  {
    id: 'health',
    title: 'Santé & urgences',
    phrases: [
      { en: 'I need a doctor', fr: 'J’ai besoin d’un médecin', phon: 'aï nid a dok-ter' },
      { en: 'Call an ambulance!', fr: 'Appelez une ambulance !', phon: 'kol an am-biou-lans' },
      { en: 'It hurts here', fr: 'J’ai mal ici', phon: 'it herts hièr' },
      { en: 'I have a headache', fr: 'J’ai mal à la tête', phon: 'aï hav a hèd-éïk' },
      { en: 'I feel sick', fr: 'Je me sens malade', phon: 'aï fil sik' },
      { en: 'Where is the pharmacy?', fr: 'Où est la pharmacie ?', phon: 'ouèr iz ze far-ma-si' },
      { en: "I'm allergic to penicillin", fr: 'Allergique à la pénicilline', phon: 'aïm a-lèr-jik tou pé-ni-si-lin' },
      { en: 'Can you help me, please?', fr: 'Pouvez-vous m’aider ?', phon: 'kan you hèlp mi · pliz' },
      { en: 'I lost my passport', fr: 'J’ai perdu mon passeport', phon: 'aï lost maï pas-por' },
      { en: 'Is there a hospital nearby?', fr: 'Y a-t-il un hôpital près d’ici ?', phon: 'iz zèr a ho-spi-tal nièr-baï' },
    ],
  },
]

const SYSTEM =
  'You list the most common, useful English phrases for everyday situations for French speakers. ' +
  'Reply with ONLY a strict JSON array — no markdown fences, no commentary.'

/** Messages (system + user) pour demander a l'IA les phrases courantes d'une situation. */
export function buildPhrasesMessages(
  level: CefrLevel,
  topic: string,
  count: number,
  previous: string[],
): { system: string; user: string } {
  const user =
    `List the ${count} most common English phrases for this situation: "${topic}".\n` +
    `Learner level: ${LEVELS[level].label}.\n` +
    `Each JSON item must have exactly:\n` +
    `- "en": the English phrase (natural, what natives actually say)\n` +
    `- "fr": the French meaning/translation\n` +
    `- "phon": an approximate pronunciation written with French syllables (e.g. "hè-loou · haou ar you")\n\n` +
    `Prepend nothing, explain nothing. Do NOT repeat these previous phrases: ` +
    `${previous.length > 0 ? previous.map((q) => `"${q}"`).join('; ') : '(none)'}.\n` +
    `Return ONLY the JSON array.`
  return { system: SYSTEM, user }
}

/** Extrait et valide la liste de phrases d'une reponse LLM (tolerant fences/bavardages). */
export function parsePhrases(text: string, count = 10): CommonPhrase[] {
  const cleaned = text.trim().replace(/```(?:json)?/gi, '')
  const start = cleaned.indexOf('[')
  const end = cleaned.lastIndexOf(']')
  if (start === -1 || end === -1 || end <= start) throw new Error('Réponse IA sans tableau JSON')
  let raw: unknown
  try {
    raw = JSON.parse(cleaned.slice(start, end + 1))
  } catch {
    throw new Error('JSON invalide dans la réponse IA')
  }
  if (!Array.isArray(raw)) throw new Error('La réponse IA n’est pas un tableau')

  const out: CommonPhrase[] = []
  const seen = new Set<string>()
  for (const item of raw) {
    if (typeof item !== 'object' || item === null) continue
    const it = item as Record<string, unknown>
    const en = typeof it.en === 'string' ? it.en.trim() : ''
    const fr = typeof it.fr === 'string' ? it.fr.trim() : ''
    const phon = typeof it.phon === 'string' ? it.phon.trim() : ''
    if (!en || !fr) continue
    const key = en.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    out.push({ en, fr, phon })
    if (out.length >= count) break
  }
  if (out.length === 0) throw new Error('Aucune phrase exploitable dans la réponse IA')
  return out
}

/** Recherche LLM : les phrases les plus courantes pour une situation donnee. */
export async function generatePhrases(
  settings: Settings,
  level: CefrLevel,
  topic: string,
  count: number,
  previous: string[],
  signal?: AbortSignal,
): Promise<CommonPhrase[]> {
  const { system, user } = buildPhrasesMessages(level, topic, count, previous)
  const timeout = new AbortController()
  const timer = setTimeout(() => timeout.abort(), 45000)
  const onExternalAbort = (): void => timeout.abort()
  signal?.addEventListener('abort', onExternalAbort)
  try {
    let full = ''
    for await (const chunk of streamChat(settings, system, [{ role: 'user', content: user }], timeout.signal)) {
      full += chunk
    }
    return parsePhrases(full, count)
  } finally {
    clearTimeout(timer)
    signal?.removeEventListener('abort', onExternalAbort)
  }
}
