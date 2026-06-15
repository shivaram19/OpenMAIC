const LOG_LEVELS = { debug: 0, info: 1, warn: 2, error: 3 } as const;
type LogLevel = keyof typeof LOG_LEVELS;

function getMinLevel(): LogLevel {
  const env = (process.env.LOG_LEVEL ?? 'info').toLowerCase();
  return env in LOG_LEVELS ? (env as LogLevel) : 'info';
}

function isJsonFormat(): boolean {
  return process.env.LOG_FORMAT === 'json';
}

function stringifyArg(arg: unknown): string {
  if (arg instanceof Error) return arg.stack ?? arg.message;
  if (typeof arg === 'string') return arg;
  return JSON.stringify(arg);
}

function formatLine(level: LogLevel, tag: string, args: unknown[]): string {
  const timestamp = new Date().toISOString();
  const upperLevel = level.toUpperCase();

  // Separate structured fields from message parts.
  const structured: Record<string, unknown> = {};
  const messages: string[] = [];

  for (const arg of args) {
    if (arg && typeof arg === 'object' && !Array.isArray(arg) && !(arg instanceof Error)) {
      Object.assign(structured, arg);
    } else {
      messages.push(stringifyArg(arg));
    }
  }

  if (isJsonFormat()) {
    return JSON.stringify({
      timestamp,
      level: upperLevel,
      tag,
      ...structured,
      message: messages.join(' '),
    });
  }

  const fields = Object.entries(structured)
    .map(([k, v]) => `${k}=${JSON.stringify(v)}`)
    .join(' ');

  return `[${timestamp}] [${upperLevel}] [${tag}] ${messages.join(' ')}${fields ? ` | ${fields}` : ''}`;
}

export function createLogger(tag: string) {
  const emit = (level: LogLevel, args: unknown[]) => {
    if (LOG_LEVELS[level] < LOG_LEVELS[getMinLevel()]) return;

    const line = formatLine(level, tag, args);

    // Console output
    const fn =
      level === 'debug'
        ? console.debug
        : level === 'warn'
          ? console.warn
          : level === 'error'
            ? console.error
            : console.log;
    fn(line);
  };

  return {
    debug: (...args: unknown[]) => emit('debug', args),
    info: (...args: unknown[]) => emit('info', args),
    warn: (...args: unknown[]) => emit('warn', args),
    error: (...args: unknown[]) => emit('error', args),
  };
}
