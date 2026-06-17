'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { scrollToPilot } from '../_lib/scroll';

/**
 * Action goal: remove the last objections that block conversion,
 * then offer a low-friction path back to the pilot form.
 */
export function FAQ() {
  const items = [
    {
      question: 'Which boards and grades do you support?',
      answer:
        'Abhyāsa supports CBSE, ICSE, Maharashtra (MSBSHSE), Karnataka (KSEAB), Tamil Nadu (DGE TN), Uttar Pradesh (UPMSP), and Bihar (BSEB). We currently focus on middle-school and high-school maths and science, with more subjects rolling out each term.',
    },
    {
      question: 'Do I need special hardware?',
      answer:
        'No. Worksheets print on any A4 black-and-white printer. Grading uses the OMR strip on each sheet and any Android phone camera. No expensive scanner or laminator is required.',
    },
    {
      question: 'Is student data safe?',
      answer:
        'Yes. Abhyāsa is designed around India’s Digital Personal Data Protection Act, 2023. Data is hosted in India, encrypted at rest and in transit, and never used for ads or sold to third parties. Verifiable parental consent is built in.',
    },
    {
      question: 'Can worksheets be printed in regional languages?',
      answer:
        'Yes. You can generate questions and parent reports in English, Hindi, Marathi, Kannada, Tamil, Telugu, Urdu, and Bengali. More languages are added based on pilot feedback.',
    },
    {
      question: 'How does the free pilot work?',
      answer:
        'The Starter plan is free for up to 50 students and 2 worksheets per month. For larger batches, we run a 14-day Growth pilot with no setup fees. You keep all generated PDFs and reports.',
    },
  ];

  return (
    <section id="faq" className="border-t border-border bg-secondary/30">
      <div className="mx-auto max-w-3xl px-6 py-20">
        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Frequently asked questions
        </h2>
        <div className="mt-8 space-y-4">
          {items.map((item) => (
            <details key={item.question} className="group rounded-xl border bg-card shadow-sm">
              <summary className="flex cursor-pointer list-none items-center justify-between p-5 font-medium">
                {item.question}
                <svg
                  className="h-4 w-4 transition-transform group-open:rotate-180"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="border-t border-border px-5 pb-5 pt-0">
                <p className="mt-4 text-sm text-muted-foreground">{item.answer}</p>
              </div>
            </details>
          ))}
        </div>

        <div className="mt-10 text-center">
          <p className="text-muted-foreground">Still unsure?</p>
          <Button className="mt-3" size="lg" onClick={scrollToPilot}>
            Start a free pilot
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
