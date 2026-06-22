'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  Printer,
  ScanLine,
  TrendingUp,
  ShieldCheck,
  Languages,
  School,
  CheckCircle2,
} from 'lucide-react';

export default function DrMathLandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
              Dr
            </div>
            <span className="text-lg font-semibold tracking-tight">Dr. Math</span>
          </div>
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <a href="#how-it-works" className="hover:text-foreground">
              How it works
            </a>
            <a href="#pricing" className="hover:text-foreground">
              Pricing
            </a>
            <a href="#trust" className="hover:text-foreground">
              Trust
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/worksheet">Open app</Link>
            </Button>
            <Button size="sm" asChild>
              <a href="#pricing">Start pilot</a>
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="mx-auto max-w-6xl px-6 py-20 md:py-28">
          <div className="max-w-3xl">
            <Badge variant="secondary" className="mb-5">
              Made for Indian tuition centres & budget schools
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
              Worksheets that learn how your students learn
            </h1>
            <p className="mt-6 text-lg text-muted-foreground md:text-xl">
              Generate board-aligned worksheets, grade them by scanning OMR strips with a phone, and
              let Dr. Math recommend the next practice set for every student.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Button size="lg" asChild>
                <a href="#pricing">Start a free pilot</a>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/worksheet">Try the worksheet builder</Link>
              </Button>
              <Button size="lg" variant="secondary" asChild>
                <Link href="/engine/demo">See end-to-end engine demo</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="border-y border-border bg-secondary/30">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">The Dr. Math loop</h2>
            <p className="mt-3 text-muted-foreground">
              Paper-first, teacher-in-the-loop, outcome-driven.
            </p>

            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  icon: FileText,
                  title: '1. Generate',
                  body: 'Pick a topic and board. Dr. Math creates a personalized worksheet for each student in seconds.',
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
                  body: 'Dr. Math updates each student’s Mark and suggests the next worksheet based on gaps.',
                },
              ].map((step) => (
                <Card key={step.title} className="bg-card">
                  <CardHeader className="pb-3">
                    <step.icon className="h-6 w-6 text-primary" />
                    <CardTitle className="text-base">{step.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm leading-relaxed">
                      {step.body}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="mx-auto max-w-6xl px-6 py-20">
          <div className="grid gap-12 md:grid-cols-3">
            <div>
              <School className="h-6 w-6 text-primary" />
              <h3 className="mt-4 text-lg font-semibold">Board-aligned</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                CBSE, Maharashtra, Karnataka, Tamil Nadu, UP, Bihar. Reduced-syllabus exclusions are
                respected automatically.
              </p>
            </div>
            <div>
              <Languages className="h-6 w-6 text-primary" />
              <h3 className="mt-4 text-lg font-semibold">Multilingual</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Generate worksheets and parent reports in English and Hindi. Regional languages
                coming next.
              </p>
            </div>
            <div>
              <ShieldCheck className="h-6 w-6 text-primary" />
              <h3 className="mt-4 text-lg font-semibold">DPDP-ready</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Student data stays in India. No ads, no tracking, no selling data. Verifiable
                parental consent built in.
              </p>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="border-y border-border bg-secondary/30">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Simple pricing</h2>
            <p className="mt-3 text-muted-foreground">
              Per-student, per-month. No setup fees for pilots.
            </p>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              <Card className="bg-card">
                <CardHeader>
                  <CardTitle className="text-base">Starter</CardTitle>
                  <CardDescription>Free</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" /> Up to 50 students
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" /> 2 worksheets / month
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" /> PDF generation
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="relative border-primary bg-card">
                <Badge className="absolute -top-3 left-4 bg-primary text-primary-foreground">
                  Popular
                </Badge>
                <CardHeader>
                  <CardTitle className="text-base">Growth</CardTitle>
                  <CardDescription>₹2,499 – ₹4,999 / month</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" /> Unlimited students
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" /> OMR scan grading
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" /> Adaptive next worksheets
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" /> Parent reports
                    </li>
                  </ul>
                  <Button className="mt-6 w-full" size="sm">
                    Start pilot
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-card">
                <CardHeader>
                  <CardTitle className="text-base">Enterprise</CardTitle>
                  <CardDescription>Custom</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" /> Multi-branch dashboards
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" /> White-label app
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" /> API access
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" /> Dedicated success manager
                    </li>
                  </ul>
                  <Button className="mt-6 w-full" variant="outline" size="sm">
                    Contact sales
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Trust */}
        <section id="trust" className="mx-auto max-w-6xl px-6 py-20">
          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div className="max-w-xl">
              <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
                Built for trust, not hype
              </h2>
              <p className="mt-3 text-muted-foreground">
                Dr. Math is designed around the Digital Personal Data Protection Act, 2023. Student
                data is hosted in India by default, encrypted at rest and in transit, and erased
                when it is no longer needed.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <ShieldCheck className="h-10 w-10 text-primary" />
              <div>
                <div className="font-semibold">India-hosted</div>
                <div className="text-sm text-muted-foreground">DPDP-ready by design</div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-secondary/30">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground text-sm font-bold">
                Dr
              </div>
              <span className="font-medium">Dr. Math</span>
            </div>
            <p className="text-sm text-muted-foreground">
              A product experiment by OpenMAIC. Student-first. Teacher-led. Privacy-safe.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
