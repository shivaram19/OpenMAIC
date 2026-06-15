'use client';

import { useState } from 'react';
import type { StudentRecord, StudentCreateInput } from '@/lib/types/worksheet';
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
import { Plus, Trash2 } from 'lucide-react';

interface StudentFormProps {
  initial?: StudentRecord;
  onSubmit: (data: StudentCreateInput) => void;
  onCancel?: () => void;
  submitLabel?: string;
}

export function StudentForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel = 'Save Student',
}: StudentFormProps) {
  const [name, setName] = useState(initial?.name || '');
  const [grade, setGrade] = useState(initial?.grade || '');
  const [className, setClassName] = useState(initial?.class || '');
  const [school, setSchool] = useState(initial?.school || '');
  const [weakTopics, setWeakTopics] = useState((initial?.weakTopics || []).join(', '));
  const [strongTopics, setStrongTopics] = useState((initial?.strongTopics || []).join(', '));
  const [engagementLevel, setEngagementLevel] = useState<StudentCreateInput['engagementLevel']>(
    initial?.engagementLevel || 'medium',
  );
  const [attendanceRate, setAttendanceRate] = useState(
    typeof initial?.attendanceRate === 'number' ? Math.round(initial.attendanceRate * 100) : '',
  );
  const [performances, setPerformances] = useState<
    { topic: string; accuracy: number | ''; attempts: number | ''; lastAttemptedAt: string }[]
  >(
    (initial?.pastPerformance || []).map((p) => ({
      topic: p.topic,
      accuracy: Math.round(p.accuracy * 100),
      attempts: p.attempts,
      lastAttemptedAt: p.lastAttemptedAt || '',
    })),
  );

  const addPerformance = () => {
    setPerformances([
      ...performances,
      { topic: '', accuracy: '', attempts: '', lastAttemptedAt: '' },
    ]);
  };

  const updatePerformance = (index: number, field: string, value: string | number) => {
    setPerformances(performances.map((p, i) => (i === index ? { ...p, [field]: value } : p)));
  };

  const removePerformance = (index: number) => {
    setPerformances(performances.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data: StudentCreateInput = {
      name: name.trim(),
      grade: grade.trim() || undefined,
      class: className.trim() || undefined,
      school: school.trim() || undefined,
      weakTopics: weakTopics
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      strongTopics: strongTopics
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      engagementLevel,
      attendanceRate: attendanceRate === '' ? undefined : Number(attendanceRate) / 100,
      pastPerformance: performances
        .filter((p) => p.topic.trim())
        .map((p) => ({
          topic: p.topic.trim(),
          accuracy: Number(p.accuracy) / 100,
          attempts: Number(p.attempts) || 1,
          lastAttemptedAt: p.lastAttemptedAt || undefined,
        })),
    };
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Name *</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="grade">Grade</Label>
          <Input
            id="grade"
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            placeholder="e.g. 5"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="class">Class</Label>
          <Input
            id="class"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            placeholder="e.g. 5B"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="school">School</Label>
          <Input id="school" value={school} onChange={(e) => setSchool(e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="weak">Weak Topics (comma separated)</Label>
          <Textarea
            id="weak"
            value={weakTopics}
            onChange={(e) => setWeakTopics(e.target.value)}
            rows={2}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="strong">Strong Topics (comma separated)</Label>
          <Textarea
            id="strong"
            value={strongTopics}
            onChange={(e) => setStrongTopics(e.target.value)}
            rows={2}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="attendance">Attendance Rate (%)</Label>
          <Input
            id="attendance"
            type="number"
            min={0}
            max={100}
            value={attendanceRate}
            onChange={(e) => setAttendanceRate(e.target.value === '' ? '' : Number(e.target.value))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="engagement">Engagement Level</Label>
          <Select
            value={engagementLevel || 'medium'}
            onValueChange={(v) => setEngagementLevel(v as StudentCreateInput['engagementLevel'])}
          >
            <SelectTrigger id="engagement">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Past Performance</Label>
          <Button type="button" variant="outline" size="sm" onClick={addPerformance}>
            <Plus className="mr-1 h-3.5 w-3.5" />
            Add Topic
          </Button>
        </div>

        {performances.map((p, idx) => (
          <div key={idx} className="grid grid-cols-1 gap-2 rounded-lg border p-3 sm:grid-cols-4">
            <Input
              placeholder="Topic"
              value={p.topic}
              onChange={(e) => updatePerformance(idx, 'topic', e.target.value)}
            />
            <Input
              type="number"
              placeholder="Accuracy %"
              min={0}
              max={100}
              value={p.accuracy}
              onChange={(e) =>
                updatePerformance(
                  idx,
                  'accuracy',
                  e.target.value === '' ? '' : Number(e.target.value),
                )
              }
            />
            <Input
              type="number"
              placeholder="Attempts"
              min={1}
              value={p.attempts}
              onChange={(e) =>
                updatePerformance(
                  idx,
                  'attempts',
                  e.target.value === '' ? '' : Number(e.target.value),
                )
              }
            />
            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={p.lastAttemptedAt}
                onChange={(e) => updatePerformance(idx, 'lastAttemptedAt', e.target.value)}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removePerformance(idx)}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-3 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}
