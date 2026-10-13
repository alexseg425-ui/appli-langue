// Fabrique UNE seule page HTML à partir du build web (npx expo export --platform web).
// Pourquoi ? Une page unique s'ouvre partout (navigateur du téléphone, aperçu partagé)
// sans serveur ni chemins à corriger : le JavaScript de l'app est intégré dans la page.
// La page produite est un "fragment" : sans <!doctype>, <html>, <head> ni <body>,
// car la publication Claude ajoute elle-même cette enveloppe.
// Usage : npx tsx scripts/build-web-single.ts <dossier-du-build> <fichier-de-sortie.html>
import fs from 'node:fs';
import path from 'node:path';

const [distArg, outArg] = process.argv.slice(2);
if (!distArg || !outArg) {
  console.error('Usage : npx tsx scripts/build-web-single.ts <dossier-du-build> <fichier-de-sortie.html>');
  process.exit(1);
}

const dist = path.resolve(distArg);
let html = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');

// 1. Le script principal de l'app (un seul fichier, sans morceaux à charger à part).
const scriptTag = html.match(/<script src="(\/_expo\/static\/js\/web\/[^"]+\.js)"[^>]*><\/script>/);
if (!scriptTag) throw new Error('Script de l\'app introuvable dans index.html');

let code = fs.readFileSync(path.join(dist, scriptTag[1]!), 'utf8');
// Un "</script>" dans le code couperait la page : on le neutralise.
code = code.replace(/<\/script/gi, '<\\/script').replace(/<!--/g, '<\\!--');
html = html.replace(scriptTag[0], () => `<script>${code}</script>`);

// 2. L'icône pointe vers un fichier absent de la page unique : on la retire.
html = html.replace(/<link rel="icon"[^>]*>/, '');

// 3. Adresse : si la page est ouverte avec un chemin (ex. /artifact/abc),
// l'app ne sait pas quoi afficher. On revient à la racine avant son démarrage.
const pathFix = `<script>(function(){try{if(location.pathname!=='/'){history.replaceState(null,'','/'+location.search+location.hash);}}catch(e){}})();</script>`;

// 4. Titre court et fond de couleur crème dès le chargement (pas d'écran blanc).
html = html
  .replace(/<title>[^<]*<\/title>/, '<title>Chispa, app de langues</title>')
  .replace('</head>', `<style>html,body,#root{box-sizing:border-box}body{background:#FFF7EC;color-scheme:light dark}</style>${pathFix}\n</head>`);


// 5. Fragment : on retire l'enveloppe du document (la publication l'ajoute).
const headInner = html.match(/<head>([\s\S]*)<\/head>/)?.[1] ?? '';
const bodyInner = html.match(/<body>([\s\S]*)<\/body>/)?.[1] ?? '';
const cleanedHead = headInner.replace(/<meta charset[^>]*>|<meta httpEquiv[^>]*>|<meta name="viewport"[^>]*>/g, '');
html = `${cleanedHead.trim()}\n${bodyInner.trim()}\n`;

const output = path.resolve(outArg);
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, html);
console.log(`Page unique écrite : ${output} (${(fs.statSync(output).size / 1024 / 1024).toFixed(2)} Mo)`);
