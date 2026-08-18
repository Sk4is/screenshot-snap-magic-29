export interface ProductStory {
  heroTitle: [string, string];
  heroSubtitle: string;
  heroDescription: string;
  heroCta: string;
  chapterTwoWords: [string, string, string];
  chapterThreeWords: [string, string, string];
  ingredients: [string, string, string, string];
  chapterFiveWords: [string, string, string];
}

export interface Product {
  id: string;
  name: string;
  color: string;
  colorDark: string;
  story: ProductStory;
}

function darken(hex: string, amount: number): string {
  const c = hex.replace('#', '');
  const r = Math.max(0, Math.round(parseInt(c.slice(0, 2), 16) * (1 - amount)));
  const g = Math.max(0, Math.round(parseInt(c.slice(2, 4), 16) * (1 - amount)));
  const b = Math.max(0, Math.round(parseInt(c.slice(4, 6), 16) * (1 - amount)));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

export const products: Product[] = [
  {
    id: 'peach',
    name: 'Peach Nectar',
    color: '#FF5A30',
    colorDark: darken('#FF5A30', 0.55),
    story: {
      heroTitle: ['PEACH', 'NECTAR'],
      heroSubtitle: 'Juicy peach. Clean energy. Zero compromise.',
      heroDescription: 'Bright white peach flavor with a crisp sparkling finish.',
      heroCta: 'DISCOVER THE FLAVOR',
      chapterTwoWords: ['REAL', 'FRUIT', 'ENERGY'],
      chapterThreeWords: ['ZERO', 'BORING', 'FLAVOR'],
      ingredients: ['WHITE PEACH', 'SPARKLING WATER', 'NATURAL CAFFEINE', 'ZERO SUGAR'],
      chapterFiveWords: ['MADE', 'TO', 'MOVE'],
    },
  },
  {
    id: 'lime',
    name: 'Electric Lime',
    color: '#68D44B',
    colorDark: darken('#68D44B', 0.6),
    story: {
      heroTitle: ['ELECTRIC', 'LIME'],
      heroSubtitle: 'Sharp citrus. Instant charge. Pure voltage.',
      heroDescription: 'Tart lime zest cut with a razor-clean sparkling snap.',
      heroCta: 'FEEL THE CHARGE',
      chapterTwoWords: ['RAW', 'CITRUS', 'JOLT'],
      chapterThreeWords: ['NEVER', 'FLAT', 'FLAVOR'],
      ingredients: ['LIME ZEST', 'SPARKLING WATER', 'NATURAL CAFFEINE', 'ZERO SUGAR'],
      chapterFiveWords: ['BUILT', 'TO', 'SPARK'],
    },
  },
  {
    id: 'berry',
    name: 'Wild Berry',
    color: '#9146FF',
    colorDark: darken('#9146FF', 0.6),
    story: {
      heroTitle: ['WILD', 'BERRY'],
      heroSubtitle: 'Dark berries. Wild edge. Endless drive.',
      heroDescription: 'A deep berry blend layered over a fizzing electric finish.',
      heroCta: 'TASTE THE WILD',
      chapterTwoWords: ['DEEP', 'BERRY', 'RUSH'],
      chapterThreeWords: ['NO', 'HALFWAY', 'FLAVOR'],
      ingredients: ['MIXED BERRY', 'SPARKLING WATER', 'NATURAL CAFFEINE', 'ZERO SUGAR'],
      chapterFiveWords: ['RUN', 'ON', 'WILD'],
    },
  },
  {
    id: 'blue',
    name: 'Blue Ice',
    color: '#348AFF',
    colorDark: darken('#348AFF', 0.6),
    story: {
      heroTitle: ['BLUE', 'ICE'],
      heroSubtitle: 'Glacial cool. Electric clarity. Total focus.',
      heroDescription: 'Icy blue raspberry chilled into a razor-crisp fizz.',
      heroCta: 'GO SUBZERO',
      chapterTwoWords: ['COLD', 'CLEAR', 'FOCUS'],
      chapterThreeWords: ['ZERO', 'STATIC', 'HAZE'],
      ingredients: ['BLUE RASPBERRY', 'SPARKLING WATER', 'NATURAL CAFFEINE', 'ZERO SUGAR'],
      chapterFiveWords: ['STAY', 'ICE', 'COLD'],
    },
  },
  {
    id: 'cherry',
    name: 'Cherry Rush',
    color: '#E22B45',
    colorDark: darken('#E22B45', 0.55),
    story: {
      heroTitle: ['CHERRY', 'RUSH'],
      heroSubtitle: 'Dark cherry. Fast pulse. No slowing down.',
      heroDescription: 'Deep cherry intensity balanced by a sharp sparkling bite.',
      heroCta: 'FEEL THE RUSH',
      chapterTwoWords: ['DARK', 'CHERRY', 'PULSE'],
      chapterThreeWords: ['NEVER', 'SLOW', 'FLAVOR'],
      ingredients: ['DARK CHERRY', 'SPARKLING WATER', 'NATURAL CAFFEINE', 'ZERO SUGAR'],
      chapterFiveWords: ['CHASE', 'THE', 'RUSH'],
    },
  },
  {
    id: 'lemon',
    name: 'Lemon Flash',
    color: '#F6D83B',
    colorDark: darken('#F6D83B', 0.6),
    story: {
      heroTitle: ['LEMON', 'FLASH'],
      heroSubtitle: 'Bright citrus. Instant spark. Pure clarity.',
      heroDescription: 'Sun-bright lemon flash finished with a crackling fizz.',
      heroCta: 'CATCH THE FLASH',
      chapterTwoWords: ['BRIGHT', 'CITRUS', 'SPARK'],
      chapterThreeWords: ['ZERO', 'DULL', 'MOMENTS'],
      ingredients: ['FRESH LEMON', 'SPARKLING WATER', 'NATURAL CAFFEINE', 'ZERO SUGAR'],
      chapterFiveWords: ['MADE', 'TO', 'FLASH'],
    },
  },
  {
    id: 'midnight',
    name: 'Midnight',
    color: '#161616',
    colorDark: '#000000',
    story: {
      heroTitle: ['MIDNIGHT', 'EDITION'],
      heroSubtitle: 'Dark cola. Deep focus. After-hours energy.',
      heroDescription: 'A bold blackout cola built for the hours nobody sees.',
      heroCta: 'ENTER THE DARK',
      chapterTwoWords: ['DEEP', 'DARK', 'DRIVE'],
      chapterThreeWords: ['ZERO', 'DAYLIGHT', 'RULES'],
      ingredients: ['BLACKOUT COLA', 'SPARKLING WATER', 'NATURAL CAFFEINE', 'ZERO SUGAR'],
      chapterFiveWords: ['OWN', 'THE', 'NIGHT'],
    },
  },
];
