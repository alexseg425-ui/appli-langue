// Barre de progression de la leçon (de 0 à 1).
import { StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useTheme } from '../theme/useTheme';

export function ProgressBar({ progress }: { progress: number }) {
  const { colors } = useTheme();
  const clamped = Math.min(1, Math.max(0, progress));

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped * 100) }}
      style={[styles.track, { backgroundColor: colors.border }]}
    >
      <Animated.View
        style={[styles.fill, { width: `${clamped * 100}%`, backgroundColor: colors.accent }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { height: 14, borderRadius: 7, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 7 },
});
