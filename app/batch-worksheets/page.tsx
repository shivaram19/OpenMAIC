'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
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
import { Loader2, FileText, ArrowLeft, Users } from 'lucide-react';
import { getCurrentModelConfig } from '@/lib/utils/model-config';
import { toast } from 'sonner';

const QUESTION_TYPE_OPTIONS = [
  { value: 'single', label: 'Single Choice' },
  { value: 'multiple', label: 'Multiple Choice' },
  { value: 'text', label: 'Short Answer' },
] as const;

export default function BatchWorksheetsPage() {
  const { students, loading: studentsLoading, fetchStudents } = useStudentStore();

  const [topic, setTopic] = useState('Fractions and Decimals');
  const [questionCount, setQuestionCount] = useState(5);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['single', 'text']);
  const [extraInstructions, setExtraInstructions] = useState('');
  const [filterGrade, setFilterGrade] = useState<string>('all');
  const [filterClass, setFilterClass] = useState<string>('all');

  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState<string>('');

  useEffect(() => {
    void fetchStudents();
  }, [fetchStudents]);

  const grades = useMemo(
    () => [...new Set(students.map((s) => s.grade).filter((g): g is string => !!g))].sort(),
    [students],
  );
  const classes = useMemo(
    () => [...new Set(students.map((s) => s.class).filter((c): c is string => !!c))].sort(),
    [students],
  );

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const gradeMatch = filterGrade === 'all' || s.grade === filterGrade;
      const classMatch = filterClass === 'all' || s.class === filterClass;
      return gradeMatch && classMatch;
    });
  }, [students, filterGrade, filterClass]);

  const toggleType = (value: string) => {
    setSelectedTypes((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  };

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error('Please enter a topic');
      return;
    }
    if (selectedTypes.length === 0) {
      toast.error('Please select at least one question type');
      return;
    }
    if (filteredStudents.length === 0) {
      toast.error('No students match the selected filters');
      return;
    }

    setGenerating(true);
    setProgress(`Generating worksheets for ${filteredStudents.length} student(s)...`);

    try {
      const modelConfig = getCurrentModelConfig();
      const res = await fetch('/api/generate-worksheet-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-model': modelConfig.modelString,
          'x-api-key': modelConfig.apiKey,
          ...(modelConfig.baseUrl ? { 'x-base-url': modelConfig.baseUrl } : {}),
          ...(modelConfig.providerType ? { 'x-provider-type': modelConfig.providerType } : {}),
        },
        body: JSON.stringify({
          students: filteredStudents,
          topic,
          questionCount,
          difficulty,
          questionTypes: selectedTypes,
          extraInstructions,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status}`);
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `worksheets-${filteredStudents.length}-students.pdf`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success(`Downloaded PDF with worksheets for ${filteredStudents.length} student(s)`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to generate worksheets');
    } finally {
      setGenerating(false);
      setProgress('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <main className="mx-auto max-w-5xl space-y-6 px-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Batch Worksheet Generation</h1>
            <p className="text-sm text-slate-600">
              Generate personalized PDF worksheets for an entire class at once.
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
          </div>
        </div>

        <div className="space-y-4 rounded-xl border bg-white p-6 shadow-sm">
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
              <Label htmlFor="count">Questions per Student</Label>
              <Input
                id="count"
                type="number"
                min={1}
                max={20}
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
                  <SelectValue />
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

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="filter-grade">Filter by Grade</Label>
              <Select value={filterGrade} onValueChange={setFilterGrade}>
                <SelectTrigger id="filter-grade">
                  <SelectValue placeholder="All grades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All grades</SelectItem>
                  {grades.map((g) => (
                    <SelectItem key={g} value={g}>
                      Grade {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="filter-class">Filter by Class</Label>
              <Select value={filterClass} onValueChange={setFilterClass}>
                <SelectTrigger id="filter-class">
                  <SelectValue placeholder="All classes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All classes</SelectItem>
                  {classes.map((c) => (
                    <SelectItem key={c} value={c}>
                      Class {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
        </div>

        <div className="space-y-4 rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Selected Students</h3>
            <span className="text-sm text-slate-600">{filteredStudents.length} student(s)</span>
          </div>

          {studentsLoading && students.length === 0 ? (
            <div className="text-sm text-slate-500">Loading students...</div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-sm text-slate-500">
              No students match the filters.{' '}
              <Link href="/students" className="font-medium underline">
                Add students
              </Link>{' '}
              first.
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {filteredStudents.map((s) => (
                <div key={s.id} className="rounded-lg border p-3 text-sm">
                  <div className="font-medium">{s.name}</div>
                  <div className="text-slate-600">
                    Grade {s.grade || '-'} {s.class ? `(${s.class})` : ''}
                  </div>
                  <div className="mt-1 text-xs text-red-600">
                    Weak: {(s.weakTopics || []).join(', ') || '-'}
                  </div>
                </div>
              ))}
            </div>
          )}

          <Button
            onClick={handleGenerate}
            disabled={generating || filteredStudents.length === 0}
            size="lg"
            className="w-full"
          >
            {generating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {progress || 'Generating...'}
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Generate PDF Worksheets for {filteredStudents.length} Student(s)
              </>
            )}
          </Button>
        </div>
      </main>
    </div>
  );
}
