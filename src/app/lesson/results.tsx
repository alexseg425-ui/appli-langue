// Écran de fin de leçon : résultat, XP gagnés (qui s'affichent en comptant), confettis et mascotte.
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { Button3D } from '../../ui/components/Button3D';
import { Chispa } from '../../ui/components/Chispa';
import { Confetti } from '../../ui/components/Confetti';
import { Screen } from '../../ui/components/Screen';
import { useTheme } from '../../ui/theme/useTheme';

// Compte de 0 jusqu'à "target" en une vingtaine de petites étapes.
function useCountUp(target: number, duration: number): number {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const steps = Math.max(1, Math.min(target, 20));
    let step = 0;
    const id = setInterval(() => {
      step++;
      setValue(Math.round((target * step) / steps));
      if (step >= steps) clearInterval(id);
    }, duration / steps);
    return () => clearInterval(id);
  }, [target, duration]);

  return value;
}

export default function ResultsScreen() {
  const params = useLocalSearchParams<{ xp?: string; perfect?: string; mistakes?: string }>();
  const { t } = useTranslation();
  const router = useRouter();
  const { colors } = useTheme();

  const xp = Number(params.xp ?? 0);
  const perfect = params.perfect === '1';
  const mistakes = Number(params.mistakes ?? 0);
  const shownXp = useCountUp(xp, 900);

  return (
    <Screen>
      <LinearGradient
        colors={[colors.accent, colors.background]}
        locations={[0, 0.6]}
        style={StyleSheet.absoluteFill}
      />
      <Confetti />
      <View style={styles.content}>
        <Animated.View entering={ZoomIn.springify()}>
          <Chispa size={120} />
        </Animated.View>
        <Animated.Text
          entering={FadeInDown.delay(150)}
          style={[styles.title, { color: colors.text }]}
        >
          {t('results.title')}
        </Animated.Text>
        <Animated.Text entering={FadeInDown.delay(300)} style={[styles.xp, { color: colors.text }]}>
          {t('results.xp', { xp: shownXp })}
        </Animated.Text>
        {perfect ? (
          <Animated.Text
            entering={FadeInDown.delay(450)}
            style={[styles.badge, { color: colors.correct }]}
          >
            {t('results.perfect')}
          </Animated.Text>
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
  xp: { fontSize: 34, fontWeight: '900' },
  badge: { fontSize: 18, fontWeight: '800' },
  mascot: { fontSize: 16, fontWeight: '600', textAlign: 'center', marginTop: 8 },
  footer: { padding: 20 },
});
