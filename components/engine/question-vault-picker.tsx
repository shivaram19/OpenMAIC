'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type {
  VaultQuestion,
  DiagnosticMark,
  Subject,
  Difficulty,
} from '@/lib/abhyasa-engine/types';

interface QuestionVaultPickerProps {
  vault: VaultQuestion[];
  marks: DiagnosticMark[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

export function QuestionVaultPicker({
  vault,
  marks,
  selectedIds,
  onChange,
}: QuestionVaultPickerProps) {
  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState<Subject | 'all'>('all');
  const [difficulty, setDifficulty] = useState<Difficulty | 'all'>('all');

  const focusTopics = useMemo(() => new Set(marks.map((m) => m.topic)), [marks]);

  const filtered = useMemo(() => {
    return vault.filter((q) => {
      const matchesSearch =
        q.question.toLowerCase().includes(search.toLowerCase()) ||
        q.topic.toLowerCase().includes(search.toLowerCase()) ||
        q.subTopic.toLowerCase().includes(search.toLowerCase());
      const matchesSubject = subject === 'all' || q.subject === subject;
      const matchesDifficulty = difficulty === 'all' || q.difficulty === difficulty;
      return matchesSearch && matchesSubject && matchesDifficulty;
    });
  }, [vault, search, subject, difficulty]);

  const toggle = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((x) => x !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  function subjectColor(s: Subject) {
    switch (s) {
      case 'maths':
        return 'bg-blue-50 text-blue-700';
      case 'physics':
        return 'bg-amber-50 text-amber-700';
      case 'chemistry':
        return 'bg-emerald-50 text-emerald-700';
    }
  }

  function difficultyVariant(d: Difficulty) {
    switch (d) {
      case 'easy':
        return 'secondary';
      case 'medium':
        return 'default';
      case 'hard':
        return 'destructive';
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Question Vault</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            placeholder="Search questions, topics..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1"
          />
          <Select value={subject} onValueChange={(v) => setSubject(v as Subject | 'all')}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All subjects</SelectItem>
              <SelectItem value="maths">Maths</SelectItem>
              <SelectItem value="physics">Physics</SelectItem>
              <SelectItem value="chemistry">Chemistry</SelectItem>
            </SelectContent>
          </Select>
          <Select value={difficulty} onValueChange={(v) => setDifficulty(v as Difficulty | 'all')}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All levels</SelectItem>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="text-xs text-slate-500">
          Showing {filtered.length} questions · {selectedIds.length} selected
        </div>

        <div className="max-h-[420px] space-y-2 overflow-y-auto pr-1">
          {filtered.map((q) => {
            const focused = focusTopics.has(q.topic);
            return (
              <div
                key={q.id}
                className={`rounded-lg border p-3 transition-colors ${
                  selectedIds.includes(q.id) ? 'border-primary bg-primary/5' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={selectedIds.includes(q.id)}
                    onCheckedChange={() => toggle(q.id)}
                    className="mt-1"
                  />
                  <div className="flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <Badge className={subjectColor(q.subject)}>{q.subject}</Badge>
                      <Badge variant={difficultyVariant(q.difficulty)}>{q.difficulty}</Badge>
                      {focused && <Badge variant="outline">focus topic</Badge>}
                      {q.misconceptionTag && (
                        <Badge variant="outline" className="text-xs">
                          {q.misconceptionTag}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm font-medium">{q.question}</p>
                    <p className="text-xs text-slate-500">
                      {q.topic} · {q.subTopic}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
