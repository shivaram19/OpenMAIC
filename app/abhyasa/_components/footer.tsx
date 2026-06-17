'use client';

/**
 * Action goal: reinforce trust, provide legal anchors, and keep the
 * brand association with Trayini.ai clear without distracting from the pilot.
 */
export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
              अ
            </div>
            <span className="font-medium">Abhyāsa</span>
          </div>
          <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
            <a href="https://trayini.ai" target="_blank" rel="noreferrer" className="hover:text-foreground">
              trayini.ai
            </a>
            <a href="/privacy" className="hover:text-foreground">
              Privacy
            </a>
            <a href="/terms" className="hover:text-foreground">
              Terms
            </a>
            <a href="mailto:hello@trayini.ai" className="hover:text-foreground">
              Contact
            </a>
          </div>
        </div>
        <p className="mt-6 text-xs text-muted-foreground">
          A Trayini.ai initiative. Student-first. Teacher-led. Privacy-safe.
        </p>
      </div>
    </footer>
  );
}
