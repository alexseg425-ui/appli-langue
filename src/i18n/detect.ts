// Choisit la langue de l'interface à partir du code du téléphone (ex. "fr-FR" -> "fr").
// Pur (sans React) pour pouvoir être testé.
import { InterfaceLanguageCode, isInterfaceLanguage } from './languages';

// Langue utilisée si celle du téléphone n'est pas prise en charge.
export const FALLBACK_INTERFACE_LANGUAGE: InterfaceLanguageCode = 'en';

export function resolveInterfaceLanguage(code: string | null | undefined): InterfaceLanguageCode {
  const base = (code ?? '').toLowerCase().split(/[-_]/)[0] ?? '';
  return isInterfaceLanguage(base) ? base : FALLBACK_INTERFACE_LANGUAGE;
}
