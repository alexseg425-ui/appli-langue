// Lecture de la musique du chemin et des effets sonores.
import { AudioPlayer, AudioSource, createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { Platform } from 'react-native';
import { useUserStore } from '../store/userStore';
import { synthesizeMusic } from './music';
import { encodeWav, SoundName, synthesize, toBase64 } from './synth';

// Fichiers générés par scripts/generate-sounds.ts (sur téléphone).
const SOURCES: Record<SoundName, number> = {
  tap: require('../../assets/sounds/tap.wav'),
  correct: require('../../assets/sounds/correct.wav'),
  almost: require('../../assets/sounds/almost.wav'),
  wrong: require('../../assets/sounds/wrong.wav'),
  combo: require('../../assets/sounds/combo.wav'),
  complete: require('../../assets/sounds/complete.wav'),
  heartLost: require('../../assets/sounds/heartLost.wav'),
};
const MUSIC_SOURCE: number = require('../../assets/music/chemin.wav');

// Volume de la musique par rapport aux effets (la musique reste en fond).
const MUSIC_VOLUME = 0.35;

// Sur le web, la page doit fonctionner toute seule (sans fichiers à côté) :
// le son est donc fabriqué et intégré directement dans la page.
function webUri(samples: Float32Array): AudioSource {
  return { uri: `data:audio/wav;base64,${toBase64(encodeWav(samples))}` };
}

const players: Partial<Record<SoundName, AudioPlayer>> = {};

// À appeler une fois au démarrage. Les sons jouent même si le téléphone est en mode silencieux,
// et se mélangent à la musique de l'utilisateur (elle ne s'arrête pas).
export async function initAudio(): Promise<void> {
  try {
    await setAudioModeAsync({ playsInSilentMode: true, interruptionMode: 'mixWithOthers' });
  } catch {
    // Sans audio, l'app fonctionne quand même.
  }
}

// Joue un effet sonore, si le réglage "Effets sonores" est activé.
export function playSound(name: SoundName): void {
  if (!useUserStore.getState().soundEnabled) return;

  try {
    const player =
      players[name] ??
      createAudioPlayer(Platform.OS === 'web' ? webUri(synthesize(name)) : SOURCES[name]);
    players[name] = player;

    // On repart du début : le son peut être joué plusieurs fois de suite (ex. tuiles).
    const start = () => {
      try {
        player.play();
      } catch {
        // Son ignoré si le téléphone refuse la lecture.
      }
    };
    void player.seekTo(0).then(start, start);
  } catch {
    // Un son qui ne joue pas ne doit jamais bloquer l'app.
  }
}

let musicPlayer: AudioPlayer | undefined;

// Lance (ou reprend) la musique du chemin, si le réglage "Musique" est activé.
export function startPathMusic(): void {
  if (!useUserStore.getState().musicEnabled) return;

  try {
    if (!musicPlayer) {
      const source = Platform.OS === 'web' ? webUri(synthesizeMusic()) : MUSIC_SOURCE;
      musicPlayer = createAudioPlayer(source);
      musicPlayer.loop = true;
      musicPlayer.volume = MUSIC_VOLUME;
    }
    musicPlayer.play();
  } catch {
    // Sans musique, le chemin reste utilisable.
  }
}

// Met la musique en pause (quand on quitte le chemin). Elle reprend là où elle s'est arrêtée.
export function stopPathMusic(): void {
  try {
    musicPlayer?.pause();
  } catch {
    // Rien à arrêter.
  }
}
