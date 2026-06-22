import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import type { DiagnosticMark } from '@/lib/abhyasa-engine/types';

function subjectColor(subject: string) {
  switch (subject) {
    case 'maths':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'physics':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'chemistry':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    default:
      return 'bg-slate-100 text-slate-700';
  }
}

function masteryBadge(level: DiagnosticMark['masteryLevel']) {
  switch (level) {
    case 'weak':
      return <Badge variant="destructive">Weak</Badge>;
    case 'building':
      return <Badge variant="secondary">Building</Badge>;
    case 'strong':
      return <Badge variant="default">Strong</Badge>;
  }
}

interface StudentGapCardProps {
  studentName: string;
  grade: string;
  className?: string;
  marks: DiagnosticMark[];
}

export function StudentGapCard({ studentName, grade, className, marks }: StudentGapCardProps) {
  const weak = marks.filter((m) => m.masteryLevel === 'weak');
  const building = marks.filter((m) => m.masteryLevel === 'building');

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base">{studentName}</CardTitle>
            <p className="text-xs text-slate-500">Grade {grade}</p>
          </div>
          <div className="flex gap-1 text-xs">
            <Badge variant="destructive">{weak.length} weak</Badge>
            <Badge variant="secondary">{building.length} building</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {marks.slice(0, 5).map((m) => (
          <div key={`${m.subject}-${m.topic}`} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium capitalize">
                {m.subject} · {m.topic}
              </span>
              {masteryBadge(m.masteryLevel)}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Progress value={m.accuracy * 100} className="h-2 flex-1" />
              <span className="w-10 text-right">{Math.round(m.accuracy * 100)}%</span>
            </div>
            <div className="flex flex-wrap gap-1">
              <Badge variant="outline" className={`text-xs ${subjectColor(m.subject)}`}>
                {m.recommendedDifficulty}
              </Badge>
              {m.lastErrorType && (
                <Badge variant="outline" className="text-xs">
                  {m.lastErrorType}
                </Badge>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
