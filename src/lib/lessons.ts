export interface LessonPhrase {
  en: string
  fr: string
}

export interface Lesson {
  id: string
  title: string
  description: string
  phrases: LessonPhrase[]
}

/** Lecons embarquees dans l'application : aucune IA ni connexion necessaire pour les consulter. */
export const LESSONS: Lesson[] = [
  {
    id: 'daily',
    title: 'La vie quotidienne',
    description: 'Phrases utiles tous les jours.',
    phrases: [
      { en: 'Could you pass me the salt, please?', fr: "Peux-tu me passer le sel, s'il te plaît ?" },
      { en: "I'm going to the grocery store after work.", fr: "Je vais à l'épicerie après le travail." },
      { en: 'What time does the bus usually leave?', fr: 'À quelle heure le bus part-il généralement ?' },
      { en: "I'd like a coffee with milk, thanks.", fr: 'Je voudrais un café au lait, merci.' },
      { en: 'Can you tell me how to get to the station?', fr: "Peux-tu m'indiquer le chemin de la gare ?" },
      { en: 'I forgot my keys at home this morning.', fr: "J'ai oublié mes clés à la maison ce matin." },
      { en: 'Could you help me carry these bags?', fr: 'Pourrais-tu m’aider à porter ces sacs ?' },
      { en: 'We are having dinner at seven this evening.', fr: 'Nous dînons à sept heures ce soir.' },
    ],
  },
  {
    id: 'travel',
    title: 'Voyager',
    description: "À l'aéroport, à l'hôtel et en déplacement.",
    phrases: [
      { en: 'Where is the nearest subway station?', fr: 'Où est la station de métro la plus proche ?' },
      { en: "I'd like to book a one-way ticket to Paris.", fr: 'Je voudrais réserver un billet simple pour Paris.' },
      { en: 'Is breakfast included in the price?', fr: 'Le petit-déjeuner est-il inclus dans le prix ?' },
      { en: 'Could you call me a taxi, please?', fr: 'Pourriez-vous m’appeler un taxi, s’il vous plaît ?' },
      { en: 'What time is boarding for flight 204?', fr: "À quelle heure est l'embarquement du vol 204 ?" },
      { en: 'I have a reservation under the name Martin.', fr: 'J’ai une réservation au nom de Martin.' },
      { en: 'Could I see a map of the city, please?', fr: 'Pourrais-je voir un plan de la ville, s’il vous plaît ?' },
      { en: 'Is there a pharmacy nearby?', fr: 'Y a-t-il une pharmacie près d’ici ?' },
    ],
  },
  {
    id: 'smalltalk',
    title: 'Small talk',
    description: 'Bavarder en anglais.',
    phrases: [
      { en: 'How was your weekend?', fr: "Comment s'est passée ta fin de semaine ?" },
      { en: 'What do you like to do in your free time?', fr: "Qu'aimes-tu faire pendant ton temps libre ?" },
      { en: "The weather is lovely today, isn't it?", fr: "Il fait un temps magnifique aujourd'hui, n'est-ce pas ?" },
      { en: 'I really enjoy cooking with friends.', fr: 'J’aime beaucoup cuisiner avec des amis.' },
      { en: 'Have you seen any good films lately?', fr: 'As-tu vu de bons films récemment ?' },
      { en: 'Where did you grow up?', fr: 'Où as-tu grandi ?' },
      { en: "I'm thinking of learning to play the guitar.", fr: 'Je pense apprendre à jouer de la guitare.' },
      { en: 'It was nice talking to you!', fr: 'C’était sympa de discuter avec toi !' },
    ],
  },
  {
    id: 'work',
    title: 'Au travail',
    description: 'Réunions, e-mails et collègues.',
    phrases: [
      { en: 'Could we schedule a meeting for Thursday?', fr: 'Pourrions-nous planifier une réunion jeudi ?' },
      { en: "I'll send you the report by the end of the day.", fr: 'Je t’envoie le rapport d’ici la fin de la journée.' },
      { en: 'Sorry, I’m running a few minutes late.', fr: 'Désolé, j’ai quelques minutes de retard.' },
      { en: 'Could you speak a little more slowly, please?', fr: 'Pourriez-vous parler un peu plus lentement, s’il vous plaît ?' },
      { en: 'What do you think about this idea?', fr: 'Que pensez-vous de cette idée ?' },
      { en: 'Let me check with my team and get back to you.', fr: 'Laisse-moi vérifier avec mon équipe et je reviens vers toi.' },
      { en: 'I’m afraid I disagree, and here’s why.', fr: 'Je ne suis pas d’accord, et voici pourquoi.' },
      { en: 'Thanks for your help, I really appreciate it.', fr: 'Merci pour ton aide, j’apprécie vraiment.' },
    ],
  },
  {
    id: 'restaurant',
    title: 'Au restaurant',
    description: 'Commander, demander, payer.',
    phrases: [
      { en: 'A table for two, please.', fr: 'Une table pour deux, s’il vous plaît.' },
      { en: 'Could we see the menu, please?', fr: 'Pourrions-nous voir le menu, s’il vous plaît ?' },
      { en: 'What do you recommend?', fr: 'Que recommandez-vous ?' },
      { en: "I'll have the grilled fish with vegetables.", fr: 'Je vais prendre le poisson grillé avec des légumes.' },
      { en: "I'm allergic to nuts.", fr: 'Je suis allergique aux fruits à coque.' },
      { en: 'Could we have the bill, please?', fr: "Pourrions-nous avoir l'addition, s'il vous plaît ?" },
      { en: 'Is service included?', fr: 'Le service est-il inclus ?' },
      { en: 'It was delicious, thank you!', fr: 'C’était délicieux, merci !' },
    ],
  },
]

/** Phrases du quotidien pour la prononciation. */
export const DAILY_PHRASES: string[] = [
  'Could you pass me the salt, please?',
  "I'm going to the grocery store after work.",
  'What time does the bus usually leave?',
  "I'd like a coffee with milk, thanks.",
  'Can you tell me how to get to the station?',
  'I forgot my umbrella at home today.',
  'We are having dinner at seven this evening.',
  'She called me as soon as she arrived.',
  'Do you want to watch a movie tonight?',
  'I need to wake up early tomorrow morning.',
]
