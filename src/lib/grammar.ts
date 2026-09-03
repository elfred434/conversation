/** Le jeu de grammaire : curriculum complet par mondes, une regle = une lecon
 *  + un mini-quiz. Maitriser une regle debloque la suivante. */

export interface GrammarQuestion {
  /** Phrase avec ___ comme trou. */
  q: string
  a: string
  hint?: string
}

export interface GrammarRule {
  id: string
  title: string
  /** Explication courte en francais (1-3 lignes). */
  rule: string
  /** Exemples affiches (anglais + traduction). */
  examples?: { en: string; fr: string }[]
  questions: GrammarQuestion[]
}

export interface GrammarTier {
  id: string
  title: string
  rules: GrammarRule[]
}

export const GRAMMAR_TIERS: GrammarTier[] = [
  {
    id: 'bases',
    title: 'Monde 1 · Les bases',
    rules: [
      {
        id: 'be-have',
        title: 'Être et avoir (be / have)',
        rule: 'be = être : I am, you are, he/she/it is, we are, they are. have = avoir : I/you/we/they have, he/she/it has.',
        examples: [
          { en: 'She is my sister.', fr: 'C’est ma sœur.' },
          { en: 'I have a dog.', fr: 'J’ai un chien.' },
        ],
        questions: [
          { q: 'She ___ my sister.', a: 'is', hint: 'he / she / it → is' },
          { q: 'They ___ happy.', a: 'are', hint: 'they → are' },
          { q: 'I ___ a dog.', a: 'have', hint: 'avoir avec I → have' },
        ],
      },
      {
        id: 'articles',
        title: 'Articles : a / an / the',
        rule: 'a + son de consonne (a phone), an + son de voyelle (an apple), the = quelque chose de précis (the best).',
        examples: [
          { en: 'An apple a day…', fr: 'Une pomme par jour…' },
          { en: 'She is the best singer.', fr: 'C’est la meilleure chanteuse.' },
        ],
        questions: [
          { q: '___ apple a day keeps the doctor away.', a: 'An', hint: 'son voyelle → an' },
          { q: 'She is ___ best student.', a: 'the', hint: 'superlatif → the' },
          { q: 'I bought ___ new phone.', a: 'a', hint: 'son consonne → a' },
        ],
      },
      {
        id: 'plurals',
        title: 'Les pluriels',
        rule: 'Général : -s. Après s, x, ch, sh : -es. Consonne + y → -ies. Irréguliers à connaître : man→men, child→children, foot→feet.',
        questions: [
          { q: 'One box, two ___.', a: 'boxes', hint: 'après -x → -es' },
          { q: 'One baby, two ___.', a: 'babies', hint: 'consonne + y → -ies' },
          { q: 'One child, two ___.', a: 'children', hint: 'irrégulier' },
        ],
      },
      {
        id: 'present-simple',
        title: 'Présent simple',
        rule: 'Habitudes et vérités générales. -s à la 3ᵉ personne (he works). Négation : don’t / doesn’t + verbe nu. Question : Do / Does… ?',
        examples: [
          { en: 'He works in Paris.', fr: 'Il travaille à Paris.' },
          { en: 'I don’t like coffee.', fr: 'Je n’aime pas le café.' },
        ],
        questions: [
          { q: 'He ___ (work) in Paris.', a: 'works', hint: '3ᵉ personne → -s' },
          { q: 'I ___ (not / like) coffee.', a: "don't like", hint: 'contraction : don’t + like' },
          { q: '___ she speak English?', a: 'Does', hint: 'question 3ᵉ personne → Does' },
        ],
      },
      {
        id: 'present-continuous',
        title: 'Présent continu (be + -ing)',
        rule: 'Action en cours maintenant : am / is / are + verbe-ing. Indice : now, look, at the moment.',
        examples: [
          { en: 'Look! It is raining.', fr: 'Regarde ! Il pleut (en ce moment).' },
          { en: 'I am reading a book.', fr: 'Je lis un livre (là, maintenant).' },
        ],
        questions: [
          { q: 'Look! It ___ (rain).', a: 'is raining' },
          { q: 'They ___ (play) football now.', a: 'are playing' },
          { q: 'I ___ (read) at the moment.', a: 'am reading' },
        ],
      },
    ],
  },
  {
    id: 'passe-futur',
    title: 'Monde 2 · Passé & futur',
    rules: [
      {
        id: 'was-were',
        title: 'Was / Were (être au passé)',
        rule: 'I / he / she / it → was. You / we / they → were. Négation : wasn’t / weren’t.',
        questions: [
          { q: 'I ___ at home yesterday.', a: 'was' },
          { q: 'They ___ late.', a: 'were', hint: 'they → were' },
          { q: '___ you at school?', a: 'Were', hint: 'question avec you → Were' },
        ],
      },
      {
        id: 'past-simple',
        title: 'Prétérit (le passé simple)',
        rule: 'Action finie et datée. Réguliers : -ED (watched). Irréguliers : go→went, see→saw. Négation et question : didn’t / Did… ? + verbe nu.',
        examples: [
          { en: 'She went to the market.', fr: 'Elle est allée au marché.' },
          { en: 'I didn’t see him.', fr: 'Je ne l’ai pas vu.' },
        ],
        questions: [
          { q: 'Yesterday, she ___ (go) to the market.', a: 'went', hint: 'irrégulier' },
          { q: 'We ___ (watch) a film last night.', a: 'watched' },
          { q: 'I ___ (not / see) him.', a: "didn't see", hint: 'didn’t + verbe nu' },
        ],
      },
      {
        id: 'future-will',
        title: 'Futur avec will',
        rule: 'Décision spontanée, promesse ou prédiction : will + verbe nu. Négation : won’t.',
        questions: [
          { q: 'I think it ___ (rain) tomorrow.', a: 'will rain', hint: 'prédiction' },
          { q: 'Don’t worry, I ___ (help) you.', a: 'will help', hint: 'promesse' },
          { q: 'She ___ (not / come).', a: "won't come", hint: 'contraction : won’t' },
        ],
      },
      {
        id: 'going-to',
        title: 'Futur avec be going to',
        rule: 'Intention ou projet décidé AVANT de parler : am / is / are going to + verbe nu.',
        questions: [
          { q: 'I ___ (visit) my grandma this weekend.', a: 'am going to visit', hint: 'projet → be going to' },
          { q: 'They ___ (move) to London.', a: 'are going to move' },
          { q: 'He ___ (study) tonight.', a: 'is going to study' },
        ],
      },
      {
        id: 'present-perfect',
        title: 'Present perfect (have + participe passé)',
        rule: 'Lien avec le présent : expérience, bilan, depuis. have / has + participe passé. Indices : since, for, just, ever, never.',
        examples: [
          { en: 'I have lived here since 2019.', fr: 'J’habite ici depuis 2019.' },
          { en: 'Have you ever been to London?', fr: 'Tu es déjà allé à Londres ?' },
        ],
        questions: [
          { q: 'I ___ (live) here since 2019.', a: 'have lived', hint: 'since → present perfect' },
          { q: 'She has ___ (eat).', a: 'eaten', hint: 'participe passé de eat' },
          { q: '___ you ever been to London?', a: 'Have' },
        ],
      },
    ],
  },
  {
    id: 'affirmer',
    title: 'Monde 3 · S’affirmer',
    rules: [
      {
        id: 'comparatives',
        title: 'Comparatif & superlatif',
        rule: 'Court : -er / -est (hot → hotter → the hottest). Long : more / the most (more interesting). Irréguliers : good → better → the best.',
        questions: [
          { q: 'This book is ___ (interesting) than the film.', a: 'more interesting' },
          { q: 'She is the ___ (good) student.', a: 'best', hint: 'irrégulier' },
          { q: 'Today is ___ (hot) than yesterday.', a: 'hotter', hint: 'court : consonne doubling' },
        ],
      },
      {
        id: 'quantifiers',
        title: 'some / any / much / many',
        rule: 'some = affirmatif ; any = négatif et questions ; much + indénombrable (sugar) ; many + dénombrable (friends).',
        questions: [
          { q: 'I have ___ friends in London.', a: 'some', hint: 'phrase positive' },
          { q: 'Do you have ___ money?', a: 'any', hint: 'question → any' },
          { q: 'How ___ sugar do you want?', a: 'much', hint: 'indénombrable' },
        ],
      },
      {
        id: 'modals',
        title: 'Modaux : can / could / must / should',
        rule: 'can = capacité ; could = passé ou politesse ; must = obligation forte ; should = conseil. Toujours + verbe nu (sans to).',
        questions: [
          { q: 'You look ill. You ___ see a doctor.', a: 'should', hint: 'conseil' },
          { q: 'I ___ swim when I was five.', a: 'could', hint: 'capacité dans le passé' },
          { q: 'You ___ stop at a red light.', a: 'must', hint: 'obligation' },
        ],
      },
      {
        id: 'conditional-1',
        title: 'Conditionnel type 1 : If + présent → will',
        rule: 'Situation probable : If + présent simple, will + verbe nu. If it rains, we will stay home.',
        questions: [
          { q: 'If it rains, we ___ (stay) home.', a: 'will stay' },
          { q: 'If you ___ (study), you will pass.', a: 'study', hint: 'après if → présent' },
          { q: 'If she calls, I ___ (answer).', a: 'will answer' },
        ],
      },
      {
        id: 'gerund-infinitive',
        title: 'Gérondif ou infinitif ?',
        rule: 'like / love / hate / enjoy + -ing. want / need / decide / hope + to + verbe.',
        questions: [
          { q: 'I like ___ (play) football.', a: 'playing', hint: 'like → -ing' },
          { q: 'I want ___ (travel) the world.', a: 'to travel', hint: 'want → to' },
          { q: 'She decided ___ (stay) home.', a: 'to stay' },
        ],
      },
    ],
  },
  {
    id: 'nuancer',
    title: 'Monde 4 · Nuancer',
    rules: [
      {
        id: 'past-continuous',
        title: 'Past continuous (was/were + -ing)',
        rule: 'Action en cours dans le passé, souvent interrompue par une action brève au prétérit. While I was sleeping, you called.',
        questions: [
          { q: 'I ___ (sleep) when you called.', a: 'was sleeping' },
          { q: 'They ___ (cook) at 8 pm.', a: 'were cooking', hint: 'they → were' },
          { q: 'While she ___ (read), the phone rang.', a: 'was reading' },
        ],
      },
      {
        id: 'perfect-vs-past',
        title: 'Present perfect ou prétérit ?',
        rule: 'Date précise passée (yesterday, last week, in 2010) → prétérit. since / for / just / ever (sans date) → present perfect.',
        questions: [
          { q: 'I ___ (see) that film last week.', a: 'saw', hint: 'last week → prétérit' },
          { q: 'We ___ (know) each other for ten years.', a: 'have known', hint: 'for → present perfect' },
          { q: 'He has just ___ (leave).', a: 'left', hint: 'participe passé de leave' },
        ],
      },
      {
        id: 'passive',
        title: 'La voix passive (be + participe passé)',
        rule: 'On met l’objet en sujet : be conjugué + participe passé. English is spoken here.',
        questions: [
          { q: 'English ___ (speak) here.', a: 'is spoken' },
          { q: 'The window ___ (break) yesterday.', a: 'was broken' },
          { q: 'This song ___ (sing) by everyone.', a: 'is sung', hint: 'participe irrégulier de sing' },
        ],
      },
      {
        id: 'relatives',
        title: ' Relatives : who / which / that / whose',
        rule: 'who = personne, which = chose, that = les deux. whose = possession (dont).',
        questions: [
          { q: 'The man ___ lives next door is kind.', a: 'who', hint: 'personne → who' },
          { q: 'The phone ___ I bought is fast.', a: 'that', hint: 'that (ou which)' },
          { q: 'The girl ___ brother is famous studies here.', a: 'whose', hint: 'possession → whose' },
        ],
      },
      {
        id: 'conditional-2',
        title: 'Conditionnel type 2 : If + prétérit → would',
        rule: 'Hypothèse irréelle du présent : If + prétérit, would + verbe nu. If I were rich, I would travel.',
        questions: [
          { q: 'If I ___ (be) rich, I would travel.', a: 'were', hint: 'au type 2, on dit I were' },
          { q: 'If I had time, I ___ (learn) the piano.', a: 'would learn' },
          { q: 'She would be happy if you ___ (call) her.', a: 'called', hint: 'après if → prétérit' },
        ],
      },
    ],
  },
  {
    id: 'maitriser',
    title: 'Monde 5 · Maîtriser',
    rules: [
      {
        id: 'past-perfect',
        title: 'Past perfect (had + participe passé)',
        rule: 'L’antériorité : la première des deux actions passées. When I arrived, they had already eaten.',
        questions: [
          { q: 'When I arrived, they ___ (already / eat).', a: 'had already eaten' },
          { q: 'She ___ (never / see) the sea before that day.', a: 'had never seen' },
          { q: 'After he ___ (finish), we left.', a: 'had finished' },
        ],
      },
      {
        id: 'conditional-3',
        title: 'Conditionnel type 3 : le regret du passé',
        rule: 'If + past perfect, would have + participe passé. If I had known, I would have come.',
        questions: [
          { q: 'If I ___ (know), I would have come.', a: 'had known' },
          { q: 'If it had rained, we ___ (stay) home.', a: 'would have stayed' },
          { q: 'She wouldn’t have been late if she ___ (take) a taxi.', a: 'had taken' },
        ],
      },
      {
        id: 'used-to',
        title: 'Used to (les habitudes du passé)',
        rule: 'used to + verbe nu = avant, mais plus maintenant. I used to play tennis (je jouais avant).',
        questions: [
          { q: 'I ___ (play) tennis when I was young.', a: 'used to play' },
          { q: 'We ___ (live) in Lyon, but not anymore.', a: 'used to live' },
          { q: 'There ___ be a cinema here.', a: 'used to' },
        ],
      },
      {
        id: 'question-tags',
        title: 'Question tags (n’est-ce pas ?)',
        rule: 'Phrase positive → tag négatif, et inverse. On reprend l’auxiliaire : You’re ready, aren’t you?',
        questions: [
          { q: 'You’re ready, ___?', a: "aren't you", hint: 'are → aren’t' },
          { q: 'She likes jazz, ___?', a: "doesn't she", hint: 'présent 3ᵉ pers → doesn’t' },
          { q: 'You can swim, ___?', a: "can't you" },
        ],
      },
      {
        id: 'reported-speech',
        title: 'Discours indirect',
        rule: 'On recule les temps : présent → prétérit, will → would, have → had. “I am tired” → He said he was tired.',
        questions: [
          { q: 'He said he ___ (be) tired.', a: 'was' },
          { q: 'She said she ___ (will) call me.', a: 'would' },
          { q: 'They told me they ___ (have) a car.', a: 'had' },
        ],
      },
    ],
  },
]

