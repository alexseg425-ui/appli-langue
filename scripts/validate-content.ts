// Vérifie tout le contenu (JSON) : commande "npm run validate:content".
import { buildLanguageContent } from '../src/engine/content/buildLanguageContent';
import { RAW_CONTENT } from '../src/generated/contentIndex';

let hasErrors = false;

for (const [code, raw] of Object.entries(RAW_CONTENT)) {
  const { content, issues } = buildLanguageContent(code, raw);

  if (issues.length === 0) {
    console.log(`✅ ${code} : contenu valide`);
    continue;
  }

  // Sans "content", la langue ne peut pas être affichée dans l'app.
  if (!content) hasErrors = true;
  console.log(`${content ? '⚠️' : '❌'} ${code} : ${issues.length} problème(s)`);
  for (const issue of issues) {
    console.log(`   - ${issue.file} → ${issue.message}`);
  }
}

process.exit(hasErrors ? 1 : 0);
