export interface Ingredient {
  label: string;
  title: string;
  copy: string;
}

export interface Stat {
  value: string;
  label: string;
}

export interface Product {
  id: string;
  name: string;
  /** ["PEACH", "NECTAR"] — used for the giant hero typography */
  words: [string, string];
  color: string;
  colorDark: string;
  /** background environment stops */
  gradient: { edge: string; mid: string; glow: string };
  tagline: string;
  description: string;
  detail: string;
  profile: string;
  profileNote: string;
  ingredients: [Ingredient, Ingredient, Ingredient, Ingredient];
  stats: [Stat, Stat, Stat, Stat];
}

function darken(hex: string, amount: number): string {
  const c = hex.replace('#', '');
  const p = (i: number) =>
    Math.max(0, Math.round(parseInt(c.slice(i, i + 2), 16) * (1 - amount)))
      .toString(16)
      .padStart(2, '0');
  return `#${p(0)}${p(2)}${p(4)}`;
}

const baseIngredients = (
  fruit: string,
  fruitCopy: string
): [Ingredient, Ingredient, Ingredient, Ingredient] => [
  { label: 'INGREDIENT 01', title: fruit, copy: fruitCopy },
  {
    label: 'INGREDIENT 02',
    title: 'NATURAL\nCAFFEINE',
    copy: 'Natural caffeine from coffee beans for a smooth, sustained lift without the crash.',
  },
  {
    label: 'INGREDIENT 03',
    title: 'SPARKLING\nWATER',
    copy: 'Light carbonation built on filtered sparkling water for a crisp, refreshing finish.',
  },
  {
    label: 'INGREDIENT 04',
    title: 'ZERO\nSUGAR',
    copy: 'Full flavor, zero sugar. Nothing heavy, nothing artificial tasting.',
  },
];

const stats = (profile: string): [Stat, Stat, Stat, Stat] => [
  { value: '500 ml', label: 'CAN SIZE' },
  { value: '0 g', label: 'SUGAR' },
  { value: 'NATURAL', label: 'CAFFEINE' },
  { value: profile, label: 'BASE' },
];

