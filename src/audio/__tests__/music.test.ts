import { buildScore, MELODY, MUSIC_LOOP_SECONDS, synthesizeMusic } from '../music';
import { SAMPLE_RATE } from '../instruments';

describe('musique du chemin', () => {
  it('chaque mesure de la mélodie dure exactement 4 temps', () => {
    const bars: Record<number, number> = {};
    for (const [beat, , length] of MELODY) {
      const bar = Math.floor(beat / 4);
      bars[bar] = (bars[bar] ?? 0) + length;
      // Une note ne doit pas déborder sur la mesure suivante.
      expect(Math.floor((beat + length - 1e-9) / 4)).toBe(bar);
    }
    expect(Object.keys(bars)).toHaveLength(8);
    for (const total of Object.values(bars)) expect(total).toBe(4);
  });

  it('la boucle dure 8 mesures à 90 battements par minute', () => {
    expect(MUSIC_LOOP_SECONDS).toBeCloseTo((8 * 4 * 60) / 90, 6);
  });

  it('la partition contient des nappes, de la basse, de la mélodie et des percussions', () => {
    const instruments = new Set(buildScore().map((event) => event.instrument));
    expect([...instruments].sort()).toEqual(['bell', 'kick', 'pad', 'pluck', 'shaker']);
  });

  it('la piste a la bonne durée, un volume raisonnable, et commence et finit en silence', () => {
    const samples = synthesizeMusic();
    expect(samples.length).toBe(Math.round(MUSIC_LOOP_SECONDS * SAMPLE_RATE));
    let peak = 0;
    for (const value of samples) peak = Math.max(peak, Math.abs(value));
    expect(peak).toBeGreaterThan(0.6);
    expect(peak).toBeLessThanOrEqual(0.7 + 1e-6);
    // Pas de clic au moment où la boucle recommence.
    expect(Math.abs(samples[0] ?? 1)).toBeLessThan(0.001);
    expect(Math.abs(samples[samples.length - 1] ?? 1)).toBeLessThan(0.001);
  });
});
