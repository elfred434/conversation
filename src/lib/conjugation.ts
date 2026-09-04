/** Conjugaisons : generation 100 % hors-ligne (regles -s / -ed / -ing + table irreguliers). */

export type TenseId =
  | 'present-simple'
  | 'past-simple'
  | 'present-continuous'
  | 'past-continuous'
  | 'modals'

export const TENSES: { id: TenseId; label: string; hint: string }[] = [
  { id: 'present-simple', label: 'Présent simple', hint: 'Habitudes et vérités générales' },
  { id: 'past-simple', label: 'Passé simple (prétérit)', hint: 'Action finie et datée' },
  { id: 'present-continuous', label: 'Présent continu', hint: 'Action en cours maintenant' },
  { id: 'past-continuous', label: 'Passé continu', hint: 'Action en cours dans le passé' },
  { id: 'modals', label: 'Verbes modaux', hint: 'can, must, should… toujours + verbe nu' },
]

export const PERSONS: { p: string; fr: string }[] = [
  { p: 'I', fr: 'je' },
  { p: 'you', fr: 'tu' },
  { p: 'he / she / it', fr: 'il / elle' },
  { p: 'we', fr: 'nous' },
  { p: 'you', fr: 'vous' },
  { p: 'they', fr: 'ils / elles' },
]

/** Verbes irréguliers : past, participe passé, forme en -ing et 3e personne spéciales. */
export const IRREG: Record<string, { past: string; pp: string; fr: string; s?: string; ing?: string }> = {
  be: { past: 'was / were', pp: 'been', fr: 'être', s: 'is', ing: 'being' },
  have: { past: 'had', pp: 'had', fr: 'avoir', s: 'has', ing: 'having' },
  do: { past: 'did', pp: 'done', fr: 'faire', s: 'does', ing: 'doing' },
  go: { past: 'went', pp: 'gone', fr: 'aller', s: 'goes' },
  say: { past: 'said', pp: 'said', fr: 'dire' },
  take: { past: 'took', pp: 'taken', fr: 'prendre' },
  get: { past: 'got', pp: 'got', fr: 'obtenir' },
  make: { past: 'made', pp: 'made', fr: 'fabriquer' },
  know: { past: 'knew', pp: 'known', fr: 'savoir' },
  think: { past: 'thought', pp: 'thought', fr: 'penser' },
  see: { past: 'saw', pp: 'seen', fr: 'voir', ing: 'seeing' },
  come: { past: 'came', pp: 'come', fr: 'venir' },
  find: { past: 'found', pp: 'found', fr: 'trouver' },
  give: { past: 'gave', pp: 'given', fr: 'donner' },
  tell: { past: 'told', pp: 'told', fr: 'dire à' },
  feel: { past: 'felt', pp: 'felt', fr: 'ressentir' },
  become: { past: 'became', pp: 'become', fr: 'devenir' },
  leave: { past: 'left', pp: 'left', fr: 'partir' },
  put: { past: 'put', pp: 'put', fr: 'mettre' },
  mean: { past: 'meant', pp: 'meant', fr: 'vouloir dire' },
  keep: { past: 'kept', pp: 'kept', fr: 'garder' },
  begin: { past: 'began', pp: 'begun', fr: 'commencer' },
  show: { past: 'showed', pp: 'shown', fr: 'montrer' },
  hear: { past: 'heard', pp: 'heard', fr: 'entendre' },
  run: { past: 'ran', pp: 'run', fr: 'courir' },
  bring: { past: 'brought', pp: 'brought', fr: 'apporter' },
  write: { past: 'wrote', pp: 'written', fr: 'écrire' },
  sit: { past: 'sat', pp: 'sat', fr: "s'asseoir" },
  stand: { past: 'stood', pp: 'stood', fr: 'se tenir debout' },
  lose: { past: 'lost', pp: 'lost', fr: 'perdre' },
  pay: { past: 'paid', pp: 'paid', fr: 'payer' },
  meet: { past: 'met', pp: 'met', fr: 'rencontrer' },
  understand: { past: 'understood', pp: 'understood', fr: 'comprendre' },
  speak: { past: 'spoke', pp: 'spoken', fr: 'parler' },
  read: { past: 'read', pp: 'read', fr: 'lire' },
  spend: { past: 'spent', pp: 'spent', fr: 'dépenser' },
  grow: { past: 'grew', pp: 'grown', fr: 'grandir' },
  win: { past: 'won', pp: 'won', fr: 'gagner' },
  teach: { past: 'taught', pp: 'taught', fr: 'enseigner' },
  buy: { past: 'bought', pp: 'bought', fr: 'acheter' },
  send: { past: 'sent', pp: 'sent', fr: 'envoyer' },
  build: { past: 'built', pp: 'built', fr: 'construire' },
  fall: { past: 'fell', pp: 'fallen', fr: 'tomber' },
  cut: { past: 'cut', pp: 'cut', fr: 'couper' },
  break: { past: 'broke', pp: 'broken', fr: 'casser' },
  eat: { past: 'ate', pp: 'eaten', fr: 'manger' },
  drink: { past: 'drank', pp: 'drunk', fr: 'boire' },
  sleep: { past: 'slept', pp: 'slept', fr: 'dormir' },
  fly: { past: 'flew', pp: 'flown', fr: 'voler' },
  sing: { past: 'sang', pp: 'sung', fr: 'chanter' },
  swim: { past: 'swam', pp: 'swum', fr: 'nager' },
  wake: { past: 'woke', pp: 'woken', fr: 'réveiller' },
  wear: { past: 'wore', pp: 'worn', fr: 'porter' },
  drive: { past: 'drove', pp: 'driven', fr: 'conduire' },
  catch: { past: 'caught', pp: 'caught', fr: 'attraper' },
  choose: { past: 'chose', pp: 'chosen', fr: 'choisir' },
  draw: { past: 'drew', pp: 'drawn', fr: 'dessiner' },
  forget: { past: 'forgot', pp: 'forgotten', fr: 'oublier' },
  lie: { past: 'lay', pp: 'lain', fr: 'être allongé', s: 'lies', ing: 'lying' },
  die: { past: 'died', pp: 'died', fr: 'mourir', ing: 'dying' },
  tie: { past: 'tied', pp: 'tied', fr: 'attacher', ing: 'tying' },
}

