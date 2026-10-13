// Fabrique les effets sonores directement à partir de formes d'onde (sinus, triangle, carré).
// Pourquoi ? Les sons sont ainsi originaux, sans fichier sous licence à vérifier.
// Un son = une liste de "notes" : chaque note a une onde, une fréquence qui peut glisser
// (de "from" à "to") et une enveloppe qui s'éteint en douceur.

export const SOUND_NAMES = [
  'tap',
  'correct',
  'almost',
  'wrong',
  'combo',
  'complete',
  'heartLost',
] as const;

export type SoundName = (typeof SOUND_NAMES)[number];

export const SAMPLE_RATE = 22050;

type Wave = 'sine' | 'triangle' | 'square';

interface Tone {
  start: number; // début, en secondes
  duration: number; // durée, en secondes
  from: number; // fréquence de départ (Hz)
  to?: number; // fréquence de fin (Hz) ; absent = fréquence constante
  wave: Wave;
  gain: number; // volume de la note (0 à 1)
}

const RECIPES: Record<SoundName, Tone[]> = {
  // Petit "clic" court, quand on touche un bouton ou une tuile.
  tap: [{ start: 0, duration: 0.06, from: 900, to: 600, wave: 'sine', gain: 0.5 }],
  // Deux notes qui montent : bonne réponse.
  correct: [
    { start: 0, duration: 0.14, from: 1047, wave: 'triangle', gain: 0.6 },
    { start: 0.09, duration: 0.3, from: 1319, wave: 'triangle', gain: 0.6 },
  ],
  // Deux notes douces qui descendent : "presque".
  almost: [
    { start: 0, duration: 0.14, from: 784, wave: 'sine', gain: 0.5 },
    { start: 0.12, duration: 0.25, from: 659, wave: 'sine', gain: 0.5 },
  ],
  // Bourdonnement qui descend : mauvaise réponse.
  wrong: [{ start: 0, duration: 0.35, from: 260, to: 170, wave: 'square', gain: 0.25 }],
  // Arpège rapide : combo activé.
  combo: [523, 659, 784, 1047].map((freq, index) => ({
    start: index * 0.06,
    duration: 0.16,
    from: freq,
    wave: 'triangle' as const,
    gain: 0.5,
  })),
  // Petite fanfare : leçon terminée.
  complete: [
    { start: 0, duration: 0.12, from: 523, wave: 'triangle', gain: 0.55 },
    { start: 0.12, duration: 0.12, from: 659, wave: 'triangle', gain: 0.55 },
    { start: 0.24, duration: 0.12, from: 784, wave: 'triangle', gain: 0.55 },
    { start: 0.36, duration: 0.6, from: 1047, wave: 'triangle', gain: 0.6 },
  ],
  // Glissando triste : plus de cœurs.
  heartLost: [{ start: 0, duration: 0.45, from: 520, to: 220, wave: 'sine', gain: 0.5 }],
};

function waveValue(kind: Wave, phase: number): number {
  switch (kind) {
    case 'sine':
      return Math.sin(phase);
    case 'triangle':
      return (2 / Math.PI) * Math.asin(Math.sin(phase));
    case 'square':
      return Math.sign(Math.sin(phase)) * 0.6; // carré adouci pour ne pas agresser l'oreille
  }
}

// Calcule les échantillons (valeurs entre -1 et 1) d'un son.
export function synthesize(name: SoundName, sampleRate = SAMPLE_RATE): Float32Array {
  const tones = RECIPES[name];
  const end = Math.max(...tones.map((tone) => tone.start + tone.duration));
  const samples = new Float32Array(Math.ceil((end + 0.02) * sampleRate));

  for (const tone of tones) {
    const first = Math.round(tone.start * sampleRate);
    const count = Math.round(tone.duration * sampleRate);
    const target = tone.to ?? tone.from;
    let phase = 0;

    for (let i = 0; i < count; i++) {
      const index = first + i;
      if (index >= samples.length) break;

      const progress = i / count;
      const frequency = tone.from + (target - tone.from) * progress;
      phase += (2 * Math.PI * frequency) / sampleRate;

      // Attaque très courte, puis extinction progressive.
      const attack = Math.min(1, i / (0.006 * sampleRate));
      const decay = Math.exp(-4 * progress);
      samples[index] =
        (samples[index] ?? 0) + waveValue(tone.wave, phase) * attack * decay * tone.gain;
    }
  }

  // Ramène le son au même volume maximum, quel que soit le réglage des notes.
  let peak = 0;
  for (const sample of samples) peak = Math.max(peak, Math.abs(sample));
  if (peak > 0) {
    for (let i = 0; i < samples.length; i++) samples[i] = ((samples[i] ?? 0) / peak) * 0.9;
  }
  return samples;
}

// Écrit les échantillons dans un fichier WAV (PCM 16 bits, mono).
export function encodeWav(samples: Float32Array, sampleRate = SAMPLE_RATE): Uint8Array {
  const dataSize = samples.length * 2;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  const writeText = (offset: number, text: string) => {
    for (let i = 0; i < text.length; i++) view.setUint8(offset + i, text.charCodeAt(i));
  };

  writeText(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeText(8, 'WAVE');
  writeText(12, 'fmt ');
  view.setUint32(16, 16, true); // taille de l'en-tête "fmt"
  view.setUint16(20, 1, true); // format PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // octets par seconde
  view.setUint16(32, 2, true); // octets par échantillon
  view.setUint16(34, 16, true); // bits par échantillon
  writeText(36, 'data');
  view.setUint32(40, dataSize, true);

  for (let i = 0; i < samples.length; i++) {
    const value = Math.max(-1, Math.min(1, samples[i] ?? 0));
    view.setInt16(44 + i * 2, Math.round(value < 0 ? value * 0x8000 : value * 0x7fff), true);
  }
  return new Uint8Array(buffer);
}

const BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

// Encode des octets en base64 (pour intégrer un son directement dans une page web).
export function toBase64(bytes: Uint8Array): string {
  let output = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const first = bytes[i] ?? 0;
    const second = bytes[i + 1];
    const third = bytes[i + 2];
    const packed = (first << 16) | ((second ?? 0) << 8) | (third ?? 0);
    output += BASE64_CHARS[(packed >> 18) & 63];
    output += BASE64_CHARS[(packed >> 12) & 63];
    output += second === undefined ? '=' : BASE64_CHARS[(packed >> 6) & 63];
    output += third === undefined ? '=' : BASE64_CHARS[packed & 63];
  }
  return output;
}
