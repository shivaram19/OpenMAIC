'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { NAV_LINKS } from '../_lib/constants';

interface StickyHeaderProps {
  onCtaClick: () => void;
}

/**
 * Action goal: keep the primary conversion action one tap away at all times
 * while providing only the navigation links that support the decision journey.
 */
export function StickyHeader({ onCtaClick }: StickyHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/abhyasa" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
            अ
          </div>
          <span className="text-lg font-semibold tracking-tight">Abhyāsa</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className="hover:text-foreground">
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Button variant="ghost" size="sm" asChild>
            <a href="https://trayini.ai" target="_blank" rel="noreferrer">
              trayini.ai
            </a>
          </Button>
          <Button size="sm" onClick={onCtaClick}>
            Start free pilot
          </Button>
        </div>

        <button
          className="inline-flex h-10 w-10 items-center justify-center rounded-md md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-border bg-background px-6 py-4 md:hidden">
          <nav className="flex flex-col gap-3 text-sm text-muted-foreground">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="hover:text-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <hr className="border-border" />
            <a
              href="https://trayini.ai"
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground"
            >
              trayini.ai
            </a>
            <Button size="sm" onClick={onCtaClick}>
              Start free pilot
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}
