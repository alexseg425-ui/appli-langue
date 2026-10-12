// Gros bouton "3D" : une ombre en bas qui s'enfonce quand on appuie dessus.
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { useTheme } from '../theme/useTheme';

type Variant = 'primary' | 'correct' | 'secondary';

interface Props {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  style?: ViewStyle;
}

export function Button3D({ label, onPress, variant = 'primary', disabled, style }: Props) {
  const { colors } = useTheme();

  const look = {
    primary: { background: colors.accent, shadow: colors.accentShadow, text: colors.onColor },
    correct: { background: colors.correct, shadow: '#1D8A4E', text: colors.onColor },
    secondary: { background: colors.surface, shadow: colors.border, text: colors.text },
  }[variant];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: disabled ? colors.locked : look.background,
          borderBottomColor: disabled ? colors.locked : look.shadow,
          borderBottomWidth: pressed ? 2 : 6,
          marginTop: pressed ? 4 : 0,
        },
        style,
      ]}
    >
      <Text style={[styles.label, { color: look.text }]}>{label}</Text>
    </Pressable>
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
