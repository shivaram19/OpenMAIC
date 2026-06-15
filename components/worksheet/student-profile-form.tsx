'use client';

import type { StudentProfile } from '@/lib/types/generation';
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

interface StudentProfileFormProps {
  value: StudentProfile;
  onChange: (profile: StudentProfile) => void;
}

export function StudentProfileForm({ value, onChange }: StudentProfileFormProps) {
  const update = <K extends keyof StudentProfile>(key: K, val: StudentProfile[K]) => {
    onChange({ ...value, [key]: val });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
        Student Details
      </h3>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={value.name || ''}
            onChange={(e) => update('name', e.target.value)}
            placeholder="Student name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="grade">Grade</Label>
          <Input
            id="grade"
            value={value.grade || ''}
            onChange={(e) => update('grade', e.target.value)}
            placeholder="e.g. 5"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="class">Class</Label>
          <Input
            id="class"
            value={value.class || ''}
            onChange={(e) => update('class', e.target.value)}
            placeholder="e.g. 5B"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="school">School</Label>
          <Input
            id="school"
            value={value.school || ''}
            onChange={(e) => update('school', e.target.value)}
            placeholder="School name"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="weakTopics">Weak Topics (comma separated)</Label>
          <Textarea
            id="weakTopics"
            value={(value.weakTopics || []).join(', ')}
            onChange={(e) =>
              update(
                'weakTopics',
                e.target.value
                  .split(',')
                  .map((t) => t.trim())
                  .filter(Boolean),
              )
            }
            placeholder="Fractions, Decimals..."
            rows={2}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="strongTopics">Strong Topics (comma separated)</Label>
          <Textarea
            id="strongTopics"
            value={(value.strongTopics || []).join(', ')}
            onChange={(e) =>
              update(
                'strongTopics',
                e.target.value
                  .split(',')
                  .map((t) => t.trim())
                  .filter(Boolean),
              )
            }
            placeholder="Addition, Multiplication..."
            rows={2}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="attendance">Attendance Rate (%)</Label>
          <Input
            id="attendance"
            type="number"
            min={0}
            max={100}
            value={
              typeof value.attendanceRate === 'number' ? Math.round(value.attendanceRate * 100) : ''
            }
            onChange={(e) =>
              update(
                'attendanceRate',
                e.target.value === '' ? undefined : Number(e.target.value) / 100,
              )
            }
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="engagement">Engagement Level</Label>
          <Select
            value={value.engagementLevel || 'medium'}
            onValueChange={(v) => update('engagementLevel', v as StudentProfile['engagementLevel'])}
          >
            <SelectTrigger id="engagement">
              <SelectValue placeholder="Select engagement level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
