// Déroulé d'une leçon, sans React : quelle question, combien d'erreurs, quel XP.
// Une mauvaise réponse renvoie l'exercice à la fin de la leçon (une seule fois).
import type { Exercise } from '../content/schema';
import type { Verdict } from '../../languages/types';
import { registerAnswer, lessonXp } from '../gamification/xp';

export interface LessonState {
  queue: Exercise[];
  index: number; // position de la question en cours
  retriedIds: string[]; // exercices déjà renvoyés à la fin
  lastVerdict: Verdict | null; // résultat de la question en cours, null avant vérification
  mistakes: number;
  almosts: number;
  streak: number;
  comboXp: number;
  comboJustReached: boolean; // le combo vient d'être activé (pour l'animation)
}

export function createLesson(exercises: Exercise[]): LessonState {
  return {
    queue: [...exercises],
    index: 0,
    retriedIds: [],
    lastVerdict: null,
    mistakes: 0,
    almosts: 0,
    streak: 0,
    comboXp: 0,
    comboJustReached: false,
  };
}

export function currentExercise(state: LessonState): Exercise | undefined {
  return state.queue[state.index];
}

// Enregistre le résultat de la question en cours.
export function recordVerdict(state: LessonState, verdict: Verdict): LessonState {
  const current = currentExercise(state);
  if (!current || state.lastVerdict) return state; // déjà vérifiée

  const combo = registerAnswer(state.streak, verdict === 'correct');
  const shouldRetry = verdict === 'wrong' && !state.retriedIds.includes(current.id);

  return {
    ...state,
    queue: shouldRetry ? [...state.queue, current] : state.queue,
    retriedIds: shouldRetry ? [...state.retriedIds, current.id] : state.retriedIds,
    lastVerdict: verdict,
    mistakes: state.mistakes + (verdict === 'wrong' ? 1 : 0),
    almosts: state.almosts + (verdict === 'almost' ? 1 : 0),
    streak: combo.streak,
    comboXp: state.comboXp + combo.xp,
    comboJustReached: combo.comboReached,
  };
}

// Passe à la question suivante.
export function nextStep(state: LessonState): LessonState {
  return { ...state, index: state.index + 1, lastVerdict: null, comboJustReached: false };
}

export function isLessonComplete(state: LessonState): boolean {
  return state.index >= state.queue.length;
}

// Résultat final : "parfaite" = aucune erreur ni "presque".
export function lessonResult(state: LessonState) {
  const perfect = state.mistakes === 0 && state.almosts === 0;
  return {
    perfect,
    mistakes: state.mistakes,
    xp: lessonXp(perfect) + state.comboXp,
  };
}
