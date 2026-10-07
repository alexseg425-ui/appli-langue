import { Stack } from 'expo-router';

// Layout racine : c'est le "cadre" qui entoure tous les écrans de l'app.
export default function RootLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
