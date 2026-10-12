// Règles d'XP et de combo.
import { GAME_CONFIG } from '../config';

export interface AnswerResult {
  streak: number; // bonnes réponses d'affilée
  xp: number; // XP bonus gagnés par cette réponse
  comboReached: boolean; // le combo vient d'être activé à cette réponse
}

// Enregistre une réponse et calcule le combo.
// - Une mauvaise réponse remet le compteur à zéro.
// - Après 5 bonnes réponses d'affilée, chaque bonne réponse suivante rapporte +1 XP.
export function registerAnswer(streak: number, correct: boolean): AnswerResult {
  if (!correct) return { streak: 0, xp: 0, comboReached: false };

  const next = streak + 1;
  return {
    streak: next,
    xp: next > GAME_CONFIG.comboLength ? GAME_CONFIG.comboBonusXp : 0,
    comboReached: next === GAME_CONFIG.comboLength,
  };
}

// XP d'une leçon terminée : 10, plus 5 si elle est parfaite.
export function lessonXp(perfect: boolean): number {
  return GAME_CONFIG.lessonXp + (perfect ? GAME_CONFIG.perfectLessonBonusXp : 0);
}
