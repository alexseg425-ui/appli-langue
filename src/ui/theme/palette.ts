// Couleurs de l'app. Chaque couleur existe en mode clair et en mode sombre.
export const palettes = {
  light: {
    background: '#FFF7EC',
    surface: '#FFFFFF',
    text: '#3B2A1A',
    textMuted: '#7A6A5A',
    border: '#EBDCC8',
    primary: '#FF8A3D', // couleur d'accent (remplacée par la couleur de la langue)
    correct: '#2FB86E',
    correctStrong: '#1F8A52', // vert assez foncé pour du texte blanc lisible
    correctDeep: '#14653A',
    almost: '#F2B233',
    wrong: '#EF5350',
    locked: '#D9CFC4',
    selected: '#FFF1E0',
    onColor: '#FFFFFF',
  },
  dark: {
    background: '#1E1812',
    surface: '#2C241C',
    text: '#FFF4E6',
    textMuted: '#B9A894',
    border: '#4A3C2E',
    primary: '#FF9B57',
    correct: '#3FCB80',
    correctStrong: '#1F8A52',
    correctDeep: '#14653A',
    almost: '#F5BE4F',
    wrong: '#FF6B68',
    locked: '#4A4038',
    selected: '#3A2E23',
    onColor: '#FFFFFF',
  },
};

export type Palette = typeof palettes.light;
export type ColorScheme = keyof typeof palettes;
