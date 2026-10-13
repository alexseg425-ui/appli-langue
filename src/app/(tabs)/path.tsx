// Écran d'accueil : le chemin vertical des unités et des leçons.
import { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { playSound } from '../../audio/sounds';
import { getLanguageContent } from '../../engine/content/registry';
import { buildPath, PathLesson, PathUnit, unitTitle } from '../../engine/path/pathBuilder';
import { resolveInterfaceLanguage } from '../../i18n/detect';
import { useProgressStore } from '../../store/progressStore';
import { useUserStore } from '../../store/userStore';
import { Chispa } from '../../ui/components/Chispa';
import { Hearts } from '../../ui/components/Hearts';
import { Screen } from '../../ui/components/Screen';
import { useTheme } from '../../ui/theme/useTheme';

export default function PathScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { colors } = useTheme();
  const uiLang = resolveInterfaceLanguage(i18n.language);

  const learningLanguages = useUserStore((state) => state.learningLanguages);
  const activeLanguage = useUserStore((state) => state.activeLanguage);
  const setActiveLanguage = useUserStore((state) => state.setActiveLanguage);

  const totalXp = useProgressStore((state) => state.totalXp);
  const hearts = useProgressStore((state) => state.hearts);
  const courses = useProgressStore((state) => state.courses);
  const syncHearts = useProgressStore((state) => state.syncHearts);

  // Les cœurs se rechargent avec le temps : on vérifie à l'ouverture, puis toutes les 30 s.
  useEffect(() => {
    syncHearts();
    const id = setInterval(syncHearts, 30_000);
    return () => clearInterval(id);
  }, [syncHearts]);

  const content = activeLanguage ? getLanguageContent(activeLanguage) : undefined;
  const completed = activeLanguage ? (courses[activeLanguage]?.completedLessons ?? {}) : {};
  const units = content ? buildPath(content.units, completed) : [];

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <LinearGradient
          colors={[colors.accentStrong, colors.accentDeep]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <View style={styles.mascotBubble}>
            <Chispa size={52} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.heroTitle, { color: colors.onColor }]}>{t('path.title')}</Text>
            <Text style={[styles.heroXp, { color: colors.onColor }]}>
              {t('path.xp', { count: totalXp })}
            </Text>
          </View>
          <View style={[styles.heartPill, { backgroundColor: colors.surface }]}>
            <Hearts count={hearts} />
          </View>
        </LinearGradient>

        <View style={styles.switcher}>
          {learningLanguages.map((code) => {
            const config = getLanguageContent(code)?.config;
            if (!config) return null;
            const selected = code === activeLanguage;
            return (
              <Pressable
                key={code}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => {
                  playSound('tap');
                  setActiveLanguage(code);
                }}
                style={[
                  styles.chip,
                  {
                    borderColor: selected ? colors.accent : colors.border,
                    backgroundColor: colors.surface,
                  },
                ]}
              >
                <Text style={{ fontSize: 18 }}>{config.flag}</Text>
                <Text style={{ color: colors.text, fontWeight: '700' }}>{config.nativeName}</Text>
              </Pressable>
            );
          })}
        </View>

        {!content ? (
          <Text style={{ color: colors.textMuted, padding: 16 }}>{t('path.noCourse')}</Text>
        ) : null}

        {units.map((unit) => (
          <UnitBlock
            key={unit.id}
            unit={unit}
            uiLang={uiLang}
            title={unitTitle(unit, uiLang)}
            onLesson={(lesson) => router.push(`/lesson/${lesson.id}`)}
          />
        ))}
      </ScrollView>
    </Screen>
  );
}

