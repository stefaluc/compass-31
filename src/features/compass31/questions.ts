import type { Compass31DomainKey } from '@/lib/clinical/compass31';

/**
 * COMPASS-31 questionnaire structure. Answers are 1-based option numbers as
 * printed on the paper survey; points = pointsKey[answer - 1].
 *
 * A question with `dependsOn` becomes N/A when the parent question's answer
 * equals the parent's `naAnswer` (e.g. answering "No" to Q1 skips Q2-4).
 */

export interface CompassQuestion {
  id: number;
  text: string;
  pointsKey: number[];
  /** Parent question id this question depends on. */
  dependsOn?: number;
  /** When THIS question is answered with this value, dependents become N/A. */
  naAnswer?: number;
  /** Checkmark-style question (special entry hint). */
  type?: 'checkmark';
}

export interface CompassDomain {
  key: Compass31DomainKey;
  domain: string;
  maxScore: number;
  questions: CompassQuestion[];
}

export const COMPASS_QUESTIONNAIRE: CompassDomain[] = [
  {
    key: 'orthostaticIntolerance',
    domain: 'Orthostatic Intolerance',
    maxScore: 10,
    questions: [
      {
        id: 1,
        text: 'In the past year, have you ever felt faint, dizzy, "goofy", or had difficulty thinking soon after standing up from a sitting or lying position?',
        pointsKey: [1, 0],
        naAnswer: 2,
      },
      {
        id: 2,
        text: 'When standing up, how frequently do you get these feelings or symptoms?',
        pointsKey: [0, 1, 2, 3],
        dependsOn: 1,
      },
      {
        id: 3,
        text: 'How would you rate the severity of these feelings or symptoms?',
        pointsKey: [1, 2, 3],
        dependsOn: 1,
      },
      {
        id: 4,
        text: 'In the past year, have these feelings or symptoms that you have experienced:',
        pointsKey: [3, 2, 1, 0, 0, 0],
        dependsOn: 1,
      },
    ],
  },
  {
    key: 'vasomotor',
    domain: 'Vasomotor',
    maxScore: 6,
    questions: [
      {
        id: 5,
        text: 'In the past year, have you ever noticed color changes in your skin, such as red, white, or purple?',
        pointsKey: [1, 0],
        naAnswer: 2,
      },
      {
        id: 6,
        text: 'What parts of your body are affected by these color changes? (Check all that apply)',
        pointsKey: [1, 1, 2],
        type: 'checkmark',
        dependsOn: 5,
      },
      {
        id: 7,
        text: 'Are these changes in your skin color:',
        pointsKey: [3, 2, 1, 0],
        dependsOn: 5,
      },
    ],
  },
  {
    key: 'secretomotor',
    domain: 'Secretomotor',
    maxScore: 7,
    questions: [
      {
        id: 8,
        text: 'In the past 5 years, what changes, if any, have occurred in your general body sweating?',
        pointsKey: [1, 0, 0, 1, 2, 0],
      },
      {
        id: 9,
        text: 'Do your eyes feel excessively dry?',
        pointsKey: [1, 0],
      },
      {
        id: 10,
        text: 'Does your mouth feel excessively dry?',
        pointsKey: [1, 0],
      },
      {
        id: 11,
        text: 'For the symptom of dry eyes or dry mouth that you have had for the longest period of time, is this symptom:',
        pointsKey: [0, 3, 2, 1, 0, 0, 0],
      },
    ],
  },
  {
    key: 'gastrointestinal',
    domain: 'Gastrointestinal',
    maxScore: 28,
    questions: [
      {
        id: 12,
        text: 'In the past year, have you noticed any changes in how quickly you get full when eating a meal?',
        pointsKey: [2, 1, 0, 0, 0],
      },
      {
        id: 13,
        text: 'In the past year, have you felt excessively full or persistently full (bloated feeling) after a meal?',
        pointsKey: [0, 1, 2],
      },
      {
        id: 14,
        text: 'In the past year, have you vomited after a meal?',
        pointsKey: [0, 1, 2],
      },
      {
        id: 15,
        text: 'In the past year, have you had a cramping or colicky abdominal pain?',
        pointsKey: [0, 1, 2],
      },
      {
        id: 16,
        text: 'In the past year, have you had any bouts of diarrhea?',
        pointsKey: [1, 0],
        naAnswer: 2,
      },
      {
        id: 17,
        text: 'How frequently does this occur?',
        pointsKey: [0, 1, 2, 3],
        dependsOn: 16,
      },
      {
        id: 18,
        text: 'How severe are these bouts of diarrhea?',
        pointsKey: [1, 2, 3],
        dependsOn: 16,
      },
      {
        id: 19,
        text: 'Are your bouts of diarrhea getting:',
        pointsKey: [3, 2, 1, 0, 0, 0],
        dependsOn: 16,
      },
      {
        id: 20,
        text: 'In the past year, have you been constipated?',
        pointsKey: [1, 0],
        naAnswer: 2,
      },
      {
        id: 21,
        text: 'How frequently are you constipated?',
        pointsKey: [0, 1, 2, 3],
        dependsOn: 20,
      },
      {
        id: 22,
        text: 'How severe are these episodes of constipation?',
        pointsKey: [1, 2, 3],
        dependsOn: 20,
      },
      {
        id: 23,
        text: 'Is your constipation getting:',
        pointsKey: [3, 2, 1, 0, 0, 0],
        dependsOn: 20,
      },
    ],
  },
  {
    key: 'bladder',
    domain: 'Bladder',
    maxScore: 9,
    questions: [
      {
        id: 24,
        text: 'In the past year, have you ever lost control of your bladder function?',
        pointsKey: [0, 1, 2, 3],
      },
      {
        id: 25,
        text: 'In the past year, have you had difficulty passing urine?',
        pointsKey: [0, 1, 2, 3],
      },
      {
        id: 26,
        text: 'In the past year, have you had trouble completely emptying your bladder?',
        pointsKey: [0, 1, 2, 3],
      },
    ],
  },
  {
    key: 'pupillomotor',
    domain: 'Pupillomotor',
    maxScore: 15,
    questions: [
      {
        id: 27,
        text: 'In the past year, without sunglasses or tinted glasses, has bright light bothered your eyes?',
        pointsKey: [0, 1, 2, 3],
        naAnswer: 1,
      },
      {
        id: 28,
        text: 'How severe is this sensitivity to bright light?',
        pointsKey: [1, 2, 3],
        dependsOn: 27,
      },
      {
        id: 29,
        text: 'In the past year, have you had trouble focusing your eyes?',
        pointsKey: [0, 1, 2, 3],
        naAnswer: 1,
      },
      {
        id: 30,
        text: 'How severe is this focusing problem?',
        pointsKey: [1, 2, 3],
        dependsOn: 29,
      },
      {
        id: 31,
        text: 'Is the most troublesome symptom with your eyes (i.e. sensitivity to bright light or trouble focusing) getting:',
        pointsKey: [0, 3, 2, 1, 0, 0, 0],
      },
    ],
  },
];

