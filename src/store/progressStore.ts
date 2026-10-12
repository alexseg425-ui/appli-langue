// Progression : XP total, cœurs, leçons terminées par langue.
// Sauvegardé sur le téléphone (AsyncStorage).
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { GAME_CONFIG } from '../engine/config';
import { loseHeart, refreshHearts } from '../engine/gamification/hearts';

export interface CourseProgress {
  completedLessons: Record<string, { perfect: boolean }>;
}

interface ProgressState {
  totalXp: number; // XP commun à toutes les langues
  hearts: number;
  lastHeartRefillAt: number;
  courses: Record<string, CourseProgress>; // progression séparée pour chaque langue
  syncHearts: () => void; // ajoute les cœurs gagnés avec le temps
  loseHeartNow: () => void;
  completeLesson: (lang: string, lessonId: string, perfect: boolean, xp: number) => void;
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set) => ({
      totalXp: 0,
      hearts: GAME_CONFIG.maxHearts,
      lastHeartRefillAt: Date.now(),
      courses: {},
      syncHearts: () =>
        set((state) => {
          const next = refreshHearts(
            { hearts: state.hearts, lastRefillAt: state.lastHeartRefillAt },
            Date.now(),
          );
          return { hearts: next.hearts, lastHeartRefillAt: next.lastRefillAt };
        }),
      loseHeartNow: () =>
        set((state) => {
          const next = loseHeart(
            { hearts: state.hearts, lastRefillAt: state.lastHeartRefillAt },
            Date.now(),
          );
          return { hearts: next.hearts, lastHeartRefillAt: next.lastRefillAt };
        }),
      completeLesson: (lang, lessonId, perfect, xp) =>
        set((state) => {
          const course = state.courses[lang] ?? { completedLessons: {} };
          const previous = course.completedLessons[lessonId];
          return {
            totalXp: state.totalXp + xp,
            courses: {
              ...state.courses,
              [lang]: {
                completedLessons: {
                  ...course.completedLessons,
                  // Une leçon déjà parfaite reste parfaite.
                  [lessonId]: { perfect: perfect || (previous?.perfect ?? false) },
                },
              },
            },
          };
        }),
    }),
    {
      name: 'chispa-progress',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
