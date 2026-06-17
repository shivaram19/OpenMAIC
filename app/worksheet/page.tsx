'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import type { StudentProfile, SceneOutline, GeneratedQuizContent } from '@/lib/types/generation';
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
import { Badge } from '@/components/ui/badge';
import { Loader2, Printer, Wand2, Users, ArrowLeft, Files, GraduationCap, BookOpen } from 'lucide-react';
import { getCurrentModelConfig } from '@/lib/utils/model-config';
import { toast } from 'sonner';
import {
  BOARD_LABELS,
  MEDIUM_LABELS,
  TRACK_LABELS,
  type SupportedBoard,
  type SupportedMedium,
  type ExamTrack,
  validateBoardContext,
  buildBoardContextPrompt,
  defaultExcludedTopics,
  boardDisplayLabels,
} from '@/lib/worksheet/board-context';

const QUESTION_TYPE_OPTIONS = [
  { value: 'single', label: 'Single Choice' },
  { value: 'multiple', label: 'Multiple Choice' },
  { value: 'short_answer', label: 'Short Answer' },
] as const;

const BOARD_OPTIONS = Object.entries(BOARD_LABELS).map(([value, label]) => ({
  value: value as SupportedBoard,
  label,
}));

const MEDIUM_OPTIONS = Object.entries(MEDIUM_LABELS).map(([value, label]) => ({
  value: value as SupportedMedium,
  label,
}));

const TRACK_OPTIONS = Object.entries(TRACK_LABELS).map(([value, label]) => ({
  value: value as ExamTrack,
  label,
}));

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

  const [board, setBoard] = useState<SupportedBoard>('cbse');
  const [medium, setMedium] = useState<SupportedMedium>('en');
  const [track, setTrack] = useState<ExamTrack>('board');
  const [excludedTopics, setExcludedTopics] = useState<string[]>([]);

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

  useEffect(() => {
    const gradeNum = Number(student.grade);
    setExcludedTopics(
      defaultExcludedTopics(board, Number.isNaN(gradeNum) ? undefined : gradeNum),
    );
  }, [board, student.grade]);

  const boardContext = useMemo(() => {
    const gradeNum = Number(student.grade);
    return validateBoardContext({
      board,
      medium,
      grade: Number.isNaN(gradeNum) ? undefined : gradeNum,
      track,
      excludedTopics,
    });
  }, [board, medium, student.grade, track, excludedTopics]);

  const boardLabels = useMemo(() => boardDisplayLabels(boardContext), [boardContext]);

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
      const boardPrompt = buildBoardContextPrompt(boardContext, topic);
      const weakTopicsText = (student.weakTopics || []).join(', ') || topic;

      const outline: SceneOutline = {
        id: 'worksheet-quiz',
        type: 'quiz',
        title: topic,
        description: `${boardPrompt}\n\nPersonalized worksheet for ${student.name} focusing on ${weakTopicsText}. ${extraInstructions}`.trim(),
        keyPoints: [
          boardPrompt,
          `Focus on weak topics: ${weakTopicsText}`,
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

      const mediumName = boardLabels.mediumLabel;
      const boardName = boardLabels.boardLabel;
      const languageDirective = `Teach in ${mediumName} at a ${student.grade ? `grade ${student.grade}` : 'school'} level. Use terminology from ${boardName}. Respect excluded topics and answer formats.`;

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
          languageDirective,
          studentProfile: student,
          boardContext,
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
    <div className="min-h-screen bg-background py-8 print:bg-white print:py-0">
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
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Personalized Student Worksheet
            </h1>
            <p className="mt-2 text-muted-foreground">
              Generate a board-aligned practice sheet tailored to one student&apos;s weak topics, pace, and level.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
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

        <section className="space-y-4 rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Select Student</h2>
            </div>
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
            <div className="text-sm text-muted-foreground">Loading students...</div>
          ) : students.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No students found.{' '}
              <Link href="/students" className="font-medium underline underline-offset-2 hover:text-primary">
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
        </section>

        <section className="space-y-4 rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Board & Syllabus</h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="board">Board</Label>
              <Select value={board} onValueChange={(v) => setBoard(v as SupportedBoard)}>
                <SelectTrigger id="board">
                  <SelectValue placeholder="Select board" />
                </SelectTrigger>
                <SelectContent>
                  {BOARD_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="medium">Medium of Instruction</Label>
              <Select value={medium} onValueChange={(v) => setMedium(v as SupportedMedium)}>
                <SelectTrigger id="medium">
                  <SelectValue placeholder="Select medium" />
                </SelectTrigger>
                <SelectContent>
                  {MEDIUM_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="track">Track</Label>
              <Select value={track} onValueChange={(v) => setTrack(v as ExamTrack)}>
                <SelectTrigger id="track">
                  <SelectValue placeholder="Select track" />
                </SelectTrigger>
                <SelectContent>
                  {TRACK_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="topic">Topic / Syllabus</Label>
            <Input
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Fractions for Class 5"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{boardLabels.boardLabel}</Badge>
            <Badge variant="secondary">{boardLabels.mediumLabel}</Badge>
            <Badge variant="secondary">{boardLabels.trackLabel}</Badge>
            {excludedTopics.length > 0 && (
              <Badge variant="outline" className="border-destructive text-destructive">
                Excludes: {excludedTopics.join(', ')}
              </Badge>
            )}
          </div>
        </section>

        <section className="space-y-4 rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Worksheet Settings</h2>

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
                Generate Worksheet{student.name ? ` for ${student.name}` : ''}
              </>
            )}
          </Button>
        </section>

        {questions.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Preview</h2>
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
              boardContext={boardContext}
            />
          </section>
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
            boardContext={boardContext}
          />
        </div>
      )}
    </div>
  );
}
