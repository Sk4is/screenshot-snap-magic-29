export interface Ingredient {
  label: string;
  title: string;
  copy: string;
}

export interface Stat {
  value: string;
  label: string;
}

export type CanPattern = 'rays' | 'stripes' | 'bubbles' | 'waves' | 'grid' | 'splash';

export interface Product {
  id: string;
  name: string;
  /** ["PEACH", "NECTAR"] — used for the giant hero typography */
  words: [string, string];
  color: string;
  colorDark: string;
  /** secondary accent printed on the can */
  accent: string;
  /** unique printed graphic per flavor */
  pattern: CanPattern;
  /** background environment stops */
  gradient: { edge: string; mid: string; glow: string };
  tagline: string;
  /** short phrase printed on the can label */
  canTagline: string;
  /** ingredient line for the tiny legal print */
  canIngredients: string;
  /** keyword row printed under the nutrition chips */
  keywords: [string, string, string];
  caffeineMg: number;
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
  fruitCopy: string,
  caffeineMg: number
): [Ingredient, Ingredient, Ingredient, Ingredient] => [
  { label: 'INGREDIENT 01', title: fruit, copy: fruitCopy },
  {
    label: 'INGREDIENT 02',
    title: 'NATURAL\nCAFFEINE',
    copy: `${caffeineMg}mg of natural caffeine from green coffee beans for a smooth, sustained lift without the crash.`,
  },
  {
    label: 'INGREDIENT 03',
    title: 'SPARKLING\nWATER',
    copy: 'Light carbonation built on triple-filtered sparkling water for a crisp, refreshing finish.',
  },
  {
    label: 'INGREDIENT 04',
    title: 'ZERO\nSUGAR',
    copy: 'Full flavor, zero sugar. Nothing heavy, nothing artificial tasting.',
  },
];

const stats = (caffeineMg: number): [Stat, Stat, Stat, Stat] => [
  { value: '500 ml', label: 'CAN SIZE' },
  { value: '0 g', label: 'SUGAR' },
  { value: `${caffeineMg} mg`, label: 'NATURAL CAFFEINE' },
  { value: 'SPARKLING', label: 'BASE' },
];

interface Seed {
  id: string;
  name: string;
  words: [string, string];
  color: string;
  accent: string;
  pattern: CanPattern;
  gradient: { edge: string; mid: string; glow: string };
  canTagline: string;
  canIngredients: string;
  keywords: [string, string, string];
  caffeineMg: number;
  tagline: string;
  description: string;
  detail: string;
  profile: string;
  profileNote: string;
  fruit: string;
  fruitCopy: string;
}

