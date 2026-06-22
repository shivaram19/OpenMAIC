'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { DemoShell } from '@/components/engine/demo-shell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useDemoState } from '@/lib/abhyasa-engine/use-demo-state';
import { computeDiagnosticMarks, getClassTopicSummary } from '@/lib/abhyasa-engine/diagnostics';
import { Users, FileText, AlertTriangle, TrendingUp } from 'lucide-react';

export default function PrincipalDashboardPage() {
  const { state, hydrated } = useDemoState();

  const marks = useMemo(() => {
    if (!state) return [];
    return computeDiagnosticMarks(state.students, state.vault, state.examResults);
  }, [state]);

  const summary = useMemo(() => {
    if (!state) return null;
    const topicSummary = getClassTopicSummary(marks);
    const avgAccuracy =
      marks.length > 0 ? marks.reduce((s, m) => s + m.accuracy, 0) / marks.length : 0;
    const weakStudents = new Set(
      marks.filter((m) => m.masteryLevel === 'weak').map((m) => m.studentId),
    );
    const buildingStudents = new Set(
      marks.filter((m) => m.masteryLevel === 'building').map((m) => m.studentId),
    );
    return {
      totalStudents: state.students.length,
      totalAssignments: state.assignedSets.length,
      printedAssignments: state.assignedSets.filter((s) => s.status === 'printed').length,
      avgAccuracy,
      weakStudentsCount: weakStudents.size,
      buildingStudentsCount: buildingStudents.size,
      weakestTopics: topicSummary.slice(0, 5),
      recentAssignments: [...state.assignedSets]
        .sort((a, b) => b.assignedAt.localeCompare(a.assignedAt))
        .slice(0, 5),
    };
  }, [state, marks]);

  if (!hydrated) {
    return (
      <DemoShell>
        <div className="py-20 text-center text-slate-500">Loading...</div>
      </DemoShell>
    );
  }

  if (!state || !summary) {
    return (
      <DemoShell>
        <Card className="mx-auto max-w-xl text-center">
          <CardHeader>
            <CardTitle>No demo data</CardTitle>
            <CardDescription>Load sample data first.</CardDescription>
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

  const studentMap = new Map(state.students.map((s) => [s.id, s]));

  return (
    <DemoShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Principal Overview</h1>
          <p className="text-sm text-slate-600">School-level academic health at a glance.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <div className="text-2xl font-bold">{summary.totalStudents}</div>
                <div className="text-xs text-slate-500">Students in demo</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <div className="text-2xl font-bold">{Math.round(summary.avgAccuracy * 100)}%</div>
                <div className="text-xs text-slate-500">Class avg accuracy</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-600">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <div className="text-2xl font-bold">{summary.weakStudentsCount}</div>
                <div className="text-xs text-slate-500">Students with weak topics</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {summary.printedAssignments}/{summary.totalAssignments}
                </div>
                <div className="text-xs text-slate-500">Worksheets printed</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Weakest topics</CardTitle>
              <CardDescription>Topics where the class needs the most support.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {summary.weakestTopics.map((t) => (
                <div key={`${t.subject}-${t.topic}`} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium capitalize">
                      {t.subject} · {t.topic}
                    </span>
                    <Badge variant={t.avgAccuracy < 0.5 ? 'destructive' : 'secondary'}>
                      {Math.round(t.avgAccuracy * 100)}%
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Progress value={t.avgAccuracy * 100} className="h-2 flex-1" />
                    <span className="w-10 text-right">{t.weakStudents} weak</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent assignments</CardTitle>
              <CardDescription>Worksheets sent by teachers to the operator.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {summary.recentAssignments.length === 0 ? (
                <div className="py-8 text-center text-slate-500">No assignments yet.</div>
              ) : (
                summary.recentAssignments.map((set) => {
                  const student = studentMap.get(set.studentId);
                  return (
                    <div
                      key={set.id}
                      className="flex items-center justify-between rounded-lg border p-3 text-sm"
                    >
                      <div>
                        <div className="font-medium">{student?.name || 'Unknown'}</div>
                        <div className="text-xs text-slate-500">
                          {set.questionIds.length} questions · {set.assignedBy}
                        </div>
                      </div>
                      <Badge variant={set.status === 'printed' ? 'default' : 'secondary'}>
                        {set.status}
                      </Badge>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" asChild>
            <Link href="/engine/teacher">Open Teacher Dashboard</Link>
          </Button>
          <Button asChild>
            <Link href="/engine/operator">Open Operator Desk</Link>
          </Button>
        </div>
      </div>
    </DemoShell>
  );
}
