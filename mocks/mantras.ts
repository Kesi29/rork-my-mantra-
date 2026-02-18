import { MantraTheme } from '@/utils/mantraImages';

export interface MantraCategory {
  id: string;
  title: string;
  icon: string;
  isPremium: boolean;
  theme: MantraTheme;
  mantras: string[];
}

export const MANTRA_CATEGORIES: MantraCategory[] = [
  {
    id: 'peace',
    title: 'Inner Peace',
    icon: '🕊️',
    isPremium: false,
    theme: 'roots',
    mantras: [
      'I am at peace with myself and the world around me',
      'I release what I cannot control',
      'Stillness lives within me',
    ],
  },
  {
    id: 'confidence',
    title: 'Confidence',
    icon: '🔥',
    isPremium: false,
    theme: 'power',
    mantras: [
      'I am worthy of everything I desire',
      'I trust myself completely',
      'My potential is limitless',
    ],
  },
  {
    id: 'gratitude',
    title: 'Gratitude',
    icon: '✨',
    isPremium: true,
    theme: 'expansion',
    mantras: [
      'I am grateful for this moment',
      'Abundance flows freely to me',
      'Every day is a gift I unwrap with joy',
      'I attract positivity into my life',
    ],
  },
  {
    id: 'healing',
    title: 'Healing',
    icon: '💚',
    isPremium: true,
    theme: 'discipline',
    mantras: [
      'My body knows how to heal itself',
      'I forgive myself and set myself free',
      'Every breath brings me closer to wholeness',
      'I am gentle with myself today',
    ],
  },
  {
    id: 'abundance',
    title: 'Abundance',
    icon: '🌟',
    isPremium: true,
    theme: 'wealth',
    mantras: [
      'I am a magnet for prosperity',
      'Wealth flows to me effortlessly',
      'I deserve financial freedom',
      'Opportunities are everywhere around me',
    ],
  },
  {
    id: 'love',
    title: 'Self-Love',
    icon: '💗',
    isPremium: true,
    theme: 'creation',
    mantras: [
      'I am enough exactly as I am',
      'I love myself unconditionally',
      'My heart is open to giving and receiving love',
      'I radiate warmth and kindness',
    ],
  },
  {
    id: 'focus',
    title: 'Focus & Clarity',
    icon: '🎯',
    isPremium: true,
    theme: 'mind',
    mantras: [
      'My mind is sharp and focused',
      'I channel my energy with intention',
      'Clarity guides my every decision',
      'I am present in this moment',
    ],
  },
];
