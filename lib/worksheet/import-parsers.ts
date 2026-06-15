import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import type { StudentCreateInput } from '@/lib/types/worksheet';

export interface ParsedStudentRow {
  name: string;
  grade?: string;
  class?: string;
  school?: string;
  weakTopics?: string;
  strongTopics?: string;
  engagementLevel?: string;
  attendanceRate?: string | number;
  topic?: string;
  accuracy?: string | number;
  attempts?: string | number;
  lastAttemptedAt?: string;
}

export interface ImportParseResult {
  students: StudentCreateInput[];
  rowCount: number;
  errors: string[];
}

const VALID_ENGAGEMENT_LEVELS = ['low', 'medium', 'high'] as const;

function normalizeEngagement(value: unknown): StudentCreateInput['engagementLevel'] {
  if (typeof value !== 'string') return 'medium';
  const normalized = value.toLowerCase().trim();
  if (normalized === 'l' || normalized === 'low') return 'low';
  if (normalized === 'h' || normalized === 'high') return 'high';
  if (normalized === 'm' || normalized === 'medium') return 'medium';
  return VALID_ENGAGEMENT_LEVELS.includes(normalized as (typeof VALID_ENGAGEMENT_LEVELS)[number])
    ? (normalized as StudentCreateInput['engagementLevel'])
    : 'medium';
}

function parseNumber(value: unknown): number | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value === 'number') return value;
  const parsed = Number(String(value).replace('%', '').trim());
  return Number.isNaN(parsed) ? undefined : parsed;
}

function parseAttendance(value: unknown): number | undefined {
  const num = parseNumber(value);
  if (num === undefined) return undefined;
  // If > 1, assume percentage (e.g. 88) and convert to 0-1
  return num > 1 ? num / 100 : num;
}

function parseAccuracy(value: unknown): number | undefined {
  const num = parseNumber(value);
  if (num === undefined) return undefined;
  // If > 1, assume percentage (e.g. 45) and convert to 0-1
  return num > 1 ? num / 100 : num;
}

function splitTopics(value: unknown): string[] {
  if (typeof value !== 'string' || !value.trim()) return [];
  return value
    .split(/[,;]/)
    .map((t) => t.trim())
    .filter(Boolean);
}

export function parseCSV(text: string): ImportParseResult {
  const parseResult = Papa.parse<ParsedStudentRow>(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim().toLowerCase(),
  });

  if (parseResult.errors.length > 0) {
    return {
      students: [],
      rowCount: 0,
      errors: parseResult.errors.map((e) => `Row ${e.row}: ${e.message}`),
    };
  }

  return aggregateRows(parseResult.data);
}

export function parseExcel(arrayBuffer: ArrayBuffer): ImportParseResult {
  try {
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<ParsedStudentRow>(firstSheet, { defval: '' });
    return aggregateRows(rows);
  } catch (error) {
    return {
      students: [],
      rowCount: 0,
      errors: [error instanceof Error ? error.message : 'Failed to parse Excel file'],
    };
  }
}

export function aggregateRows(rows: ParsedStudentRow[]): ImportParseResult {
  const errors: string[] = [];
  const grouped = new Map<string, StudentCreateInput>();

  for (const row of rows) {
    const name = (row.name || '').trim();
    if (!name) {
      errors.push('Skipping row with missing name');
      continue;
    }

    const grade = (row.grade || '').trim() || undefined;
    const className = (row.class || '').trim() || undefined;
    const school = (row.school || '').trim() || undefined;
    const key = [name, grade || '', className || '', school || ''].join('|').toLowerCase();

    if (!grouped.has(key)) {
      grouped.set(key, {
        name,
        grade,
        class: className,
        school,
        weakTopics: splitTopics(row.weakTopics),
        strongTopics: splitTopics(row.strongTopics),
        engagementLevel: normalizeEngagement(row.engagementLevel),
        attendanceRate: parseAttendance(row.attendanceRate),
        pastPerformance: [],
      });
    }

    const student = grouped.get(key)!;

    // Merge weak/strong topics across rows
    student.weakTopics = [
      ...new Set([...(student.weakTopics || []), ...splitTopics(row.weakTopics)]),
    ];
    student.strongTopics = [
      ...new Set([...(student.strongTopics || []), ...splitTopics(row.strongTopics)]),
    ];

    const topic = (row.topic || '').trim();
    if (topic) {
      const accuracy = parseAccuracy(row.accuracy);
      const attempts = parseNumber(row.attempts);
      const lastAttemptedAt = (row.lastAttemptedAt || '').trim() || undefined;

      student.pastPerformance = student.pastPerformance || [];
      student.pastPerformance.push({
        topic,
        accuracy: accuracy ?? 0,
        attempts: attempts ?? 1,
        ...(lastAttemptedAt ? { lastAttemptedAt } : {}),
      });
    }
  }

  return {
    students: Array.from(grouped.values()),
    rowCount: rows.length,
    errors,
  };
}

export function generateSampleCSV(): string {
  const headers = [
    'name',
    'grade',
    'class',
    'school',
    'weakTopics',
    'strongTopics',
    'engagementLevel',
    'attendanceRate',
    'topic',
    'accuracy',
    'attempts',
    'lastAttemptedAt',
  ];
  const rows = [
    [
      'Aarav Sharma',
      '5',
      '5B',
      'Greenfield Public School',
      'Fractions,Decimals,Word Problems',
      'Addition,Subtraction,Multiplication Tables',
      'medium',
      '88',
      'Fractions',
      '45',
      '3',
      '2026-05-15',
    ],
    [
      'Aarav Sharma',
      '5',
      '5B',
      'Greenfield Public School',
      'Fractions,Decimals,Word Problems',
      'Addition,Subtraction,Multiplication Tables',
      'medium',
      '88',
      'Decimals',
      '52',
      '2',
      '2026-05-20',
    ],
    [
      'Priya Patel',
      '7',
      '7A',
      'Greenfield Public School',
      'Algebraic Expressions,Linear Equations',
      'Geometry,Data Handling,Integers',
      'high',
      '96',
      'Algebraic Expressions',
      '55',
      '3',
      '2026-05-16',
    ],
  ];
  return [
    headers.join(','),
    ...rows.map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
  ].join('\n');
}
