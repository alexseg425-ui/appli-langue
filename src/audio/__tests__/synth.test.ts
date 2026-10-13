import { encodeWav, SAMPLE_RATE, SOUND_NAMES, synthesize, toBase64 } from '../synth';

describe('effets sonores', () => {
  it('chaque son existe, dure entre 0,05 s et 1 s et reste dans les bornes', () => {
    for (const name of SOUND_NAMES) {
      const samples = synthesize(name);
      const seconds = samples.length / SAMPLE_RATE;
      expect(seconds).toBeGreaterThan(0.05);
      expect(seconds).toBeLessThan(1);
      const peak = Math.max(...samples.map((value) => Math.abs(value)));
      expect(peak).toBeCloseTo(0.9, 2);
    }
  });

  it("le son d'erreur est plus long que le clic", () => {
    expect(synthesize('wrong').length).toBeGreaterThan(synthesize('tap').length);
  });
});

describe('fichier WAV', () => {
  it('a un en-tête WAV valide (PCM 16 bits, mono)', () => {
    const samples = synthesize('correct');
    const bytes = encodeWav(samples);
    const text = (start: number, length: number) =>
      String.fromCharCode(...bytes.slice(start, start + length));

    expect(text(0, 4)).toBe('RIFF');
    expect(text(8, 4)).toBe('WAVE');
    expect(text(12, 4)).toBe('fmt ');
    expect(text(36, 4)).toBe('data');

    const view = new DataView(bytes.buffer);
    expect(view.getUint16(20, true)).toBe(1); // PCM
    expect(view.getUint16(22, true)).toBe(1); // mono
    expect(view.getUint32(24, true)).toBe(SAMPLE_RATE);
    expect(view.getUint16(34, true)).toBe(16);
    expect(view.getUint32(40, true)).toBe(samples.length * 2);
    expect(bytes.length).toBe(44 + samples.length * 2);
  });
});

describe('base64', () => {
  it('encode comme les outils standard', () => {
    const bytes = (text: string) => new TextEncoder().encode(text);
    expect(toBase64(bytes('Man'))).toBe('TWFu');
    expect(toBase64(bytes('Ma'))).toBe('TWE=');
    expect(toBase64(bytes('M'))).toBe('TQ==');
    expect(toBase64(new Uint8Array([0xff, 0xfe]))).toBe('//4=');
  });
});
