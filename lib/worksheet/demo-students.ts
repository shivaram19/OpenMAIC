import type { StudentProfile } from '@/lib/types/generation';

export const DEMO_STUDENTS: StudentProfile[] = [
  {
    name: 'Aarav Sharma',
    grade: '5',
    class: '5B',
    school: 'Greenfield Public School',
    weakTopics: ['Fractions', 'Decimals', 'Word Problems'],
    strongTopics: ['Addition', 'Subtraction', 'Multiplication Tables'],
    engagementLevel: 'medium',
    attendanceRate: 0.88,
    pastPerformance: [
      { topic: 'Fractions', accuracy: 0.45, attempts: 3, lastAttemptedAt: '2026-05-15' },
      { topic: 'Decimals', accuracy: 0.52, attempts: 2, lastAttemptedAt: '2026-05-20' },
      { topic: 'Word Problems', accuracy: 0.4, attempts: 4, lastAttemptedAt: '2026-05-22' },
      { topic: 'Addition', accuracy: 0.92, attempts: 5, lastAttemptedAt: '2026-05-18' },
      { topic: 'Subtraction', accuracy: 0.88, attempts: 5, lastAttemptedAt: '2026-05-18' },
    ],
  },
  {
    name: 'Priya Patel',
    grade: '7',
    class: '7A',
    school: 'Greenfield Public School',
    weakTopics: ['Algebraic Expressions', 'Linear Equations'],
    strongTopics: ['Geometry', 'Data Handling', 'Integers'],
    engagementLevel: 'high',
    attendanceRate: 0.96,
    pastPerformance: [
      {
        topic: 'Algebraic Expressions',
        accuracy: 0.55,
        attempts: 3,
        lastAttemptedAt: '2026-05-16',
      },
      { topic: 'Linear Equations', accuracy: 0.48, attempts: 2, lastAttemptedAt: '2026-05-21' },
      { topic: 'Geometry', accuracy: 0.9, attempts: 4, lastAttemptedAt: '2026-05-19' },
      { topic: 'Data Handling', accuracy: 0.85, attempts: 3, lastAttemptedAt: '2026-05-17' },
    ],
  },
  {
    name: 'Rohan Gupta',
    grade: '4',
    class: '4C',
    school: 'Greenfield Public School',
    weakTopics: ['Division', 'Money & Bills', 'Measurement'],
    strongTopics: ['Place Value', 'Number Patterns', 'Shapes'],
    engagementLevel: 'low',
    attendanceRate: 0.75,
    pastPerformance: [
      { topic: 'Division', accuracy: 0.38, attempts: 3, lastAttemptedAt: '2026-05-14' },
      { topic: 'Money & Bills', accuracy: 0.5, attempts: 2, lastAttemptedAt: '2026-05-20' },
      { topic: 'Measurement', accuracy: 0.42, attempts: 2, lastAttemptedAt: '2026-05-22' },
      { topic: 'Place Value', accuracy: 0.95, attempts: 4, lastAttemptedAt: '2026-05-18' },
    ],
  },
];

export const DEFAULT_DEMO_STUDENT = DEMO_STUDENTS[0];
