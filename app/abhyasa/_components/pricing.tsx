'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2 } from 'lucide-react';

interface PricingProps {
  onCtaClick: () => void;
}

/**
 * Action goal: remove price ambiguity so buyers self-qualify,
 * then convert each tier into the appropriate next step.
 */
export function Pricing({ onCtaClick }: PricingProps) {
  const tiers = [
    {
      name: 'Starter',
      price: 'Free',
      description: 'For small centres and pilot classrooms.',
      features: ['Up to 50 students', '2 worksheets / month', 'PDF generation', 'English + Hindi'],
      cta: 'Get started',
      variant: 'outline' as const,
    },
    {
      name: 'Growth',
      price: '₹2,499 – ₹4,999 / month',
      description: 'For growing tuition centres and schools.',
      features: [
        'Unlimited students',
        'OMR scan grading',
        'Adaptive next worksheets',
        'Parent reports',
        'Regional languages',
      ],
      cta: 'Start pilot',
      variant: 'default' as const,
      popular: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      description: 'For chains and institutional partners.',
      features: [
        'Multi-branch dashboards',
        'White-label app',
        'API access',
        'Dedicated success manager',
      ],
      cta: 'Contact sales',
      variant: 'outline' as const,
    },
  ];

  return (
    <section id="pricing" className="border-y border-border bg-secondary/30">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Simple, per-student pricing
        </h2>
        <p className="mt-3 text-muted-foreground">No setup fees for pilots. Cancel anytime.</p>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {tiers.map((tier) => (
            <Card
              key={tier.name}
              className={`relative bg-card ${tier.popular ? 'border-primary' : ''}`}
            >
              {tier.popular && (
                <Badge className="absolute -top-3 left-4 bg-primary text-primary-foreground">
                  Popular
                </Badge>
              )}
              <CardHeader>
                <CardTitle className="text-base">{tier.name}</CardTitle>
                <CardDescription>{tier.price}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
                {tier.name === 'Enterprise' ? (
                  <Button className="mt-6 w-full" variant={tier.variant} size="sm" asChild>
                    <a href="mailto:hello@trayini.ai?subject=Abhyasa%20Enterprise%20inquiry">
                      {tier.cta}
                    </a>
                  </Button>
                ) : (
                  <Button
                    className="mt-6 w-full"
                    variant={tier.variant}
                    size="sm"
                    onClick={onCtaClick}
                  >
                    {tier.cta}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
