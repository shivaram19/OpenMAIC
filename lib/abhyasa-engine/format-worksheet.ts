import type { DemoStudent, VaultQuestion } from './types';
import type { QuizQuestion } from '@/lib/types/stage';
import type { StudentProfile } from '@/lib/types/generation';
import type { BoardContext } from '@/lib/worksheet/board-context';

export interface WorksheetPayload {
  students: StudentProfile[];
  topic: string;
  questionCount: number;
  difficulty: 'easy' | 'medium' | 'hard';
  questionTypes: ('single' | 'multiple' | 'text')[];
  board: BoardContext['board'];
  medium: BoardContext['medium'];
  grade?: number;
  track: BoardContext['track'];
  extraInstructions?: string;
}

export function mapDemoStudentToProfile(student: DemoStudent): StudentProfile {
  return {
    name: student.name,
    grade: student.grade,
    class: student.class,
    school: student.school,
    weakTopics: [],
    strongTopics: [],
    engagementLevel: 'medium',
    pastPerformance: [],
  };
}

export function mapVaultQuestionsToQuiz(questions: VaultQuestion[]): QuizQuestion[] {
  return questions.map((q, idx) => ({
    id: q.id,
    type: q.type === 'single' ? 'single' : 'short_answer',
    question: `${idx + 1}. ${q.question}`,
    options: q.options,
    answer: q.answer,
    analysis: q.explanation,
    hasAnswer: true,
    points: q.difficulty === 'easy' ? 1 : q.difficulty === 'medium' ? 2 : 3,
  }));
}

export function buildWorksheetPayload(
  student: DemoStudent,
  questions: VaultQuestion[],
  topic = 'Personalized Remediation Worksheet',
  difficulty: 'easy' | 'medium' | 'hard' = 'medium',
): WorksheetPayload {
  const quizQuestions = mapVaultQuestionsToQuiz(questions);
  const hasMultiple = quizQuestions.some((q) => q.type === 'multiple');
  const questionTypes: ('single' | 'multiple' | 'text')[] = hasMultiple
    ? ['single', 'multiple', 'text']
    : ['single', 'text'];

  return {
    students: [mapDemoStudentToProfile(student)],
    topic,
    questionCount: questions.length,
    difficulty,
    questionTypes,
    board: 'cbse',
    medium: 'en',
    grade: Number(student.grade) || undefined,
    track: 'board',
    extraInstructions: `Focus on the student's weak topics. Include brief explanations (rectifications) after each answer so the student can self-correct.`,
  };
}
