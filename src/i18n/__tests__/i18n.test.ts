import en from '../locales/en.json';
import fr from '../locales/fr.json';
import { resolveInterfaceLanguage } from '../detect';

// Liste toutes les clés d'un fichier de traduction, ex. "lesson.check".
function keysOf(object: Record<string, unknown>, prefix = ''): string[] {
  return Object.entries(object).flatMap(([key, value]) =>
    typeof value === 'object' && value !== null
      ? keysOf(value as Record<string, unknown>, `${prefix}${key}.`)
      : [`${prefix}${key}`],
  );
}

describe('détection de la langue du téléphone', () => {
  it('prend la langue principale, quelle que soit la région', () => {
    expect(resolveInterfaceLanguage('fr')).toBe('fr');
    expect(resolveInterfaceLanguage('fr-CA')).toBe('fr');
    expect(resolveInterfaceLanguage('en_US')).toBe('en');
  });

  it("utilise l'anglais si la langue n'est pas prise en charge", () => {
    expect(resolveInterfaceLanguage('de-DE')).toBe('en');
    expect(resolveInterfaceLanguage('')).toBe('en');
    expect(resolveInterfaceLanguage(undefined)).toBe('en');
  });
});

describe('fichiers de traduction', () => {
  it('ont exactement les mêmes clés en français et en anglais', () => {
    const frKeys = keysOf(fr).sort();
    const enKeys = keysOf(en).sort();
    expect(frKeys.filter((key) => !enKeys.includes(key))).toEqual([]);
    expect(enKeys.filter((key) => !frKeys.includes(key))).toEqual([]);
  });
});
