// Génère les fichiers WAV de l'app : les effets sonores (assets/sounds/) et la musique du chemin (assets/music/).
// Lancer : npm run sounds:generate (à relancer si on modifie src/audio/synth.ts ou src/audio/music.ts)
import fs from 'node:fs';
import path from 'node:path';
import { synthesizeMusic } from '../src/audio/music';
import { encodeWav, SOUND_NAMES, synthesize } from '../src/audio/synth';

const ROOT = path.resolve(__dirname, '..', 'assets');

function writeWav(folder: string, name: string, samples: Float32Array) {
  const dir = path.join(ROOT, folder);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, `${name}.wav`), Buffer.from(encodeWav(samples)));
  console.log(`✅ ${folder}/${name}.wav`);
}

for (const name of SOUND_NAMES) writeWav('sounds', name, synthesize(name));
writeWav('music', 'chemin', synthesizeMusic());