export type CompassAnswers = Record<number, number | null>;

const questionById = new Map(
  COMPASS_QUESTIONNAIRE.flatMap((d) => d.questions).map((q) => [q.id, q]),
);

/** A question is N/A when its parent was answered with the parent's naAnswer. */
export function isQuestionNA(question: CompassQuestion, answers: CompassAnswers): boolean {
  if (question.dependsOn == null) return false;
  const parent = questionById.get(question.dependsOn);
  if (!parent || parent.naAnswer == null) return false;
  return answers[parent.id] === parent.naAnswer;
}

export function isAnswerInRange(question: CompassQuestion, answer: number | null): boolean {
  return answer != null && answer >= 1 && answer <= question.pointsKey.length;
}

/** Raw score for one domain. N/A dependents contribute 0 even if previously answered. */
export function domainScore(domain: CompassDomain, answers: CompassAnswers): number {
  return domain.questions.reduce((sum, q) => {
    if (isQuestionNA(q, answers)) return sum;
    const answer = answers[q.id];
    if (!isAnswerInRange(q, answer)) return sum;
    return sum + q.pointsKey[(answer as number) - 1];
  }, 0);
}

/** A question counts as done when validly answered or skipped via dependency. */
export function questionsDone(questions: CompassQuestion[], answers: CompassAnswers): number {
  return questions.reduce((count, q) => {
    if (isQuestionNA(q, answers)) return count + 1;
    return count + (isAnswerInRange(q, answers[q.id] ?? null) ? 1 : 0);
  }, 0);
}

export const TOTAL_QUESTIONS = COMPASS_QUESTIONNAIRE.reduce(
  (n, d) => n + d.questions.length,
  0,
);
