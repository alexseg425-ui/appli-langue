// Écran de fin de leçon : résultat, XP gagnés, confettis et mot de la mascotte.
import { StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Button3D } from '../../ui/components/Button3D';
import { Chispa } from '../../ui/components/Chispa';
import { Confetti } from '../../ui/components/Confetti';
import { Screen } from '../../ui/components/Screen';
import { useTheme } from '../../ui/theme/useTheme';

export default function ResultsScreen() {
  const params = useLocalSearchParams<{ xp?: string; perfect?: string; mistakes?: string }>();
  const { t } = useTranslation();
  const router = useRouter();
  const { colors } = useTheme();

  const xp = Number(params.xp ?? 0);
  const perfect = params.perfect === '1';
  const mistakes = Number(params.mistakes ?? 0);

  return (
    <Screen>
      <Confetti />
      <View style={styles.content}>
        <Chispa size={120} />
        <Text style={[styles.title, { color: colors.text }]}>{t('results.title')}</Text>
        <Text style={[styles.xp, { color: colors.accent }]}>{t('results.xp', { xp })}</Text>
        {perfect ? (
          <Text style={[styles.badge, { color: colors.correct }]}>{t('results.perfect')}</Text>
        ) : null}
        <Text style={{ color: colors.textMuted }}>
          {t('results.mistakes', { count: mistakes })}
        </Text>
        <Text style={[styles.mascot, { color: colors.text }]}>{t('results.mascot')}</Text>
      </View>
      <View style={styles.footer}>
        <Button3D label={t('results.continue')} onPress={() => router.replace('/(tabs)/path')} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, padding: 24 },
  title: { fontSize: 30, fontWeight: '800', textAlign: 'center' },
  xp: { fontSize: 28, fontWeight: '900' },
  badge: { fontSize: 18, fontWeight: '800' },
  mascot: { fontSize: 16, fontWeight: '600', textAlign: 'center', marginTop: 8 },
  footer: { padding: 20 },
});
