// Gros bouton "3D" : une ombre en bas qui s'enfonce et un léger rebond à l'appui.
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { playSound } from '../../audio/sounds';
import { useTheme } from '../theme/useTheme';

type Variant = 'primary' | 'correct' | 'secondary';

interface Props {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  silent?: boolean; // true = pas de son "tap" (le bouton déclenche déjà son propre son)
  style?: ViewStyle;
}

export function Button3D({ label, onPress, variant = 'primary', disabled, silent, style }: Props) {
  const { colors } = useTheme();
  const [isPressed, setIsPressed] = useState(false);
  const scale = useSharedValue(1);
  // Le ressort se déclenche ici (et non dans le toucher) : le bouton rebondit à chaque appui.
  useEffect(() => {
    scale.value = withSpring(isPressed ? 0.96 : 1, { damping: 12, stiffness: 280 });
  }, [isPressed, scale]);
  const pressStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const look = {
    primary: { background: colors.accentStrong, shadow: colors.accentDeep, text: colors.onColor },
    correct: { background: colors.correctStrong, shadow: colors.correctDeep, text: colors.onColor },
    secondary: { background: colors.surface, shadow: colors.border, text: colors.text },
  }[variant];

  const handlePress = () => {
    if (disabled) return;
    if (!silent) playSound('tap');
    onPress();
  };

  return (
    <Animated.View style={[pressStyle, style]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled: !!disabled }}
        onPress={handlePress}
        onPressIn={() => setIsPressed(true)}
        onPressOut={() => setIsPressed(false)}
        disabled={disabled}
        style={({ pressed }) => [
          styles.base,
          {
            backgroundColor: disabled ? colors.locked : look.background,
            borderBottomColor: disabled ? colors.locked : look.shadow,
            borderBottomWidth: pressed ? 2 : 6,
            marginTop: pressed ? 4 : 0,
          },
        ]}
      >
        <Text style={[styles.label, { color: disabled ? colors.text : look.text }]}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 56,
    borderRadius: 18,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { fontSize: 17, fontWeight: '800' },
});
