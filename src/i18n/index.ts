// Initialisation de i18next (traductions de l'interface).
// Importer ce fichier une seule fois, au démarrage de l'app.
import i18next from 'i18next';
import { getLocales } from 'expo-localization';
import { initReactI18next } from 'react-i18next';
import { resolveInterfaceLanguage } from './detect';
import type { InterfaceLanguageCode } from './languages';
import en from './locales/en.json';
import fr from './locales/fr.json';

// Langue du téléphone, proposée par défaut au premier lancement.
export function detectDeviceLanguage(): InterfaceLanguageCode {
  return resolveInterfaceLanguage(getLocales()[0]?.languageCode);
}

if (!i18next.isInitialized) {
  void i18next.use(initReactI18next).init({
    resources: {
      fr: { translation: fr },
      en: { translation: en },
    },
    lng: detectDeviceLanguage(),
    fallbackLng: 'en',
    supportedLngs: ['fr', 'en'],
    load: 'languageOnly',
    interpolation: { escapeValue: false }, // React protège déjà l'affichage
  });
}

export default i18next;
