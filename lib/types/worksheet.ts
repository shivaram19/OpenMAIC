import type { StudentProfile } from './generation';

export interface StudentRecord extends StudentProfile {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudentCreateInput extends Omit<StudentProfile, 'pastPerformance'> {
  pastPerformance?: StudentProfile['pastPerformance'];
}

export type StudentUpdateInput = Partial<StudentCreateInput>;