function UnitBlock({
  unit,
  uiLang,
  title,
  onLesson,
}: {
  unit: PathUnit;
  uiLang: string;
  title: string;
  onLesson: (lesson: PathLesson) => void;
}) {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <View style={[styles.unit, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.unitLabel, { color: colors.accentStrong }]}>
        {t('path.unit', { number: unit.order })} · {unit.cefr}
      </Text>
      <Text style={[styles.unitTitle, { color: colors.text }]}>{title}</Text>
      <Text style={{ color: colors.textMuted, marginBottom: 12 }}>
        {unit.description[uiLang] ?? unit.description['en']}
      </Text>

      <View style={styles.lessons}>
        {unit.lessons.map((lesson, index) => (
          <LessonNode
            key={lesson.id}
            lesson={lesson}
            index={index}
            onPress={() => onLesson(lesson)}
          />
        ))}
      </View>

      <View style={styles.chest}>
        <Text style={{ fontSize: 28, opacity: unit.chestUnlocked ? 1 : 0.5 }}>🎁</Text>
        <Text
          style={{
            color: unit.chestUnlocked ? colors.text : colors.textMuted,
            fontWeight: '700',
            flex: 1,
          }}
        >
          {unit.chestUnlocked
            ? t('path.chestOpen')
            : `${t('path.chest')} · ${t('path.chestLocked')}`}
        </Text>
      </View>
    </View>
  );
}

// Fait "respirer" la leçon qu'on doit faire maintenant (elle attire l'œil).
function usePulse(active: boolean) {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (!active) {
      scale.value = 1;
      return;
    }
    scale.value = withRepeat(
      withSequence(withTiming(1.08, { duration: 650 }), withTiming(1, { duration: 650 })),
      -1,
    );
  }, [active, scale]);

  return useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
}

// Un rond par leçon, décalé à gauche / à droite pour former un chemin en zigzag.
function LessonNode({
  lesson,
  index,
  onPress,
}: {
  lesson: PathLesson;
  index: number;
  onPress: () => void;
}) {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const locked = lesson.status === 'locked';
  const done = lesson.status === 'completed';
  const pulse = usePulse(lesson.status === 'available');
  const shifted = index % 2 === 1;
  const gradient: [string, string] = done
    ? [colors.correctStrong, colors.correctDeep]
    : [colors.accentStrong, colors.accentDeep];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: locked }}
      accessibilityHint={locked ? t('path.lessonLocked') : undefined}
      accessibilityLabel={pickLabel(lesson, i18n.language)}
      disabled={locked}
      onPress={() => {
        playSound('tap');
        onPress();
      }}
      style={[styles.nodeRow, { marginLeft: shifted ? 56 : 0, marginRight: shifted ? 0 : 56 }]}
    >
      <Animated.View style={pulse}>
        {locked ? (
          <View style={[styles.node, { backgroundColor: colors.locked }]}>
            <Text style={styles.nodeIcon}>🔒</Text>
          </View>
        ) : (
          <LinearGradient colors={gradient} style={styles.node}>
            <Text style={styles.nodeIcon}>{done ? '✓' : '▶'}</Text>
          </LinearGradient>
        )}
      </Animated.View>
      <View style={{ flex: 1, paddingLeft: 12 }}>
        <Text style={{ color: colors.text, fontWeight: '700' }}>
          {pickLabel(lesson, i18n.language)}
        </Text>
        <Text style={{ color: colors.textMuted, fontSize: 12 }}>
          {done && lesson.perfect
            ? t('path.perfect')
            : t('path.exercises', { count: lesson.exerciseCount })}
        </Text>
      </View>
    </Pressable>
  );
}

// Titre d'une leçon dans la langue de l'interface (repli sur l'anglais).
function pickLabel(lesson: PathLesson, lang: string): string {
  return lesson.title[resolveInterfaceLanguage(lang)] ?? lesson.title['en'] ?? '';
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 16, paddingBottom: 40 },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: 26,
  },
  mascotBubble: { backgroundColor: '#FFFFFF', borderRadius: 40, padding: 4 },
  heroTitle: { fontSize: 22, fontWeight: '800' },
  heroXp: { fontSize: 15, fontWeight: '700' },
  heartPill: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  switcher: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
  },
  unit: { borderRadius: 22, borderWidth: 1, padding: 18 },
  unitLabel: { fontSize: 13, fontWeight: '800', textTransform: 'uppercase' },
  unitTitle: { fontSize: 20, fontWeight: '800', marginTop: 4 },
  lessons: { gap: 18, marginVertical: 8 },
  nodeRow: { flexDirection: 'row', alignItems: 'center' },
  node: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderBottomWidth: 6,
    borderBottomColor: 'rgba(0,0,0,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodeIcon: { fontSize: 26, color: '#FFFFFF', fontWeight: '800' },
  chest: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8 },
});
