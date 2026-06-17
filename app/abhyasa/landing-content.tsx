'use client';

import { StickyHeader } from './_components/sticky-header';
import { Hero } from './_components/hero';
import { Problem } from './_components/problem';
import { Loop } from './_components/loop';
import { Features } from './_components/features';
import { ForWhom } from './_components/for-whom';
import { Pricing } from './_components/pricing';
import { PilotForm } from './_components/pilot-form';
import { FAQ } from './_components/faq';
import { Footer } from './_components/footer';
import { scrollToPilot } from './_lib/scroll';

/**
 * Orchestrates the Abhyāsa landing page.
 *
 * Every section is designed to either:
 * 1. Move the visitor toward the pilot form, or
 * 2. Remove a friction/objection that stops them from taking that step.
 */
export function AbhyasaLandingContent() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <StickyHeader onCtaClick={scrollToPilot} />

      <main>
        <Hero onCtaClick={scrollToPilot} />
        <Problem />
        <Loop onCtaClick={scrollToPilot} />
        <Features onCtaClick={scrollToPilot} />
        <ForWhom onCtaClick={scrollToPilot} />
        <Pricing onCtaClick={scrollToPilot} />
        <PilotForm />
        <FAQ />
      </main>

      <Footer />
    </div>
  );
}
