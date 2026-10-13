// Lecture des effets sonores. Chaque son est créé une seule fois, puis rejoué.
import { AudioPlayer, AudioSource, createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { Platform } from 'react-native';
import { useUserStore } from '../store/userStore';
import { encodeWav, SoundName, synthesize, toBase64 } from './synth';

// Fichiers générés par scripts/generate-sounds.ts (voir src/audio/synth.ts).
const SOURCES: Record<SoundName, number> = {
  tap: require('../../assets/sounds/tap.wav'),
  correct: require('../../assets/sounds/correct.wav'),
  almost: require('../../assets/sounds/almost.wav'),
  wrong: require('../../assets/sounds/wrong.wav'),
  combo: require('../../assets/sounds/combo.wav'),
  complete: require('../../assets/sounds/complete.wav'),
  heartLost: require('../../assets/sounds/heartLost.wav'),
};

const players: Partial<Record<SoundName, AudioPlayer>> = {};

// Sur le web, la page doit fonctionner toute seule (sans fichiers à côté) :
// le son est donc fabriqué et intégré directement dans la page.
function sourceFor(name: SoundName): AudioSource {
  if (Platform.OS === 'web') {
    return { uri: `data:audio/wav;base64,${toBase64(encodeWav(synthesize(name)))}` };
  }
  return SOURCES[name];
}

// À appeler une fois au démarrage. Les sons jouent même si le téléphone est en mode silencieux :
// seul le réglage "Sons" de l'app compte.
export async function initAudio(): Promise<void> {
  try {
    // Les effets se mélangent à la musique de l'utilisateur (elle ne s'arrête pas).
    await setAudioModeAsync({ playsInSilentMode: true, interruptionMode: 'mixWithOthers' });
  } catch {
    // Sans audio, l'app fonctionne quand même.
  }
}

// Joue un effet sonore, si le réglage "Sons" est activé.
export function playSound(name: SoundName): void {
  if (!useUserStore.getState().soundEnabled) return;

  try {
    const player = players[name] ?? createAudioPlayer(sourceFor(name));
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
