import type { VaultQuestion, DiagnosticMark, AssignedSet } from './types';

export interface SelectionOptions {
  count?: number;
  excludeRecentDays?: number;
}

export function selectQuestionsForStudent(
  studentId: string,
  marks: DiagnosticMark[],
  vault: VaultQuestion[],
  assignedSets: AssignedSet[],
  options: SelectionOptions = {},
): VaultQuestion[] {
  const { count = 8, excludeRecentDays = 7 } = options;
  const studentMarks = marks.filter((m) => m.studentId === studentId);
  const weakMarks = studentMarks.filter((m) => m.masteryLevel === 'weak');
  const buildingMarks = studentMarks.filter((m) => m.masteryLevel === 'building');

  // Topics to focus on.
  const focusTopics = new Set<string>();
  const focusSubjects = new Set<string>();
  for (const m of weakMarks) {
    focusTopics.add(m.topic);
    focusSubjects.add(m.subject);
  }
  for (const m of buildingMarks) {
    focusTopics.add(m.topic);
    focusSubjects.add(m.subject);
  }

  // Recently assigned question IDs.
  const cutoff = new Date(Date.now() - excludeRecentDays * 24 * 60 * 60 * 1000).toISOString();
  const recentlyAssigned = new Set<string>();
  for (const set of assignedSets) {
    if (set.studentId !== studentId) continue;
    if (set.assignedAt >= cutoff) {
      for (const qid of set.questionIds) recentlyAssigned.add(qid);
    }
  }

  // Difficulty recommendation per topic.
  const recommendedDifficultyByTopic = new Map<string, DiagnosticMark['recommendedDifficulty']>();
  for (const m of studentMarks) {
    recommendedDifficultyByTopic.set(m.topic, m.recommendedDifficulty);
  }

  const scored = vault
    .filter((q) => focusSubjects.has(q.subject))
    .map((q) => {
      let score = 0;
      const isWeakTopic = focusTopics.has(q.topic);
      const mark = studentMarks.find((m) => m.topic === q.topic);

      if (isWeakTopic) score += 10;
      if (mark && q.difficulty === mark.recommendedDifficulty) score += 5;
      if (mark && mark.lastErrorType && q.misconceptionTag === mark.lastErrorType) score += 3;
      if (recentlyAssigned.has(q.id)) score -= 5;

      return { q, score };
    });

  scored.sort((a, b) => b.score - a.score);

  // Ensure at least one easy prerequisite per weak topic.
  const selected: VaultQuestion[] = [];
  const selectedIds = new Set<string>();
  for (const topic of focusTopics) {
    const easy = scored.find(
      ({ q }) => q.topic === topic && q.difficulty === 'easy' && !selectedIds.has(q.id),
    );
    if (easy) {
      selected.push(easy.q);
      selectedIds.add(easy.q.id);
    }
  }

  // Fill remaining slots by score.
  for (const { q } of scored) {
    if (selected.length >= count) break;
    if (selectedIds.has(q.id)) continue;
    selected.push(q);
    selectedIds.add(q.id);
  }

  return selected;
}
