// Réglages : langue de l'interface (changement immédiat) et thème.
import { ScrollView, StyleSheet, Pressable, Switch, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { canPair } from '../../engine/languagePair';
import { resolveInterfaceLanguage } from '../../i18n/detect';
import { INTERFACE_LANGUAGES, InterfaceLanguageCode } from '../../i18n/languages';
import { ThemePreference, useUserStore } from '../../store/userStore';
import { OptionList } from '../../ui/components/OptionList';
import { Screen } from '../../ui/components/Screen';
import { useTheme } from '../../ui/theme/useTheme';

const THEMES: ThemePreference[] = ['system', 'light', 'dark'];

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const currentLanguage = resolveInterfaceLanguage(i18n.language);

  const activeLanguage = useUserStore((state) => state.activeLanguage);
  const setInterfaceLanguage = useUserStore((state) => state.setInterfaceLanguage);
  const soundEnabled = useUserStore((state) => state.soundEnabled);
  const setSoundEnabled = useUserStore((state) => state.setSoundEnabled);
  const themePreference = useUserStore((state) => state.themePreference);
  const setThemePreference = useUserStore((state) => state.setThemePreference);

  // Une langue déjà apprise ne peut pas servir à l'explication : on la grise.
  const languageOptions = INTERFACE_LANGUAGES.map((language) => {
    const allowed = canPair(language.code, activeLanguage);
    return {
      code: language.code,
      label: language.label,
      flag: language.flag,
      disabled: !allowed,
      hint: allowed ? undefined : t('settings.alreadyLearned'),
    };
  });

  const themeLabel: Record<ThemePreference, string> = {
    system: t('settings.themeSystem'),
    light: t('settings.themeLight'),
    dark: t('settings.themeDark'),
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>{t('settings.title')}</Text>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t('settings.interfaceLanguage')}
          </Text>
          <Text style={{ color: colors.textMuted }}>{t('settings.interfaceHint')}</Text>
          <OptionList
            options={languageOptions}
            selected={currentLanguage}
            onSelect={(code) => setInterfaceLanguage(code as InterfaceLanguageCode)}
          />
        </View>

        <View
          style={[styles.soundRow, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <View style={{ flex: 1 }}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t('settings.sounds')}
            </Text>
            <Text style={{ color: colors.textMuted }}>{t('settings.soundsHint')}</Text>
          </View>
          <Switch
            value={soundEnabled}
            onValueChange={setSoundEnabled}
            trackColor={{ false: colors.border, true: colors.accent }}
            thumbColor={colors.onColor}
            accessibilityLabel={t('settings.sounds')}
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('settings.theme')}</Text>
          <View style={styles.segmented}>
            {THEMES.map((theme) => {
              const selected = theme === themePreference;
              return (
                <Pressable
                  key={theme}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  onPress={() => setThemePreference(theme)}
                  style={[
                    styles.segment,
                    {
                      backgroundColor: selected ? colors.accentStrong : colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Text
                    style={{ color: selected ? colors.onColor : colors.text, fontWeight: '700' }}
                  >
                    {themeLabel[theme]}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 24 }}>
          {t('settings.version')}
        </Text>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 24 },
  title: { fontSize: 26, fontWeight: '800' },
  section: { gap: 10 },
  sectionTitle: { fontSize: 18, fontWeight: '800' },
  soundRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
  },
  segmented: { flexDirection: 'row', gap: 8 },
  segment: { flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: 14, borderWidth: 2 },
});
