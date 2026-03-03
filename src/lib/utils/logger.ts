/**
 * Structured logger utility — wraps console methods with
 * a consistent format and level awareness.
 *
 * In production (NODE_ENV === 'production') debug-level
 * messages are silenced.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const MIN_LEVEL: LogLevel =
  process.env.NODE_ENV === 'production' ? 'info' : 'debug';

function shouldLog(level: LogLevel): boolean {
  return LEVEL_PRIORITY[level] >= LEVEL_PRIORITY[MIN_LEVEL];
}

function formatPrefix(level: LogLevel): string {
  const ts = new Date().toISOString();
  return `[${ts}] [${level.toUpperCase()}]`;
}

export const logger = {
  debug(message: string, ...args: unknown[]) {
    if (!shouldLog('debug')) return;
    // eslint-disable-next-line no-console
    console.debug(formatPrefix('debug'), message, ...args);
  },

  info(message: string, ...args: unknown[]) {
    if (!shouldLog('info')) return;
    // eslint-disable-next-line no-console
    console.info(formatPrefix('info'), message, ...args);
  },

  warn(message: string, ...args: unknown[]) {
    if (!shouldLog('warn')) return;
    // eslint-disable-next-line no-console
    console.warn(formatPrefix('warn'), message, ...args);
  },

  error(message: string, ...args: unknown[]) {
    if (!shouldLog('error')) return;
    // eslint-disable-next-line no-console
    console.error(formatPrefix('error'), message, ...args);
  },
};
