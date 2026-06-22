export type Subject = 'maths' | 'physics' | 'chemistry';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type MasteryLevel = 'weak' | 'building' | 'strong';
export type ResponseCorrect = 'right' | 'wrong' | 'partial';

export interface DemoStudent {
  id: string;
  name: string;
  grade: string;
  class: string;
  school: string;
}

export interface VaultQuestion {
  id: string;
  subject: Subject;
  topic: string;
  subTopic: string;
  difficulty: Difficulty;
  type: 'single' | 'short_answer';
  question: string;
  options?: { label: string; value: string }[];
  answer: string[];
  explanation: string;
  misconceptionTag?: string;
  estimatedTimeMin: number;
}

export interface ExamResponse {
  questionId: string;
  correct: ResponseCorrect;
  timeSpentSec?: number;
}

export interface ExamResult {
  studentId: string;
  examName: string;
  date: string;
  responses: ExamResponse[];
}

export interface DiagnosticMark {
  studentId: string;
  subject: Subject;
  topic: string;
  accuracy: number;
  attempts: number;
  rightCount: number;
  partialCount: number;
  wrongCount: number;
  masteryLevel: MasteryLevel;
  lastErrorType?: string;
  recommendedDifficulty: Difficulty;
}

export interface AssignedSet {
  id: string;
  studentId: string;
  assignedBy: string;
  assignedAt: string;
  questionIds: string[];
  status: 'draft' | 'sent_to_operator' | 'printed';
}

export interface DemoState {
  students: DemoStudent[];
  vault: VaultQuestion[];
  examResults: ExamResult[];
  assignedSets: AssignedSet[];
  seededAt?: string;
}
