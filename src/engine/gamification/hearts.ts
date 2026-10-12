// Règles des cœurs : perte, recharge automatique (1 cœur toutes les 4 h).
// Toutes les fonctions reçoivent "now" (l'heure actuelle) pour être faciles à tester.
import { GAME_CONFIG } from '../config';

export interface HeartsState {
  hearts: number;
  lastRefillAt: number; // date (ms) à partir de laquelle la recharge compte
}

// Perd un cœur. Si on était à 5, la recharge démarre maintenant.
export function loseHeart(state: HeartsState, now: number): HeartsState {
  if (state.hearts <= 0) return state;
  const wasFull = state.hearts >= GAME_CONFIG.maxHearts;
  return {
    hearts: state.hearts - 1,
    lastRefillAt: wasFull ? now : state.lastRefillAt,
  };
}

// Ajoute les cœurs gagnés depuis la dernière mise à jour (plafonné à 5).
export function refreshHearts(state: HeartsState, now: number): HeartsState {
  const { maxHearts, heartRegenMs } = GAME_CONFIG;
  if (state.hearts >= maxHearts) return { hearts: maxHearts, lastRefillAt: now };

  const steps = Math.floor((now - state.lastRefillAt) / heartRegenMs);
  if (steps <= 0) return state;

  const hearts = Math.min(maxHearts, state.hearts + steps);
  const lastRefillAt = hearts === maxHearts ? now : state.lastRefillAt + steps * heartRegenMs;
  return { hearts, lastRefillAt };
}

// Temps (ms) avant le prochain cœur. 0 si les cœurs sont pleins.
export function msUntilNextHeart(state: HeartsState, now: number): number {
  if (state.hearts >= GAME_CONFIG.maxHearts) return 0;
  return Math.max(0, state.lastRefillAt + GAME_CONFIG.heartRegenMs - now);
}
