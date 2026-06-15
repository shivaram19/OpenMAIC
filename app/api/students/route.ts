import { NextRequest } from 'next/server';
import { listStudents, createStudent } from '@/lib/server/student-storage';
import { apiSuccess, apiError } from '@/lib/server/api-response';
import { createLogger } from '@/lib/logger';
import type { StudentCreateInput } from '@/lib/types/worksheet';

const log = createLogger('Students API');

export const maxDuration = 60;

export async function GET() {
  try {
    const students = await listStudents();
    return apiSuccess({ students });
  } catch (error) {
    log.error('Failed to list students:', error);
    return apiError('INTERNAL_ERROR', 500, error instanceof Error ? error.message : String(error));
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as StudentCreateInput;

    if (!body.name || body.name.trim().length === 0) {
      return apiError('MISSING_REQUIRED_FIELD', 400, 'Student name is required');
    }

    const student = await createStudent(body);
    return apiSuccess({ student }, 201);
  } catch (error) {
    log.error('Failed to create student:', error);
    return apiError('INTERNAL_ERROR', 500, error instanceof Error ? error.message : String(error));
  }
}
