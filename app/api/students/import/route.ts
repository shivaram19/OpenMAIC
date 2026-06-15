import { NextRequest } from 'next/server';
import { createStudent } from '@/lib/server/student-storage';
import { apiSuccess, apiError } from '@/lib/server/api-response';
import { createLogger } from '@/lib/logger';
import type { StudentCreateInput } from '@/lib/types/worksheet';

const log = createLogger('Students Import API');

export const maxDuration = 120;

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { students: StudentCreateInput[] };
    const { students } = body;

    if (!Array.isArray(students) || students.length === 0) {
      return apiError('INVALID_REQUEST', 400, 'No students provided for import');
    }

    const results = [];
    const errors: string[] = [];

    for (const input of students) {
      if (!input.name || input.name.trim().length === 0) {
        errors.push('Skipping student with missing name');
        continue;
      }

      try {
        const student = await createStudent(input);
        results.push(student);
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        errors.push(`Failed to create ${input.name}: ${msg}`);
        log.error(`Failed to import student ${input.name}:`, error);
      }
    }

    return apiSuccess({
      imported: results.length,
      failed: errors.length,
      students: results,
      errors,
    });
  } catch (error) {
    log.error('Failed to import students:', error);
    return apiError('INTERNAL_ERROR', 500, error instanceof Error ? error.message : String(error));
  }
}
