import { formatDuration } from '../format';
import { levenshtein } from '../levenshtein';
import { shuffle } from '../shuffle';

describe('levenshtein', () => {
  it('compte les lettres à changer, ajouter ou retirer', () => {
    expect(levenshtein('hola', 'hola')).toBe(0);
    expect(levenshtein('hola', 'hala')).toBe(1);
    expect(levenshtein('buenas noche', 'buenas noches')).toBe(1);
    expect(levenshtein('gato', 'perro')).toBeGreaterThan(2);
  });
});

describe('formatDuration', () => {
  it('affiche mm:ss', () => {
    expect(formatDuration(0)).toBe('00:00');
    expect(formatDuration(61_000)).toBe('01:01');
    expect(formatDuration(4 * 60 * 60 * 1000)).toBe('240:00');
  });
});

describe('shuffle', () => {
  it('garde les mêmes éléments sans modifier la liste de départ', () => {
    const original = ['a', 'b', 'c', 'd'];
    const mixed = shuffle(original, () => 0.5);
    expect([...mixed].sort()).toEqual([...original].sort());
    expect(original).toEqual(['a', 'b', 'c', 'd']);
  });
});
