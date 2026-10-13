import { RAW_CONTENT } from '../../../generated/contentIndex';
import { buildLanguageContent } from '../buildLanguageContent';
import { UnitSchema } from '../schema';

describe("contenu réel de l'app", () => {
  it("l'espagnol est valide", () => {
    const { content, issues } = buildLanguageContent('es', RAW_CONTENT.es);
    expect(issues).toEqual([]);
    expect(content).not.toBeNull();
    expect(content!.units[0]?.lessons.length).toBeGreaterThanOrEqual(5);
  });
});

describe('détection des erreurs dans le contenu', () => {
  const base = () => JSON.parse(JSON.stringify(RAW_CONTENT.es));
  const build = (raw: ReturnType<typeof base>) => buildLanguageContent('es', raw);

  it('signale une traduction manquante', () => {
    const raw = base();
    delete raw.config.data.name.en;
    const { content, issues } = build(raw);
    expect(content).toBeNull();
    expect(issues.some((i) => i.file === 'config.json')).toBe(true);
  });

  it("signale un identifiant d'exercice en double", () => {
    const raw = base();
    raw.units[0].data.lessons[0].exercises[1].id = raw.units[0].data.lessons[0].exercises[0].id;
    const { issues } = build(raw);
    expect(issues.some((i) => i.message.includes('en double'))).toBe(true);
  });

  it("signale une bonne réponse absente des choix d'image", () => {
    const raw = base();
    const exercise = raw.units[0].data.lessons[0].exercises.find(
      (e: { type: string }) => e.type === 'image_choice',
    );
    exercise.answer = 'zzz';
    const { issues } = build(raw);
    expect(issues.some((i) => i.message.includes('pas une option'))).toBe(true);
  });

  it('signale une astuce liée à une unité inconnue', () => {
    const raw = base();
    raw.tips[0].data.unitId = 'inconnue';
    const { issues } = build(raw);
    expect(issues.some((i) => i.message.includes('unité inconnue'))).toBe(true);
  });

  it('signale un code de langue qui ne correspond pas au dossier', () => {
    const { issues } = build(base());
    const { issues: wrongFolder } = buildLanguageContent('it', RAW_CONTENT.es);
    expect(issues).toEqual([]);
    expect(wrongFolder.some((i) => i.message.includes('ne correspond pas'))).toBe(true);
  });
});

describe('barre de caractères spéciaux', () => {
  it("le parcours 1 de l'espagnol ne l'affiche pas", () => {
    const { content } = buildLanguageContent('es', RAW_CONTENT.es);
    expect(content!.units[0]?.showSpecialChars).toBe(false);
  });

  it("elle est affichée par défaut quand l'unité ne précise rien", () => {
    const unit = JSON.parse(JSON.stringify(RAW_CONTENT.es.units[0]!.data));
    delete unit.showSpecialChars;
    expect(UnitSchema.parse(unit).showSpecialChars).toBe(true);
  });
});
