// Affiche le nombre de cœurs restants.
import { Text, View } from 'react-native';
import { useTheme } from '../theme/useTheme';

export function Hearts({ count }: { count: number }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      <Text style={{ fontSize: 18 }}>❤️</Text>
      <Text
        style={{ fontSize: 16, fontWeight: '800', color: count === 0 ? colors.wrong : colors.text }}
      >
        {count}
      </Text>
    </View>
  );
}
