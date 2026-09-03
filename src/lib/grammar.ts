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
          { q: 'He ___ two brothers.', a: 'has', hint: 'he / she / it → has' },
          { q: 'I ___ hungry.', a: 'am', hint: 'I → am' },
          { q: 'We ___ late for school.', a: 'are', hint: 'we → are' },
          { q: 'She ___ a new bike.', a: 'has' },
          { q: 'My parents ___ a big garden.', a: 'have', hint: 'they → have' },
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
          { q: 'She is ___ engineer.', a: 'an', hint: 'son voyelle → an' },
          { q: '___ sun is bright today.', a: 'The', hint: 'unique → the' },
          { q: 'He has ___ umbrella.', a: 'an' },
          { q: 'I need ___ hour to finish.', a: 'an', hint: 'h muet : son voyelle → an' },
          { q: 'This is ___ house of my dreams.', a: 'the' },
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
          { q: 'One man, two ___.', a: 'men', hint: 'irrégulier' },
          { q: 'One foot, two ___.', a: 'feet', hint: 'irrégulier' },
          { q: 'One city, many ___.', a: 'cities', hint: 'consonne + y → -ies' },
          { q: 'One watch, two ___.', a: 'watches', hint: 'après -ch → -es' },
          { q: 'One book, two ___.', a: 'books', hint: 'cas général : -s' },
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
          { q: 'She ___ (watch) TV every evening.', a: 'watches', hint: 'après -ch → -es' },
          { q: 'We ___ (live) in Cotonou.', a: 'live' },
          { q: 'He ___ (not / play) tennis.', a: "doesn't play", hint: 'doesn’t + verbe nu' },
          { q: '___ you like chocolate?', a: 'Do', hint: 'question avec you → Do' },
          { q: 'The sun ___ (rise) in the east.', a: 'rises', hint: 'vérité générale → -s' },
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
          { q: 'She ___ (cook) dinner right now.', a: 'is cooking' },
          { q: 'We ___ (wait) for the bus.', a: 'are waiting' },
          { q: 'Look! The baby ___ (sleep).', a: 'is sleeping', hint: 'Look! = action en cours' },
          { q: '___ you coming with us?', a: 'Are' },
          { q: 'I ___ (write) an email at the moment.', a: 'am writing', hint: 'I → am' },
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
          { q: 'She ___ at the party last night.', a: 'was' },
          { q: 'We ___ tired after the match.', a: 'were', hint: 'we → were' },
          { q: 'It ___ cold yesterday.', a: 'was' },
          { q: 'He ___ not at school on Monday.', a: 'was' },
          { q: 'You ___ very kind to me.', a: 'were', hint: 'you → were' },
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
          { q: 'We ___ (play) football two days ago.', a: 'played', hint: 'régulier : -ed' },
          { q: 'He ___ (buy) a new phone last week.', a: 'bought', hint: 'irrégulier' },
          { q: '___ you finish your homework?', a: 'Did', hint: 'question → Did + verbe nu' },
          { q: 'She ___ (not / come) to the party.', a: "didn't come", hint: 'didn’t + verbe nu' },
          { q: 'I ___ (see) him at the market yesterday.', a: 'saw', hint: 'irrégulier' },
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
          { q: 'I think you ___ (love) this film.', a: 'will love', hint: 'prédiction' },
          { q: 'I promise I ___ (call) you tonight.', a: 'will call', hint: 'promesse' },
          { q: 'Maybe she ___ (be) late.', a: 'will be' },
          { q: 'Don’t worry, they ___ (not / forget).', a: "won't forget", hint: 'won’t + verbe nu' },
          { q: 'I’m sure we ___ (win) the match!', a: 'will win' },
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
          { q: 'Look at those clouds! It ___ (rain).', a: 'is going to rain', hint: 'indice visible → be going to' },
          { q: 'We ___ (buy) a house next year.', a: 'are going to buy' },
          { q: 'I ___ (start) a new job on Monday.', a: 'am going to start' },
          { q: 'She ___ (cook) dinner for us tonight.', a: 'is going to cook' },
          { q: 'They ___ (watch) a film this evening.', a: 'are going to watch' },
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
          { q: 'She ___ (just / finish) her homework.', a: 'has just finished', hint: 'just → present perfect' },
          { q: 'I ___ (know) him for ten years.', a: 'have known', hint: 'for → present perfect' },
          { q: 'He ___ (never / visit) Paris.', a: 'has never visited' },
          { q: 'We ___ (be) friends since childhood.', a: 'have been', hint: 'since → present perfect' },
          { q: '___ she ever eaten sushi?', a: 'Has', hint: 'she → Has' },
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
          { q: 'Today is ___ (hot) than yesterday.', a: 'hotter', hint: 'court : on double la consonne' },
          { q: 'An elephant is ___ (big) than a dog.', a: 'bigger', hint: 'court : on double la consonne' },
          { q: 'She is the ___ (tall) girl in the class.', a: 'tallest' },
          { q: 'This exercise is ___ (easy) than the last one.', a: 'easier', hint: 'consonne + y → -ier' },
          { q: 'This film is ___ (bad) than the book.', a: 'worse', hint: 'irrégulier' },
          { q: 'He runs ___ (fast) than me.', a: 'faster' },
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
          { q: 'How ___ people came to the party?', a: 'many', hint: 'dénombrable (people)' },
          { q: 'There isn’t ___ milk left.', a: 'much', hint: 'indénombrable' },
          { q: 'Would you like ___ tea?', a: 'some', hint: 'offre polie → some' },
          { q: 'I don’t have ___ brothers.', a: 'any', hint: 'négation → any' },
          { q: 'She has ___ money in her pocket.', a: 'some', hint: 'phrase positive → some' },
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
          { q: '___ you help me, please?', a: 'Could', hint: 'demande polie' },
          { q: 'She ___ speak three languages.', a: 'can', hint: 'capacité' },
          { q: 'It’s late. You ___ go to bed.', a: 'should', hint: 'conseil' },
          { q: 'I ___ wear a helmet on a motorbike — it’s the law.', a: 'must', hint: 'obligation' },
          { q: 'When I was young, I ___ run very fast.', a: 'could', hint: 'capacité dans le passé' },
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
          { q: 'If she ___ (pass) her exam, her parents will be proud.', a: 'passes', hint: 'après if → présent' },
          { q: 'If you eat too much, you ___ (be) sick.', a: 'will be' },
          { q: 'We ___ (miss) the bus if we don’t hurry.', a: 'will miss' },
          { q: 'If he ___ (ask) me, I will help him.', a: 'asks' },
          { q: 'If it rains tomorrow, we ___ (not / go) to the beach.', a: "won't go", hint: 'won’t + verbe nu' },
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
          { q: 'She enjoys ___ (dance) at parties.', a: 'dancing', hint: 'enjoy → -ing' },
          { q: 'He needs ___ (sleep) eight hours.', a: 'to sleep', hint: 'need → to' },
          { q: 'They hope ___ (see) you soon.', a: 'to see' },
          { q: 'I hate ___ (get up) early.', a: 'getting up', hint: 'hate → -ing' },
          { q: 'We decided ___ (sell) the car.', a: 'to sell' },
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
          { q: 'He ___ (walk) home when it started to rain.', a: 'was walking' },
          { q: 'We ___ (have) dinner at 7 pm.', a: 'were having', hint: 'we → were' },
          { q: 'While they ___ (play) outside, it began to snow.', a: 'were playing' },
          { q: 'I ___ (dream) when the alarm rang.', a: 'was dreaming' },
          { q: 'What ___ you doing at 9 pm last night?', a: 'were', hint: 'you → were' },
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
          { q: 'She ___ (visit) London in 2015.', a: 'visited', hint: 'date précise → prétérit' },
          { q: 'I ___ (not / finish) my homework yet.', a: "haven't finished", hint: 'yet → present perfect' },
          { q: 'They ___ (move) to Paris last year.', a: 'moved', hint: 'last year → prétérit' },
          { q: 'We ___ (live) here since March.', a: 'have lived', hint: 'since → present perfect' },
          { q: 'He has just ___ (buy) a car.', a: 'bought', hint: 'participe passé de buy' },
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
          { q: 'This house ___ (build) in 1920.', a: 'was built', hint: 'participe de build' },
          { q: 'French ___ (teach) in this school.', a: 'is taught' },
          { q: 'The letters ___ (send) every morning.', a: 'are sent' },
          { q: 'The cake ___ (make) by my grandma yesterday.', a: 'was made', hint: 'yesterday → was' },
          { q: 'Football ___ (play) all over the world.', a: 'is played' },
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
          { q: 'The woman ___ sold me the bread is very nice.', a: 'who', hint: 'personne → who' },
          { q: 'The ring ___ she lost was gold.', a: 'which', hint: 'chose → which' },
          { q: 'The boy ___ bike was stolen is crying.', a: 'whose', hint: 'possession → whose' },
          { q: 'The children ___ live here are very polite.', a: 'who' },
          { q: 'The house ___ windows are blue is ours.', a: 'whose', hint: 'possession → whose' },
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
          { q: 'If I won the lottery, I ___ (buy) an island.', a: 'would buy' },
          { q: 'If she ___ (have) more time, she would read.', a: 'had', hint: 'après if → prétérit' },
          { q: 'If we ___ (be) birds, we would fly.', a: 'were' },
          { q: 'He would be healthier if he ___ (stop) smoking.', a: 'stopped' },
          { q: 'If they lived closer, we ___ (visit) them more often.', a: 'would visit' },
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
          { q: 'The train ___ (leave) when we arrived.', a: 'had left' },
          { q: 'She was sad because she ___ (lose) her keys.', a: 'had lost' },
          { q: 'After they ___ (sell) their house, they moved to Paris.', a: 'had sold' },
          { q: 'He told me he ___ (forget) my birthday.', a: 'had forgotten' },
          { q: 'When I got to school, the class ___ (already / start).', a: 'had already started' },
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
          { q: 'If you ___ (study), you would have passed.', a: 'had studied' },
          { q: 'If we had left earlier, we ___ (not / miss) the train.', a: "wouldn't have missed", hint: 'wouldn’t have + participe' },
          { q: 'If she had seen me, she ___ (say) hello.', a: 'would have said' },
          { q: 'I would have called you if I ___ (have) your number.', a: 'had had', hint: 'past perfect de have : had had' },
          { q: 'If it ___ (snow), we would have built a snowman.', a: 'had snowed' },
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
          { q: 'She ___ (have) long hair when she was a teenager.', a: 'used to have' },
          { q: 'They ___ (be) neighbours, but they moved away.', a: 'used to be' },
          { q: 'He ___ (smoke), but he stopped last year.', a: 'used to smoke' },
          { q: 'I didn’t ___ like coffee, but now I love it.', a: 'use', hint: 'après didn’t : use sans -d' },
          { q: 'There ___ be a farm here, before the city grew.', a: 'used to' },
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
          { q: 'It’s a beautiful day, ___?', a: "isn't it", hint: 'it’s → isn’t it' },
          { q: 'They arrived yesterday, ___?', a: "didn't they", hint: 'prétérit → didn’t' },
          { q: 'You don’t like fish, ___?', a: 'do you', hint: 'négatif → tag positif' },
          { q: 'She isn’t at home, ___?', a: 'is she', hint: 'négatif → tag positif' },
          { q: 'We have met before, ___?', a: "haven't we", hint: 'have → haven’t' },
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
          { q: 'She said she ___ (like) tea.', a: 'liked', hint: 'présent → prétérit' },
          { q: 'He said he ___ (read) a book.', a: 'was reading', hint: 'présent continu → past continuous' },
          { q: 'They said they ___ (come) to the party.', a: 'would come', hint: 'will → would' },
          { q: 'She said she ___ (see) him the day before.', a: 'had seen', hint: 'prétérit → past perfect' },
          { q: 'He said he ___ (can) swim.', a: 'could', hint: 'can → could' },
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

/** Etoiles obtenues selon le nombre de fautes : 3 = parfait, 2 = 1 faute, 1 = le reste. */
export function starsFor(mistakes: number): 1 | 2 | 3 {
  if (mistakes <= 0) return 3
  if (mistakes === 1) return 2
  return 1
}

export interface GrammarProgress {
  mastered: string[]
  stars: Record<string, number>
}

/** Melange une copie du tableau (Fisher-Yates, rng injectable pour les tests). */
export function shuffleQuestions<T>(arr: readonly T[], rng: () => number = Math.random): T[] {
  const out = [...arr]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}
