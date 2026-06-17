'use client';

import { ArrowRight } from 'lucide-react';

/**
 * Action goal: validate the visitor’s pain so they feel understood,
 * then transition them toward the solution section with a single,
 * low-friction click.
 */
export function Problem() {
  const painPoints = [
    {
      title: 'One-size-fits-all papers',
      body: 'Weak topics stay untouched. Strong students stay bored. Nobody gets the practice they actually need.',
    },
    {
      title: 'Hours of admin every week',
      body: 'Teachers photocopy generic sheets, check them manually, and still have no time to personalise for each child.',
    },
    {
      title: 'Marks without meaning',
      body: 'Parents see scores, but never the real gaps behind them. Progress feels like a black box.',
    },
  ];

  return (
    <section className="border-y border-border bg-secondary/30">
      <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Most worksheets were never built for your students
        </h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {painPoints.map((item) => (
            <div key={item.title} className="rounded-xl border bg-card p-6 shadow-sm">
              <h3 className="font-semibold text-foreground">{item.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{item.body}</p>
            </div>
          ))}
        </div>
        <a
          href="#loop"
          className="mt-10 inline-flex items-center gap-2 font-semibold text-primary hover:underline"
        >
          See how Abhyāsa changes the loop
          <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </section>
  );
}
