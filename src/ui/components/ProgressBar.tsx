// Barre de progression de la leçon (de 0 à 1). La barre glisse jusqu'à sa nouvelle valeur.
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useTheme } from '../theme/useTheme';

export function ProgressBar({ progress }: { progress: number }) {
  const { colors } = useTheme();
  const clamped = Math.min(1, Math.max(0, progress));
  const width = useSharedValue(clamped);

  useEffect(() => {
    width.value = withTiming(clamped, { duration: 450 });
  }, [clamped, width]);

  const fillStyle = useAnimatedStyle(() => ({ width: `${width.value * 100}%` }));

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped * 100) }}
      style={[styles.track, { backgroundColor: colors.border }]}
    >
      <Animated.View style={[styles.fill, { backgroundColor: colors.accent }, fillStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { height: 14, borderRadius: 7, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 7 },
});
