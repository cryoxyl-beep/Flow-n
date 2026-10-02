export interface QuoteItem {
  id: string;
  text: string;
  author: string;
  category: 'focus' | 'stoicism' | 'creativity' | 'calm' | 'motivation';
}

export const INITIAL_QUOTES: QuoteItem[] = [
  {
    id: '1',
    text: "Hard work beats talent when talent doesn't work hard.",
    author: "Tim Notke",
    category: "focus",
  },
  {
    id: '2',
    text: "You have power over your mind - not outside events. Realize this, and you will find strength.",
    author: "Marcus Aurelius",
    category: "stoicism",
  },
  {
    id: '3',
    text: "Concentrate all your thoughts upon the work in hand. The sun's rays do not burn until brought to a focus.",
    author: "Alexander Graham Bell",
    category: "focus",
  },
  {
    id: '4',
    text: "Simplicity is the ultimate sophistication.",
    author: "Leonardo da Vinci",
    category: "creativity",
  },
  {
    id: '5',
    text: "In the midst of movement and chaos, keep stillness inside of you.",
    author: "Deepak Chopra",
    category: "calm",
  },
  {
    id: '6',
    text: "We suffer more often in imagination than in reality.",
    author: "Seneca",
    category: "stoicism",
  },
  {
    id: '7',
    text: "Deep work is the ability to focus without distraction on a cognitively demanding task.",
    author: "Cal Newport",
    category: "focus",
  },
  {
    id: '8',
    text: "Creativity is intelligence having fun.",
    author: "Albert Einstein",
    category: "creativity",
  },
  {
    id: '9',
    text: "Peace comes from within. Do not seek it without.",
    author: "Buddha",
    category: "calm",
  },
  {
    id: '10',
    text: "Small daily improvements over time lead to stunning results.",
    author: "Robin Sharma",
    category: "motivation",
  },
  {
    id: '11',
    text: "It is not that we have a short time to live, but that we waste a lot of it.",
    author: "Seneca",
    category: "stoicism",
  },
  {
    id: '12',
    text: "Flow is the state of total immersion in an activity.",
    author: "Mihaly Csikszentmihalyi",
    category: "focus",
  }
];
