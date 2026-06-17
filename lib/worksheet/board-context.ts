/**
 * Board-aware worksheet context.
 *
 * Supports Indian and international boards. The context is injected into LLM
 * prompts and PDF headers so that generated questions match the student's
 * curriculum, medium, and exam track.
 */

export type SupportedBoard =
  | 'cbse'
  | 'msbshse'
  | 'kseab'
  | 'dge_tn'
  | 'upmsp'
  | 'bseb'
  | 'icse'
  | 'nios'
  | 'other';

export type SupportedMedium = 'en' | 'hi' | 'mr' | 'kn' | 'ta' | 'te' | 'ur' | 'bn' | 'other';

export type ExamTrack = 'board' | 'jee_foundation' | 'neet_foundation' | 'olympiad';

export interface BoardContext {
  board: SupportedBoard;
  medium?: SupportedMedium;
  grade?: number;
  track?: ExamTrack;
  excludedTopics?: string[];
  includedTopics?: string[];
  answerFormats?: ('mcq' | 'short' | 'long' | 'case_based')[];
}

export const BOARD_LABELS: Record<SupportedBoard, string> = {
  cbse: 'CBSE (NCERT-based)',
  msbshse: 'Maharashtra State Board (MSBSHSE)',
  kseab: 'Karnataka State Board (KSEAB / SSLC)',
  dge_tn: 'Tamil Nadu State Board (DGE TN / Samacheer Kalvi)',
  upmsp: 'Uttar Pradesh State Board (UPMSP)',
  bseb: 'Bihar State Board (BSEB)',
  icse: 'ICSE',
  nios: 'NIOS',
  other: 'Other board',
};

export const MEDIUM_LABELS: Record<SupportedMedium, string> = {
  en: 'English',
  hi: 'Hindi',
  mr: 'Marathi',
  kn: 'Kannada',
  ta: 'Tamil',
  te: 'Telugu',
  ur: 'Urdu',
  bn: 'Bengali',
  other: 'Other medium',
};

export const TRACK_LABELS: Record<ExamTrack, string> = {
  board: 'Board exam preparation',
  jee_foundation: 'JEE foundation track',
  neet_foundation: 'NEET foundation track',
  olympiad: 'Olympiad / higher-order thinking',
};

export function validateBoardContext(ctx: Partial<BoardContext>): BoardContext {
  const board = (ctx.board ?? 'cbse') as SupportedBoard;
  const medium = (ctx.medium ?? 'en') as SupportedMedium;
  const track = (ctx.track ?? 'board') as ExamTrack;

  return {
    board,
    medium,
    grade: ctx.grade,
    track,
    excludedTopics: Array.isArray(ctx.excludedTopics) ? ctx.excludedTopics : [],
    includedTopics: Array.isArray(ctx.includedTopics) ? ctx.includedTopics : [],
    answerFormats: Array.isArray(ctx.answerFormats) ? ctx.answerFormats : ['mcq', 'short'],
  };
}

export function boardDisplayLabels(ctx: BoardContext): {
  boardLabel: string;
  mediumLabel: string;
  trackLabel: string;
} {
  return {
    boardLabel: BOARD_LABELS[ctx.board] ?? BOARD_LABELS.other,
    mediumLabel: MEDIUM_LABELS[ctx.medium ?? 'en'] ?? MEDIUM_LABELS.other,
    trackLabel: TRACK_LABELS[ctx.track ?? 'board'] ?? TRACK_LABELS.board,
  };
}

/**
 * Build a compact block of board context to prepend to the LLM prompt.
 */
export function buildBoardContextPrompt(ctx: BoardContext, topic: string): string {
  const { boardLabel, mediumLabel, trackLabel } = boardDisplayLabels(ctx);
  const lines = [
    `Board context:`,
    `- Board: ${boardLabel}`,
    `- Medium of instruction: ${mediumLabel}`,
    `- Track: ${trackLabel}`,
  ];

  if (ctx.grade) lines.push(`- Grade: ${ctx.grade}`);
  if (ctx.excludedTopics && ctx.excludedTopics.length > 0) {
    lines.push(`- Excluded/reduced-syllabus topics (DO NOT use): ${ctx.excludedTopics.join(', ')}`);
  }
  if (ctx.includedTopics && ctx.includedTopics.length > 0) {
    lines.push(`- Focus sub-topics: ${ctx.includedTopics.join(', ')}`);
  }
  if (ctx.answerFormats && ctx.answerFormats.length > 0) {
    lines.push(`- Required answer formats: ${ctx.answerFormats.join(', ')}`);
  }

  lines.push(
    `- Topic for this worksheet: ${topic}`,
    ``,
    `Rules:`,
    `1. Use terminology and sequencing appropriate for the board above.`,
    `2. Respect excluded topics strictly.`,
    `3. Match the requested answer formats and difficulty level.`,
    `4. For JEE/NEET foundation tracks, raise conceptual depth but keep the topic within the student's grade ceiling.`,
    `5. Generate questions in ${mediumLabel} unless the user explicitly asks for English.`,
  );

  return lines.join('\n');
}

/**
 * Known reduced/excluded topics by board (2025-26). Keep this minimal and
 * validate against official PDFs each academic year.
 */
export function defaultExcludedTopics(board: SupportedBoard, grade?: number): string[] {
  if (board === 'cbse' && grade === 10) {
    // CBSE 2025-26 has reduced Constructions and some geometry theorems.
    return ['constructions', 'construction of tangents'];
  }
  return [];
}
