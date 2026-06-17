'use client';

import { Button } from '@/components/ui/button';
import { ShieldCheck, Languages, ScanLine, TrendingUp, School, FileText, ArrowRight } from 'lucide-react';

interface FeaturesProps {
  onCtaClick: () => void;
}

/**
 * Action goal: translate product capabilities into outcomes the buyer cares about,
 * then ask for the pilot while intent is high.
 */
export function Features({ onCtaClick }: FeaturesProps) {
  const features = [
    {
      icon: School,
      title: 'Board-aligned by default',
      body: 'CBSE, Maharashtra, Karnataka, Tamil Nadu, UP, Bihar, ICSE. Reduced-syllabus exclusions are respected automatically.',
    },
    {
      icon: Languages,
      title: 'Multilingual practice',
      body: 'Generate worksheets and parent reports in English, Hindi, Marathi, Kannada, Tamil, Telugu, Urdu and Bengali.',
    },
    {
      icon: ScanLine,
      title: 'Grade with a phone scan',
      body: 'An OMR strip on every sheet lets any teacher scan answers and get marks in seconds—no special hardware.',
    },
    {
      icon: TrendingUp,
      title: 'Adaptive next worksheets',
      body: 'Abhyāsa tracks each student’s weak topics and adjusts the difficulty and question mix for the next practice set.',
    },
    {
      icon: ShieldCheck,
      title: 'DPDP-ready by design',
      body: 'Student data stays in India. Encrypted at rest and in transit. No ads, no tracking, no selling data.',
    },
    {
      icon: FileText,
      title: 'Parent reports that make sense',
      body: 'Auto-generate short, visual reports in the parent’s language—topics mastered, gaps remaining, next steps.',
    },
  ];

  return (
    <section id="features" className="border-y border-border bg-secondary/30">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">What Abhyāsa gives you</h2>
        <p className="mt-3 text-muted-foreground">
          Less admin. More insight. Practice that actually matches each learner.
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <feature.icon className="h-6 w-6 text-primary" />
              <h3 className="mt-4 text-lg font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-12">
          <Button size="lg" onClick={onCtaClick}>
            Get these features for your students
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
