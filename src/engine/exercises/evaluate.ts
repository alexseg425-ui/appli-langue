// Vérifie une réponse selon le type d'exercice.
import type { Exercise } from '../content/schema';
import type { LanguagePlugin, Verdict } from '../../languages/types';

export interface EvaluationContext {
  targetPlugin: LanguagePlugin; // règles de la langue apprise (espagnol...)
  uiPlugin: LanguagePlugin; // règles de la langue de l'interface (français...)
  uiLang: string; // langue de l'interface, ex. "fr"
}

// "correct", "almost" (presque) ou "wrong" (faux).
export function evaluateAnswer(exercise: Exercise, input: string, ctx: EvaluationContext): Verdict {
  switch (exercise.type) {
    case 'translate_to_target':
      return ctx.targetPlugin.compare(input, exercise.answers);
    case 'translate_to_source':
      return ctx.uiPlugin.compare(input, exercise.answers[ctx.uiLang] ?? []);
    case 'image_choice':
      return input === exercise.answer ? 'correct' : 'wrong';
  }
}

// La bonne réponse, à montrer après une erreur.
export function correctAnswerText(exercise: Exercise, uiLang: string): string {
  switch (exercise.type) {
    case 'translate_to_target':
      return exercise.answers[0] ?? '';
    case 'translate_to_source':
      return exercise.answers[uiLang]?.[0] ?? '';
    case 'image_choice':
      return exercise.options.find((option) => option.id === exercise.answer)?.emoji ?? '';
  }
}
