'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import type { StudentProfile } from '@/lib/types/generation';
import type { SceneOutline } from '@/lib/types/generation';
import type { GeneratedQuizContent } from '@/lib/types/generation';
import type { QuizQuestion } from '@/lib/types/stage';

import { StudentProfileForm } from '@/components/worksheet/student-profile-form';
import { WorksheetPreview } from '@/components/worksheet/worksheet-preview';
import { useStudentStore } from '@/lib/worksheet/student-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Printer, Wand2, Users, ArrowLeft, Files } from 'lucide-react';
import { getCurrentModelConfig } from '@/lib/utils/model-config';
import { toast } from 'sonner';

const QUESTION_TYPE_OPTIONS = [
  { value: 'single', label: 'Single Choice' },
  { value: 'multiple', label: 'Multiple Choice' },
  { value: 'short_answer', label: 'Short Answer' },
] as const;

export default function WorksheetPage() {
  const { students, loading: studentsLoading, fetchStudents } = useStudentStore();
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [student, setStudent] = useState<StudentProfile>({
    name: '',
    grade: '',
    class: '',
    school: '',
    weakTopics: [],
    strongTopics: [],
    engagementLevel: 'medium',
    attendanceRate: undefined,
    pastPerformance: [],
  });
  const [topic, setTopic] = useState('Fractions and Decimals for Class 5');
  const [questionCount, setQuestionCount] = useState(8);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['single', 'short_answer']);
  const [extraInstructions, setExtraInstructions] = useState('');

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [generatedAt, setGeneratedAt] = useState<string>('');
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    void fetchStudents();
  }, [fetchStudents]);

  useEffect(() => {
    if (students.length > 0 && !selectedStudentId) {
      const first = students[0];
      setSelectedStudentId(first.id);
      setStudent(first);
    }
  }, [students, selectedStudentId]);

  const handleSelectStudent = (id: string) => {
    const found = students.find((s) => s.id === id);
    if (found) {
      setSelectedStudentId(id);
      setStudent(found);
    }
  };

  const toggleType = (value: string) => {
    setSelectedTypes((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  };

  const generateWorksheet = async () => {
    if (!topic.trim()) {
      toast.error('Please enter a topic');
      return;
    }
    if (selectedTypes.length === 0) {
      toast.error('Please select at least one question type');
      return;
    }

    setLoading(true);
    setQuestions([]);

    try {
      const modelConfig = getCurrentModelConfig();
      const outline: SceneOutline = {
        id: 'worksheet-quiz',
        type: 'quiz',
        title: topic,
        description: `Personalized worksheet for ${student.name} focusing on ${(student.weakTopics || []).join(', ') || topic}. ${extraInstructions}`,
        keyPoints: [
          `Focus on weak topics: ${(student.weakTopics || []).join(', ') || topic}`,
          `Student grade: ${student.grade || 'unspecified'}`,
          `Adjust difficulty: ${difficulty}`,
          extraInstructions || 'Follow standard curriculum for the topic.',
        ],
        order: 1,
        quizConfig: {
          questionCount,
          difficulty,
          questionTypes: selectedTypes as ('single' | 'multiple' | 'text')[],
        },
      };

      const res = await fetch('/api/generate/scene-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-model': modelConfig.modelString,
          'x-api-key': modelConfig.apiKey,
          ...(modelConfig.baseUrl ? { 'x-base-url': modelConfig.baseUrl } : {}),
          ...(modelConfig.providerType ? { 'x-provider-type': modelConfig.providerType } : {}),
        },
        body: JSON.stringify({
          outline,
          allOutlines: [outline],
          stageId: 'worksheet-stage',
          languageDirective: `Teach in English at a ${student.grade ? `grade ${student.grade}` : 'school'} level.`,
          studentProfile: student,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `HTTP ${res.status}`);
      }

      const data = (await res.json()) as { content: GeneratedQuizContent };
      const generated = data.content;

      if (!generated || !generated.questions || generated.questions.length === 0) {
        throw new Error('No questions were generated');
      }

      setQuestions(generated.questions);
      setGeneratedAt(new Date().toLocaleDateString());
      toast.success(`Generated ${generated.questions.length} personalized questions`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to generate worksheet');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 print:bg-white print:py-0">
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .worksheet-print-area,
          .worksheet-print-area * {
            visibility: visible;
          }
          .worksheet-print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 0;
            box-shadow: none;
          }
        }
      `}</style>

      <main className="mx-auto max-w-5xl space-y-8 px-4 print:hidden">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Personalized Student Worksheet</h1>
            <p className="mt-2 text-slate-600">
              Generate a practice sheet tailored to one student&apos;s weak topics, pace, and level.
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-1 h-4 w-4" />
                Home
              </Button>
            </Link>
            <Link href="/students">
              <Button variant="outline" size="sm">
                <Users className="mr-1 h-4 w-4" />
                Roster
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

        <div className="space-y-4 rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Select Student</h3>
            <div className="flex gap-2">
              <Link href="/students">
                <Button variant="outline" size="sm">
                  <Users className="mr-1 h-4 w-4" />
                  Manage Students
                </Button>
              </Link>
              <Link href="/batch-worksheets">
                <Button variant="outline" size="sm">
                  <Files className="mr-1 h-4 w-4" />
                  Batch Generate
                </Button>
              </Link>
            </div>
          </div>
          {studentsLoading && students.length === 0 ? (
            <div className="text-sm text-slate-500">Loading students...</div>
          ) : students.length === 0 ? (
            <div className="text-sm text-slate-500">
              No students found.{' '}
              <Link href="/students" className="font-medium underline">
                Add a student
              </Link>{' '}
              first.
            </div>
          ) : (
            <Select value={selectedStudentId} onValueChange={handleSelectStudent}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a student" />
              </SelectTrigger>
              <SelectContent>
                {students.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name} — Grade {s.grade || '-'}
                    {s.class ? ` (${s.class})` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <StudentProfileForm value={student} onChange={setStudent} />
        </div>

        <div className="space-y-4 rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="text-lg font-semibold">Worksheet Settings</h3>

          <div className="space-y-2">
            <Label htmlFor="topic">Topic / Syllabus</Label>
            <Input
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Fractions for Class 5"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="count">Number of Questions</Label>
              <Input
                id="count"
                type="number"
                min={1}
                max={30}
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select
                value={difficulty}
                onValueChange={(v) => setDifficulty(v as typeof difficulty)}
              >
                <SelectTrigger id="difficulty">
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Question Types</Label>
              <div className="flex flex-wrap gap-3 pt-2">
                {QUESTION_TYPE_OPTIONS.map((opt) => (
                  <label key={opt.value} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={selectedTypes.includes(opt.value)}
                      onCheckedChange={() => toggleType(opt.value)}
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="extra">Extra Instructions (optional)</Label>
            <Textarea
              id="extra"
              value={extraInstructions}
              onChange={(e) => setExtraInstructions(e.target.value)}
              placeholder="e.g. Include real-life word problems, avoid negative numbers..."
              rows={2}
            />
          </div>

          <Button onClick={generateWorksheet} disabled={loading} size="lg" className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating personalized worksheet...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" />
                Generate Worksheet for {student.name}
              </>
            )}
          </Button>
        </div>

        {questions.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Preview</h3>
              <Button variant="outline" onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" />
                Print / Save as PDF
              </Button>
            </div>
            <WorksheetPreview
              ref={printRef}
              student={student}
              topic={topic}
              questions={questions}
              generatedAt={generatedAt}
            />
          </div>
        )}
      </main>

      {/* Print-only view */}
      {questions.length > 0 && (
        <div className="hidden print:block">
          <WorksheetPreview
            student={student}
            topic={topic}
            questions={questions}
            generatedAt={generatedAt}
          />
        </div>
      )}
    </div>
  );
}
