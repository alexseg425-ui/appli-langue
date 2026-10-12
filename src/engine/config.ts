// Réglages du jeu. Changer une valeur ici change tout le jeu (ex. la recharge des cœurs).
export const GAME_CONFIG = {
  maxHearts: 5,
  heartRegenMs: 4 * 60 * 60 * 1000, // 1 cœur toutes les 4 heures
  lessonXp: 10,
  perfectLessonBonusXp: 5,
  comboLength: 5, // nombre de bonnes réponses d'affilée pour activer le combo
  comboBonusXp: 1, // XP gagnés par bonne réponse après le combo
} as const;
