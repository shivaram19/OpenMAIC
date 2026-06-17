'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ShieldCheck, Mail, Phone, CheckCircle2 } from 'lucide-react';
import { BOARD_OPTIONS } from '../_lib/constants';

/**
 * Action goal: capture a high-intent lead with the smallest possible form,
 * reassure about privacy, and hand the request to the sales inbox.
 */
export function PilotForm() {
  const [form, setForm] = useState({
    name: '',
    organisation: '',
    email: '',
    phone: '',
    students: '',
    board: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const update = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.organisation) return;

    const subject = encodeURIComponent('Abhyāsa pilot request');
    const body = encodeURIComponent(
      `Hi Team Abhyāsa,\n\n` +
        `I would like to start a free pilot.\n\n` +
        `Name: ${form.name}\n` +
        `Centre/School: ${form.organisation}\n` +
        `Email: ${form.email}\n` +
        `Phone: ${form.phone}\n` +
        `Approx. students: ${form.students}\n` +
        `Board: ${form.board}\n\n` +
        `Message:\n${form.message || '—'}\n`,
    );
    window.location.href = `mailto:hello@trayini.ai?subject=${subject}&body=${body}`;
    setSubmitted(true);
  };

  return (
    <section id="pilot" className="mx-auto max-w-3xl px-6 py-20">
      <div className="rounded-2xl border bg-card p-6 shadow-sm md:p-10">
        <h2 className="text-2xl font-semibold tracking-tight">Start your free pilot</h2>
        <p className="mt-2 text-muted-foreground">
          Tell us about your centre or school. We will set up a 14-day pilot with no setup fees.
        </p>

        {submitted ? (
          <div className="mt-8 rounded-lg bg-muted p-6 text-center">
            <CheckCircle2 className="mx-auto h-10 w-10 text-primary" />
            <h3 className="mt-3 text-lg font-semibold">Thank you</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Your email client should open with the details. If it does not, write to us at{' '}
              <a href="mailto:hello@trayini.ai" className="text-primary underline">
                hello@trayini.ai
              </a>
              .
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Your name</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => update('name', e.target.value)}
                  placeholder="Ramesh Sharma"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="organisation">Centre / School name</Label>
                <Input
                  id="organisation"
                  value={form.organisation}
                  onChange={(e) => update('organisation', e.target.value)}
                  placeholder="Bright Minds Tuition"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => update('email', e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => update('phone', e.target.value)}
                    placeholder="+91 98765 43210"
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="students">Approx. number of students</Label>
                <Input
                  id="students"
                  type="number"
                  min={1}
                  value={form.students}
                  onChange={(e) => update('students', e.target.value)}
                  placeholder="120"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="board">Primary board</Label>
                <Select value={form.board} onValueChange={(v) => update('board', v)}>
                  <SelectTrigger id="board">
                    <SelectValue placeholder="Select board" />
                  </SelectTrigger>
                  <SelectContent>
                    {BOARD_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Anything else we should know? (optional)</Label>
              <Textarea
                id="message"
                value={form.message}
                onChange={(e) => update('message', e.target.value)}
                placeholder="e.g. We run CBSE Class 9-10 maths batches..."
                rows={3}
              />
            </div>

            <div className="flex items-start gap-3 rounded-lg bg-muted p-4 text-sm text-muted-foreground">
              <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
              <p>
                No spam. Your information stays in India and is only used to set up the pilot. Read our{' '}
                <a href="/privacy" className="text-primary underline">
                  privacy policy
                </a>
                .
              </p>
            </div>

            <Button type="submit" size="lg" className="w-full">
              <Mail className="mr-2 h-4 w-4" />
              Request pilot access
            </Button>
          </form>
        )}
      </div>
    </section>
  );
}
