// Écran de leçon : une question à la fois, vérification, cœurs, XP et combo.
import * as Haptics from 'expo-haptics';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { correctAnswerText, evaluateAnswer } from '../../engine/exercises/evaluate';
import { findLesson, getLanguageContent } from '../../engine/content/registry';
import { pickText } from '../../engine/content/localized';
import { msUntilNextHeart } from '../../engine/gamification/hearts';
import {
  createLesson,
  currentExercise,
  isLessonComplete,
  lessonResult,
  LessonState,
  nextStep,
  recordVerdict,
} from '../../engine/lesson/lessonRunner';
import { resolveInterfaceLanguage } from '../../i18n/detect';
import { getPlugin, getUiPlugin } from '../../languages';
import { useProgressStore } from '../../store/progressStore';
import { useUserStore } from '../../store/userStore';
import { Button3D } from '../../ui/components/Button3D';
import { Chispa } from '../../ui/components/Chispa';
import { FeedbackBanner } from '../../ui/components/FeedbackBanner';
import { Hearts } from '../../ui/components/Hearts';
import { ProgressBar } from '../../ui/components/ProgressBar';
import { Screen } from '../../ui/components/Screen';
import { ExerciseView } from '../../ui/exercises/ExerciseView';
import { useTheme } from '../../ui/theme/useTheme';
import { formatDuration } from '../../utils/format';

