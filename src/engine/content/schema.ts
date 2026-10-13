// Schémas Zod : ils décrivent la forme exacte que doit avoir chaque fichier JSON de contenu.
// Si un fichier ne respecte pas le schéma, l'app (et la commande validate:content) le signale.
import { z } from 'zod';
import { INTERFACE_LANGUAGES } from '../../i18n/languages';

// Chaque texte doit exister dans toutes les langues d'interface (fr et en pour l'instant).
const REQUIRED_LANGUAGES = INTERFACE_LANGUAGES.map((language) => language.code);

export const LocalizedText = z
  .record(z.string(), z.string().min(1))
  .refine((texts) => REQUIRED_LANGUAGES.every((code) => texts[code] !== undefined), {
    message: `une traduction manque (il faut : ${REQUIRED_LANGUAGES.join(', ')})`,
  });

const HexColor = z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'couleur au format #RRGGBB');
const CefrLevel = z.enum(['A1', 'A2', 'B1', 'B2']);

// config.json : l'identité de la langue et ses règles.
export const ConfigSchema = z.object({
  code: z.string().regex(/^[a-z]{2,3}(-[A-Za-z]{2,4})?$/, 'code de langue invalide'),
  name: LocalizedText,
  instructionName: LocalizedText,
  nativeName: z.string().min(1),
  flag: z.string().min(1),
  accent: HexColor,
  writingSystem: z.enum(['latin', 'cyrillic', 'han']),
  ttsVoice: z.string().min(2),
  specialChars: z.array(z.string().min(1)),
  correction: z.object({
    ignoreCase: z.boolean(),
    ignorePunctuation: z.boolean(),
    accentsOptional: z.boolean(), // un accent oublié donne "Presque !"
    typoTolerance: z.number().int().min(0).max(2), // nombre de lettres fausses tolérées
  }),
  levels: z.array(z.object({ cefr: CefrLevel, label: LocalizedText })).min(1),
  comboPhrases: z.array(z.string().min(1)).min(1),
});

// characters.json : les personnages de la langue.
export const CharacterSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  age: z.number().int().min(5).max(120),
  city: z.string().min(1),
  color: HexColor,
  role: LocalizedText,
  personality: LocalizedText,
  phrases: z.array(z.object({ text: z.string().min(1), translation: LocalizedText })).min(1),
});
export const CharactersSchema = z.array(CharacterSchema);

// Les 3 types d'exercices de la Phase 1 (les autres arriveront en Phase 2).
const TranslateToTargetSchema = z.object({
  id: z.string().min(1),
  type: z.literal('translate_to_target'),
  source: LocalizedText, // phrase dans la langue de l'utilisateur
  answers: z.array(z.string().min(1)).min(1), // réponses acceptées dans la langue apprise
  distractors: z.array(z.string().min(1)).default([]), // mots "pièges" ajoutés aux tuiles
});

const AnswersByLanguage = z
  .record(z.string(), z.array(z.string().min(1)).min(1))
  .refine((answers) => REQUIRED_LANGUAGES.every((code) => answers[code] !== undefined), {
    message: `des réponses manquent (il faut : ${REQUIRED_LANGUAGES.join(', ')})`,
  });

const TranslateToSourceSchema = z.object({
  id: z.string().min(1),
  type: z.literal('translate_to_source'),
  source: z.string().min(1), // phrase dans la langue apprise
  answers: AnswersByLanguage, // réponses acceptées, par langue d'interface
});

const ImageChoiceSchema = z.object({
  id: z.string().min(1),
  type: z.literal('image_choice'),
  prompt: LocalizedText,
  options: z
    .array(z.object({ id: z.string().min(1), emoji: z.string().min(1) }))
    .min(2)
    .max(4),
  answer: z.string().min(1), // identifiant de la bonne option
});

export const ExerciseSchema = z.discriminatedUnion('type', [
  TranslateToTargetSchema,
  TranslateToSourceSchema,
  ImageChoiceSchema,
]);

export const LessonSchema = z.object({
  id: z.string().min(1),
  title: LocalizedText,
  exercises: z.array(ExerciseSchema).min(3),
});

// Une unité = un chapitre du chemin, avec ses leçons.
export const UnitSchema = z.object({
  id: z.string().min(1),
  order: z.number().int().min(1),
  cefr: CefrLevel,
  title: LocalizedText,
  description: LocalizedText,
  // false = pas de barre de caractères spéciaux dans cette unité (ex. parcours débutant)
  showSpecialChars: z.boolean().default(true),
  lessons: z.array(LessonSchema).min(1),
});

// tips/ : astuces de grammaire d'une unité.
export const UnitTipsSchema = z.object({
  unitId: z.string().min(1),
  tips: z.array(z.object({ title: LocalizedText, body: LocalizedText })).min(1),
});

export type LanguageConfig = z.output<typeof ConfigSchema>;
export type Character = z.output<typeof CharacterSchema>;
export type Exercise = z.output<typeof ExerciseSchema>;
export type Lesson = z.output<typeof LessonSchema>;
export type Unit = z.output<typeof UnitSchema>;
export type UnitTips = z.output<typeof UnitTipsSchema>;
