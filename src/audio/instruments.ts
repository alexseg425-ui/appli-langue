// Instruments synthétisés : chaque note est calculée à partir de formules mathématiques.
// Pas de fichier audio à télécharger : les sons sont originaux et reproductibles à l'identique.

export const SAMPLE_RATE = 22050;

export type Instrument = 'bell' | 'marimba' | 'pluck' | 'pad' | 'kick' | 'shaker' | 'glide';

export interface NoteEvent {
  instrument: Instrument;
  at: number; // début de la note, en secondes
  dur: number; // durée : le son s'éteint dans cette durée
  freq: number; // hauteur, en Hz
  to?: number; // fréquence d'arrivée (uniquement pour "glide")
  gain: number; // volume de la note (0 à 1)
}

// Générateur pseudo-aléatoire "graine" : le même nombre de départ donne toujours le même bruit.
export function createRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return (state / 4294967296) * 2 - 1; // valeur entre -1 et 1
  };
}

// Partiels d'une cloche : [rapport de fréquence, volume, vitesse d'extinction].
const BELL_PARTIALS: [number, number, number][] = [
  [1, 1, 3],
  [2.76, 0.5, 5],
  [5.4, 0.25, 8],
  [8.93, 0.12, 11],
];

// Partiels d'un marimba : son boisé, très court.
const MARIMBA_PARTIALS: [number, number, number][] = [
  [1, 1, 12],
  [4, 0.2, 22],
  [10, 0.04, 30],
];

// Somme de sinusoïdes (partiels) avec une attaque immédiate et une extinction exponentielle.
function renderPartials(
  partials: [number, number, number][],
  event: NoteEvent,
  sampleRate: number,
): Float32Array {
  const count = Math.round(event.dur * sampleRate);
  const out = new Float32Array(count);
  for (const [ratio, amplitude, decay] of partials) {
    for (let i = 0; i < count; i++) {
      const t = i / sampleRate;
      const attack = Math.min(1, i / (0.002 * sampleRate));
      const envelope = Math.exp((-decay * t) / event.dur) * attack;
      out[i] =
        (out[i] ?? 0) + Math.sin(2 * Math.PI * event.freq * ratio * t) * amplitude * envelope;
    }
  }
  return out;
}

// Corde pincée (algorithme de Karplus-Strong) : on fait vibrer un bruit dans une boucle.
function renderPluck(event: NoteEvent, sampleRate: number, random: () => number): Float32Array {
  const count = Math.round(event.dur * sampleRate);
  const period = Math.max(2, Math.round(sampleRate / event.freq));
  const line = new Float32Array(period);
  for (let i = 0; i < period; i++) line[i] = random();

  const out = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const index = i % period;
    const next = (index + 1) % period;
    out[i] = (line[index] ?? 0) * (1 - i / count); // s'éteint doucement jusqu'à la fin
    line[index] = 0.5 * ((line[index] ?? 0) + (line[next] ?? 0)) * 0.996;
  }
  return out;
}

// Nappe douce : deux sinusoïdes légèrement désaccordées, attaque et relâche lentes.
function renderPad(event: NoteEvent, sampleRate: number): Float32Array {
  const count = Math.round(event.dur * sampleRate);
  const out = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const t = i / sampleRate;
    const phase = 2 * Math.PI * event.freq * t;
    const triangle = (2 / Math.PI) * Math.asin(Math.sin(phase));
    const tone = 0.6 * Math.sin(phase) + 0.4 * Math.sin(phase * 1.004) + 0.25 * triangle;
    const attack = Math.min(1, t / 0.2);
    const release = Math.min(1, (event.dur - t) / 0.5);
    out[i] = tone * attack * Math.max(0, release);
  }
  return out;
}

// Grosse caisse : une sinusoïde dont la hauteur chute très vite.
function renderKick(event: NoteEvent, sampleRate: number): Float32Array {
  const count = Math.round(event.dur * sampleRate);
  const out = new Float32Array(count);
  let phase = 0;
  for (let i = 0; i < count; i++) {
    const t = i / sampleRate;
    const frequency = 45 + 80 * Math.exp(-30 * t);
    phase += (2 * Math.PI * frequency) / sampleRate;
    out[i] = Math.sin(phase) * Math.exp(-14 * t);
  }
  return out;
}

// Shaker : bruit "aiguisé" (différence entre deux échantillons) qui s'éteint vite.
function renderShaker(event: NoteEvent, sampleRate: number, random: () => number): Float32Array {
  const count = Math.round(event.dur * sampleRate);
  const out = new Float32Array(count);
  let previous = 0;
  for (let i = 0; i < count; i++) {
    const noise = random();
    const t = i / sampleRate;
    out[i] = (noise - previous) * 0.5 * Math.exp(-60 * t);
    previous = noise;
  }
  return out;
}

// Glissando : une note qui passe de "freq" à "to", avec un léger vibrato (son mélancolique).
function renderGlide(event: NoteEvent, sampleRate: number): Float32Array {
  const count = Math.round(event.dur * sampleRate);
  const target = event.to ?? event.freq;
  const out = new Float32Array(count);
  let phase = 0;
  for (let i = 0; i < count; i++) {
    const progress = i / count;
    const t = i / sampleRate;
    const vibrato = 1 + 0.008 * Math.sin(2 * Math.PI * 5 * t);
    const frequency = (event.freq + (target - event.freq) * progress) * vibrato;
    phase += (2 * Math.PI * frequency) / sampleRate;
    const envelope = Math.min(1, t / 0.01) * Math.exp(-2.5 * progress);
    out[i] = Math.sin(phase) * envelope;
  }
  return out;
}

function renderNote(event: NoteEvent, sampleRate: number, random: () => number): Float32Array {
  switch (event.instrument) {
    case 'bell':
      return renderPartials(BELL_PARTIALS, event, sampleRate);
    case 'marimba':
      return renderPartials(MARIMBA_PARTIALS, event, sampleRate);
    case 'pluck':
      return renderPluck(event, sampleRate, random);
    case 'pad':
      return renderPad(event, sampleRate);
    case 'kick':
      return renderKick(event, sampleRate);
    case 'shaker':
      return renderShaker(event, sampleRate, random);
    case 'glide':
      return renderGlide(event, sampleRate);
  }
}

// Mélange toutes les notes dans une seule piste.
// "wrap" : ce qui dépasse la fin revient au début (utile pour une musique en boucle).
export function renderEvents(
  events: NoteEvent[],
  length: number,
  sampleRate = SAMPLE_RATE,
  wrap = false,
): Float32Array {
  const out = new Float32Array(length);
  events.forEach((event, index) => {
    // Chaque note a son propre bruit, toujours le même d'une fois sur l'autre.
    const random = createRandom(1000 + index * 7919);
    const samples = renderNote(event, sampleRate, random);
    const start = Math.round(event.at * sampleRate);

    for (let i = 0; i < samples.length; i++) {
      let position = start + i;
      if (wrap) position %= length;
      else if (position >= length) break;
      out[position] = (out[position] ?? 0) + (samples[i] ?? 0) * event.gain;
    }
  });
  return out;
}

// Ramène la piste à une crête donnée (ex. 0,9), pour un volume prévisible.
export function normalizePeak(samples: Float32Array, peak: number): Float32Array {
  let current = 0;
  for (const sample of samples) current = Math.max(current, Math.abs(sample));
  if (current > 0) {
    for (let i = 0; i < samples.length; i++) samples[i] = ((samples[i] ?? 0) / current) * peak;
  }
  return samples;
}
