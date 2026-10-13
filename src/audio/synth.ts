// Effets sonores de l'app, fabriqués avec les instruments de src/audio/instruments.ts.
// Chaque effet est une liste de notes (instrument, moment, hauteur, volume).
import { NoteEvent, normalizePeak, renderEvents, SAMPLE_RATE } from './instruments';

export { SAMPLE_RATE };

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

// Fréquence d'une note MIDI (69 = la 440 Hz ; 72 = do 5 ; 84 = do 6…).
const hz = (midi: number): number => 440 * 2 ** ((midi - 69) / 12);

const RECIPES: Record<SoundName, NoteEvent[]> = {
  // Petit "tac" de bois, quand on touche un bouton ou une tuile.
  tap: [{ instrument: 'marimba', at: 0, dur: 0.12, freq: hz(84), gain: 0.5 }],
  // Carillon : deux cloches qui sonnent l'une après l'autre.
  correct: [
    { instrument: 'bell', at: 0, dur: 0.9, freq: hz(84), gain: 0.55 },
    { instrument: 'bell', at: 0.09, dur: 1.1, freq: hz(88), gain: 0.55 },
  ],
  // Deux pincements doux qui descendent : "presque".
  almost: [
    { instrument: 'pluck', at: 0, dur: 0.5, freq: hz(79), gain: 0.6 },
    { instrument: 'pluck', at: 0.12, dur: 0.6, freq: hz(76), gain: 0.6 },
  ],
  // Deux notes graves de marimba : une erreur, sans agressivité.
  wrong: [
    { instrument: 'marimba', at: 0, dur: 0.35, freq: hz(50), gain: 0.7 },
    { instrument: 'marimba', at: 0.12, dur: 0.4, freq: hz(45), gain: 0.6 },
  ],
  // Arpège de cordes pincées : combo activé.
  combo: [72, 76, 79, 84].map((midi, index) => ({
    instrument: 'pluck' as const,
    at: index * 0.07,
    dur: 0.45,
    freq: hz(midi),
    gain: 0.55,
  })),
  // Accord de cloches qui s'élargit : leçon terminée.
  complete: [
    { instrument: 'bell', at: 0, dur: 1.2, freq: hz(72), gain: 0.5 },
    { instrument: 'bell', at: 0.1, dur: 1.2, freq: hz(76), gain: 0.5 },
    { instrument: 'bell', at: 0.2, dur: 1.2, freq: hz(79), gain: 0.5 },
    { instrument: 'bell', at: 0.36, dur: 1.8, freq: hz(84), gain: 0.6 },
  ],
  // Glissando lent et mélancolique : plus de cœurs.
  heartLost: [{ instrument: 'glide', at: 0, dur: 0.7, freq: hz(72), to: hz(60), gain: 0.5 }],
};

// Fabrique les échantillons (valeurs entre -1 et 1) d'un effet sonore.
export function synthesize(name: SoundName, sampleRate = SAMPLE_RATE): Float32Array {
  const events = RECIPES[name];
  const end = Math.max(...events.map((event) => event.at + event.dur));
  const length = Math.ceil((end + 0.05) * sampleRate);
  return normalizePeak(renderEvents(events, length, sampleRate), 0.9);
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
