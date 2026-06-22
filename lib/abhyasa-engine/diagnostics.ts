import type {
  DemoStudent,
  VaultQuestion,
  ExamResult,
  DiagnosticMark,
  ResponseCorrect,
  MasteryLevel,
  Difficulty,
} from './types';

function difficultyValue(d: Difficulty): number {
  return { easy: 1, medium: 2, hard: 3 }[d];
}

function valueToDifficulty(v: number): Difficulty {
  if (v <= 1) return 'easy';
  if (v >= 3) return 'hard';
  return 'medium';
}

export function computeDiagnosticMarks(
  students: DemoStudent[],
  vault: VaultQuestion[],
  examResults: ExamResult[],
): DiagnosticMark[] {
  const marks: DiagnosticMark[] = [];
  const questionMap = new Map(vault.map((q) => [q.id, q]));

  for (const student of students) {
    const result = examResults.find((r) => r.studentId === student.id);
    if (!result) continue;

    const topicGroups = new Map<
      string,
      { subject: string; responses: { correct: ResponseCorrect; question: VaultQuestion }[] }
    >();

    for (const response of result.responses) {
      const question = questionMap.get(response.questionId);
      if (!question) continue;
      const key = `${question.subject}::${question.topic}`;
      if (!topicGroups.has(key)) {
        topicGroups.set(key, { subject: question.subject, responses: [] });
      }
      topicGroups.get(key)!.responses.push({ correct: response.correct, question });
    }

    for (const [key, group] of topicGroups) {
      const attempts = group.responses.length;
      let score = 0;
      let rightCount = 0;
      let partialCount = 0;
      let wrongCount = 0;
      for (const r of group.responses) {
        if (r.correct === 'right') {
          score += 1;
          rightCount += 1;
        } else if (r.correct === 'partial') {
          score += 0.5;
          partialCount += 1;
        } else {
          wrongCount += 1;
        }
      }
      const accuracy = attempts > 0 ? score / attempts : 0;

      let masteryLevel: MasteryLevel;
      if (accuracy < 0.5) masteryLevel = 'weak';
      else if (accuracy < 0.8) masteryLevel = 'building';
      else masteryLevel = 'strong';

      // Recommended difficulty: adjust from average attempted difficulty based on mastery.
      const avgDifficulty =
        group.responses.reduce((sum, r) => sum + difficultyValue(r.question.difficulty), 0) /
        attempts;
      let recommended = valueToDifficulty(Math.round(avgDifficulty));
      if (masteryLevel === 'weak')
        recommended = valueToDifficulty(difficultyValue(recommended) - 1);
      else if (masteryLevel === 'strong')
        recommended = valueToDifficulty(difficultyValue(recommended) + 1);

      // Last error type from most recent wrong response.
      const wrongResponses = group.responses.filter((r) => r.correct === 'wrong');
      const lastErrorType =
        wrongResponses.length > 0
          ? wrongResponses[wrongResponses.length - 1].question.misconceptionTag
          : undefined;

      marks.push({
        studentId: student.id,
        subject: group.subject as DiagnosticMark['subject'],
        topic: key.split('::')[1],
        accuracy,
        attempts,
        rightCount,
        partialCount,
        wrongCount,
        masteryLevel,
        lastErrorType,
        recommendedDifficulty: recommended,
      });
    }
  }

  return marks;
}

export function getStudentMarks(studentId: string, marks: DiagnosticMark[]): DiagnosticMark[] {
  return marks.filter((m) => m.studentId === studentId).sort((a, b) => a.accuracy - b.accuracy);
}

export function getWeakTopicsForStudent(
  studentId: string,
  marks: DiagnosticMark[],
): DiagnosticMark[] {
  return getStudentMarks(studentId, marks).filter((m) => m.masteryLevel === 'weak');
}

export function getClassTopicSummary(marks: DiagnosticMark[]) {
  const byTopic = new Map<
    string,
    { subject: string; topic: string; totalAccuracy: number; count: number; weakStudents: number }
  >();
  for (const m of marks) {
    const key = `${m.subject}::${m.topic}`;
    if (!byTopic.has(key)) {
      byTopic.set(key, {
        subject: m.subject,
        topic: m.topic,
        totalAccuracy: 0,
        count: 0,
        weakStudents: 0,
      });
    }
    const entry = byTopic.get(key)!;
    entry.totalAccuracy += m.accuracy;
    entry.count += 1;
    if (m.masteryLevel === 'weak') entry.weakStudents += 1;
  }
  return Array.from(byTopic.values())
    .map((t) => ({ ...t, avgAccuracy: t.totalAccuracy / t.count }))
    .sort((a, b) => a.avgAccuracy - b.avgAccuracy);
}
