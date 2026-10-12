// Affiche un exercice selon son type. Chaque type a sa propre vue, mais toutes
// remontent la réponse de la même façon : une chaîne de caractères via onChange.
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { Exercise } from '../../engine/content/schema';
import { pickText } from '../../engine/content/localized';
import type { LanguagePlugin, Verdict } from '../../languages/types';
import { UI_SPECIAL_CHARS } from '../../languages';
import { shuffle } from '../../utils/shuffle';
import { useTheme } from '../theme/useTheme';

interface Props {
  exercise: Exercise;
  uiLang: string;
  targetPlugin: LanguagePlugin;
  targetName: string; // nom de la langue apprise dans la langue de l'interface, ex. "l'espagnol"
  value: string;
  onChange: (value: string) => void;
  verdict: Verdict | null; // null tant que la réponse n'est pas vérifiée
}

export function ExerciseView(props: Props) {
  switch (props.exercise.type) {
    case 'translate_to_target':
      return <TilesExercise {...props} exercise={props.exercise} />;
    case 'translate_to_source':
      return <TypingExercise {...props} exercise={props.exercise} />;
    case 'image_choice':
      return <ImageExercise {...props} exercise={props.exercise} />;
  }
}

// Titre de la consigne, comme "Traduis vers l'espagnol".
function Instruction({ text }: { text: string }) {
  const { colors } = useTheme();
  return <Text style={[styles.instruction, { color: colors.textMuted }]}>{text}</Text>;
}

// Type 1 : on compose la phrase en touchant des tuiles de mots.
function TilesExercise({
  exercise,
  uiLang,
  targetPlugin,
  targetName,
  verdict,
  onChange,
}: Props & { exercise: Extract<Exercise, { type: 'translate_to_target' }> }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const disabled = verdict !== null;

  // Mots de la bonne réponse + mots "pièges", mélangés une seule fois par exercice.
  const bank = useMemo(
    () => shuffle([...targetPlugin.tokenize(exercise.answers[0] ?? ''), ...exercise.distractors]),
    [exercise, targetPlugin],
  );
  const [picked, setPicked] = useState<number[]>([]);

  const toggle = (index: number) => {
    if (disabled) return;
    const next = picked.includes(index)
      ? picked.filter((item) => item !== index)
      : [...picked, index];
    setPicked(next);
    onChange(next.map((item) => bank[item] ?? '').join(' '));
  };

  return (
    <View style={{ gap: 18 }}>
      <Instruction text={t('exercises.translateTo', { language: targetName })} />
      <Text style={[styles.source, { color: colors.text }]}>
        {pickText(exercise.source, uiLang)}
      </Text>

      <View style={[styles.answerArea, { borderColor: colors.border }]}>
        {picked.length === 0 ? (
          <Text style={{ color: colors.textMuted }}>{t('lesson.tapWords')}</Text>
        ) : (
          <View style={styles.tiles}>
            {picked.map((index) => (
              <Tile
                key={index}
                text={bank[index] ?? ''}
                onPress={() => toggle(index)}
                disabled={disabled}
              />
            ))}
          </View>
        )}
      </View>

      <View style={styles.tiles}>
        {bank.map((text, index) => (
          <Tile
            key={index}
            text={text}
            onPress={() => toggle(index)}
            disabled={disabled || picked.includes(index)}
            faded={picked.includes(index)}
          />
        ))}
      </View>
    </View>
  );
}

function Tile({
  text,
  onPress,
  disabled,
  faded,
}: {
  text: string;
  onPress: () => void;
  disabled?: boolean;
  faded?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={text}
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.tile,
        {
          backgroundColor: colors.surface,
          borderBottomColor: colors.border,
          opacity: faded ? 0.3 : 1,
        },
      ]}
    >
      <Text style={[styles.tileText, { color: colors.text }]}>{text}</Text>
    </Pressable>
  );
}

// Type 2 : on écrit la traduction dans sa propre langue.
function TypingExercise({
  exercise,
  uiLang,
  targetName,
  value,
  onChange,
  verdict,
}: Props & { exercise: Extract<Exercise, { type: 'translate_to_source' }> }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const disabled = verdict !== null;
  const specialChars = UI_SPECIAL_CHARS[uiLang] ?? [];

  return (
    <View style={{ gap: 18 }}>
      <Instruction
        text={t('exercises.translateTo', { language: t(`languageInstruction.${uiLang}`) })}
      />
      <Text style={[styles.source, { color: colors.text }]}>{exercise.source}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        editable={!disabled}
        placeholder={t('lesson.typeAnswer')}
        placeholderTextColor={colors.textMuted}
        autoCapitalize="none"
        autoCorrect={false}
        style={[
          styles.input,
          { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface },
        ]}
      />
      {specialChars.length > 0 ? (
        <View style={styles.specialChars} accessibilityLabel={targetName}>
          {specialChars.map((char) => (
            <Pressable
              key={char}
              accessibilityRole="button"
              accessibilityLabel={char}
              disabled={disabled}
              onPress={() => onChange(value + char)}
              style={[
                styles.charKey,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <Text style={[styles.charText, { color: colors.text }]}>{char}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

// Type 3 : choisir la bonne image parmi 2 à 4 cartes.
function ImageExercise({
  exercise,
  uiLang,
  value,
  onChange,
  verdict,
}: Props & { exercise: Extract<Exercise, { type: 'image_choice' }> }) {
  const { colors } = useTheme();
  const disabled = verdict !== null;

  return (
    <View style={{ gap: 18 }}>
      <Instruction text={pickText(exercise.prompt, uiLang)} />
      <View style={styles.cards}>
        {exercise.options.map((option) => {
          const selected = value === option.id;
          const isAnswer = option.id === exercise.answer;
          const borderColor =
            verdict && isAnswer
              ? colors.correct
              : verdict && selected
                ? colors.wrong
                : selected
                  ? colors.accent
                  : colors.border;
          return (
            <Pressable
              key={option.id}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              disabled={disabled}
              onPress={() => onChange(option.id)}
              style={[styles.card, { backgroundColor: colors.surface, borderColor }]}
            >
              <Text style={styles.emoji}>{option.emoji}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  instruction: { fontSize: 15, fontWeight: '700' },
  source: { fontSize: 26, fontWeight: '800' },
  answerArea: {
    minHeight: 84,
    borderBottomWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 12,
    justifyContent: 'center',
  },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tile: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderBottomWidth: 4,
  },
  tileText: { fontSize: 17, fontWeight: '700' },
  input: {
    borderWidth: 2,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 18,
  },
  specialChars: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  charKey: {
    minWidth: 40,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  charText: { fontSize: 18, fontWeight: '700' },
  cards: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  card: {
    width: 130,
    height: 130,
    borderRadius: 20,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: 56 },
});
