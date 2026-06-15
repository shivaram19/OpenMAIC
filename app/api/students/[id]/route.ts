import { NextRequest } from 'next/server';
import { readStudent, updateStudent, deleteStudent } from '@/lib/server/student-storage';
import { apiSuccess, apiError } from '@/lib/server/api-response';
import { createLogger } from '@/lib/logger';
import type { StudentUpdateInput } from '@/lib/types/worksheet';

const log = createLogger('Student API');

export const maxDuration = 60;

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const student = await readStudent(id);
    if (!student) {
      return apiError('INTERNAL_ERROR', 404, 'Student not found');
    }
    return apiSuccess({ student });
  } catch (error) {
    log.error('Failed to read student:', error);
    return apiError('INTERNAL_ERROR', 500, error instanceof Error ? error.message : String(error));
  }
}

export async function PUT(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const body = (await req.json()) as StudentUpdateInput;
    const student = await updateStudent(id, body);
    if (!student) {
      return apiError('INTERNAL_ERROR', 404, 'Student not found');
    }
    return apiSuccess({ student });
  } catch (error) {
    log.error('Failed to update student:', error);
    return apiError('INTERNAL_ERROR', 500, error instanceof Error ? error.message : String(error));
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const deleted = await deleteStudent(id);
    if (!deleted) {
      return apiError('INTERNAL_ERROR', 404, 'Student not found');
    }
    return apiSuccess({ success: true });
  } catch (error) {
    log.error('Failed to delete student:', error);
    return apiError('INTERNAL_ERROR', 500, error instanceof Error ? error.message : String(error));
  }
}
