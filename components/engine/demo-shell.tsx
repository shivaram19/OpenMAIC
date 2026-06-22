'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Users, Printer, BarChart3, RefreshCcw } from 'lucide-react';

const nav = [
  { href: '/engine/demo', label: 'Demo Setup', icon: RefreshCcw },
  { href: '/engine/teacher', label: 'Teacher', icon: Users },
  { href: '/engine/operator', label: 'Operator', icon: Printer },
  { href: '/engine/principal', label: 'Principal', icon: BarChart3 },
];

export function DemoShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
              Ab
            </div>
            <div>
              <span className="font-semibold">Abhyāsa Engine Demo</span>
              <span className="ml-2 hidden text-xs text-slate-500 sm:inline">Sample data only</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {nav.map((item) => {
              const active = pathname === item.href;
              return (
                <Button key={item.href} variant={active ? 'default' : 'ghost'} size="sm" asChild>
                  <Link href={item.href} className="flex items-center gap-1.5">
                    <item.icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{item.label}</span>
                  </Link>
                </Button>
              );
            })}
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
    </div>
  );
}
