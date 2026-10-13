// Affiche le nombre de cœurs restants. Le cœur "saute" quand on en perd un.
import { useEffect, useRef } from 'react';
import { Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../theme/useTheme';

export function Hearts({ count }: { count: number }) {
  const { colors } = useTheme();
  const scale = useSharedValue(1);
  const previous = useRef(count);

  useEffect(() => {
    if (count < previous.current) {
      scale.value = withSequence(withTiming(1.35, { duration: 120 }), withSpring(1));
    }
    previous.current = count;
  }, [count, scale]);

  const popStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={[{ flexDirection: 'row', alignItems: 'center', gap: 4 }, popStyle]}>
      <Text style={{ fontSize: 18 }}>❤️</Text>
      <Text
        style={{ fontSize: 16, fontWeight: '800', color: count === 0 ? colors.wrong : colors.text }}
      >
        {count}
      </Text>
    </Animated.View>
  );
}