/** Traductions de verbes réguliers courants (pour le sous-titre). */
const REG_FR: Record<string, string> = {
  work: 'travailler', play: 'jouer', watch: 'regarder', listen: 'écouter',
  study: 'étudier', try: 'essayer', ask: 'demander', need: 'avoir besoin de',
  want: 'vouloir', use: 'utiliser', call: 'appeler', open: 'ouvrir',
  close: 'fermer', clean: 'nettoyer', cook: 'cuisiner', dance: 'danser',
  walk: 'marcher', learn: 'apprendre', help: 'aider', talk: 'parler',
  live: 'habiter', stay: 'rester', arrive: 'arriver', cry: 'pleurer',
  laugh: 'rire', smile: 'sourire', visit: 'visiter', travel: 'voyager',
  plan: 'planifier', happen: 'se produire', start: 'commencer',
  change: 'changer', turn: 'tourner', follow: 'suivre', offer: 'offrir',
  wait: 'attendre', hope: 'espérer', decide: 'décider', explain: 'expliquer',
  finish: 'finir', like: 'aimer', love: 'adorer', look: 'regarder',
  move: 'bouger', answer: 'répondre', join: 'rejoindre', rain: 'pleuvoir',
}

/** Verbes proposés en un clic (les irréguliers d'abord : ce sont eux qu'on cherche). */
export const SUGGESTED: { v: string; fr: string }[] = [
  { v: 'be', fr: 'être' }, { v: 'have', fr: 'avoir' }, { v: 'go', fr: 'aller' },
  { v: 'do', fr: 'faire' }, { v: 'make', fr: 'fabriquer' }, { v: 'say', fr: 'dire' },
  { v: 'take', fr: 'prendre' }, { v: 'get', fr: 'obtenir' }, { v: 'see', fr: 'voir' },
  { v: 'come', fr: 'venir' }, { v: 'know', fr: 'savoir' }, { v: 'think', fr: 'penser' },
  { v: 'speak', fr: 'parler' }, { v: 'write', fr: 'écrire' }, { v: 'eat', fr: 'manger' },
  { v: 'run', fr: 'courir' }, { v: 'begin', fr: 'commencer' }, { v: 'buy', fr: 'acheter' },
  { v: 'work', fr: 'travailler' }, { v: 'play', fr: 'jouer' }, { v: 'study', fr: 'étudier' },
  { v: 'stop', fr: 'arrêter' }, { v: 'travel', fr: 'voyager' }, { v: 'watch', fr: 'regarder' },
]

