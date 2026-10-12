// Construit le chemin : quelles leçons sont terminées, disponibles ou verrouillées.
import type { Unit, Lesson } from '../content/schema';
import { pickText, LocalizedText } from '../content/localized';

export type LessonStatus = 'completed' | 'available' | 'locked';

export interface PathLesson {
  id: string;
  title: LocalizedText;
  exerciseCount: number;
  status: LessonStatus;
  perfect: boolean;
}

export interface PathUnit {
  id: string;
  order: number;
  cefr: string;
  title: LocalizedText;
  description: LocalizedText;
  lessons: PathLesson[];
  chestUnlocked: boolean; // toutes les leçons de l'unité sont terminées
}

// Une leçon est disponible si la précédente est terminée. La première est toujours disponible.
export function buildPath(
  units: Unit[],
  completed: Record<string, { perfect: boolean }>,
): PathUnit[] {
  let previousCompleted = true;

  return units.map((unit) => {
    const lessons = unit.lessons.map((lesson: Lesson): PathLesson => {
      const record = completed[lesson.id];
      const status: LessonStatus = record
        ? 'completed'
        : previousCompleted
          ? 'available'
          : 'locked';
      previousCompleted = status === 'completed';

      return {
        id: lesson.id,
        title: lesson.title,
        exerciseCount: lesson.exercises.length,
        status,
        perfect: record?.perfect ?? false,
      };
    });

    return {
      id: unit.id,
      order: unit.order,
      cefr: unit.cefr,
      title: unit.title,
      description: unit.description,
      lessons,
      chestUnlocked: lessons.every((lesson) => lesson.status === 'completed'),
    };
  });
}

// Titre d'une unité dans la langue voulue (utilisé par l'écran du chemin).
export function unitTitle(unit: PathUnit, lang: string): string {
  return pickText(unit.title, lang);
}
