import { NextRequest } from 'next/server';
import { callLLM } from '@/lib/ai/llm';
import type { LanguageModel } from 'ai';
import { resolveModelFromHeaders } from '@/lib/server/resolve-model';
import { apiError } from '@/lib/server/api-response';
import { createLogger } from '@/lib/logger';
import { generateWorksheetPDF } from '@/lib/worksheet/pdf-generator';
import type { QuizQuestion } from '@/lib/types/stage';
import type { StudentProfile } from '@/lib/types/generation';
import {
  type BoardContext,
  validateBoardContext,
  buildBoardContextPrompt,
  defaultExcludedTopics,
} from '@/lib/worksheet/board-context';

const log = createLogger('Worksheet PDF API');

export const maxDuration = 300;

interface PDFRequestBody {
  students: StudentProfile[];
  topic: string;
  questionCount: number;
  difficulty: 'easy' | 'medium' | 'hard';
  questionTypes: ('single' | 'multiple' | 'text')[];
  extraInstructions?: string;
  board?: BoardContext['board'];
  medium?: BoardContext['medium'];
  grade?: number;
  track?: BoardContext['track'];
  excludedTopics?: string[];
  includedTopics?: string[];
  answerFormats?: BoardContext['answerFormats'];
}

async function generateQuestionsForStudent(
  student: StudentProfile,
  config: Omit<PDFRequestBody, 'students'>,
  model: LanguageModel,
): Promise<QuizQuestion[]> {
  const boardContext = validateBoardContext({
    board: config.board,
    medium: config.medium,
    grade: config.grade,
    track: config.track,
    excludedTopics: config.excludedTopics,
    includedTopics: config.includedTopics,
    answerFormats: config.answerFormats,
  });

  // Merge user-provided exclusions with known board defaults.
  const knownExclusions = defaultExcludedTopics(boardContext.board, boardContext.grade);
  boardContext.excludedTopics = Array.from(
    new Set([...(boardContext.excludedTopics || []), ...knownExclusions]),
  );

  const boardPrompt = buildBoardContextPrompt(boardContext, config.topic);

  const prompt = `${boardPrompt}

Generate ${config.questionCount} ${config.difficulty} questions for the topic "${config.topic}".

Student Profile:
Name: ${student.name}
Grade: ${student.grade || 'unspecified'}
Weak topics: ${(student.weakTopics || []).join(', ') || 'None specified'}
Strong topics: ${(student.strongTopics || []).join(', ') || 'None specified'}
Past performance: ${(student.pastPerformance || []).map((p) => `- ${p.topic}: ${Math.round(p.accuracy * 100)}% over ${p.attempts} attempts`).join('\n') || 'No records'}

${config.extraInstructions ? `Additional instructions: ${config.extraInstructions}\n` : ''}Emphasize weak topics. Address the student by name where natural. Output ONLY a JSON array of question objects.`;

  const result = await callLLM(
    {
      model,
      system: `You are a professional educational assessment designer for Indian school curricula. Generate quiz questions as a JSON array. Respect the board context, excluded topics, and answer formats. Every question must include analysis and points. If math formulas are needed, use plain text description instead of LaTeX syntax.`,
      messages: [
        {
          role: 'user' as const,
          content: prompt,
        },
      ],
    },
    'worksheet-pdf',
    { retries: 1 },
  );

  const text = result.text.trim();
  
  // Try parsing the entire response first
  let questions: QuizQuestion[];
  try {
    questions = JSON.parse(text) as QuizQuestion[];
  } catch {
    // Fall back to extracting first JSON array
    const match = text.match(/\[[\s\S]*?\]/); // non-greedy
    if (!match) {
      throw new Error('Failed to parse generated questions: no JSON array found');
    }
    questions = JSON.parse(match[0]) as QuizQuestion[];
  }
  
  return questions.map((q, i) => ({
    ...q,
    id: q.id || `q_${i + 1}`,
  }));
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as PDFRequestBody;
    const {
      students,
      topic,
      questionCount,
      difficulty,
      questionTypes,
      extraInstructions,
      board,
      medium,
      grade,
      track,
      excludedTopics,
      includedTopics,
      answerFormats,
    } = body;

    if (!Array.isArray(students) || students.length === 0) {
      return apiError('MISSING_REQUIRED_FIELD', 400, 'No students provided');
    }
    if (!topic) {
      return apiError('MISSING_REQUIRED_FIELD', 400, 'Topic is required');
    }
    if (!questionCount || questionCount < 1) {
      return apiError('MISSING_REQUIRED_FIELD', 400, 'Invalid question count');
    }
    if (!Array.isArray(questionTypes) || questionTypes.length === 0) {
      return apiError('MISSING_REQUIRED_FIELD', 400, 'No question types selected');
    }

    const { model, modelString } = await resolveModelFromHeaders(req);
    log.info({
      studentCount: students.length,
      board: board ?? 'cbse',
      track: track ?? 'board',
      topic,
      model: modelString,
    }, 'Worksheet PDF request received');

    const sharedBoardContext = validateBoardContext({
      board,
      medium,
      grade,
      track,
      excludedTopics,
      includedTopics,
      answerFormats,
    });

    // Generate questions for all students in parallel
    const generated = await Promise.all(
      students.map(async (student) => {
        try {
          const questions = await generateQuestionsForStudent(
            student,
            {
              topic,
              questionCount,
              difficulty,
              questionTypes,
              extraInstructions,
              board: sharedBoardContext.board,
              medium: sharedBoardContext.medium,
              grade: sharedBoardContext.grade,
              track: sharedBoardContext.track,
              excludedTopics: sharedBoardContext.excludedTopics,
              includedTopics: sharedBoardContext.includedTopics,
              answerFormats: sharedBoardContext.answerFormats,
            },
            model,
          );
          return { student, questions, error: null };
        } catch (error) {
          const msg = error instanceof Error ? error.message : String(error);
          log.error({ error: msg }, 'Failed to generate questions for student');
          return { student, questions: [], error: msg };
        }
      }),
    );

    const successful = generated.filter((g) => g.questions.length > 0);
    const failed = generated.filter((g) => g.error);

    if (successful.length === 0) {
      return apiError(
        'GENERATION_FAILED',
        500,
        `Failed to generate worksheets: ${failed.map((f) => `${f.student.name}: ${f.error}`).join('; ')}`,
      );
    }

    // Generate PDFs for each successful student and merge by concatenation
    const generatedAt = new Date().toLocaleDateString();
    const pdfBuffers = await Promise.all(
      successful.map((g) =>
        generateWorksheetPDF({
          student: g.student,
          topic,
          questions: g.questions,
          generatedAt,
          boardContext: sharedBoardContext,
        }),
      ),
    );

    const finalPdf = Buffer.concat(pdfBuffers);

    const filename =
      successful.length === 1
        ? `worksheet-${successful[0].student.name.replace(/\s+/g, '-').toLowerCase()}.pdf`
        : `worksheets-${successful.length}-students.pdf`;

    return new Response(finalPdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    log.error('Failed to generate worksheet PDFs:', error);
    return apiError('INTERNAL_ERROR', 500, error instanceof Error ? error.message : String(error));
  }
}
