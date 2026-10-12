// Fabrique un plugin de langue à partir de ses règles de correction (lues dans config.json).
import { levenshtein } from '../utils/levenshtein';
import type { LanguagePlugin, Verdict } from './types';

export interface CorrectionRules {
  ignoreCase: boolean; // majuscules ignorées
  ignorePunctuation: boolean; // ponctuation ignorée (? ! ¿ ¡ . , …)
  accentsOptional: boolean; // accent oublié = "presque"
  typoTolerance: number; // nombre de lettres fausses tolérées ("presque")
}

export interface PluginOptions {
  code: string;
  specialChars: string[];
  correction: CorrectionRules;
}

const PUNCTUATION = /[.,;:!?¡¿…«»"“”]/g;

// Enlève les accents : "adiós" -> "adios", "niño" -> "nino".
export function stripAccents(text: string): string {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '');
}

export function createPlugin({ code, specialChars, correction }: PluginOptions): LanguagePlugin {
  const normalize = (text: string): string => {
    let result = text.trim().replace(/\s+/g, ' ');
    if (correction.ignoreCase) result = result.toLowerCase();
    if (correction.ignorePunctuation) {
      result = result.replace(PUNCTUATION, '').replace(/\s+/g, ' ').trim();
    }
    return result.normalize('NFC');
  };

  const compare = (input: string, accepted: string[]): Verdict => {
    const typed = normalize(input);
    if (typed === '') return 'wrong';

    const targets = accepted.map(normalize);

    // 1. Une réponse parfaite gagne toujours, même si une autre est "presque".
    if (targets.includes(typed)) return 'correct';

    // 2. Ensuite on regarde les réponses "presque".
    const typedWithoutAccents = stripAccents(typed);
    for (const target of targets) {
      if (correction.accentsOptional && stripAccents(target) === typedWithoutAccents) {
        return 'almost';
      }
      // On ne tolère les fautes que sur les mots assez longs (évite les faux "presque").
      if (
        correction.typoTolerance > 0 &&
        target.length >= 5 &&
        levenshtein(typed, target) <= correction.typoTolerance
      ) {
        return 'almost';
      }
    }
    return 'wrong';
  };

  return {
    code,
    specialChars,
    tokenize: (sentence) => sentence.trim().split(/\s+/).filter(Boolean),
    normalize,
    compare,
  };
}
