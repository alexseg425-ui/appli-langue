// Valide tous les fichiers d'une langue et fait les vérifications "croisées"
// (ids uniques, tips qui pointent vers une unité existante, etc.).
// Ce fichier ne dépend pas de React : il tourne dans l'app ET dans la commande validate:content.
import { z } from 'zod';
import {
  CharactersSchema,
  ConfigSchema,
  Character,
  LanguageConfig,
  Unit,
  UnitSchema,
  UnitTips,
  UnitTipsSchema,
} from './schema';

export interface RawFile {
  file: string;
  data: unknown;
}

export interface RawLanguageFiles {
  config: RawFile;
  characters: RawFile | null;
  units: RawFile[];
  tips: RawFile[];
}

export interface ContentIssue {
  file: string;
  message: string;
}

export interface LanguageContent {
  config: LanguageConfig;
  characters: Character[];
  units: Unit[];
  tips: UnitTips[];
}

export interface BuildResult {
  content: LanguageContent | null; // null si le contenu est invalide
  issues: ContentIssue[];
}

// Vérifie un fichier avec son schéma. Renvoie null et remplit "issues" en cas d'erreur.
function parseFile<T extends z.ZodType>(
  schema: T,
  file: RawFile,
  issues: ContentIssue[],
): z.output<T> | null {
  const result = schema.safeParse(file.data);
  if (result.success) return result.data;

  for (const issue of result.error.issues) {
    const where = issue.path.length > 0 ? issue.path.join('.') : '(racine)';
    issues.push({ file: file.file, message: `${where} : ${issue.message}` });
  }
  return null;
}

export function buildLanguageContent(code: string, raw: RawLanguageFiles): BuildResult {
  const issues: ContentIssue[] = [];

  const config = parseFile(ConfigSchema, raw.config, issues);
  if (config && config.code !== code) {
    issues.push({
      file: raw.config.file,
      message: `le code "${config.code}" ne correspond pas au dossier "${code}"`,
    });
  }

  const units: Unit[] = [];
  for (const file of raw.units) {
    const unit = parseFile(UnitSchema, file, issues);
    if (unit) units.push(unit);
  }

  const characters = raw.characters
    ? (parseFile(CharactersSchema, raw.characters, issues) ?? [])
    : [];

  const tips: UnitTips[] = [];
  for (const file of raw.tips) {
    const tip = parseFile(UnitTipsSchema, file, issues);
    if (tip) tips.push(tip);
  }

  // Vérifications croisées : identifiants uniques et références correctes.
  if (units.length === 0) {
    issues.push({ file: 'units/', message: 'aucune unité trouvée' });
  }

  const unitIds = new Set<string>();
  const orders = new Set<number>();
  const lessonIds = new Set<string>();
  const exerciseIds = new Set<string>();

  for (const unit of units) {
    if (unitIds.has(unit.id)) {
      issues.push({ file: `units/${unit.id}`, message: `id d'unité en double : ${unit.id}` });
    }
    unitIds.add(unit.id);

    if (orders.has(unit.order)) {
      issues.push({ file: `units/${unit.id}`, message: `ordre en double : ${unit.order}` });
    }
    orders.add(unit.order);

    for (const lesson of unit.lessons) {
      if (lessonIds.has(lesson.id)) {
        issues.push({ file: `units/${unit.id}`, message: `id de leçon en double : ${lesson.id}` });
      }
      lessonIds.add(lesson.id);

      for (const exercise of lesson.exercises) {
        if (exerciseIds.has(exercise.id)) {
          issues.push({
            file: `units/${unit.id}`,
            message: `id d'exercice en double : ${exercise.id}`,
          });
        }
        exerciseIds.add(exercise.id);

        // La bonne option doit exister parmi les choix.
        if (
          exercise.type === 'image_choice' &&
          !exercise.options.some((option) => option.id === exercise.answer)
        ) {
          issues.push({
            file: `units/${unit.id}`,
            message: `${exercise.id} : la bonne réponse "${exercise.answer}" n'est pas une option`,
          });
        }
      }
    }
  }

  for (const tip of tips) {
    if (!unitIds.has(tip.unitId)) {
      issues.push({ file: 'tips/', message: `astuce liée à une unité inconnue : ${tip.unitId}` });
    }
  }

  if (issues.length > 0 || !config) {
    return { content: null, issues };
  }

  units.sort((a, b) => a.order - b.order);
  return { content: { config, characters, units, tips }, issues };
}
