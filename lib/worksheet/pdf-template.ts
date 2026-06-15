import type { QuizQuestion } from '@/lib/types/stage';
import type { StudentProfile } from '@/lib/types/generation';

export interface WorksheetPDFData {
  student: StudentProfile;
  topic: string;
  questions: QuizQuestion[];
  generatedAt: string;
}

export function buildWorksheetHTML(data: WorksheetPDFData): string {
  const { student, topic, questions, generatedAt } = data;

  const weakTopics = (student.weakTopics || []).join(', ') || 'General review';
  const strongTopics = (student.strongTopics || []).join(', ') || '-';

  const questionRows = questions
    .map((q, idx) => {
      const optionsHtml =
        q.type !== 'short_answer' && q.options && q.options.length > 0
          ? `<div style="margin-top: 12px; display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              ${q.options
                .map(
                  (opt) => `
                <div style="display: flex; align-items: center; gap: 8px; border: 1px solid #d1d5db; border-radius: 6px; padding: 8px 12px;">
                  <span style="width: 22px; height: 22px; border-radius: 50%; border: 1.5px solid #6b7280; display: inline-flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 600;">${escapeHtml(opt.value)}</span>
                  <span style="font-size: 13px;">${escapeHtml(opt.label)}</span>
                </div>`,
                )
                .join('')}
             </div>`
          : `<div style="margin-top: 12px; min-height: 80px; border: 1px solid #d1d5db; border-radius: 6px; padding: 10px;"></div>`;

      const typeLabel =
        q.type === 'single'
          ? 'Single choice'
          : q.type === 'multiple'
            ? 'Multiple choice'
            : 'Short answer';
      const points =
        typeof q.points === 'number' ? `${q.points} point${q.points !== 1 ? 's' : ''}` : '';

      return `
        <div style="page-break-inside: avoid; margin-bottom: 28px;">
          <div style="display: flex; gap: 12px;">
            <div style="flex-shrink: 0; width: 28px; height: 28px; border-radius: 50%; background: #e2e8f0; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700;">${idx + 1}</div>
            <div style="flex: 1;">
              <p style="margin: 0; font-size: 14px; line-height: 1.5; font-weight: 500;">${escapeHtml(q.question)}</p>
              ${optionsHtml}
              <div style="margin-top: 8px; font-size: 11px; color: #9ca3af;">${typeLabel}${points ? ` • ${points}` : ''}</div>
            </div>
          </div>
        </div>
      `;
    })
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Worksheet - ${escapeHtml(student.name)}</title>
  <style>
    @page { size: A4; margin: 16mm; }
    * { box-sizing: border-box; }
    body { margin: 0; padding: 0; font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #111827; }
  </style>
</head>
<body>
  <div style="max-width: 210mm; margin: 0 auto; padding: 24px;">
    <div style="border-bottom: 2px solid #1f2937; padding-bottom: 16px; margin-bottom: 16px;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start;">
        <div>
          <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">Personal Practice Worksheet</h1>
          <p style="margin: 6px 0 0; font-size: 13px; color: #4b5563;">Curated for ${escapeHtml(student.name)}</p>
        </div>
        <div style="text-align: right; font-size: 12px; color: #4b5563;">
          <div>${escapeHtml(student.school || '')}</div>
          <div>Grade ${student.grade || '-'}${student.class ? ` - ${escapeHtml(student.class)}` : ''}</div>
          ${generatedAt ? `<div>Generated: ${escapeHtml(generatedAt)}</div>` : ''}
        </div>
      </div>

      <div style="margin-top: 16px; display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 13px;">
        <div><strong>Topic:</strong> ${escapeHtml(topic)}</div>
        <div><strong>Focus areas:</strong> ${escapeHtml(weakTopics)}</div>
        <div><strong>Strong topics:</strong> ${escapeHtml(strongTopics)}</div>
      </div>

      <div style="margin-top: 16px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;">
        <div style="border: 1px solid #9ca3af; border-radius: 6px; padding: 10px; text-align: center;">
          <div style="font-size: 11px; color: #6b7280;">Student Name</div>
          <div style="height: 22px;"></div>
        </div>
        <div style="border: 1px solid #9ca3af; border-radius: 6px; padding: 10px; text-align: center;">
          <div style="font-size: 11px; color: #6b7280;">Score</div>
          <div style="height: 22px;"></div>
        </div>
        <div style="border: 1px solid #9ca3af; border-radius: 6px; padding: 10px; text-align: center;">
          <div style="font-size: 11px; color: #6b7280;">Date</div>
          <div style="height: 22px;"></div>
        </div>
      </div>
    </div>

    <div style="background: #f8fafc; border-radius: 8px; padding: 16px; margin-bottom: 24px; font-size: 12px;">
      <p style="margin: 0 0 6px; font-weight: 600;">Instructions:</p>
      <ul style="margin: 0; padding-left: 18px; color: #374151;">
        <li>Read each question carefully before answering.</li>
        <li>For multiple-choice questions, circle the correct option.</li>
        <li>For short-answer questions, write your answer in the space provided.</li>
        <li>Show your work where possible.</li>
      </ul>
    </div>

    <div>
      ${questionRows}
    </div>

    <div style="border-top: 1px solid #e5e7eb; padding-top: 16px; margin-top: 32px; text-align: center; font-size: 11px; color: #6b7280;">
      This worksheet was generated for ${escapeHtml(student.name)} based on their learning profile.
    </div>
  </div>
</body>
</html>`;
}

function escapeHtml(text: string | undefined | null): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
