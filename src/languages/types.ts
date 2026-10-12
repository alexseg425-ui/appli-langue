// Interface commune à toutes les langues : "plugin de langue".
// Le moteur ne connaît que cette interface ; chaque langue fournit ses règles.

// Résultat d'une réponse : juste, presque (accent oublié, petite faute) ou fausse.
export type Verdict = 'correct' | 'almost' | 'wrong';

export interface LanguagePlugin {
  code: string;
  specialChars: string[]; // lettres affichées au-dessus du clavier
  tokenize: (sentence: string) => string[]; // découpe une phrase en mots (tuiles)
  normalize: (text: string) => string; // met un texte sous une forme comparable
  compare: (input: string, accepted: string[]) => Verdict; // compare avec les réponses acceptées
}
