import { NextRequest } from 'next/server';
import { callLLM } from '@/lib/ai/llm';
import { resolveModelFromHeaders } from '@/lib/server/resolve-model';
import { apiSuccess, apiError } from '@/lib/server/api-response';
import { createLogger } from '@/lib/logger';
import { parseJsonResponse } from '@/lib/generation/json-repair';
import { aggregateRows } from '@/lib/worksheet/import-parsers';
import type { ParsedStudentRow } from '@/lib/worksheet/import-parsers';

const log = createLogger('OCR Marksheet API');

export const maxDuration = 120;

const OCR_SYSTEM_PROMPT = `You are an expert OCR and data extraction assistant. Your task is to read a scanned school marksheet image and extract student performance data as structured JSON.

Look for:
- Student names
- Grade/class/school (if visible)
- Subject or topic names
- Marks, scores, or accuracy percentages
- Number of attempts or tests (if shown)
- Dates (if shown)

Rules:
1. Convert all marks/scores into an accuracy percentage between 0 and 100. If the marksheet shows raw scores like "18/20", calculate the percentage: 18/20 = 90.
2. If a cell shows a letter grade, map it approximately: A=90, B=75, C=60, D=45, F=30. Use your best judgment.
3. If topic names are not explicit, infer them from subject column headers.
4. If a value is missing, use empty string or omit it.
5. Return ONLY a JSON object with this exact shape:

{
  "rows": [
    {
      "name": "Student Name",
      "grade": "5",
      "class": "5B",
      "school": "School Name",
      "weakTopics": "Topic1,Topic2",
      "strongTopics": "Topic3,Topic4",
      "engagementLevel": "medium",
      "attendanceRate": "88",
      "topic": "Fractions",
      "accuracy": "45",
      "attempts": "3",
      "lastAttemptedAt": "2026-05-15"
    }
  ]
}

Important:
- Do NOT wrap the JSON in markdown code fences.
- Do NOT include any explanation or prose.
- If the same student appears in multiple rows with different topics, include all rows. They will be grouped by name/grade/class/school later.
- If no marksheet is detected, return {"rows": []}.
- If a column header is ambiguous, make a reasonable assumption and extract the data.`;

export async function POST(req: NextRequest) {
  let imageFileName: string | undefined;
  try {
    const contentType = req.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return apiError('INVALID_REQUEST', 400, 'Expected multipart/form-data');
    }

    const formData = await req.formData();
    const imageFile = formData.get('image') as File | null;
    const grade = (formData.get('grade') as string | null) || undefined;
    const className = (formData.get('class') as string | null) || undefined;
    const school = (formData.get('school') as string | null) || undefined;

    if (!imageFile) {
      return apiError('MISSING_REQUIRED_FIELD', 400, 'No image file provided');
    }

    imageFileName = imageFile.name;

    // Resolve model from headers (same pattern as other endpoints)
    const { model, modelInfo, modelString } = await resolveModelFromHeaders(req);

    if (!modelInfo?.capabilities?.vision) {
      return apiError(
        'INVALID_REQUEST',
        400,
        `Selected model ${modelString} does not support vision. Please use a vision-capable model like openai:gpt-4o or google:gemini-3-flash-preview.`,
      );
    }

    // Convert image to base64 data URI
    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mimeType = imageFile.type || 'image/jpeg';
    const base64 = buffer.toString('base64');
    const dataUri = `data:${mimeType};base64,${base64}`;

    log.info(`Running OCR on marksheet [model=${modelString}, file=${imageFileName}]`);

    const result = await callLLM(
      {
        model,
        system: OCR_SYSTEM_PROMPT,
        messages: [
          {
            role: 'user' as const,
            content: [
              {
                type: 'text',
                text: 'Extract all student performance data from this marksheet image as JSON.',
              },
              {
                type: 'image',
                image: dataUri,
              },
            ],
          },
        ],
      },
      'ocr-marksheet',
    );

    const parsed = parseJsonResponse<{ rows: ParsedStudentRow[] }>(result.text);
    if (!parsed || !Array.isArray(parsed.rows)) {
      return apiError('GENERATION_FAILED', 500, 'Failed to parse OCR response');
    }

    // Apply default context values if provided
    const rows = parsed.rows.map((row) => ({
      ...row,
      grade: row.grade || grade || '',
      class: row.class || className || '',
      school: row.school || school || '',
    }));

    const importResult = aggregateRows(rows);

    return apiSuccess({
      rows: rows.length,
      students: importResult.students,
      errors: importResult.errors,
      rawResponse: result.text,
    });
  } catch (error) {
    log.error(`OCR marksheet failed [file="${imageFileName ?? 'unknown'}"]:`, error);
    return apiError('INTERNAL_ERROR', 500, error instanceof Error ? error.message : String(error));
  }
}
