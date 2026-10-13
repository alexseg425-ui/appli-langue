// Chispa, la mascotte : un caméléon. Il flotte doucement pour rester vivant à l'écran.
// Sa couleur suit la couleur d'accent de la langue apprise.
import { useEffect } from 'react';
import { Text } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../theme/useTheme';

export function Chispa({ size = 96 }: { size?: number }) {
  const { colors } = useTheme();
  const float = useSharedValue(0);

  useEffect(() => {
    float.value = withRepeat(
      withSequence(
        withTiming(-6, { duration: 1100, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 1100, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
    );
  }, [float]);

  const floatStyle = useAnimatedStyle(() => ({ transform: [{ translateY: float.value }] }));

  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no"
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: colors.accent,
          alignItems: 'center',
          justifyContent: 'center',
          borderBottomWidth: size / 16,
          borderBottomColor: colors.accentShadow,
        },
        floatStyle,
      ]}
    >
      <Text style={{ fontSize: size * 0.5 }}>🦎</Text>
    </Animated.View>
  );
}
