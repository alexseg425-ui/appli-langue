// Petits emojis qui tombent à l'écran de fin de leçon (animation Reanimated).
import { useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

const PIECES = ['🎉', '✨', '⭐', '🎊', '🔥'];

function Piece({ index }: { index: number }) {
  const progress = useSharedValue(0);
  const left = useMemo(() => `${(index * 37) % 100}%` as const, [index]);

  useEffect(() => {
    progress.value = withDelay(
      index * 40,
      withTiming(1, { duration: 1600, easing: Easing.out(Easing.quad) }),
    );
  }, [index, progress]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: progress.value * 650 }, { rotate: `${progress.value * 540}deg` }],
    opacity: 1 - progress.value * 0.5,
  }));

  return (
    <Animated.Text style={[styles.piece, { left }, style]}>
      {PIECES[index % PIECES.length]}
    </Animated.Text>
  );
}

export function Confetti({ count = 24 }: { count?: number }) {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {Array.from({ length: count }, (_, index) => (
        <Piece key={index} index={index} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  piece: { position: 'absolute', top: -30, fontSize: 22 },
});
