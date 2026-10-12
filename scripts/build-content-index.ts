// Crée src/generated/contentIndex.ts : la liste de tous les fichiers de contenu.
// Pourquoi ? Une application mobile ne peut pas "lire un dossier" au lancement :
// chaque fichier JSON doit être importé explicitement. Ce script le fait pour nous.
// Lancer : npm run content:index (appelé automatiquement avant npm start et npm test)
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(__dirname, '..');
const CONTENT_DIR = path.join(ROOT, 'content');
const OUTPUT = path.join(ROOT, 'src', 'generated', 'contentIndex.ts');

const imports: string[] = [];
const entries: string[] = [];
let counter = 0;

// Ajoute un "import" au fichier généré et renvoie le nom de la variable créée.
function importJson(relativePath: string): string {
  const name = `file_${counter++}`;
  imports.push(`import ${name} from '../../content/${relativePath}';`);
  return name;
}

// Liste les fichiers .json d'un dossier (dossier absent = liste vide).
function jsonFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith('.json'))
    .sort();
}

for (const code of fs.readdirSync(CONTENT_DIR).sort()) {
  const langDir = path.join(CONTENT_DIR, code);
  if (!fs.statSync(langDir).isDirectory()) continue;

  const config = importJson(`${code}/config.json`);
  const characters = fs.existsSync(path.join(langDir, 'characters.json'))
    ? `{ file: 'characters.json', data: ${importJson(`${code}/characters.json`)} }`
    : 'null';
  const units = jsonFiles(path.join(langDir, 'units')).map(
    (file) => `{ file: 'units/${file}', data: ${importJson(`${code}/units/${file}`)} }`,
  );
  const tips = jsonFiles(path.join(langDir, 'tips')).map(
    (file) => `{ file: 'tips/${file}', data: ${importJson(`${code}/tips/${file}`)} }`,
  );

  entries.push(`  '${code}': {
    config: { file: 'config.json', data: ${config} },
    characters: ${characters},
    units: [${units.join(', ')}],
    tips: [${tips.join(', ')}],
  },`);
}

const output = `// FICHIER GÉNÉRÉ par scripts/build-content-index.ts : ne pas le modifier à la main.
${imports.join('\n')}

export const RAW_CONTENT = {
${entries.join('\n')}
};
`;

fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
fs.writeFileSync(OUTPUT, output);
console.log(`Index du contenu généré : ${entries.length} langue(s), ${imports.length} fichier(s).`);
