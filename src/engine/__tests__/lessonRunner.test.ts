import type { Exercise } from '../content/schema';
import { correctAnswerText, evaluateAnswer } from '../exercises/evaluate';
import {
  createLesson,
  currentExercise,
  isLessonComplete,
  lessonResult,
  nextStep,
  recordVerdict,
} from '../lesson/lessonRunner';
import { createPlugin } from '../../languages/createPlugin';
import { getUiPlugin } from '../../languages';

const exercises: Exercise[] = [
  {
    id: 'e1',
    type: 'translate_to_target',
    source: { fr: 'Bonjour', en: 'Hello' },
    answers: ['Hola'],
    distractors: [],
  },
  {
    id: 'e2',
    type: 'translate_to_target',
    source: { fr: 'Adieu', en: 'Bye' },
    answers: ['Adiós'],
    distractors: [],
  },
  {
    id: 'e3',
    type: 'image_choice',
    prompt: { fr: 'Choisis', en: 'Pick' },
    options: [
      { id: 'a', emoji: '🌙' },
      { id: 'b', emoji: '🌅' },
    ],
    answer: 'a',
  },
];

// Joue toutes les questions dans l'ordre avec les verdicts donnés.
function play(verdicts: ('correct' | 'almost' | 'wrong')[]) {
  let state = createLesson(exercises);
  for (const verdict of verdicts) {
    state = recordVerdict(state, verdict);
    state = nextStep(state);
  }
  return state;
}

describe("déroulé d'une leçon", () => {
  it('une leçon sans faute est parfaite et rapporte 15 XP', () => {
    const state = play(['correct', 'correct', 'correct']);
    expect(isLessonComplete(state)).toBe(true);
    expect(lessonResult(state)).toEqual({ perfect: true, mistakes: 0, xp: 15 });
  });

  it('une erreur renvoie la question à la fin, une seule fois', () => {
    let state = createLesson(exercises);
    state = nextStep(recordVerdict(state, 'wrong'));
    expect(state.queue).toHaveLength(4);
    expect(currentExercise(state)?.id).toBe('e2');

    state = nextStep(recordVerdict(state, 'wrong'));
    state = nextStep(recordVerdict(state, 'wrong'));
    state = nextStep(recordVerdict(state, 'wrong'));
    expect(state.queue.filter((e) => e.id === 'e1')).toHaveLength(2);
  });

  it('une réponse "presque" ne compte pas comme une erreur, mais la leçon n\'est pas parfaite', () => {
    const state = play(['almost', 'correct', 'correct']);
    const result = lessonResult(state);
    expect(result.mistakes).toBe(0);
    expect(result.perfect).toBe(false);
    expect(result.xp).toBe(10);
  });

  it("le combo ajoute de l'XP à la fin de la leçon", () => {
    const many: Exercise[] = Array.from({ length: 8 }, (_, i) => ({
      id: `x${i}`,
      type: 'image_choice' as const,
      prompt: { fr: 'x', en: 'x' },
      options: [
        { id: 'a', emoji: '🌙' },
        { id: 'b', emoji: '🌅' },
      ],
      answer: 'a',
    }));
    let state = createLesson(many);
    for (let i = 0; i < 8; i++) state = nextStep(recordVerdict(state, 'correct'));
    // 8 bonnes réponses : le combo démarre à la 6e, donc 3 bonus de +1 XP.
    expect(lessonResult(state).xp).toBe(15 + 3);
  });

  it('ne compte pas une réponse déjà vérifiée deux fois', () => {
    const once = recordVerdict(createLesson(exercises), 'wrong');
    expect(recordVerdict(once, 'correct')).toBe(once);
  });
});

describe('évaluation des réponses', () => {
  const targetPlugin = createPlugin({
    code: 'es',
    specialChars: [],
    correction: {
      ignoreCase: true,
      ignorePunctuation: true,
      accentsOptional: true,
      typoTolerance: 1,
    },
  });
  const ctx = { targetPlugin, uiPlugin: getUiPlugin('fr'), uiLang: 'fr' };

  it('vérifie une traduction vers la langue apprise', () => {
    expect(evaluateAnswer(exercises[0]!, 'Hola', ctx)).toBe('correct');
    expect(evaluateAnswer(exercises[0]!, 'Adiós', ctx)).toBe('wrong');
    expect(correctAnswerText(exercises[0]!, 'fr')).toBe('Hola');
  });

  it("accepte la traduction dans la langue de l'utilisateur", () => {
    const toSource: Exercise = {
      id: 's1',
      type: 'translate_to_source',
      source: 'Buenos días',
      answers: { fr: ['Bonjour', 'Bonjour (le matin)'], en: ['Good morning'] },
    };
    expect(evaluateAnswer(toSource, 'bonjour', ctx)).toBe('correct');
    expect(evaluateAnswer(toSource, 'Bonsoir', ctx)).toBe('wrong');
    expect(correctAnswerText(toSource, 'fr')).toBe('Bonjour');
  });

  it("vérifie le choix d'image", () => {
    expect(evaluateAnswer(exercises[2]!, 'a', ctx)).toBe('correct');
    expect(evaluateAnswer(exercises[2]!, 'b', ctx)).toBe('wrong');
    expect(correctAnswerText(exercises[2]!, 'fr')).toBe('🌙');
  });
});
