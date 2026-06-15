import { promises as fs } from 'fs';
import path from 'path';
import type { StudentRecord, StudentCreateInput, StudentUpdateInput } from '@/lib/types/worksheet';

export const STUDENTS_DIR = path.join(process.cwd(), 'data', 'students');

async function ensureStudentsDir() {
  await fs.mkdir(STUDENTS_DIR, { recursive: true });
}

function buildStudentFilePath(id: string): string {
  return path.join(STUDENTS_DIR, `${id}.json`);
}

export function isValidStudentId(id: string): boolean {
  return /^[a-zA-Z0-9_-]+$/.test(id);
}

export function slugifyStudentId(input: StudentCreateInput): string {
  const base = [input.name, input.grade, input.class, input.school]
    .filter(Boolean)
    .join('-')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return `${base}-${Date.now()}`;
}

export async function listStudents(): Promise<StudentRecord[]> {
  await ensureStudentsDir();
  try {
    const files = await fs.readdir(STUDENTS_DIR);
    const records = await Promise.all(
      files
        .filter((f) => f.endsWith('.json'))
        .map(async (f) => {
          const content = await fs.readFile(path.join(STUDENTS_DIR, f), 'utf-8');
          return JSON.parse(content) as StudentRecord;
        }),
    );
    return records.sort((a, b) => a.name.localeCompare(b.name));
  } catch {
    return [];
  }
}

export async function readStudent(id: string): Promise<StudentRecord | null> {
  if (!isValidStudentId(id)) return null;
  const filePath = buildStudentFilePath(id);
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content) as StudentRecord;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null;
    throw error;
  }
}

export async function createStudent(input: StudentCreateInput): Promise<StudentRecord> {
  await ensureStudentsDir();
  const id = slugifyStudentId(input);
  const now = new Date().toISOString();
  const record: StudentRecord = {
    ...input,
    pastPerformance: input.pastPerformance || [],
    id,
    createdAt: now,
    updatedAt: now,
  };
  await fs.writeFile(buildStudentFilePath(id), JSON.stringify(record, null, 2), 'utf-8');
  return record;
}

export async function updateStudent(
  id: string,
  input: StudentUpdateInput,
): Promise<StudentRecord | null> {
  if (!isValidStudentId(id)) return null;
  const existing = await readStudent(id);
  if (!existing) return null;

  const updated: StudentRecord = {
    ...existing,
    ...input,
    pastPerformance: input.pastPerformance ?? existing.pastPerformance,
    id: existing.id,
    createdAt: existing.createdAt,
    updatedAt: new Date().toISOString(),
  };

  await fs.writeFile(buildStudentFilePath(id), JSON.stringify(updated, null, 2), 'utf-8');
  return updated;
}

export async function deleteStudent(id: string): Promise<boolean> {
  if (!isValidStudentId(id)) return false;
  const filePath = buildStudentFilePath(id);
  try {
    await fs.unlink(filePath);
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return false;
    throw error;
  }
}
