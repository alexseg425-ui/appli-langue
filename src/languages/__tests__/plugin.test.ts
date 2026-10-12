import { RAW_CONTENT } from '../../generated/contentIndex';
import { buildLanguageContent } from '../../engine/content/buildLanguageContent';
import { getPlugin } from '../index';
import { createPlugin, stripAccents } from '../createPlugin';

// On teste avec les vraies règles de l'espagnol (config.json), pas avec des copies.
const { content } = buildLanguageContent('es', RAW_CONTENT.es);
const spanish = getPlugin(content!.config);

describe("règles de l'espagnol", () => {
  it('une bonne réponse est juste', () => {
    expect(spanish.compare('Hola', ['Hola'])).toBe('correct');
    expect(spanish.compare('  Buenos   días ', ['Buenos días'])).toBe('correct');
  });

  it('majuscules et ponctuation ne comptent pas', () => {
    expect(spanish.compare('hola', ['Hola'])).toBe('correct');
    expect(spanish.compare('¿Cómo estás', ['¿Cómo estás?'])).toBe('correct');
    expect(spanish.compare('¡Hola!', ['Hola'])).toBe('correct');
  });

  it('un accent oublié donne "presque"', () => {
    expect(spanish.compare('adios', ['Adiós'])).toBe('almost');
    expect(spanish.compare('Como estas?', ['¿Cómo estás?'])).toBe('almost');
  });

  it('une petite faute sur un mot assez long donne "presque"', () => {
    expect(spanish.compare('buenas noche', ['buenas noches'])).toBe('almost');
  });

  it('une faute trop grave est fausse, et les mots courts ne sont pas tolérés', () => {
    expect(spanish.compare('Adiós', ['Hola'])).toBe('wrong');
    expect(spanish.compare('holo', ['hola'])).toBe('wrong');
    expect(spanish.compare('', ['Hola'])).toBe('wrong');
  });

  it('accepte plusieurs bonnes réponses', () => {
    expect(spanish.compare('Buenos días', ['Buenos días', 'Buen día'])).toBe('correct');
    expect(spanish.compare('Buen día', ['Buenos días', 'Buen día'])).toBe('correct');
  });

  it('une bonne réponse l\'emporte sur une réponse "presque"', () => {
    expect(spanish.compare('Adiós', ['Adios', 'Adiós'])).toBe('correct');
  });

  it('découpe une phrase en mots pour les tuiles', () => {
    expect(spanish.tokenize('¿Cómo te llamas?')).toEqual(['¿Cómo', 'te', 'llamas?']);
  });

  it("propose les caractères spéciaux de l'espagnol", () => {
    expect(spanish.specialChars).toContain('ñ');
    expect(spanish.specialChars).toContain('¿');
  });
});

describe('fabrique de plugins', () => {
  it('retire les accents', () => {
    expect(stripAccents('niño, café')).toBe('nino, cafe');
  });

  it("sans correction d'accent, un accent oublié est faux", () => {
    const strict = createPlugin({
      code: 'xx',
      specialChars: [],
      correction: {
        ignoreCase: true,
        ignorePunctuation: true,
        accentsOptional: false,
        typoTolerance: 0,
      },
    });
    expect(strict.compare('adios', ['Adiós'])).toBe('wrong');
  });
});
