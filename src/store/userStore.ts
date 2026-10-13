// Réglages et choix de l'utilisateur : langues, thème, fin de l'onboarding.
// Sauvegardé sur le téléphone (AsyncStorage) : il survit à la fermeture de l'app.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { InterfaceLanguageCode } from '../i18n/languages';

export type ThemePreference = 'system' | 'light' | 'dark';

interface UserState {
  interfaceLanguage: InterfaceLanguageCode | null; // null = pas encore choisie
  themePreference: ThemePreference;
  learningLanguages: string[];
  activeLanguage: string | null; // langue apprise affichée sur le chemin
  onboardingDone: boolean;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  musicEnabled: boolean;
  setMusicEnabled: (enabled: boolean) => void;
  setInterfaceLanguage: (code: InterfaceLanguageCode) => void;
  setThemePreference: (preference: ThemePreference) => void;
  setActiveLanguage: (code: string) => void;
  completeOnboarding: (learningLanguage: string) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      interfaceLanguage: null,
      themePreference: 'system',
      learningLanguages: [],
      activeLanguage: null,
      onboardingDone: false,
      soundEnabled: true,
      setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
      musicEnabled: true,
      setMusicEnabled: (enabled) => set({ musicEnabled: enabled }),
      setInterfaceLanguage: (code) => set({ interfaceLanguage: code }),
      setThemePreference: (preference) => set({ themePreference: preference }),
      setActiveLanguage: (code) => set({ activeLanguage: code }),
      completeOnboarding: (learningLanguage) =>
        set((state) => ({
          learningLanguages: state.learningLanguages.includes(learningLanguage)
            ? state.learningLanguages
            : [...state.learningLanguages, learningLanguage],
          activeLanguage: learningLanguage,
          onboardingDone: true,
        })),
    }),
    {
      name: 'chispa-user',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
