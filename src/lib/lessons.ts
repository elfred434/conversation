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

/** Lecons embarquees : aucun reseau requis. */
export const LESSONS: Lesson[] = [
  {
    id: 'daily',
    title: 'La vie quotidienne',
    description: 'Phrases utiles tous les jours.',
    phrases: [
      { en: "Could you pass me the salt, please?", fr: "Peux-tu me passer le sel, s'il te plaît ?" },
      { en: "I'm going to the grocery store after work.", fr: 'Je vais à l’épicerie après le travail.' },
      { en: 'What time does the bus usually leave?', fr: 'À quelle heure le bus part-il généralement ?' },
      { en: "I'd like a coffee with milk, thanks.", fr: 'Je voudrais un café au lait, merci.' },
      { en: 'Can you tell me how to get to the station?', fr: 'Peux-tu m’indiquer le chemin de la gare ?' },
    ],
  },
  {
    id: 'travel',
    title: 'Voyager',
    description: "À l'aéroport et en déplacement.",
    phrases: [
      { en: 'Where is the nearest subway station?', fr: 'Où est la station de métro la plus proche ?' },
      { en: "I'd like to book a one-way ticket to Paris.", fr: 'Je voudrais réserver un billet simple pour Paris.' },
      { en: 'Is breakfast included in the price?', fr: 'Le petit-déjeuner est-il inclus dans le prix ?' },
      { en: 'Could you call me a taxi, please?', fr: 'Pourriez-vous m’appeler un taxi, s’il vous plaît ?' },
    ],
  },
  {
    id: 'smalltalk',
    title: 'Small talk',
    description: 'Bavarder en anglais.',
    phrases: [
      { en: 'How was your weekend?', fr: "Comment s'est passée ta fin de semaine ?" },
      { en: 'What do you like to do in your free time?', fr: 'Que aimes-tu faire pendant ton temps libre ?' },
      { en: "The weather is lovely today, isn't it?", fr: "Il fait un temps magnifique aujourd'hui, n'est-ce pas ?" },
      { en: 'I really enjoy cooking with friends.', fr: 'J’aime beaucoup cuisiner avec des amis.' },
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
