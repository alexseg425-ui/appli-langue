// Musique du chemin : une boucle douce de 8 mesures (Am – F – C – G, à 90 battements par minute).
// Elle est composée ici en notes, puis fabriquée avec les mêmes instruments que les effets.
import { normalizePeak, NoteEvent, renderEvents, SAMPLE_RATE } from './instruments';

export const MUSIC_BPM = 90;
const BEAT = 60 / MUSIC_BPM; // durée d'un temps, en secondes
const BARS = 8;
const BEATS_PER_BAR = 4;
export const MUSIC_LOOP_BEATS = BARS * BEATS_PER_BAR;
export const MUSIC_LOOP_SECONDS = MUSIC_LOOP_BEATS * BEAT;

const hz = (midi: number): number => 440 * 2 ** ((midi - 69) / 12);

// Accords : une basse (note grave) et trois notes d'accord, pour chaque paire de mesures.
const CHORDS = [
  { bass: 45, notes: [57, 60, 64] }, // La mineur (Am)
  { bass: 41, notes: [53, 57, 60] }, // Fa (F)
  { bass: 36, notes: [60, 64, 67] }, // Do (C)
  { bass: 43, notes: [55, 59, 62] }, // Sol (G)
];

// Mélodie : [temps de départ, note MIDI, durée en temps]. Chaque mesure fait 4 temps.
export const MELODY: [number, number, number][] = [
  [0, 76, 1],
  [1, 79, 0.5],
  [1.5, 76, 0.5],
  [2, 74, 1],
  [3, 72, 1],
  [4, 69, 1],
  [5, 72, 0.5],
  [5.5, 74, 0.5],
  [6, 76, 1],
  [7, 74, 1],
  [8, 72, 1],
  [9, 69, 0.5],
  [9.5, 72, 0.5],
  [10, 74, 1],
  [11, 76, 1],
  [12, 79, 1],
  [13, 76, 0.5],
  [13.5, 74, 0.5],
  [14, 72, 1],
  [15, 69, 1],
  [16, 67, 1],
  [17, 72, 1],
  [18, 76, 1],
  [19, 79, 1],
  [20, 76, 1],
  [21, 74, 1],
  [22, 72, 1],
  [23, 67, 1],
  [24, 69, 1],
  [25, 67, 0.5],
  [25.5, 69, 0.5],
  [26, 74, 1],
  [27, 79, 1],
  [28, 76, 1],
  [29, 74, 0.5],
  [29.5, 72, 0.5],
  [30, 74, 1],
  [31, 67, 1],
];

// Liste de toutes les notes de la boucle, avec leur moment (en secondes).
export function buildScore(): NoteEvent[] {
  const events: NoteEvent[] = [];

  CHORDS.forEach((chord, chordIndex) => {
    const start = chordIndex * 2 * BEATS_PER_BAR * BEAT; // chaque accord dure deux mesures
    const duration = 2 * BEATS_PER_BAR * BEAT;

    // Nappe : les notes de l'accord tiennent pendant deux mesures.
    for (const midi of chord.notes) {
      events.push({ instrument: 'pad', at: start, dur: duration, freq: hz(midi), gain: 0.06 });
    }
    // Basse : la fondamentale sur le premier temps, la quinte sur le troisième.
    events.push({
      instrument: 'pluck',
      at: start,
      dur: 1.6 * BEAT,
      freq: hz(chord.bass),
      gain: 0.5,
    });
    events.push({
      instrument: 'pluck',
      at: start + 2 * BEAT,
      dur: 1.6 * BEAT,
      freq: hz(chord.bass + 7),
      gain: 0.4,
    });
    events.push({
      instrument: 'pluck',
      at: start + 4 * BEAT,
      dur: 1.6 * BEAT,
      freq: hz(chord.bass),
      gain: 0.5,
    });
    events.push({
      instrument: 'pluck',
      at: start + 6 * BEAT,
      dur: 1.6 * BEAT,
      freq: hz(chord.bass + 7),
      gain: 0.4,
    });
  });

  // Mélodie : carillon doux.
  for (const [beat, midi, length] of MELODY) {
    events.push({
      instrument: 'bell',
      at: beat * BEAT,
      dur: length * BEAT * 1.8,
      freq: hz(midi),
      gain: 0.32,
    });
  }

  // Percussions : grosse caisse sur les temps 1 et 3, shaker sur chaque croche.
  for (let bar = 0; bar < BARS; bar++) {
    for (const beat of [0, 2]) {
      events.push({
        instrument: 'kick',
        at: (bar * BEATS_PER_BAR + beat) * BEAT,
        dur: 0.3,
        freq: 0,
        gain: 0.3,
      });
    }
  }
  for (let eighth = 0; eighth < MUSIC_LOOP_BEATS * 2; eighth++) {
    events.push({ instrument: 'shaker', at: eighth * BEAT * 0.5, dur: 0.08, freq: 0, gain: 0.07 });
  }

  return events;
}

// Fabrique la boucle complète. Les notes qui dépassent la fin reviennent au début,
// et un fondu très court évite tout clic au moment où la boucle recommence.
export function synthesizeMusic(sampleRate = SAMPLE_RATE): Float32Array {
  const length = Math.round(MUSIC_LOOP_SECONDS * sampleRate);
  const samples = normalizePeak(renderEvents(buildScore(), length, sampleRate, true), 0.7);

  const fade = Math.round(0.02 * sampleRate);
  for (let i = 0; i < fade; i++) {
    const gain = i / fade;
    samples[i] = (samples[i] ?? 0) * gain;
    samples[length - 1 - i] = (samples[length - 1 - i] ?? 0) * gain;
  }
  return samples;
}
