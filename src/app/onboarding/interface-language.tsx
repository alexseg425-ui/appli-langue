// Onboarding, étape 1 : choisir la langue de l'interface (proposée d'après le téléphone).
import { useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { detectDeviceLanguage } from '../../i18n';
import { resolveInterfaceLanguage } from '../../i18n/detect';
import { INTERFACE_LANGUAGES, InterfaceLanguageCode } from '../../i18n/languages';
import { useUserStore } from '../../store/userStore';
import { Button3D } from '../../ui/components/Button3D';
import { Chispa } from '../../ui/components/Chispa';
import { OptionList } from '../../ui/components/OptionList';
import { Screen } from '../../ui/components/Screen';
import { useTheme } from '../../ui/theme/useTheme';

export default function InterfaceLanguageScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { colors } = useTheme();
  const setInterfaceLanguage = useUserStore((state) => state.setInterfaceLanguage);

  const detected = detectDeviceLanguage();
  const [selected, setSelected] = useState<InterfaceLanguageCode>(
    resolveInterfaceLanguage(useUserStore.getState().interfaceLanguage ?? detected),
  );

  const options = INTERFACE_LANGUAGES.map((language) => ({
    code: language.code,
    label: language.label,
    flag: language.flag,
    hint: language.code === detected ? t('onboarding.interfaceDetected') : undefined,
  }));

  const onContinue = () => {
    setInterfaceLanguage(selected);
    router.push('/onboarding/learn-language');
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <Chispa size={96} />
        <Text style={[styles.title, { color: colors.text }]}>{t('onboarding.welcomeTitle')}</Text>
        <Text style={[styles.question, { color: colors.text }]}>
          {t('onboarding.interfaceTitle')}
        </Text>
        <OptionList
          options={options}
          selected={selected}
          onSelect={(code) => setSelected(code as InterfaceLanguageCode)}
        />
        <Button3D label={t('onboarding.next')} onPress={onContinue} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, gap: 18, alignItems: 'stretch' },
  title: { fontSize: 28, fontWeight: '800', textAlign: 'center' },
  question: { fontSize: 18, fontWeight: '700' },
});
