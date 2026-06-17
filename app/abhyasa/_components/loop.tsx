'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FileText, Printer, ScanLine, TrendingUp, ArrowRight } from 'lucide-react';

interface LoopProps {
  onCtaClick: () => void;
}

/**
 * Action goal: make the product workflow understandable in 10 seconds,
 * then convert that understanding into a pilot request.
 */
export function Loop({ onCtaClick }: LoopProps) {
  const steps = [
    {
      icon: FileText,
      title: '1. Generate',
      body: 'Pick a topic and board. Abhyāsa creates a personalised worksheet for each student in seconds.',
    },
    {
      icon: Printer,
      title: '2. Print',
      body: 'Worksheets render cleanly on A4 black-and-white printers, with an OMR strip for fast grading.',
    },
    {
      icon: ScanLine,
      title: '3. Scan',
      body: 'Students answer on paper. Teachers scan the OMR strip with any Android phone.',
    },
    {
      icon: TrendingUp,
      title: '4. Adapt',
      body: 'Abhyāsa updates each student’s gap profile and suggests the next worksheet based on what they still need.',
    },
  ];

  return (
    <section id="loop" className="mx-auto max-w-6xl px-6 py-20">
      <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">The Abhyāsa loop</h2>
      <p className="mt-3 text-muted-foreground">Paper-first, teacher-in-the-loop, outcome-driven.</p>

      <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {steps.map((step) => (
          <Card key={step.title} className="bg-card">
            <CardHeader className="pb-3">
              <step.icon className="h-6 w-6 text-primary" />
              <CardTitle className="text-base">{step.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm leading-relaxed">{step.body}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-12">
        <Button size="lg" onClick={onCtaClick}>
          Try the loop in your centre
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </section>
  );
}
