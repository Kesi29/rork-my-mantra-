export type MantraTheme =
  | 'identity'
  | 'wealth'
  | 'mind'
  | 'creation'
  | 'roots'
  | 'discipline'
  | 'partnership'
  | 'power'
  | 'expansion'
  | 'status'
  | 'community'
  | 'subconscious';

export interface ThemeEntry {
  id: MantraTheme;
  label: string;
  keywords: string[];
  image: { uri: string };
}

const THEME_IMAGES: Record<MantraTheme, { uri: string }> = {
  identity: { uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/frua4o08h6r718zavxg0q' },
  wealth: { uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/fvq626mm5q6rdqbfh7kz2' },
  mind: { uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/76ik2kbdz5btfiqoatrmo' },
  roots: { uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/niktjnbowh99hxr17g8ir' },
  creation: { uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/a8lmb63ubp3y1lj6flg9k' },
  discipline: { uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/z5ldkejqivcjtkjuxy3f6' },
  partnership: { uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/4kte4kpwz6089bmmeshmz' },
  power: { uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/ydn1gl0y7h89xmxsw6yts' },
  expansion: { uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/8ixc3bdvje5tpynxtmeqr' },
  status: { uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/69dz38c4v91ha06gvgkv5' },
  community: { uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/uaqmfat284xuzayhln0xz' },
  subconscious: { uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/iwvag21z5m37l2hbo3qfk' },
};

const FALLBACK_IMAGE: { uri: string } = THEME_IMAGES.subconscious;

export const MANTRA_THEMES: ThemeEntry[] = [
  {
    id: 'identity',
    label: 'Identity & Embodiment',
    keywords: [
      'i am', 'myself', 'identity', 'body', 'self', 'enough', 'authentic',
      'true', 'being', 'exist', 'embody', 'presence', 'whole', 'real',
      'worthy', 'beautiful', 'perfect', 'complete', 'unique', 'proud',
      'confident', 'alive', 'born', 'deserve', 'accept', 'embrace',
      'matter', 'valid', 'important', 'special', 'original', 'fierce',
      'queen', 'king', 'goddess', 'god', 'divine being', 'capable',
      'brilliant', 'magnificent', 'extraordinary', 'phenomenal',
    ],
    image: THEME_IMAGES.identity,
  },
  {
    id: 'wealth',
    label: 'Value & Resources, Money',
    keywords: [
      'money', 'wealth', 'financial', 'prosperity', 'rich', 'abundance',
      'magnet', 'income', 'value', 'resource', 'afford', 'earn', 'invest',
      'fortune', 'profit', 'abundant', 'plenty', 'overflow', 'receiving',
      'attract money', 'millionaire', 'billion', 'gold', 'diamond',
      'treasure', 'luxury', 'success financially', 'debt free',
      'cash', 'bank', 'savings', 'assets', 'manifesting wealth',
    ],
    image: THEME_IMAGES.wealth,
  },
  {
    id: 'mind',
    label: 'Mind & Communication',
    keywords: [
      'mind', 'think', 'thought', 'clarity', 'focus', 'sharp', 'speak',
      'voice', 'communicate', 'express', 'listen', 'learn', 'understand',
      'idea', 'intellect', 'wisdom', 'decision', 'intention', 'aware',
      'knowledge', 'smart', 'intelligent', 'clever', 'insight', 'curious',
      'study', 'read', 'write', 'words', 'truth', 'honest', 'clear',
      'logical', 'rational', 'articulate', 'eloquent', 'perception',
      'attention', 'concentration', 'cognitive', 'brain', 'mental',
    ],
    image: THEME_IMAGES.mind,
  },
  {
    id: 'roots',
    label: 'Roots & Emotional Foundation',
    keywords: [
      'home', 'family', 'safe', 'secure', 'root', 'ground', 'foundation',
      'stable', 'comfort', 'belong', 'nurture', 'protect', 'shelter',
      'peace', 'calm', 'still', 'serene', 'release', 'control', 'rest',
      'quiet', 'steady', 'anchor', 'mother', 'father', 'child', 'parent',
      'house', 'garden', 'earth', 'soil', 'land', 'tradition', 'heritage',
      'origin', 'ancestry', 'memory', 'nest', 'haven', 'sanctuary',
      'tranquil', 'peaceful', 'relaxed', 'settled', 'centered', 'balanced',
      'letting go', 'let go', 'breathe', 'exhale', 'inhale', 'at ease',
    ],
    image: THEME_IMAGES.roots,
  },
  {
    id: 'creation',
    label: 'Creation & Self-Expression',
    keywords: [
      'create', 'art', 'beauty', 'love', 'romance', 'passion', 'heart',
      'pleasure', 'joy', 'play', 'fun', 'inspire', 'warmth', 'kindness',
      'compassion', 'unconditional', 'radiate', 'open', 'giving',
      'date', 'attract', 'happy', 'happiness', 'smile', 'laugh',
      'cherish', 'adore', 'tender', 'sweet', 'gentle', 'loving',
      'creative', 'paint', 'music', 'sing', 'dance', 'write',
      'imagine', 'color', 'bloom', 'blossom', 'flower', 'light',
      'shine', 'glow', 'spark', 'fire', 'warm', 'bright', 'joyful',
      'delight', 'bliss', 'ecstasy', 'euphoria', 'wonderful', 'amazing',
      'grateful', 'thankful', 'appreciation', 'celebrate', 'cheerful',
    ],
    image: THEME_IMAGES.creation,
  },
  {
    id: 'discipline',
    label: 'Discipline & Daily Life',
    keywords: [
      'discipline', 'routine', 'habit', 'duty', 'health', 'heal', 'fitness',
      'practice', 'consistent', 'effort', 'work', 'service', 'improve',
      'better', 'breath', 'wholeness', 'forgive', 'clean', 'order',
      'organize', 'structure', 'schedule', 'morning', 'daily', 'everyday',
      'train', 'exercise', 'run', 'gym', 'diet', 'nutrition', 'sleep',
      'wake', 'productive', 'efficiency', 'task', 'complete', 'finish',
      'commit', 'persist', 'endure', 'patient', 'patience', 'step',
      'progress', 'slowly', 'steady', 'maintain', 'sustain', 'ritual',
      'wellness', 'recovery', 'sober', 'pure', 'detox',
    ],
    image: THEME_IMAGES.discipline,
  },
  {
    id: 'partnership',
    label: 'Partnership & Projection',
    keywords: [
      'partner', 'relationship', 'together', 'balance', 'harmony', 'equal',
      'trust', 'share', 'bond', 'connect', 'mirror', 'union',
      'cooperation', 'agreement', 'mutual', 'complement', 'respect',
      'loyalty', 'faithful', 'devotion', 'wedding', 'marriage', 'spouse',
      'husband', 'wife', 'couple', 'soulmate', 'twin flame', 'companion',
      'ally', 'teamwork', 'collaborate', 'compromise', 'negotiate',
      'understand each other', 'empathy', 'support each other',
    ],
    image: THEME_IMAGES.partnership,
  },
  {
    id: 'power',
    label: 'Power & Transformation',
    keywords: [
      'power', 'transform', 'change', 'rebirth', 'phoenix', 'deep',
      'shadow', 'overcome', 'strong', 'resilient', 'rise', 'renew',
      'intensity', 'limitless', 'potential', 'fearless', 'courage',
      'supernatural', 'magic', 'unstoppable', 'warrior', 'fight',
      'battle', 'conquer', 'destroy', 'break', 'shatter', 'unleash',
      'fierce', 'bold', 'brave', 'daring', 'mighty', 'invincible',
      'strength', 'tough', 'unbreakable', 'survivor', 'survive',
      'never give up', 'relentless', 'determined', 'willpower',
      'no limit', 'boundary', 'fear', 'afraid', 'anxiety', 'worry',
      'doubt', 'obstacle', 'challenge', 'difficult', 'hard', 'struggle',
    ],
    image: THEME_IMAGES.power,
  },
  {
    id: 'expansion',
    label: 'Expansion & Meaning',
    keywords: [
      'expand', 'grow', 'travel', 'adventure', 'explore', 'meaning',
      'purpose', 'faith', 'believe', 'hope', 'opportunity', 'horizon',
      'journey', 'discover', 'dream', 'vision', 'gratitude',
      'gift', 'positivity', 'freely', 'freedom', 'open mind',
      'new', 'begin', 'start', 'fresh', 'possibility', 'potential',
      'evolve', 'develop', 'flourish', 'thrive', 'prosper', 'luck',
      'fortune', 'blessing', 'miracle', 'wonder', 'awe', 'magic',
      'manifest', 'attract', 'law of attraction', 'universe provides',
      'everything is', 'things are', 'life is', 'today is', 'tomorrow',
      'good', 'great', 'best', 'better', 'positive', 'optimistic',
    ],
    image: THEME_IMAGES.expansion,
  },
  {
    id: 'status',
    label: 'Status & Public Legacy',
    keywords: [
      'success', 'achieve', 'career', 'goal', 'ambition', 'leader',
      'legacy', 'reputation', 'accomplish', 'win', 'top',
      'master', 'authority', 'recognition', 'champion', 'victory',
      'excel', 'elite', 'first', 'best', 'greatest', 'legendary',
      'iconic', 'famous', 'known', 'impact', 'influence', 'inspire',
      'boss', 'ceo', 'entrepreneur', 'business', 'empire', 'build',
      'create legacy', 'leave mark', 'history', 'world class',
      'professional', 'expert', 'skilled', 'talented', 'gifted',
    ],
    image: THEME_IMAGES.status,
  },
  {
    id: 'community',
    label: 'Community & Future Vision',
    keywords: [
      'community', 'friend', 'people', 'society', 'future',
      'network', 'collective', 'team', 'tribe',
      'innovation', 'world', 'humanity', 'everyone',
      'volunteer', 'serve', 'help others', 'give back', 'charity',
      'planet', 'nature', 'environment', 'global', 'universal',
      'generation', 'children', 'youth', 'elder', 'wisdom',
      'movement', 'revolution', 'change the world', 'social',
      'kindred', 'sisterhood', 'brotherhood', 'fellowship',
    ],
    image: THEME_IMAGES.community,
  },
  {
    id: 'subconscious',
    label: 'Subconscious & Transcendence',
    keywords: [
      'soul', 'spirit', 'universe', 'divine', 'infinite', 'transcend',
      'meditat', 'intuition', 'inner', 'cosmic', 'ethereal',
      'surrender', 'flow', 'present', 'moment', 'silence',
      'sacred', 'energy', 'vibration', 'frequency', 'align',
      'awaken', 'enlighten', 'conscious', 'awareness', 'zen',
      'karma', 'dharma', 'chakra', 'aura', 'higher self',
      'spiritual', 'mystical', 'pray', 'prayer', 'blessing',
      'angel', 'guardian', 'protected', 'guided', 'path',
      'destiny', 'fate', 'stars', 'moon', 'sun', 'ocean',
      'water', 'sky', 'cloud', 'rain', 'wind', 'air',
      'eternal', 'timeless', 'beyond', 'within', 'deep inside',
    ],
    image: THEME_IMAGES.subconscious,
  },
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

export function classifyMantraTheme(mantra: string): MantraTheme {
  if (!mantra || mantra.trim().length === 0) return 'subconscious';

  const lower = mantra.toLowerCase().trim();
  let bestTheme: MantraTheme = 'identity';
  let bestScore = 0;

  for (const theme of MANTRA_THEMES) {
    let score = 0;
    for (const kw of theme.keywords) {
      if (lower.includes(kw)) {
        score += kw.length + 1;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestTheme = theme.id;
    }
  }

  if (bestScore === 0) {
    if (lower.startsWith('i am') || lower.startsWith('i\'m')) return 'identity';
    if (lower.startsWith('i ')) return 'identity';

    const idx = hashString(lower) % MANTRA_THEMES.length;
    console.log(`[MantraImage] No keyword match for "${mantra}", using hash fallback → ${MANTRA_THEMES[idx].id}`);
    return MANTRA_THEMES[idx].id;
  }

  return bestTheme;
}

export function getThemeImage(theme: MantraTheme): { uri: string } {
  return THEME_IMAGES[theme] ?? FALLBACK_IMAGE;
}

export function getMantraImage(mantra: string): { uri: string } {
  const theme = classifyMantraTheme(mantra);
  console.log(`[MantraImage] "${mantra}" → theme: ${theme}`);
  return getThemeImage(theme);
}

export function getThemeLabel(theme: MantraTheme): string {
  const entry = MANTRA_THEMES.find((t) => t.id === theme);
  return entry?.label ?? 'Unknown';
}