/** Les regles de chaque temps, une idee par entree (affichee une idee par ligne). */
export const TENSE_RULES: Record<TenseId, string[]> = {
  'present-simple': [
    'Usage : habitudes et routines (I work every day).',
    'Aussi : vérités générales (The sun rises in the east).',
    'Formation : base verbale, avec -s à la 3ᵉ personne (he works).',
    'Après s, ss, sh, ch, x, o : -es (he watches, she goes).',
    'Consonne + y : -ies (study → studies).',
    'Négation : don’t / doesn’t + verbe nu (She doesn’t like tea).',
    'Question : Do / Does + sujet + verbe nu (Does he play?).',
    'Indices fréquents : every day, usually, often, always, on Mondays.',
  ],
  'past-simple': [
    'Usage : action finie et datée (Yesterday, I watched TV).',
    'Verbes réguliers : -ed (play → played).',
    'Se termine par e : -d seulement (live → lived).',
    'Consonne + y : -ied (study → studied).',
    'Certains doublent la dernière lettre : stop → stopped, plan → planned.',
    'Irréguliers : à apprendre par cœur (go → went, see → saw, eat → ate).',
    'Négation : didn’t + verbe nu (I didn’t go).',
    'Question : Did + sujet + verbe nu (Did you see him?).',
    'Indices fréquents : yesterday, last week, in 2010, two days ago.',
  ],
  'present-continuous': [
    'Usage : action en cours maintenant (I am reading).',
    'Aussi : situation temporaire (I am staying with friends this week).',
    'Formation : am / is / are + verbe-ing.',
    'e muet tombe : make → making, write → writing.',
    'ie → ying : lie → lying, die → dying.',
    'Doublement : run → running, swim → swimming.',
    'Négation : am not / isn’t / aren’t + -ing (He isn’t sleeping).',
    'Question : Am / Is / Are + sujet + -ing ? (Are you coming?).',
    'Indices fréquents : now, right now, at the moment, Look!',
    'Attention : like, love, want, know, need ne prennent pas de -ing.',
  ],
  'past-continuous': [
    'Usage : action en cours dans le passé (I was reading at 8 pm).',
    'Souvent interrompue par une action brève : I was sleeping when you called.',
    'Formation : was / were + verbe-ing.',
    'was avec I, he / she / it ; were avec you, we, they.',
    'Structure fréquente : While + passé continu, prétérit (While she was cooking, he arrived).',
    'Négation : wasn’t / weren’t + -ing (They weren’t waiting).',
    'Question : Was / Were + sujet + -ing ? (Were you working?).',
    'Indices fréquents : while, at 8 pm yesterday, all morning.',
  ],
  modals: [
    'Toujours suivis du verbe nu : pas de -s, pas de to (She can swim).',
    'Pas de -s à la 3ᵉ personne : He must go (jamais musts).',
    'can / could : capacité ; could sert aussi de politesse (Could you help?).',
    'must : obligation forte ; should : conseil.',
    'may / might : permission et possibilité.',
    'will : futur (décision, prédiction) ; would : hypothèse et politesse.',
    'shall : proposition soutenu (GB) : Shall we go?.',
    'Négation : modal + not (can’t, mustn’t, shouldn’t).',
    'Question : le modal passe devant le sujet (Can you swim?).',
  ],
}

