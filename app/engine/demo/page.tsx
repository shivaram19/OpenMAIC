'use client';

import { DemoShell } from '@/components/engine/demo-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useDemoState } from '@/lib/abhyasa-engine/use-demo-state';
import {
  Loader2,
  RefreshCcw,
  Trash2,
  Users,
  BookOpen,
  FileQuestion,
  CheckCircle,
} from 'lucide-react';
import Link from 'next/link';

const steps = [
  {
    icon: FileQuestion,
    title: '1. Exam',
    desc: 'Students attempt a diagnostic test on paper or screen.',
  },
  {
    icon: CheckCircle,
    title: '2. Correction',
    desc: 'Responses are marked right, wrong, or partial.',
  },
  {
    icon: Users,
    title: '3. Diagnose',
    desc: 'Teacher dashboard shows exactly where each child is weak.',
  },
  { icon: BookOpen, title: '4. Assign', desc: 'Teacher picks questions from the labelled vault.' },
  {
    icon: FileQuestion,
    title: '5. Print',
    desc: 'Operator generates personalized worksheets with answer keys.',
  },
];

export default function EngineDemoPage() {
  const { state, hydrated, seed, reset } = useDemoState();

  if (!hydrated) {
    return (
      <DemoShell>
        <div className="py-20 text-center text-slate-500">
          <Loader2 className="mx-auto mb-2 h-6 w-6 animate-spin" />
          Loading demo...
        </div>
      </DemoShell>
    );
  }

  return (
    <DemoShell>
      <div className="space-y-8">
        <section className="text-center">
          <h1 className="text-3xl font-bold">Abhyāsa End-to-End Engine Demo</h1>
          <p className="mx-auto mt-3 max-w-2xl text-slate-600">
            See the full loop: exam → correction → diagnosis → teacher assignment → worksheet
            generation → principal oversight.
          </p>
        </section>

        {!state ? (
          <Card className="mx-auto max-w-xl">
            <CardHeader>
              <CardTitle>Seed demo data</CardTitle>
              <CardDescription>
                Create 30 sample students, 60 labelled questions, and one corrected exam. Everything
                is stored only in this browser.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button size="lg" className="w-full" onClick={seed}>
                <RefreshCcw className="mr-2 h-4 w-4" />
                Load Sample Data
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Demo loaded</CardTitle>
                <CardDescription>
                  Seeded on {new Date(state.seededAt || '').toLocaleString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-lg bg-slate-100 p-3">
                    <div className="text-2xl font-bold">{state.students.length}</div>
                    <div className="text-xs text-slate-600">Students</div>
                  </div>
                  <div className="rounded-lg bg-slate-100 p-3">
                    <div className="text-2xl font-bold">{state.vault.length}</div>
                    <div className="text-xs text-slate-600">Questions</div>
                  </div>
                  <div className="rounded-lg bg-slate-100 p-3">
                    <div className="text-2xl font-bold">{state.assignedSets.length}</div>
                    <div className="text-xs text-slate-600">Assignments</div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button asChild className="flex-1">
                    <Link href="/engine/teacher">Open Teacher Dashboard</Link>
                  </Button>
                  <Button variant="outline" onClick={reset} className="flex-1">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Reset Data
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>The loop</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {steps.map((step) => (
                  <div key={step.title} className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <step.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">{step.title}</div>
                      <div className="text-xs text-slate-500">{step.desc}</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DemoShell>
  );
}
