// Liste de choix (langues) avec un rond à cocher. Une option peut être désactivée avec une explication.
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/useTheme';

export interface OptionItem {
  code: string;
  label: string;
  flag: string;
  disabled?: boolean;
  hint?: string;
}

interface Props {
  options: OptionItem[];
  selected: string | null;
  onSelect: (code: string) => void;
}

export function OptionList({ options, selected, onSelect }: Props) {
  const { colors } = useTheme();

  return (
    <View style={{ gap: 10 }}>
      {options.map((option) => {
        const isSelected = option.code === selected;
        return (
          <Pressable
            key={option.code}
            accessibilityRole="radio"
            accessibilityState={{ selected: isSelected, disabled: !!option.disabled }}
            disabled={option.disabled}
            onPress={() => onSelect(option.code)}
            style={[
              styles.row,
              {
                backgroundColor: isSelected ? colors.selected : colors.surface,
                borderColor: isSelected ? colors.accent : colors.border,
                opacity: option.disabled ? 0.45 : 1,
              },
            ]}
          >
            <Text style={styles.flag}>{option.flag}</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: colors.text }]}>{option.label}</Text>
              {option.hint ? (
                <Text style={[styles.hint, { color: colors.textMuted }]}>{option.hint}</Text>
              ) : null}
            </View>
            <View style={[styles.radio, { borderColor: colors.accent }]}>
              {isSelected ? (
                <View style={[styles.dot, { backgroundColor: colors.accent }]} />
              ) : null}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
  },
  flag: { fontSize: 28 },
  label: { fontSize: 17, fontWeight: '700' },
  hint: { fontSize: 13, marginTop: 2 },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: { width: 10, height: 10, borderRadius: 5 },
});
