'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';
import { SANSKRIT_QUOTE } from '../_lib/constants';

interface HeroProps {
  onCtaClick: () => void;
}

/**
 * Action goal: communicate the one-sentence value proposition and offer
 * two clear next steps — a high-intent pilot request and a low-commitment
 * scroll to the product loop.
 */
export function Hero({ onCtaClick }: HeroProps) {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-16 pt-16 md:pt-24">
      <div className="max-w-3xl">
        <Badge variant="secondary" className="mb-5">
          Built for Indian tuition centres & budget schools
        </Badge>
        <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-6xl">
          Worksheets that grow with every student
        </h1>
        <p className="mt-6 text-lg text-muted-foreground md:text-xl">
          Abhyāsa generates board-aligned practice sheets, grades them by scanning OMR strips with a
          phone, and recommends the next set of questions—so every student masters one topic before
          moving to the next.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Button size="lg" onClick={onCtaClick}>
            Start a free pilot
          </Button>
          <Button variant="outline" size="lg" asChild>
            <a href="#loop">
              See how it works
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>

        <div className="mt-10 rounded-lg border-l-4 border-primary bg-muted p-5">
          <p className="font-medium italic text-foreground">“{SANSKRIT_QUOTE.text}”</p>
          <p className="mt-1 text-sm text-muted-foreground">
            “{SANSKRIT_QUOTE.translation}” — {SANSKRIT_QUOTE.source}
          </p>
        </div>
      </div>

      <div className="mt-10 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
        <Badge variant="outline">CBSE</Badge>
        <Badge variant="outline">State Boards</Badge>
        <Badge variant="outline">DPDP-ready</Badge>
        <Badge variant="outline">India-hosted</Badge>
        <Badge variant="outline">A4 black-and-white print</Badge>
      </div>
    </section>
  );
}