/** Normalise une saisie : minuscules, sans accents, apostrophes unifiees. */
export function normalizeVerb(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/[’‘`]/g, "'")
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

/** Dictionnaire inverse : francais -> verbe anglais (premiere occurrence = la plus courante). */
const FR_TO_EN: Map<string, string> = (() => {
  const map = new Map<string, string>()
  const put = (fr: string, v: string): void => {
    const key = normalizeVerb(fr)
    if (key && !map.has(key)) map.set(key, v)
  }
  for (const [v, d] of Object.entries(IRREG)) put(d.fr, v)
  for (const [v, fr] of Object.entries(REG_FR)) put(fr, v)
  for (const s of SUGGESTED) put(s.fr, s.v)
  return map
})()

/**
 * Traduit un verbe francais vers l'anglais conna du dictionnaire interne.
 * Retourne null si la saisie n'est pas un francais connu (ce sera traite comme anglais).
 */
export function fromFrench(input: string): string | null {
  return FR_TO_EN.get(normalizeVerb(input)) ?? null
}

/** Liste complete pour le select : suggere d'abord, puis irreguliers, puis reguliers connus. */
export const VERBS: { v: string; fr: string }[] = (() => {
  const out: { v: string; fr: string }[] = []
  const seen = new Set<string>()
  const push = (v: string, fr: string): void => {
    if (!seen.has(v)) {
      seen.add(v)
      out.push({ v, fr })
    }
  }
  SUGGESTED.forEach((s) => push(s.v, s.fr))
  Object.entries(IRREG).forEach(([v, d]) => push(v, d.fr))
  Object.entries(REG_FR).forEach(([v, fr]) => push(v, fr))
  return out
})()

export const MODALS: { m: string; fr: string }[] = [
  { m: 'can', fr: 'pouvoir (capacité)' },
  { m: 'could', fr: 'pouvoir (passé, politesse)' },
  { m: 'may', fr: 'pouvoir (permission)' },
  { m: 'might', fr: 'pourrait (possibilité)' },
  { m: 'must', fr: 'devoir (obligation)' },
  { m: 'should', fr: 'devrait (conseil)' },
  { m: 'will', fr: 'futur (décision, prédiction)' },
  { m: 'would', fr: 'conditionnel (hypothèse, politesse)' },
  { m: 'shall', fr: 'proposition (soutenu, GB)' },
]

const VOWELS = 'aeiou'

function isVowel(c: string): boolean {
  return VOWELS.includes(c)
}

/** Finit par consonne-voyelle-consonne (sans finir par w, x ou y). */
function endsCVC(b: string): boolean {
  if (b.length < 3) return false
  const c1 = b[b.length - 3]
  const v = b[b.length - 2]
  const c2 = b[b.length - 1]
  return !isVowel(c1) && isVowel(v) && !isVowel(c2) && !'wxy'.includes(c2)
}

function syllables(b: string): number {
  return b.match(/[aeiouy]+/g)?.length ?? 1
}

/** Verbes multi-syllabes qui doublent quand même (accent final). */
const DOUBLE_MULTI = new Set(['begin', 'forget', 'prefer', 'admit', 'occur', 'refer', 'regret', 'permit'])

function shouldDouble(b: string): boolean {
  if (!endsCVC(b)) return false
  if (DOUBLE_MULTI.has(b)) return true
  return syllables(b) === 1 // monosyllabe : stop, plan, run, get, sit…
}

/** 3e personne du singulier : he / she / it. */
export function thirdPerson(base: string): string {
  const b = base.trim().toLowerCase()
  const s = IRREG[b]?.s
  if (s) return s
  if (/(s|ss|sh|ch|x|z|o)$/.test(b)) return `${b}es`
  if (/[^aeiouy]y$/.test(b)) return `${b.slice(0, -1)}ies`
  return `${b}s`
}

/** Passé simple (prétérit). */
export function pastForm(base: string): string {
  const b = base.trim().toLowerCase()
  const ir = IRREG[b]
  if (ir) return ir.past
  if (b.endsWith('e')) return `${b}d`
  if (/[^aeiouy]y$/.test(b)) return `${b.slice(0, -1)}ied`
  if (shouldDouble(b)) return `${b}${b[b.length - 1]}ed`
  return `${b}ed`
}

/** Forme en -ing. */
export function ingForm(base: string): string {
  const b = base.trim().toLowerCase()
  const ing = IRREG[b]?.ing
  if (ing) return ing
  if (b.endsWith('ie')) return `${b.slice(0, -2)}ying`
  if (b.endsWith('ee')) return `${b}ing`
  if (b.endsWith('e')) return `${b.slice(0, -1)}ing`
  if (shouldDouble(b)) return `${b}${b[b.length - 1]}ing`
  return `${b}ing`
}

const BE_PRESENT: Record<string, string> = {
  I: 'am', you: 'are', 'he / she / it': 'is', we: 'are', they: 'are',
}
const BE_PAST: Record<string, string> = {
  I: 'was', you: 'were', 'he / she / it': 'was', we: 'were', they: 'were',
}

export interface ConjugRow {
  p: string
  fr: string
  form: string
}

/** Tableau complet : 6 personnes, ou 9 modaux pour la mode modaux. */
export function conjugate(verb: string, tense: TenseId): ConjugRow[] {
  const base = verb.trim().toLowerCase()
  if (!base) return []
  if (tense === 'modals') {
    return MODALS.map(({ m, fr }) => ({ p: m, fr, form: `${m} ${base}` }))
  }
  if (tense === 'present-simple') {
    return PERSONS.map(({ p, fr }) => ({
      p,
      fr,
      form: base === 'be' ? BE_PRESENT[p] : p === 'he / she / it' ? thirdPerson(base) : base,
    }))
  }
  if (tense === 'past-simple') {
    return PERSONS.map(({ p, fr }) => ({
      p,
      fr,
      form: base === 'be' ? BE_PAST[p] : pastForm(base),
    }))
  }
  const ing = ingForm(base)
  if (tense === 'present-continuous') {
    return PERSONS.map(({ p, fr }) => ({ p, fr, form: `${BE_PRESENT[p]} ${ing}` }))
  }
  return PERSONS.map(({ p, fr }) => ({ p, fr, form: `${BE_PAST[p]} ${ing}` }))
}

/** Le verbe est-il dans la table des irréguliers ? */
export function isIrregular(verb: string): boolean {
  return Object.prototype.hasOwnProperty.call(IRREG, verb.trim().toLowerCase())
}

/** Les trois formes d'un irrégulier (pour l'etiquette), null si régulier. */
export function verbParts(verb: string): { base: string; past: string; pp: string } | null {
  const b = verb.trim().toLowerCase()
  const ir = IRREG[b]
  if (!ir) return null
  return { base: b, past: ir.past, pp: ir.pp }
}

/** Traduction française si le verbe est connu, sinon null. */
export function verbFr(verb: string): string | null {
  const b = verb.trim().toLowerCase()
  return IRREG[b]?.fr ?? REG_FR[b] ?? SUGGESTED.find((s) => s.v === b)?.fr ?? null
}
