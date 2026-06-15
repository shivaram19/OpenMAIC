import { create } from 'zustand';
import type { StudentRecord, StudentCreateInput, StudentUpdateInput } from '@/lib/types/worksheet';

interface StudentState {
  students: StudentRecord[];
  loading: boolean;
  error: string | null;
  lastLoadedAt: number | null;

  fetchStudents: (force?: boolean) => Promise<void>;
  createStudent: (input: StudentCreateInput) => Promise<StudentRecord | null>;
  updateStudent: (id: string, input: StudentUpdateInput) => Promise<StudentRecord | null>;
  deleteStudent: (id: string) => Promise<boolean>;
  getStudentById: (id: string) => StudentRecord | undefined;
}

export const useStudentStore = create<StudentState>((set, get) => ({
  students: [],
  loading: false,
  error: null,
  lastLoadedAt: null,

  fetchStudents: async (force = false) => {
    const { lastLoadedAt, loading } = get();
    if (loading) return;
    if (!force && lastLoadedAt && Date.now() - lastLoadedAt < 30_000) return;

    set({ loading: true, error: null });
    try {
      const res = await fetch('/api/students');
      const data = (await res.json()) as {
        success: boolean;
        students: StudentRecord[];
        error?: string;
      };
      if (!data.success) throw new Error(data.error || 'Failed to load students');
      set({ students: data.students, loading: false, lastLoadedAt: Date.now() });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : String(error), loading: false });
    }
  },

  createStudent: async (input) => {
    const res = await fetch('/api/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    const data = (await res.json()) as { success: boolean; student: StudentRecord; error?: string };
    if (!data.success) throw new Error(data.error || 'Failed to create student');

    set((state) => ({
      students: [...state.students, data.student].sort((a, b) => a.name.localeCompare(b.name)),
    }));
    return data.student;
  },

  updateStudent: async (id, input) => {
    const res = await fetch(`/api/students/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    const data = (await res.json()) as { success: boolean; student: StudentRecord; error?: string };
    if (!data.success) throw new Error(data.error || 'Failed to update student');

    set((state) => ({
      students: state.students
        .map((s) => (s.id === id ? data.student : s))
        .sort((a, b) => a.name.localeCompare(b.name)),
    }));
    return data.student;
  },

  deleteStudent: async (id) => {
    const res = await fetch(`/api/students/${id}`, { method: 'DELETE' });
    const data = (await res.json()) as { success: boolean; error?: string };
    if (!data.success) throw new Error(data.error || 'Failed to delete student');

    set((state) => ({ students: state.students.filter((s) => s.id !== id) }));
    return true;
  },

  getStudentById: (id) => {
    return get().students.find((s) => s.id === id);
  },
}));
