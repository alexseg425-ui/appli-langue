// Point d'accès unique au contenu, utilisé par les écrans.
import { RAW_CONTENT } from '../../generated/contentIndex';
import { buildLanguageContent, LanguageContent } from './buildLanguageContent';
import type { Lesson, Unit } from './schema';

// On construit et valide le contenu une seule fois, au premier chargement.
const LOADED = new Map<string, LanguageContent>();

for (const [code, raw] of Object.entries(RAW_CONTENT)) {
  const { content, issues } = buildLanguageContent(code, raw);

  if (issues.length > 0 && typeof __DEV__ !== 'undefined' && __DEV__) {
    console.warn(
      `Contenu "${code}" :\n${issues.map((i) => `- ${i.file} : ${i.message}`).join('\n')}`,
    );
  }
  if (content) LOADED.set(code, content);
}

// Contenu d'une langue (undefined si la langue n'existe pas ou si son contenu est invalide).
export function getLanguageContent(code: string): LanguageContent | undefined {
  return LOADED.get(code);
}

// Codes des langues disponibles à l'apprentissage.
export function listLanguageCodes(): string[] {
  return [...LOADED.keys()];
}

// Retrouve une leçon et son unité à partir de son identifiant.
export function findLesson(
  content: LanguageContent,
  lessonId: string,
): { unit: Unit; lesson: Lesson } | undefined {
  for (const unit of content.units) {
    const lesson = unit.lessons.find((item) => item.id === lessonId);
    if (lesson) return { unit, lesson };
  }
  return undefined;
}
