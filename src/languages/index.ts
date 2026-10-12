// Point d'entrée des plugins de langue.
// Pour une langue "normale", il suffit de son config.json : le plugin est créé automatiquement.
// Une langue avec des spécificités (ex. le chinois) aura son propre fichier branché ici.
import type { LanguageConfig } from '../engine/content/schema';
import { createPlugin, CorrectionRules } from './createPlugin';
import type { LanguagePlugin } from './types';

export function getPlugin(config: LanguageConfig): LanguagePlugin {
  return createPlugin({
    code: config.code,
    specialChars: config.specialChars,
    correction: config.correction,
  });
}

// Règles de correction pour la langue de l'interface (quand l'utilisateur répond dans sa langue).
const UI_CORRECTION: CorrectionRules = {
  ignoreCase: true,
  ignorePunctuation: true,
  accentsOptional: true,
  typoTolerance: 1,
};

// Caractères spéciaux proposés quand l'utilisateur écrit dans sa propre langue.
export const UI_SPECIAL_CHARS: Record<string, string[]> = {
  fr: ['é', 'è', 'ê', 'à', 'â', 'ç', 'ù', 'û', 'ô', 'î', 'ï', 'ë', 'œ'],
  en: [],
};

export function getUiPlugin(code: string): LanguagePlugin {
  return createPlugin({
    code,
    specialChars: UI_SPECIAL_CHARS[code] ?? [],
    correction: UI_CORRECTION,
  });
}
