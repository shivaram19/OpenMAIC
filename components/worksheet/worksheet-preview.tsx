'use client';

import { forwardRef } from 'react';
import type { QuizQuestion } from '@/lib/types/stage';
import type { StudentProfile } from '@/lib/types/generation';

interface WorksheetPreviewProps {
  student: StudentProfile;
  topic: string;
  questions: QuizQuestion[];
  generatedAt?: string;
}

export const WorksheetPreview = forwardRef<HTMLDivElement, WorksheetPreviewProps>(
  function WorksheetPreview({ student, topic, questions, generatedAt }, ref) {
    return (
      <div
        ref={ref}
        className="worksheet-print-area mx-auto max-w-[210mm] space-y-6 bg-white p-8 text-slate-900 shadow-sm print:p-0"
      >
        {/* Header */}
        <header className="border-b-2 border-slate-800 pb-4">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Personal Practice Worksheet</h1>
              <p className="mt-1 text-sm text-slate-600">Curated for {student.name}</p>
            </div>
            <div className="text-right text-sm text-slate-600">
              <p>{student.school}</p>
              <p>
                Grade {student.grade}
                {student.class ? ` - ${student.class}` : ''}
              </p>
              {generatedAt && <p>Generated: {generatedAt}</p>}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-semibold">Topic:</span> {topic}
            </div>
            <div>
              <span className="font-semibold">Focus areas:</span>{' '}
              {(student.weakTopics || []).join(', ') || 'General review'}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
            <div className="rounded border border-slate-300 p-2 text-center">
              <div className="text-xs text-slate-500">Student Name</div>
              <div className="h-6" />
            </div>
            <div className="rounded border border-slate-300 p-2 text-center">
              <div className="text-xs text-slate-500">Score</div>
              <div className="h-6" />
            </div>
            <div className="rounded border border-slate-300 p-2 text-center">
              <div className="text-xs text-slate-500">Date</div>
              <div className="h-6" />
            </div>
          </div>
        </header>

        {/* Instructions */}
        <section className="rounded-lg bg-slate-50 p-4 text-sm print:bg-transparent print:p-0">
          <p className="font-semibold">Instructions:</p>
          <ul className="mt-1 list-inside list-disc text-slate-700">
            <li>Read each question carefully before answering.</li>
            <li>For multiple-choice questions, circle the correct option.</li>
            <li>For short-answer questions, write your answer in the space provided.</li>
            <li>Show your work where possible.</li>
          </ul>
        </section>

        {/* Questions */}
        <section className="space-y-8">
          {questions.map((q, idx) => (
            <div key={q.id} className="break-inside-avoid">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold">
                  {idx + 1}
                </span>
                <div className="flex-1">
                  <p className="font-medium leading-relaxed">{q.question}</p>

                  {q.type !== 'short_answer' && q.options && q.options.length > 0 && (
                    <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {q.options.map((opt) => (
                        <div
                          key={opt.value}
                          className="flex items-center gap-2 rounded border border-slate-200 p-2"
                        >
                          <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border border-slate-400 text-xs font-semibold">
                            {opt.value}
                          </span>
                          <span className="text-sm">{opt.label}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {q.type === 'short_answer' && (
                    <div className="mt-3 min-h-[80px] rounded border border-slate-300 p-2">
                      <div className="h-full w-full" />
                    </div>
                  )}

                  <div className="mt-2 text-xs text-slate-400">
                    {q.type === 'single' && 'Single choice'}
                    {q.type === 'multiple' && 'Multiple choice'}
                    {q.type === 'short_answer' && 'Short answer'}
                    {typeof q.points === 'number' &&
                      ` • ${q.points} point${q.points !== 1 ? 's' : ''}`}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* Footer */}
        <footer className="border-t pt-4 text-center text-xs text-slate-500">
          This worksheet was generated for {student.name} based on their learning profile.
        </footer>
      </div>
    );
  },
);
