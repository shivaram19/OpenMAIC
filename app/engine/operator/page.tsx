'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { DemoShell } from '@/components/engine/demo-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDemoState } from '@/lib/abhyasa-engine/use-demo-state';
import { buildWorksheetPayload } from '@/lib/abhyasa-engine/format-worksheet';
import { Loader2, Printer } from 'lucide-react';
import { toast } from 'sonner';
import { getCurrentModelConfig } from '@/lib/utils/model-config';

export default function OperatorPage() {
  const { state, hydrated, updateSetStatus } = useDemoState();
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  const vaultMap = useMemo(() => {
    if (!state) return new Map();
    return new Map(state.vault.map((q) => [q.id, q]));
  }, [state]);

  const studentMap = useMemo(() => {
    if (!state) return new Map();
    return new Map(state.students.map((s) => [s.id, s]));
  }, [state]);

  const generatePDF = async (setId: string) => {
    if (!state) return;
    const set = state.assignedSets.find((s) => s.id === setId);
    if (!set) return;
    const student = studentMap.get(set.studentId);
    if (!student) return;
    const questions = set.questionIds.map((id) => vaultMap.get(id)).filter(Boolean);
    if (questions.length === 0) {
      toast.error('No questions in this set');
      return;
    }

    setGeneratingId(setId);
    try {
      const modelConfig = getCurrentModelConfig();
      const payload = buildWorksheetPayload(student, questions);
      const res = await fetch('/api/generate-worksheet-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-model': modelConfig.modelString,
          'x-api-key': modelConfig.apiKey,
          ...(modelConfig.baseUrl ? { 'x-base-url': modelConfig.baseUrl } : {}),
          ...(modelConfig.providerType ? { 'x-provider-type': modelConfig.providerType } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `HTTP ${res.status}`);
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `worksheet-${student.name.replace(/\s+/g, '-').toLowerCase()}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      updateSetStatus(setId, 'printed');
      toast.success(`Worksheet generated for ${student.name}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to generate PDF');
    } finally {
      setGeneratingId(null);
    }
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

  const pending = state.assignedSets.filter((s) => s.status !== 'printed');
  const printed = state.assignedSets.filter((s) => s.status === 'printed');

  const renderSetList = (sets: typeof state.assignedSets) => (
    <div className="space-y-3">
      {sets.length === 0 ? (
        <div className="rounded-lg border bg-white py-12 text-center text-slate-500">
          No assignments in this section.
        </div>
      ) : (
        sets.map((set) => {
          const student = studentMap.get(set.studentId);
          const questions = set.questionIds.map((id) => vaultMap.get(id)).filter(Boolean);
          return (
            <Card key={set.id}>
              <CardContent className="p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{student?.name || 'Unknown'}</span>
                      <Badge variant={set.status === 'printed' ? 'default' : 'secondary'}>
                        {set.status}
                      </Badge>
                    </div>
                    <div className="text-xs text-slate-500">
                      Grade {student?.grade} · {questions.length} questions · Assigned{' '}
                      {new Date(set.assignedAt).toLocaleDateString()}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {questions.slice(0, 5).map((q) => (
                        <Badge key={q!.id} variant="outline" className="text-xs capitalize">
                          {q!.subject}
                        </Badge>
                      ))}
                      {questions.length > 5 && (
                        <Badge variant="outline" className="text-xs">
                          +{questions.length - 5}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    onClick={() => generatePDF(set.id)}
                    disabled={generatingId === set.id}
                    variant={set.status === 'printed' ? 'outline' : 'default'}
                  >
                    {generatingId === set.id ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Printer className="mr-2 h-4 w-4" />
                    )}
                    {set.status === 'printed' ? 'Regenerate PDF' : 'Generate PDF'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );

  return (
    <DemoShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Operator Desk</h1>
          <p className="text-sm text-slate-600">
            Generate printable worksheets from assignments sent by teachers.
          </p>
        </div>

        <Tabs defaultValue="pending">
          <TabsList>
            <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
            <TabsTrigger value="printed">Printed ({printed.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="pending">{renderSetList(pending)}</TabsContent>
          <TabsContent value="printed">{renderSetList(printed)}</TabsContent>
        </Tabs>
      </div>
    </DemoShell>
  );
}