export default function LessonScreen() {
  const { lessonId = '' } = useLocalSearchParams<{ lessonId: string }>();
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { colors } = useTheme();
  const uiLang = resolveInterfaceLanguage(i18n.language);

  const activeLanguage = useUserStore((state) => state.activeLanguage);
  const content = activeLanguage ? getLanguageContent(activeLanguage) : undefined;
  const found = content ? findLesson(content, lessonId) : undefined;
  const targetPlugin = useMemo(() => (content ? getPlugin(content.config) : undefined), [content]);

  const hearts = useProgressStore((state) => state.hearts);
  const lastHeartRefillAt = useProgressStore((state) => state.lastHeartRefillAt);
  const loseHeartNow = useProgressStore((state) => state.loseHeartNow);
  const syncHearts = useProgressStore((state) => state.syncHearts);
  const completeLesson = useProgressStore((state) => state.completeLesson);

  const [state, setState] = useState<LessonState | null>(() =>
    found ? createLesson(found.lesson.exercises) : null,
  );
  const [draft, setDraft] = useState('');
  const [now, setNow] = useState(() => Date.now());

  // Plus de cœurs : on ouvre la fenêtre d'attente. Elle se ferme dès qu'un cœur revient.
  const noHearts = hearts === 0;
  useEffect(() => {
    if (!noHearts) return;
    const id = setInterval(() => {
      setNow(Date.now());
      syncHearts();
    }, 1000);
    return () => clearInterval(id);
  }, [noHearts, syncHearts]);

  if (!found || !state || !content || !targetPlugin || !activeLanguage) {
    return (
      <Screen>
        <Text style={{ color: colors.text, padding: 24 }}>{t('lesson.notFound')}</Text>
      </Screen>
    );
  }

  const exercise = currentExercise(state);
  const verdict = state.lastVerdict;
  const isLast = state.index + 1 >= state.queue.length;
  const progress = state.queue.length ? state.index / state.queue.length : 0;
  const targetName = pickText(content.config.instructionName, uiLang);
  const comboPhrase =
    content.config.comboPhrases[state.index % content.config.comboPhrases.length] ?? '';

  const leaveLesson = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/path');
  };

  const onQuit = () =>
    Alert.alert(t('lesson.quitTitle'), t('lesson.quitBody'), [
      { text: t('common.stay'), style: 'cancel' },
      { text: t('lesson.leave'), style: 'destructive', onPress: leaveLesson },
    ]);

  // Vérifie la réponse et met à jour les cœurs et le combo.
  const onCheck = () => {
    if (!exercise || verdict || !draft.trim()) return;
    const result = evaluateAnswer(exercise, draft, {
      targetPlugin,
      uiPlugin: getUiPlugin(uiLang),
      uiLang,
    });
    void Haptics.notificationAsync(
      result === 'wrong'
        ? Haptics.NotificationFeedbackType.Error
        : Haptics.NotificationFeedbackType.Success,
    );
    if (result === 'wrong') loseHeartNow();
    setState(recordVerdict(state, result));
  };

  // Question suivante, ou fin de leçon.
  const onNext = () => {
    const next = nextStep(state);
    if (!isLessonComplete(next)) {
      setState(next);
      setDraft('');
      return;
    }
    const result = lessonResult(next);
    completeLesson(activeLanguage, found.lesson.id, result.perfect, result.xp);
    router.replace({
      pathname: '/lesson/results',
      params: {
        xp: String(result.xp),
        perfect: result.perfect ? '1' : '0',
        mistakes: String(result.mistakes),
      },
    });
  };

  const waitTime = formatDuration(
    msUntilNextHeart({ hearts, lastRefillAt: lastHeartRefillAt }, now),
  );

  return (
    <Screen>
      <View style={styles.topBar}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('common.close')}
          onPress={onQuit}
          hitSlop={12}
        >
          <Text style={[styles.close, { color: colors.textMuted }]}>✕</Text>
        </Pressable>
        <View style={{ flex: 1 }}>
          <ProgressBar progress={progress} />
        </View>
        <Hearts count={hearts} />
      </View>

      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        {exercise ? (
          <ExerciseView
            key={`${state.index}-${exercise.id}`}
            exercise={exercise}
            uiLang={uiLang}
            targetPlugin={targetPlugin}
            targetName={targetName}
            value={draft}
            onChange={setDraft}
            verdict={verdict}
          />
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        {state.comboJustReached ? (
          <Text style={[styles.combo, { color: colors.accent }]}>
            {t('lesson.comboReached')} {comboPhrase}
          </Text>
        ) : null}

        {verdict && exercise ? (
          <FeedbackBanner verdict={verdict} correctAnswer={correctAnswerText(exercise, uiLang)} />
        ) : null}

        {verdict ? (
          <Button3D
            label={isLast ? t('lesson.end') : t('lesson.next')}
            onPress={onNext}
            variant={verdict === 'wrong' ? 'secondary' : 'correct'}
          />
        ) : (
          <Button3D label={t('lesson.check')} onPress={onCheck} disabled={!draft.trim()} />
        )}

        <Pressable
          accessibilityRole="button"
          onPress={() => Alert.alert(t('common.signalProblem'), t('common.problemThanks'))}
          hitSlop={8}
        >
          <Text style={{ color: colors.textMuted, textAlign: 'center', fontSize: 13 }}>
            {t('common.signalProblem')}
          </Text>
        </Pressable>
      </View>

      <Modal visible={noHearts} transparent animationType="fade">
        <View style={styles.backdrop}>
          <View style={[styles.modal, { backgroundColor: colors.surface }]}>
            <Chispa size={72} />
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {t('lesson.noHeartsTitle')}
            </Text>
            <Text style={{ color: colors.textMuted, textAlign: 'center' }}>
              {t('lesson.noHeartsBody')}
            </Text>
            <Text style={{ color: colors.text, fontWeight: '800' }}>
              {t('lesson.nextHeartIn', { time: waitTime })}
            </Text>
            <Button3D label={t('lesson.backToPath')} onPress={leaveLesson} />
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  close: { fontSize: 22, fontWeight: '700' },
  body: { padding: 20, paddingBottom: 24 },
  footer: { padding: 16, gap: 12 },
  combo: { fontSize: 18, fontWeight: '800', textAlign: 'center' },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modal: { width: '100%', borderRadius: 24, padding: 24, alignItems: 'center', gap: 12 },
  modalTitle: { fontSize: 22, fontWeight: '800' },
});
