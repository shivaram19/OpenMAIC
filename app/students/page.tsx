'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useStudentStore } from '@/lib/worksheet/student-store';
import { StudentForm } from '@/components/worksheet/student-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  ArrowLeft,
  FileText,
  Upload,
  ScanLine,
  Files,
} from 'lucide-react';
import { toast } from 'sonner';
import type { StudentRecord, StudentCreateInput } from '@/lib/types/worksheet';
import { StudentImportModal } from '@/components/worksheet/student-import-modal';
import { MarksheetOCRModal } from '@/components/worksheet/marksheet-ocr-modal';

export default function StudentsPage() {
  const { students, loading, fetchStudents, createStudent, updateStudent, deleteStudent } =
    useStudentStore();
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [ocrOpen, setOcrOpen] = useState(false);
  const [editing, setEditing] = useState<StudentRecord | null>(null);

  useEffect(() => {
    void fetchStudents();
  }, [fetchStudents]);

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.grade || '').includes(search) ||
      (s.class || '').toLowerCase().includes(search.toLowerCase()),
  );

  const handleSubmit = async (data: StudentCreateInput) => {
    try {
      if (editing) {
        await updateStudent(editing.id, data);
        toast.success('Student updated');
      } else {
        await createStudent(data);
        toast.success('Student created');
      }
      setDialogOpen(false);
      setEditing(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save student');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this student?')) return;
    try {
      await deleteStudent(id);
      toast.success('Student deleted');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete student');
    }
  };

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (student: StudentRecord) => {
    setEditing(student);
    setDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <main className="mx-auto max-w-5xl space-y-6 px-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Student Roster</h1>
            <p className="text-sm text-slate-600">Manage students and their learning profiles.</p>
          </div>
          <div className="flex gap-2">
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-1 h-4 w-4" />
                Home
              </Button>
            </Link>
            <Link href="/worksheet">
              <Button variant="outline" size="sm">
                <FileText className="mr-1 h-4 w-4" />
                Worksheets
              </Button>
            </Link>
            <Link href="/batch-worksheets">
              <Button variant="outline" size="sm">
                <Files className="mr-1 h-4 w-4" />
                Batch
              </Button>
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search by name, grade, or class..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button variant="outline" onClick={() => setImportOpen(true)}>
            <Upload className="mr-1 h-4 w-4" />
            Import
          </Button>
          <Button variant="outline" onClick={() => setOcrOpen(true)}>
            <ScanLine className="mr-1 h-4 w-4" />
            Scan
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreate}>
                <Plus className="mr-1 h-4 w-4" />
                Add Student
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editing ? 'Edit Student' : 'Add Student'}</DialogTitle>
              </DialogHeader>
              <StudentForm
                key={editing?.id || 'new'}
                initial={editing || undefined}
                onSubmit={handleSubmit}
                onCancel={() => setDialogOpen(false)}
                submitLabel={editing ? 'Update Student' : 'Create Student'}
              />
            </DialogContent>
          </Dialog>
        </div>

        {loading && students.length === 0 ? (
          <div className="py-12 text-center text-slate-500">Loading students...</div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border bg-white py-12 text-center text-slate-500 shadow-sm">
            {students.length === 0
              ? 'No students yet. Add your first student to get started.'
              : 'No students match your search.'}
          </div>
        ) : (
          <div className="grid gap-4">
            {filtered.map((student) => (
              <div
                key={student.id}
                className="flex items-start justify-between rounded-xl border bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <div>
                  <h3 className="text-lg font-semibold">{student.name}</h3>
                  <p className="text-sm text-slate-600">
                    Grade {student.grade || '-'}
                    {student.class ? ` • ${student.class}` : ''}
                    {student.school ? ` • ${student.school}` : ''}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    {student.weakTopics && student.weakTopics.length > 0 && (
                      <span className="rounded-full bg-red-50 px-2 py-1 text-red-700">
                        Weak: {student.weakTopics.join(', ')}
                      </span>
                    )}
                    {student.strongTopics && student.strongTopics.length > 0 && (
                      <span className="rounded-full bg-green-50 px-2 py-1 text-green-700">
                        Strong: {student.strongTopics.join(', ')}
                      </span>
                    )}
                    {student.pastPerformance && student.pastPerformance.length > 0 && (
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-700">
                        {student.pastPerformance.length} topic records
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(student)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(student.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <StudentImportModal
        open={importOpen}
        onOpenChange={setImportOpen}
        onImported={() => void fetchStudents(true)}
      />
      <MarksheetOCRModal
        open={ocrOpen}
        onOpenChange={setOcrOpen}
        onImported={() => void fetchStudents(true)}
      />
    </div>
  );
}
