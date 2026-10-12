// Chispa, la mascotte : un caméléon. Pour l'instant, un simple rond coloré avec un emoji.
// Sa couleur suit la couleur d'accent de la langue apprise.
import { Text, View } from 'react-native';
import { useTheme } from '../theme/useTheme';

export function Chispa({ size = 96 }: { size?: number }) {
  const { colors } = useTheme();
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no"
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: colors.accent,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ fontSize: size * 0.5 }}>🦎</Text>
    </View>
  );
}
