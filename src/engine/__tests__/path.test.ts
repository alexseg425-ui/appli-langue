import type { Unit } from '../content/schema';
import { buildPath } from '../path/pathBuilder';
import { canPair } from '../languagePair';

const exercise = (id: string) => ({
  id,
  type: 'image_choice' as const,
  prompt: { fr: 'x', en: 'x' },
  options: [
    { id: 'a', emoji: '🌙' },
    { id: 'b', emoji: '🌅' },
  ],
  answer: 'a',
});

const units: Unit[] = [
  {
    id: 'u1',
    order: 1,
    cefr: 'A1',
    title: { fr: 'U1', en: 'U1' },
    description: { fr: '', en: '' },
    lessons: [
      {
        id: 'l1',
        title: { fr: 'L1', en: 'L1' },
        exercises: [exercise('a'), exercise('b'), exercise('c')],
      },
      {
        id: 'l2',
        title: { fr: 'L2', en: 'L2' },
        exercises: [exercise('d'), exercise('e'), exercise('f')],
      },
    ],
  },
  {
    id: 'u2',
    order: 2,
    cefr: 'A1',
    title: { fr: 'U2', en: 'U2' },
    description: { fr: '', en: '' },
    lessons: [
      {
        id: 'l3',
        title: { fr: 'L3', en: 'L3' },
        exercises: [exercise('g'), exercise('h'), exercise('i')],
      },
    ],
  },
];

describe('chemin', () => {
  it('seule la première leçon est disponible au départ', () => {
    const path = buildPath(units, {});
    expect(path[0]?.lessons.map((l) => l.status)).toEqual(['available', 'locked']);
    expect(path[1]?.lessons[0]?.status).toBe('locked');
  });

  it('une leçon se débloque quand la précédente est terminée, même entre unités', () => {
    const path = buildPath(units, { l1: { perfect: true } });
    expect(path[0]?.lessons.map((l) => l.status)).toEqual(['completed', 'available']);
    expect(path[1]?.lessons[0]?.status).toBe('locked');

    const next = buildPath(units, { l1: { perfect: false }, l2: { perfect: false } });
    expect(next[1]?.lessons[0]?.status).toBe('available');
  });

  it("le coffre s'ouvre quand toute l'unité est terminée", () => {
    const path = buildPath(units, { l1: { perfect: true }, l2: { perfect: false } });
    expect(path[0]?.chestUnlocked).toBe(true);
    expect(path[1]?.chestUnlocked).toBe(false);
  });

  it('garde la trace des leçons parfaites', () => {
    const path = buildPath(units, { l1: { perfect: true } });
    expect(path[0]?.lessons[0]?.perfect).toBe(true);
  });
});

describe('règle des langues', () => {
  it('interface et langue apprise doivent être différentes', () => {
    expect(canPair('fr', 'es')).toBe(true);
    expect(canPair('fr', 'fr')).toBe(false);
    expect(canPair('en', null)).toBe(true);
  });
});
