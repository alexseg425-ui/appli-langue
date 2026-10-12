// Onboarding, étape 2 : choisir la langue à apprendre.
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { listLanguageCodes, getLanguageContent } from '../../engine/content/registry';
import { pickText } from '../../engine/content/localized';
import { canPair } from '../../engine/languagePair';
import { resolveInterfaceLanguage } from '../../i18n/detect';
import { useUserStore } from '../../store/userStore';
import { Button3D } from '../../ui/components/Button3D';
import { OptionList } from '../../ui/components/OptionList';
import { Screen } from '../../ui/components/Screen';
import { useTheme } from '../../ui/theme/useTheme';

export default function LearnLanguageScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { colors } = useTheme();
  const uiLang = resolveInterfaceLanguage(i18n.language);
  const completeOnboarding = useUserStore((state) => state.completeOnboarding);

  const options = useMemo(
    () =>
      listLanguageCodes().map((code) => {
        const config = getLanguageContent(code)!.config;
        const allowed = canPair(uiLang, code);
        return {
          code,
          label: pickText(config.name, uiLang),
          flag: config.flag,
          disabled: !allowed,
          hint: allowed ? config.nativeName : t('onboarding.sameLanguage'),
        };
      }),
    [uiLang, t],
  );

  const firstAllowed = options.find((option) => !option.disabled)?.code ?? null;
  const [selected, setSelected] = useState<string | null>(firstAllowed);

  const onStart = () => {
    if (!selected) return;
    completeOnboarding(selected);
    router.replace('/(tabs)/path');
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.question, { color: colors.text }]}>{t('onboarding.learnTitle')}</Text>
        <Text style={{ color: colors.textMuted }}>{t('onboarding.learnHint')}</Text>
        <OptionList options={options} selected={selected} onSelect={setSelected} />
        <Button3D label={t('onboarding.start')} onPress={onStart} disabled={!selected} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, gap: 18 },
  question: { fontSize: 26, fontWeight: '800' },
});
