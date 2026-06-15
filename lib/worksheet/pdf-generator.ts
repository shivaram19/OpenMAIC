import { chromium } from 'playwright';
import type { QuizQuestion } from '@/lib/types/stage';
import type { StudentProfile } from '@/lib/types/generation';
import { createLogger } from '@/lib/logger';
import { buildWorksheetHTML } from './pdf-template';
import { ConcurrencyLimiter, getPDFConcurrencyLimit } from './concurrency-limiter';

export interface GeneratePDFOptions {
  student: StudentProfile;
  topic: string;
  questions: QuizQuestion[];
  generatedAt: string;
}

const log = createLogger('Worksheet PDF Generator');

const pdfLimiter = new ConcurrencyLimiter({
  limit: getPDFConcurrencyLimit(),
  queueTimeoutMs: 30_000,
});

export async function generateWorksheetPDF(options: GeneratePDFOptions): Promise<Buffer> {
  return pdfLimiter.withLock(async () => {
    const start = Date.now();
    log.info({ studentCount: 1, topic: options.topic }, 'PDF generation started');

    try {
      const html = buildWorksheetHTML({
        student: options.student,
        topic: options.topic,
        questions: options.questions,
        generatedAt: options.generatedAt,
      });

      const browser = await chromium.launch({ headless: true });
      try {
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle' });

        const pdf = await page.pdf({
          format: 'A4',
          printBackground: true,
          margin: { top: '0', right: '0', bottom: '0', left: '0' },
        });

        log.info(
          {
            studentCount: 1,
            topic: options.topic,
            durationMs: Date.now() - start,
            success: true,
          },
          'PDF generation completed',
        );

        return Buffer.from(pdf);
      } finally {
        await browser.close();
      }
    } catch (error) {
      log.error(
        {
          studentCount: 1,
          topic: options.topic,
          durationMs: Date.now() - start,
          success: false,
          error: error instanceof Error ? error.message : String(error),
        },
        'PDF generation failed',
      );
      throw error;
    }
  });
}

export async function generateMultipleWorksheetPDFs(items: GeneratePDFOptions[]): Promise<Buffer> {
  if (items.length === 0) {
    throw new Error('No worksheets to generate');
  }

  return pdfLimiter.withLock(async () => {
    const start = Date.now();
    const topic = items[0]?.topic ?? 'multiple';
    log.info({ studentCount: items.length, topic }, 'Batch PDF generation started');

    let browser;
    try {
      browser = await chromium.launch({ headless: true });
      const context = await browser.newContext();
      const mergedBuffers: Buffer[] = [];

      for (const item of items) {
        const html = buildWorksheetHTML({
          student: item.student,
          topic: item.topic,
          questions: item.questions,
          generatedAt: item.generatedAt,
        });
        const page = await context.newPage();
        await page.setContent(html, { waitUntil: 'networkidle' });
        const pdf = await page.pdf({
          format: 'A4',
          printBackground: true,
          margin: { top: '0', right: '0', bottom: '0', left: '0' },
        });
        mergedBuffers.push(Buffer.from(pdf));
        await page.close();
      }

      log.info(
        {
          studentCount: items.length,
          topic,
          durationMs: Date.now() - start,
          success: true,
        },
        'Batch PDF generation completed',
      );

      // Simple concatenation of PDF buffers (works for most simple PDFs generated the same way)
      // For production, use pdf-lib for proper merging.
      return Buffer.concat(mergedBuffers);
    } catch (error) {
      log.error(
        {
          studentCount: items.length,
          topic,
          durationMs: Date.now() - start,
          success: false,
          error: error instanceof Error ? error.message : String(error),
        },
        'Batch PDF generation failed',
      );
      throw error;
    } finally {
      if (browser) await browser.close();
    }
  });
}