const seeds: Seed[] = [
  {
    id: 'cherry',
    name: 'Cherry Rush',
    words: ['CHERRY', 'RUSH'],
    color: '#D8102F',
    accent: '#ff6f8a',
    pattern: 'rays',
    gradient: { edge: '#1a0206', mid: '#8c0a20', glow: '#ff3355' },
    canTagline: 'Dark cherry pressed cold',
    canIngredients: 'dark cherry juice from concentrate',
    keywords: ['Dark cherry', 'Cold pressed', 'Zero sugar'],
    caffeineMg: 200,
    tagline: 'Dark cherry. Fast pulse. No slowing down.',
    description:
      'Deep dark cherry pressed into a sharp sparkling bite. Bold up front, clean on the finish.',
    detail:
      'A concentrated dark cherry base balanced with natural caffeine and light carbonation. Built for the moment you need to move faster than the room.',
    profile: 'Dark Cherry',
    profileNote: 'Rich, tart, clean finish.',
    fruit: 'DARK\nCHERRY',
    fruitCopy: 'Real dark cherry flavor with a deep, tart, fruit-forward character.',
  },
  {
    id: 'blue',
    name: 'Blue Ice',
    words: ['BLUE', 'ICE'],
    color: '#1E6BFF',
    accent: '#8fe3ff',
    pattern: 'grid',
    gradient: { edge: '#00040f', mid: '#0b3a99', glow: '#4fc3ff' },
    canTagline: 'Arctic berry, served glacial',
    canIngredients: 'arctic berry extract, blue raspberry',
    keywords: ['Arctic berry', 'Ice cold', 'Zero sugar'],
    caffeineMg: 200,
    tagline: 'Glacial cool. Electric clarity. Total focus.',
    description: 'Icy blue raspberry chilled into a razor-crisp fizz. Cold, clear and focused.',
    detail:
      'Blue raspberry over filtered sparkling water with natural caffeine. Engineered to feel like cold air in a hot room.',
    profile: 'Blue Raspberry',
    profileNote: 'Cool, crisp, glassy finish.',
    fruit: 'ARCTIC\nBERRY',
    fruitCopy: 'Bright arctic berry with a cold, glassy edge and a clean fruity finish.',
  },
  {
    id: 'midnight',
    name: 'Midnight',
    words: ['MID', 'NIGHT'],
    color: '#22222a',
    accent: '#9fb2d8',
    pattern: 'stripes',
    gradient: { edge: '#000000', mid: '#15161c', glow: '#8fa3c8' },
    canTagline: 'Black grape after hours',
    canIngredients: 'black grape concentrate, cola botanicals',
    keywords: ['Black grape', 'After dark', 'Zero sugar'],
    caffeineMg: 240,
    tagline: 'Black grape. Deep focus. After-hours energy.',
    description: 'A blackout blend built for the hours nobody sees. Smooth, dark, relentless.',
    detail:
      'Black grape and cola botanicals with natural caffeine and zero sugar. Graphite finish, silver highlights, no noise.',
    profile: 'Black Grape',
    profileNote: 'Deep, smooth, spiced finish.',
    fruit: 'BLACK\nGRAPE',
    fruitCopy: 'Dark grape and cola botanicals with a smooth, spiced depth and no sugary weight.',
  },
  {
    id: 'peach',
    name: 'Peach Nectar',
    words: ['PEACH', 'NECTAR'],
    color: '#FF5A18',
    accent: '#ffc46b',
    pattern: 'splash',
    gradient: { edge: '#180400', mid: '#c2380a', glow: '#ffb14a' },
    canTagline: 'White peach, softly charged',
    canIngredients: 'white peach puree',
    keywords: ['White peach', 'Real fruit', 'Zero sugar'],
    caffeineMg: 200,
    tagline: 'Juicy peach. Clean energy. Zero compromise.',
    description:
      'Bright white peach with a crisp sparkling finish. Soft on the nose, sharp on the palate.',
    detail:
      'White peach flavor layered over sparkling water with natural caffeine from coffee beans. Fruity, light and never syrupy.',
    profile: 'White Peach',
    profileNote: 'Bright, juicy, clean finish.',
    fruit: 'WHITE\nPEACH',
    fruitCopy: 'Real white peach flavor with a bright fruity finish and no syrupy edge.',
  },
  {
    id: 'berry',
    name: 'Wild Berry',
    words: ['WILD', 'BERRY'],
    color: '#8A24E0',
    accent: '#ff77ff',
    pattern: 'splash',
    gradient: { edge: '#0d0018', mid: '#5c118f', glow: '#e35bff' },
    canTagline: 'Mixed berries, wild edge',
    canIngredients: 'blackberry, blueberry and raspberry concentrates',
    keywords: ['Mixed berry', 'Wild picked', 'Zero sugar'],
    caffeineMg: 200,
    tagline: 'Dark berries. Wild edge. Endless drive.',
    description: 'A deep berry blend layered over an electric fizzing finish. Wild, but controlled.',
    detail:
      'Blackberry, blueberry and raspberry notes with natural caffeine. Violet depth with a magenta lift.',
    profile: 'Mixed Berry',
    profileNote: 'Deep, jammy, bright lift.',
    fruit: 'MIXED\nBERRY',
    fruitCopy: 'Blackberry, blueberry and raspberry notes blended into a deep fruit base.',
  },
  {
    id: 'lime',
    name: 'Electric Lime',
    words: ['ELECTRIC', 'LIME'],
    color: '#4CD41B',
    accent: '#e4ff5c',
    pattern: 'rays',
    gradient: { edge: '#02140a', mid: '#1f7a12', glow: '#c6ff43' },
    canTagline: 'Lime zest, pure voltage',
    canIngredients: 'cold pressed lime juice',
    keywords: ['Lime zest', 'High voltage', 'Zero sugar'],
    caffeineMg: 220,
    tagline: 'Sharp citrus. Instant charge. Pure voltage.',
    description: 'Tart lime zest cut with a razor-clean sparkling snap. Loud citrus, zero sugar.',
    detail:
      'Cold-pressed lime character over sparkling water with natural caffeine. Sharp, green and electric.',
    profile: 'Lime Zest',
    profileNote: 'Tart, green, snapping finish.',
    fruit: 'LIME\nZEST',
    fruitCopy: 'Cold-pressed lime zest for a sharp, green citrus hit with real bite.',
  },
  {
    id: 'lemon',
    name: 'Lemon Flash',
    words: ['LEMON', 'FLASH'],
    color: '#F2C500',
    accent: '#fff6a8',
    pattern: 'stripes',
    gradient: { edge: '#140d00', mid: '#a37a00', glow: '#ffe873' },
    canTagline: 'Sun-bright lemon oil',
    canIngredients: 'lemon juice and lemon peel oil',
    keywords: ['Fresh lemon', 'Sunlit', 'Zero sugar'],
    caffeineMg: 180,
    tagline: 'Bright citrus. Instant spark. Pure clarity.',
    description: 'Sun-bright lemon finished with a crackling fizz. Golden, clean and awake.',
    detail:
      'Fresh lemon over sparkling water with natural caffeine. Amber warmth with a bright golden top note.',
    profile: 'Fresh Lemon',
    profileNote: 'Bright, zesty, golden finish.',
    fruit: 'FRESH\nLEMON',
    fruitCopy: 'Fresh lemon oil and juice notes for a bright, zesty, sunlit citrus profile.',
  },
  {
    id: 'mango',
    name: 'Mango Storm',
    words: ['MANGO', 'STORM'],
    color: '#F58A0B',
    accent: '#ffd15c',
    pattern: 'waves',
    gradient: { edge: '#1a0c00', mid: '#b35c04', glow: '#ffc247' },
    canTagline: 'Tropical mango, full force',
    canIngredients: 'alphonso mango puree',
    keywords: ['Ripe mango', 'Tropical', 'Zero sugar'],
    caffeineMg: 200,
    tagline: 'Ripe mango. Tropical force. Straight ahead.',
    description: 'Thick ripe mango cut with sparkling water into something fast and bright.',
    detail:
      'Alphonso-style mango character with natural caffeine and a dry sparkling finish that keeps it from turning heavy.',
    profile: 'Ripe Mango',
    profileNote: 'Lush, golden, dry finish.',
    fruit: 'RIPE\nMANGO',
    fruitCopy: 'Sun-ripened mango with a lush tropical body and a dry, clean tail.',
  },
  {
    id: 'pineapple',
    name: 'Pineapple Blast',
    words: ['PINEAPPLE', 'BLAST'],
    color: '#FFD11A',
    accent: '#a8f04a',
    pattern: 'bubbles',
    gradient: { edge: '#161000', mid: '#b09000', glow: '#ffe95e' },
    canTagline: 'Pineapple, cut sharp',
    canIngredients: 'pineapple juice from concentrate',
    keywords: ['Pineapple', 'Sharp cut', 'Zero sugar'],
    caffeineMg: 200,
    tagline: 'Sharp pineapple. Bright blast. Full throttle.',
    description: 'Pineapple acidity over an aggressive fizz. Sweet, sour and loud.',
    detail:
      'Pineapple juice character with natural caffeine and heavy carbonation for a sharp tropical hit.',
    profile: 'Pineapple',
    profileNote: 'Sharp, tangy, bright.',
    fruit: 'GOLDEN\nPINEAPPLE',
    fruitCopy: 'Golden pineapple with a tangy acidity that keeps every sip sharp.',
  },
  {
    id: 'watermelon',
    name: 'Watermelon Wave',
    words: ['WATERMELON', 'WAVE'],
    color: '#F63A5A',
    accent: '#7ef2a8',
    pattern: 'waves',
    gradient: { edge: '#19020a', mid: '#a51a38', glow: '#ff7a92' },
    canTagline: 'Watermelon, ice water clean',
    canIngredients: 'watermelon juice from concentrate',
    keywords: ['Watermelon', 'Ice clean', 'Zero sugar'],
    caffeineMg: 160,
    tagline: 'Cool watermelon. Long wave. Easy speed.',
    description: 'Fresh watermelon flesh over a light, water-clean fizz. Refreshing, never cloying.',
    detail:
      'Watermelon flavor with natural caffeine and gentle carbonation. The lightest can in the lineup.',
    profile: 'Watermelon',
    profileNote: 'Light, cooling, clean.',
    fruit: 'FRESH\nWATERMELON',
    fruitCopy: 'Fresh watermelon flesh with a cooling, water-clean sweetness.',
  },
  {
    id: 'guava',
    name: 'Tropical Guava',
    words: ['TROPICAL', 'GUAVA'],
    color: '#FF4D8D',
    accent: '#ffd0a8',
    pattern: 'splash',
    gradient: { edge: '#1a0410', mid: '#a81a58', glow: '#ff8fbd' },
    canTagline: 'Pink guava, sun grown',
    canIngredients: 'pink guava puree',
    keywords: ['Pink guava', 'Sun grown', 'Zero sugar'],
    caffeineMg: 200,
    tagline: 'Pink guava. Tropical heat. Slow burn.',
    description: 'Pink guava with a floral sweetness and a dry sparkling edge.',
    detail:
      'Pink guava puree character with natural caffeine. Floral, tropical and surprisingly dry.',
    profile: 'Pink Guava',
    profileNote: 'Floral, tropical, dry.',
    fruit: 'PINK\nGUAVA',
    fruitCopy: 'Pink guava with a floral, honeyed tropical character.',
  },
  {
    id: 'grape',
    name: 'Purple Grape',
    words: ['PURPLE', 'GRAPE'],
    color: '#6B2BD6',
    accent: '#c79bff',
    pattern: 'grid',
    gradient: { edge: '#0a0018', mid: '#431286', glow: '#a86bff' },
    canTagline: 'Concord grape, pressed dark',
    canIngredients: 'concord grape juice from concentrate',
    keywords: ['Concord grape', 'Deep pressed', 'Zero sugar'],
    caffeineMg: 200,
    tagline: 'Deep grape. Heavy purple. Steady push.',
    description: 'Concord grape pressed dark and dropped into a clean sparkling base.',
    detail:
      'Deep grape character with natural caffeine and zero sugar. Rich color, restrained sweetness.',
    profile: 'Concord Grape',
    profileNote: 'Rich, dark, restrained.',
    fruit: 'CONCORD\nGRAPE',
    fruitCopy: 'Concord grape pressed dark for a rich, vinous fruit body.',
  },
  {
    id: 'citrus',
    name: 'Citrus Punch',
    words: ['CITRUS', 'PUNCH'],
    color: '#FF7A00',
    accent: '#ffe08a',
    pattern: 'rays',
    gradient: { edge: '#180800', mid: '#b34f00', glow: '#ffb347' },
    canTagline: 'Four citrus, one hit',
    canIngredients: 'orange, grapefruit, lemon and lime juices',
    keywords: ['Citrus mix', 'Four fruit', 'Zero sugar'],
    caffeineMg: 220,
    tagline: 'Four citrus. One punch. No hesitation.',
    description: 'Orange, grapefruit, lemon and lime stacked into a single sharp hit.',
    detail:
      'A four-citrus blend with natural caffeine and bright acidity. The most aggressive citrus in the range.',
    profile: 'Citrus Blend',
    profileNote: 'Sharp, layered, bitter-bright.',
    fruit: 'CITRUS\nBLEND',
    fruitCopy: 'Orange, grapefruit, lemon and lime layered for a sharp, bitter-bright hit.',
  },
  {
    id: 'coconut',
    name: 'Coconut Lime',
    words: ['COCONUT', 'LIME'],
    color: '#12C7B6',
    accent: '#eafff8',
    pattern: 'bubbles',
    gradient: { edge: '#00140f', mid: '#078375', glow: '#68f2e0' },
    canTagline: 'Coconut water, lime cut',
    canIngredients: 'coconut water, lime juice',
    keywords: ['Coconut', 'Lime cut', 'Zero sugar'],
    caffeineMg: 160,
    tagline: 'Soft coconut. Sharp lime. Long calm.',
    description: 'Coconut water softness cut with a bright squeeze of lime.',
    detail:
      'Coconut water and lime juice with natural caffeine. Creamy top note, clean citrus finish.',
    profile: 'Coconut Lime',
    profileNote: 'Creamy, bright, clean.',
    fruit: 'COCONUT\nWATER',
    fruitCopy: 'Coconut water for a soft, creamy body cut sharp with fresh lime.',
  },
  {
    id: 'original',
    name: 'Energy Original',
    words: ['ENERGY', 'ORIGINAL'],
    color: '#EFEFEF',
    accent: '#9aa4b2',
    pattern: 'stripes',
    gradient: { edge: '#0a0a0c', mid: '#5c6270', glow: '#e8eef7' },
    canTagline: 'The original formula',
    canIngredients: 'classic energy blend, taurine, B vitamins',
    keywords: ['Original', 'Classic', 'Zero sugar'],
    caffeineMg: 240,
    tagline: 'The original. Nothing added. Nothing missing.',
    description: 'The classic energy profile, rebuilt clean on sparkling water and zero sugar.',
    detail:
      'The original SKYY FIZZ formula: classic energy notes, B vitamins and the highest caffeine level in the range.',
    profile: 'Classic Energy',
    profileNote: 'Familiar, bright, bracing.',
    fruit: 'CLASSIC\nENERGY',
    fruitCopy: 'The familiar energy profile with B vitamins and a bracing, clean finish.',
  },
];

export const products: Product[] = seeds.map((s) => ({
  id: s.id,
  name: s.name,
  words: s.words,
  color: s.color,
  colorDark: darken(s.color, 0.6),
  accent: s.accent,
  pattern: s.pattern,
  gradient: s.gradient,
  tagline: s.tagline,
  canTagline: s.canTagline,
  canIngredients: s.canIngredients,
  keywords: s.keywords,
  caffeineMg: s.caffeineMg,
  description: s.description,
  detail: s.detail,
  profile: s.profile,
  profileNote: s.profileNote,
  ingredients: baseIngredients(s.fruit, s.fruitCopy, s.caffeineMg),
  stats: stats(s.caffeineMg),
}));

export const DEFAULT_INDEX = 3; // Peach Nectar sits at the wave peak on load
