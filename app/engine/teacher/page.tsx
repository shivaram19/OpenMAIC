'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { DemoShell } from '@/components/engine/demo-shell';
import { StudentGapCard } from '@/components/engine/student-gap-card';
import { QuestionVaultPicker } from '@/components/engine/question-vault-picker';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDemoState } from '@/lib/abhyasa-engine/use-demo-state';
import { computeDiagnosticMarks, getClassTopicSummary } from '@/lib/abhyasa-engine/diagnostics';
import { selectQuestionsForStudent } from '@/lib/abhyasa-engine/selector';
import { toast } from 'sonner';
import { Loader2, Wand2, Send } from 'lucide-react';

export default function TeacherDashboardPage() {
  const { state, hydrated, assignSet } = useDemoState();
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sending, setSending] = useState(false);

  const marks = useMemo(() => {
    if (!state) return [];
    return computeDiagnosticMarks(state.students, state.vault, state.examResults);
  }, [state]);

  const classSummary = useMemo(() => getClassTopicSummary(marks), [marks]);

  const selectedStudent = useMemo(() => {
    if (!state) return undefined;
    return state.students.find((s) => s.id === selectedStudentId);
  }, [state, selectedStudentId]);

  const studentMarks = useMemo(() => {
    if (!selectedStudent) return [];
    return marks
      .filter((m) => m.studentId === selectedStudent.id)
      .sort((a, b) => a.accuracy - b.accuracy);
  }, [selectedStudent, marks]);

  const autoSelect = () => {
    if (!state || !selectedStudent) return;
    const picked = selectQuestionsForStudent(
      selectedStudent.id,
      marks,
      state.vault,
      state.assignedSets,
      { count: 8 },
    );
    setSelectedIds(picked.map((q) => q.id));
    toast.success(`Auto-selected ${picked.length} questions`);
  };

  const sendToOperator = () => {
    if (!selectedStudent || selectedIds.length === 0) {
      toast.error('Select a student and at least one question');
      return;
    }
    setSending(true);
    setTimeout(() => {
      assignSet({
        studentId: selectedStudent.id,
        assignedBy: 'Ms. Lakshmi',
        questionIds: selectedIds,
        status: 'sent_to_operator',
      });
      setSending(false);
      setSelectedIds([]);
      toast.success('Worksheet sent to operator');
    }, 400);
  };

  if (!hydrated) {
    return (
      <DemoShell>
        <div className="py-20 text-center text-slate-500">Loading...</div>
      </DemoShell>
    );
  }

  if (!state) {
    return (
      <DemoShell>
        <Card className="mx-auto max-w-xl text-center">
          <CardHeader>
            <CardTitle>No demo data</CardTitle>
            <CardDescription>Load sample data first to use the teacher dashboard.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/engine/demo">Go to Demo Setup</Link>
            </Button>
          </CardContent>
        </Card>
      </DemoShell>
    );
  }

  return (
    <DemoShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Teacher Dashboard</h1>
            <p className="text-sm text-slate-600">
              Diagnose class gaps and assign personalized questions.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Select a student" />
              </SelectTrigger>
              <SelectContent>
                {state.students.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name} · Grade {s.grade}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={autoSelect} disabled={!selectedStudent}>
              <Wand2 className="mr-2 h-4 w-4" />
              Auto-pick
            </Button>
          </div>
        </div>

        <Tabs defaultValue="class">
          <TabsList>
            <TabsTrigger value="class">Class Health</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="assign">Assign Worksheet</TabsTrigger>
          </TabsList>

          <TabsContent value="class" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Topic-level accuracy</CardTitle>
                <CardDescription>
                  Average accuracy across the class, sorted weakest first.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {classSummary.slice(0, 12).map((t) => (
                    <div
                      key={`${t.subject}-${t.topic}`}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="capitalize">
                          {t.subject}
                        </Badge>
                        <span className="font-medium">{t.topic}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-slate-500">{t.weakStudents} weak</span>
                        <span className="w-16 text-right font-semibold">
                          {Math.round(t.avgAccuracy * 100)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="students" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {state.students.slice(0, 12).map((s) => {
              const smarks = marks
                .filter((m) => m.studentId === s.id)
                .sort((a, b) => a.accuracy - b.accuracy);
              return (
                <StudentGapCard key={s.id} studentName={s.name} grade={s.grade} marks={smarks} />
              );
            })}
          </TabsContent>

          <TabsContent value="assign" className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Selected student</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedStudent ? (
                  <>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-lg font-semibold">{selectedStudent.name}</div>
                        <div className="text-sm text-slate-500">
                          Grade {selectedStudent.grade} · {selectedStudent.class}
                        </div>
                      </div>
                      <Button
                        onClick={sendToOperator}
                        disabled={selectedIds.length === 0 || sending}
                      >
                        {sending ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="mr-2 h-4 w-4" />
                        )}
                        Send to operator
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Gaps</div>
                      {studentMarks.length === 0 ? (
                        <p className="text-sm text-slate-500">No gaps found.</p>
                      ) : (
                        studentMarks.slice(0, 6).map((m) => (
                          <div
                            key={`${m.subject}-${m.topic}`}
                            className="flex items-center justify-between rounded-md bg-slate-50 p-2 text-sm"
                          >
                            <span className="capitalize">
                              {m.subject} · {m.topic}
                            </span>
                            <Badge
                              variant={
                                m.masteryLevel === 'weak'
                                  ? 'destructive'
                                  : m.masteryLevel === 'building'
                                    ? 'secondary'
                                    : 'default'
                              }
                            >
                              {Math.round(m.accuracy * 100)}%
                            </Badge>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="text-sm text-slate-500">
                      {selectedIds.length} question{selectedIds.length !== 1 ? 's' : ''} selected
                    </div>
                  </>
                ) : (
                  <div className="py-8 text-center text-slate-500">
                    Select a student above to start assigning.
                  </div>
                )}
              </CardContent>
            </Card>

            <QuestionVaultPicker
              vault={state.vault}
              marks={studentMarks}
              selectedIds={selectedIds}
              onChange={setSelectedIds}
            />
          </TabsContent>
        </Tabs>
      </div>
    </DemoShell>
  );
}
