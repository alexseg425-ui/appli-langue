// Un texte traduit se présente sous la forme { fr: "...", en: "..." }.
export type LocalizedText = Record<string, string>;

// Renvoie le texte dans la langue demandée.
// Si la traduction manque, on prend l'anglais, puis n'importe quelle langue disponible.
export function pickText(text: LocalizedText | undefined, lang: string, fallback = 'en'): string {
  if (!text) return '';
  return text[lang] ?? text[fallback] ?? Object.values(text)[0] ?? '';
}
