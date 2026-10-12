// Bandeau vert (bravo), jaune (presque) ou rouge (faux), affiché après chaque réponse.
import { StyleSheet, Text } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import type { Verdict } from '../../languages/types';
import { useTheme } from '../theme/useTheme';

interface Props {
  verdict: Verdict;
  correctAnswer: string;
}

export function FeedbackBanner({ verdict, correctAnswer }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const look = {
    correct: { background: colors.correct, text: colors.onColor, title: t('lesson.correct') },
    almost: { background: colors.almost, text: '#3B2A1A', title: t('lesson.almost') },
    wrong: { background: colors.wrong, text: colors.onColor, title: t('lesson.wrong') },
  }[verdict];

  return (
    <Animated.View
      entering={FadeInDown.duration(220)}
      accessibilityLiveRegion="polite"
      style={[styles.banner, { backgroundColor: look.background }]}
    >
      <Text style={[styles.title, { color: look.text }]}>{look.title}</Text>
      {verdict !== 'correct' && correctAnswer ? (
        <Text style={[styles.answer, { color: look.text }]}>
          {t('lesson.answerWas', { answer: correctAnswer })}
        </Text>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: { borderRadius: 16, padding: 14, gap: 4 },
  title: { fontSize: 18, fontWeight: '800' },
  answer: { fontSize: 15, fontWeight: '600' },
});