/** Toutes les regles, dans l'ordre de deblocage. */
export function flattenRules(): GrammarRule[] {
  return GRAMMAR_TIERS.flatMap((t) => t.rules)
}

/** La regle d'index i est debloquee si c'est la premiere ou si la precedente est maitrisee. */
export function isRuleUnlocked(i: number, mastered: string[]): boolean {
  const rules = flattenRules()
  if (i <= 0) return rules.length > 0
  return mastered.includes(rules[i - 1].id)
}


export interface GrammarProgress {
  mastered: string[]
  stars: Record<string, number>
}

// ==================== Validation de maitrise ====================

/** Taille d'un quiz genere par l'IA. */
export const QUIZ_SIZE = 8

/** Part de bonnes reponses AU PREMIER COUP exigee pour valider une regle. */
export const PASS_RATIO = 0.7

/** Nombre de bonnes reponses (premier coup) necessaires pour valider. */
export function requiredForPass(total: number): number {
  return Math.ceil(total * PASS_RATIO)
}

/** Etoiles selon la part de reponses justes AU PREMIER COUP : 100 % = 3, >= 85 % = 2, sinon 1. */
export function starsForFirstTry(first: number, total: number): 1 | 2 | 3 {
  const r = first / Math.max(1, total)
  if (r >= 1) return 3
  if (r >= 0.85) return 2
  return 1
}
