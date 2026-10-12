// Langues proposées pour l'INTERFACE de l'app.
// Pour en ajouter une (ex. l'espagnol) : ajouter une ligne ici ET un fichier src/i18n/locales/<code>.json.
export const INTERFACE_LANGUAGES = [
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
] as const;

export type InterfaceLanguageCode = (typeof INTERFACE_LANGUAGES)[number]['code'];

export function isInterfaceLanguage(code: string): code is InterfaceLanguageCode {
  return INTERFACE_LANGUAGES.some((language) => language.code === code);
}
