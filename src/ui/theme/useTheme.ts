// Renvoie les couleurs à utiliser : mode clair/sombre + couleur d'accent de la langue apprise.
import { useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { getLanguageContent } from '../../engine/content/registry';
import { useUserStore } from '../../store/userStore';
import { ColorScheme, Palette, palettes } from './palette';

// Assombrit une couleur "#RRGGBB" (pour l'ombre 3D des boutons).
export function darken(hex: string, amount: number): string {
  const value = parseInt(hex.slice(1), 16);
  const channel = (shift: number) =>
    Math.round(((value >> shift) & 0xff) * (1 - amount))
      .toString(16)
      .padStart(2, '0');
  return `#${channel(16)}${channel(8)}${channel(0)}`;
}

export interface ThemeColors extends Palette {
  accent: string;
  accentShadow: string;
}

export function useTheme(): { scheme: ColorScheme; colors: ThemeColors } {
  const systemScheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const preference = useUserStore((state) => state.themePreference);
  const activeLanguage = useUserStore((state) => state.activeLanguage);

  const scheme: ColorScheme = preference === 'system' ? systemScheme : preference;
  const accent = activeLanguage
    ? (getLanguageContent(activeLanguage)?.config.accent ?? palettes[scheme].primary)
    : palettes[scheme].primary;

  const colors = useMemo<ThemeColors>(
    () => ({ ...palettes[scheme], primary: accent, accent, accentShadow: darken(accent, 0.3) }),
    [scheme, accent],
  );

  return { scheme, colors };
}