export const products: Product[] = [
  {
    id: 'cherry',
    name: 'Cherry Rush',
    words: ['CHERRY', 'RUSH'],
    color: '#D8102F',
    colorDark: darken('#D8102F', 0.6),
    gradient: { edge: '#1a0206', mid: '#8c0a20', glow: '#ff3355' },
    tagline: 'Dark cherry. Fast pulse. No slowing down.',
    description:
      'Deep dark cherry pressed into a sharp sparkling bite. Bold up front, clean on the finish.',
    detail:
      'A concentrated dark cherry base balanced with natural caffeine and light carbonation. Built for the moment you need to move faster than the room.',
    profile: 'Dark Cherry',
    profileNote: 'Rich, tart, clean finish.',
    ingredients: baseIngredients(
      'DARK\nCHERRY',
      'Real dark cherry flavor with a deep, tart, fruit-forward character.'
    ),
    stats: stats('SPARKLING'),
  },
  {
    id: 'blue',
    name: 'Blue Ice',
    words: ['BLUE', 'ICE'],
    color: '#1E6BFF',
    colorDark: darken('#1E6BFF', 0.6),
    gradient: { edge: '#00040f', mid: '#0b3a99', glow: '#4fc3ff' },
    tagline: 'Glacial cool. Electric clarity. Total focus.',
    description:
      'Icy blue raspberry chilled into a razor-crisp fizz. Cold, clear and focused.',
    detail:
      'Blue raspberry over filtered sparkling water with natural caffeine. Engineered to feel like cold air in a hot room.',
    profile: 'Blue Raspberry',
    profileNote: 'Cool, crisp, glassy finish.',
    ingredients: baseIngredients(
      'BLUE\nRASPBERRY',
      'Bright blue raspberry with a cold, glassy edge and a clean fruity finish.'
    ),
    stats: stats('SPARKLING'),
  },
  {
    id: 'midnight',
    name: 'Midnight',
    words: ['MID', 'NIGHT'],
    color: '#2A2A30',
    colorDark: '#050506',
    gradient: { edge: '#000000', mid: '#15161c', glow: '#8fa3c8' },
    tagline: 'Dark cola. Deep focus. After-hours energy.',
    description:
      'A blackout cola built for the hours nobody sees. Smooth, dark, relentless.',
    detail:
      'Deep cola botanicals with natural caffeine and zero sugar. Graphite finish, silver highlights, no noise.',
    profile: 'Blackout Cola',
    profileNote: 'Deep, smooth, spiced finish.',
    ingredients: baseIngredients(
      'BLACKOUT\nCOLA',
      'Dark cola botanicals with a smooth, spiced depth and no sugary weight.'
    ),
    stats: stats('SPARKLING'),
  },
  {
    id: 'peach',
    name: 'Peach Nectar',
    words: ['PEACH', 'NECTAR'],
    color: '#FF5A18',
    colorDark: darken('#FF5A18', 0.6),
    gradient: { edge: '#180400', mid: '#c2380a', glow: '#ffb14a' },
    tagline: 'Juicy peach. Clean energy. Zero compromise.',
    description:
      'Bright white peach with a crisp sparkling finish. Soft on the nose, sharp on the palate.',
    detail:
      'White peach flavor layered over sparkling water with natural caffeine from coffee beans. Fruity, light and never syrupy.',
    profile: 'White Peach',
    profileNote: 'Bright, juicy, clean finish.',
    ingredients: baseIngredients(
      'WHITE\nPEACH',
      'Real white peach flavor with a bright fruity finish and no syrupy edge.'
    ),
    stats: stats('SPARKLING'),
  },
  {
    id: 'berry',
    name: 'Wild Berry',
    words: ['WILD', 'BERRY'],
    color: '#8A24E0',
    colorDark: darken('#8A24E0', 0.6),
    gradient: { edge: '#0d0018', mid: '#5c118f', glow: '#e35bff' },
    tagline: 'Dark berries. Wild edge. Endless drive.',
    description:
      'A deep berry blend layered over an electric fizzing finish. Wild, but controlled.',
    detail:
      'Blackberry, blueberry and raspberry notes with natural caffeine. Violet depth with a magenta lift.',
    profile: 'Mixed Berry',
    profileNote: 'Deep, jammy, bright lift.',
    ingredients: baseIngredients(
      'MIXED\nBERRY',
      'Blackberry, blueberry and raspberry notes blended into a deep fruit base.'
    ),
    stats: stats('SPARKLING'),
  },
  {
    id: 'lime',
    name: 'Electric Lime',
    words: ['ELECTRIC', 'LIME'],
    color: '#4CD41B',
    colorDark: darken('#4CD41B', 0.62),
    gradient: { edge: '#02140a', mid: '#1f7a12', glow: '#c6ff43' },
    tagline: 'Sharp citrus. Instant charge. Pure voltage.',
    description:
      'Tart lime zest cut with a razor-clean sparkling snap. Loud citrus, zero sugar.',
    detail:
      'Cold-pressed lime character over sparkling water with natural caffeine. Sharp, green and electric.',
    profile: 'Lime Zest',
    profileNote: 'Tart, green, snapping finish.',
    ingredients: baseIngredients(
      'LIME\nZEST',
      'Cold-pressed lime zest for a sharp, green citrus hit with real bite.'
    ),
    stats: stats('SPARKLING'),
  },
  {
    id: 'lemon',
    name: 'Lemon Flash',
    words: ['LEMON', 'FLASH'],
    color: '#F2C500',
    colorDark: darken('#F2C500', 0.6),
    gradient: { edge: '#140d00', mid: '#a37a00', glow: '#ffe873' },
    tagline: 'Bright citrus. Instant spark. Pure clarity.',
    description:
      'Sun-bright lemon finished with a crackling fizz. Golden, clean and awake.',
    detail:
      'Fresh lemon over sparkling water with natural caffeine. Amber warmth with a bright golden top note.',
    profile: 'Fresh Lemon',
    profileNote: 'Bright, zesty, golden finish.',
    ingredients: baseIngredients(
      'FRESH\nLEMON',
      'Fresh lemon oil and juice notes for a bright, zesty, sunlit citrus profile.'
    ),
    stats: stats('SPARKLING'),
  },
];

export const DEFAULT_INDEX = 3; // Peach Nectar sits at the wave peak on load
