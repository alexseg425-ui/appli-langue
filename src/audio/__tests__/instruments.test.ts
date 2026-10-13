import { createRandom, normalizePeak, renderEvents, SAMPLE_RATE } from '../instruments';

describe('instruments', () => {
  it('la graine donne toujours la même suite de nombres', () => {
    const first = createRandom(42);
    const second = createRandom(42);
    const a = [first(), first(), first()];
    expect([second(), second(), second()]).toEqual(a);
    expect(a.every((value) => value >= -1 && value <= 1)).toBe(true);
  });

  it("une note n'apparaît qu'à son moment", () => {
    const track = renderEvents(
      [{ instrument: 'bell', at: 0.5, dur: 0.3, freq: 440, gain: 1 }],
      SAMPLE_RATE,
    );
    const before = track.slice(0, Math.round(0.4 * SAMPLE_RATE));
    const after = track.slice(Math.round(0.5 * SAMPLE_RATE), Math.round(0.8 * SAMPLE_RATE));
    expect(Math.max(...before.map(Math.abs))).toBe(0);
    expect(Math.max(...after.map(Math.abs))).toBeGreaterThan(0.1);
  });

  it('avec "wrap", ce qui dépasse la fin revient au début', () => {
    const length = Math.round(0.5 * SAMPLE_RATE);
    const track = renderEvents(
      [{ instrument: 'pad', at: 0.4, dur: 0.3, freq: 220, gain: 1 }],
      length,
      SAMPLE_RATE,
      true,
    );
    const head = track.slice(0, Math.round(0.05 * SAMPLE_RATE));
    expect(Math.max(...head.map(Math.abs))).toBeGreaterThan(0);
  });

  it('normalizePeak ramène la crête à la valeur demandée', () => {
    const samples = normalizePeak(new Float32Array([0.1, -0.5, 0.25]), 0.8);
    expect(Math.max(...samples.map(Math.abs))).toBeCloseTo(0.8, 6);
  });
});
