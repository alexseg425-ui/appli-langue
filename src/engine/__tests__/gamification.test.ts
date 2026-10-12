import { GAME_CONFIG } from '../config';
import { loseHeart, msUntilNextHeart, refreshHearts } from '../gamification/hearts';
import { lessonXp, registerAnswer } from '../gamification/xp';

const HOUR = 60 * 60 * 1000;
const START = 1_000_000;

describe('XP et combo', () => {
  it('une leçon vaut 10 XP, et 15 XP si elle est parfaite', () => {
    expect(lessonXp(false)).toBe(10);
    expect(lessonXp(true)).toBe(15);
  });

  it("le combo s'active à la 5e bonne réponse, sans bonus XP à ce moment", () => {
    let streak = 0;
    const results = [1, 2, 3, 4, 5].map(() => {
      const result = registerAnswer(streak, true);
      streak = result.streak;
      return result;
    });
    expect(results.map((r) => r.xp)).toEqual([0, 0, 0, 0, 0]);
    expect(results[4]?.comboReached).toBe(true);
  });

  it('chaque bonne réponse après le combo rapporte +1 XP', () => {
    let streak = 5;
    const first = registerAnswer(streak, true);
    streak = first.streak;
    const second = registerAnswer(streak, true);
    expect(first.xp).toBe(GAME_CONFIG.comboBonusXp);
    expect(second.xp).toBe(GAME_CONFIG.comboBonusXp);
    expect(first.comboReached).toBe(false);
  });

  it('une erreur remet le combo à zéro', () => {
    expect(registerAnswer(7, false)).toEqual({ streak: 0, xp: 0, comboReached: false });
  });
});

describe('cœurs', () => {
  it('perdre un cœur à 5 démarre la recharge maintenant', () => {
    const state = loseHeart({ hearts: 5, lastRefillAt: START - 3 * HOUR }, START);
    expect(state).toEqual({ hearts: 4, lastRefillAt: START });
  });

  it("perdre un cœur quand on n'est pas plein garde le compte de recharge en cours", () => {
    const state = loseHeart({ hearts: 3, lastRefillAt: START - HOUR }, START);
    expect(state).toEqual({ hearts: 2, lastRefillAt: START - HOUR });
  });

  it('ne descend jamais sous zéro', () => {
    expect(loseHeart({ hearts: 0, lastRefillAt: START }, START).hearts).toBe(0);
  });

  it('gagne 1 cœur toutes les 4 heures', () => {
    const state = refreshHearts({ hearts: 2, lastRefillAt: START }, START + 4 * HOUR);
    expect(state).toEqual({ hearts: 3, lastRefillAt: START + 4 * HOUR });
  });

  it('gagne plusieurs cœurs si plusieurs périodes sont passées, sans dépasser 5', () => {
    expect(refreshHearts({ hearts: 1, lastRefillAt: START }, START + 9 * HOUR).hearts).toBe(3);
    expect(refreshHearts({ hearts: 1, lastRefillAt: START }, START + 100 * HOUR).hearts).toBe(
      GAME_CONFIG.maxHearts,
    );
  });

  it("ne gagne rien avant la fin d'une période", () => {
    const state = { hearts: 2, lastRefillAt: START };
    expect(refreshHearts(state, START + 3 * HOUR)).toBe(state);
  });

  it('indique le temps restant avant le prochain cœur', () => {
    expect(msUntilNextHeart({ hearts: 2, lastRefillAt: START }, START + HOUR)).toBe(3 * HOUR);
    expect(msUntilNextHeart({ hearts: 5, lastRefillAt: START }, START)).toBe(0);
  });
});
