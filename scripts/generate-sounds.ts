// Génère les fichiers WAV des effets sonores dans assets/sounds/.
// Lancer : npm run sounds:generate (à relancer seulement si on modifie src/audio/synth.ts)
import fs from 'node:fs';
import path from 'node:path';
import { encodeWav, SOUND_NAMES, synthesize } from '../src/audio/synth';

const OUTPUT_DIR = path.resolve(__dirname, '..', 'assets', 'sounds');
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

for (const name of SOUND_NAMES) {
  const file = path.join(OUTPUT_DIR, `${name}.wav`);
  fs.writeFileSync(file, Buffer.from(encodeWav(synthesize(name))));
  console.log(`✅ ${name}.wav`);
}
