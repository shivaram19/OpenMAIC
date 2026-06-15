/**
 * Lightweight, dependency-free semaphore for limiting concurrent async work.
 *
 * Used to cap parallel Playwright/Chromium PDF renders so memory/CPU does not
 * spike under batch load. The cap is configurable via env var; queued tasks
 * time out rather than waiting forever.
 */

export interface ConcurrencyLimiterOptions {
  limit: number;
  queueTimeoutMs?: number;
}

type QueueEntry = {
  resolve: () => void;
  reject: (reason: Error) => void;
  timer: NodeJS.Timeout | null;
};

export class ConcurrencyLimiter {
  private limit: number;
  private queueTimeoutMs: number;
  private running = 0;
  private queue: QueueEntry[] = [];

  constructor(options: ConcurrencyLimiterOptions) {
    if (!Number.isInteger(options.limit) || options.limit < 1) {
      throw new Error('Concurrency limit must be a positive integer');
    }
    this.limit = options.limit;
    this.queueTimeoutMs = options.queueTimeoutMs ?? 30_000;
  }

  async withLock<T>(fn: () => Promise<T>): Promise<T> {
    await this.acquire();
    try {
      return await fn();
    } finally {
      this.release();
    }
  }

  private acquire(): Promise<void> {
    if (this.running < this.limit) {
      this.running++;
      return Promise.resolve();
    }

    return new Promise<void>((resolve, reject) => {
      const entry: QueueEntry = { resolve, reject, timer: null };

      if (this.queueTimeoutMs > 0) {
        entry.timer = setTimeout(() => {
          const index = this.queue.indexOf(entry);
          if (index !== -1) {
            this.queue.splice(index, 1);
          }
          reject(
            new Error(`Timed out waiting for PDF concurrency slot after ${this.queueTimeoutMs}ms`),
          );
        }, this.queueTimeoutMs);
      }

      this.queue.push(entry);
    });
  }

  private release(): void {
    const next = this.queue.shift();
    if (next) {
      if (next.timer) {
        clearTimeout(next.timer);
      }
      next.resolve();
      // running count stays the same because the next task will eventually release.
      return;
    }

    this.running = Math.max(0, this.running - 1);
  }
}

export function getPDFConcurrencyLimit(): number {
  const raw = process.env.PDF_CONCURRENCY_LIMIT;
  if (!raw) return 3;
  const parsed = parseInt(raw, 10);
  if (!Number.isInteger(parsed) || parsed < 1) return 3;
  return parsed;
}
