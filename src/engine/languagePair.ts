// Règle "pas de même langue" : la langue de l'interface ne peut pas être la langue apprise.
// (ex. pas de français expliqué en français).
export function canPair(interfaceLang: string, learningLang: string | null | undefined): boolean {
  return !learningLang || interfaceLang !== learningLang;
}
