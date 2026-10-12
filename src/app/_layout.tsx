// Cadre racine de l'app : initialise la langue, attend la lecture des données, puis affiche les écrans.
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import i18next, { detectDeviceLanguage } from '../i18n';
import { useStoresReady } from '../store/useStoresReady';
import { useUserStore } from '../store/userStore';
import { useTheme } from '../ui/theme/useTheme';

export default function RootLayout() {
  const ready = useStoresReady();
  const interfaceLanguage = useUserStore((state) => state.interfaceLanguage);
  const { scheme, colors } = useTheme();

  // Dès que la langue de l'interface change (réglages ou onboarding), tous les textes changent.
  // Pas besoin de redémarrer l'app : react-i18next met à jour les écrans tout seul.
  useEffect(() => {
    if (!ready) return;
    void i18next.changeLanguage(interfaceLanguage ?? detectDeviceLanguage());
  }, [ready, interfaceLanguage]);

  if (!ready) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}
      />
    </>
  );
}
