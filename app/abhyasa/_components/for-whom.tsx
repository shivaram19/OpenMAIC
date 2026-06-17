'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Building2, School, TrendingUp, CheckCircle2, ArrowRight } from 'lucide-react';

interface ForWhomProps {
  onCtaClick: () => void;
}

/**
 * Action goal: let each visitor self-identify, see their personal stake,
 * and move to the pilot form while the relevance is fresh.
 */
export function ForWhom({ onCtaClick }: ForWhomProps) {
  const personas = [
    {
      icon: Building2,
      title: 'Tuition centres',
      points: [
        'Cut photocopying and worksheet-prep time',
        'Serve mixed-ability batches with one click',
        'Show parents clear progress every week',
      ],
    },
    {
      icon: School,
      title: 'Budget schools',
      points: [
        'Align weekly tests to your board syllabus',
        'Use existing A4 printers and phones',
        'Keep student data inside India',
      ],
    },
    {
      icon: Users,
      title: 'Parents',
      points: [
        'See exactly which topics need attention',
        'Receive reports in your language',
        'Know your child is practising at the right level',
      ],
    },
    {
      icon: TrendingUp,
      title: 'Students',
      points: [
        'Questions matched to your current level',
        'Instant feedback on every worksheet',
        'Build confidence topic by topic',
      ],
    },
  ];

  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
        Built for everyone in the learning loop
      </h2>
      <p className="mt-3 text-muted-foreground">
        Abhyāsa is designed around the people who shape a student’s day.
      </p>

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {personas.map((persona) => (
          <Card key={persona.title} className="bg-card">
            <CardHeader>
              <persona.icon className="h-6 w-6 text-primary" />
              <CardTitle className="text-base">{persona.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {persona.points.map((point) => (
                  <li key={point} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                    {point}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-12">
        <Button size="lg" onClick={onCtaClick}>
          Start a pilot for your audience
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </section>
  );
}
