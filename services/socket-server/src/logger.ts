// services/socket-server/src/logger.ts
// Structured JSON Logger for Production Observability

export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export interface LogContext {
  [key: string]: unknown;
}

export const logger = {
  info(message: string, context?: LogContext): void {
    const entry = {
      level: 'info',
      timestamp: new Date().toISOString(),
      message,
      ...context,
    };
    process.stdout.write(`${JSON.stringify(entry)}\n`);
  },
  warn(message: string, context?: LogContext): void {
    const entry = {
      level: 'warn',
      timestamp: new Date().toISOString(),
      message,
      ...context,
    };
    process.stderr.write(`${JSON.stringify(entry)}\n`);
  },
  error(message: string, error?: unknown, context?: LogContext): void {
    const errMessage = error instanceof Error ? error.message : error ? String(error) : undefined;
    const errStack = error instanceof Error ? error.stack : undefined;
    const entry = {
      level: 'error',
      timestamp: new Date().toISOString(),
      message,
      error: errMessage,
      stack: errStack,
      ...context,
    };
    process.stderr.write(`${JSON.stringify(entry)}\n`);
  },
};
