/**
 * Server-Side Logging Utility
 *
 * Structured logging for backend operations
 * Production-ready with different log levels
 */

import { getEnv } from './env';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4,
}

export interface LogContext {
  [key: string]: any;
}

export interface LogEntry {
  level: keyof typeof LogLevel;
  message: string;
  timestamp: string;
  context?: LogContext;
  error?: {
    message: string;
    stack?: string;
    name?: string;
  };
}

class Logger {
  private minLevel: LogLevel;
  private isProduction: boolean;

  constructor() {
    const env = getEnv();
    this.isProduction = env.NODE_ENV === 'production';
    this.minLevel = this.isProduction ? LogLevel.INFO : LogLevel.DEBUG;
  }

  /**
   * Format log entry
   */
  private format(entry: LogEntry): string {
    if (this.isProduction) {
      // JSON format for production (easier for log aggregation)
      return JSON.stringify(entry);
    } else {
      // Human-readable format for development
      const emoji = this.getEmoji(entry.level);
      const contextStr = entry.context
        ? `\n  Context: ${JSON.stringify(entry.context, null, 2)}`
        : '';
      const errorStr = entry.error
        ? `\n  Error: ${entry.error.message}${entry.error.stack ? `\n${entry.error.stack}` : ''}`
        : '';

      return `${emoji} [${entry.timestamp}] ${entry.level}: ${entry.message}${contextStr}${errorStr}`;
    }
  }

  /**
   * Get emoji for log level (development only)
   */
  private getEmoji(level: keyof typeof LogLevel): string {
    const emojis = {
      DEBUG: '🔍',
      INFO: 'ℹ️',
      WARN: '⚠️',
      ERROR: '❌',
      FATAL: '💀',
    };
    return emojis[level] || 'ℹ️';
  }

  /**
   * Should log at this level?
   */
  private shouldLog(level: LogLevel): boolean {
    return level >= this.minLevel;
  }

  /**
   * Log a message
   */
  private log(
    level: keyof typeof LogLevel,
    message: string,
    context?: LogContext,
    error?: Error
  ): void {
    if (!this.shouldLog(LogLevel[level])) {
      return;
    }

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      ...(context && { context }),
      ...(error && {
        error: {
          message: error.message,
          stack: error.stack,
          name: error.name,
        },
      }),
    };

    const formatted = this.format(entry);

    // Output based on level
    switch (level) {
      case 'DEBUG':
      case 'INFO':
        console.log(formatted);
        break;
      case 'WARN':
        console.warn(formatted);
        break;
      case 'ERROR':
      case 'FATAL':
        console.error(formatted);
        break;
    }

    // In production, you could send to external logging service here
    // e.g., Sentry, Datadog, CloudWatch, etc.
    if (this.isProduction && (level === 'ERROR' || level === 'FATAL')) {
      // TODO: Send to external error tracking service
      // Example: Sentry.captureException(error);
    }
  }

  /**
   * Debug log (only in development)
   */
  debug(message: string, context?: LogContext): void {
    this.log('DEBUG', message, context);
  }

  /**
   * Info log
   */
  info(message: string, context?: LogContext): void {
    this.log('INFO', message, context);
  }

  /**
   * Warning log
   */
  warn(message: string, context?: LogContext): void {
    this.log('WARN', message, context);
  }

  /**
   * Error log
   */
  error(message: string, error?: Error, context?: LogContext): void {
    this.log('ERROR', message, context, error);
  }

  /**
   * Fatal error log (critical issues)
   */
  fatal(message: string, error?: Error, context?: LogContext): void {
    this.log('FATAL', message, context, error);
  }

  /**
   * Log API request
   */
  apiRequest(data: {
    method: string;
    path: string;
    userId?: string;
    ip?: string;
    userAgent?: string;
  }): void {
    this.info('API Request', {
      type: 'api_request',
      ...data,
    });
  }

  /**
   * Log API response
   */
  apiResponse(data: {
    method: string;
    path: string;
    status: number;
    duration: number;
    userId?: string;
  }): void {
    this.info('API Response', {
      type: 'api_response',
      ...data,
    });
  }

  /**
   * Log database operation
   */
  database(operation: string, context?: LogContext): void {
    this.debug(`Database: ${operation}`, {
      type: 'database',
      ...context,
    });
  }

  /**
   * Log AI operation
   */
  ai(operation: string, context?: LogContext): void {
    this.info(`AI: ${operation}`, {
      type: 'ai',
      ...context,
    });
  }

  /**
   * Log blockchain operation
   */
  blockchain(operation: string, context?: LogContext): void {
    this.info(`Blockchain: ${operation}`, {
      type: 'blockchain',
      ...context,
    });
  }

  /**
   * Create a child logger with persistent context
   */
  child(context: LogContext): ChildLogger {
    return new ChildLogger(this, context);
  }
}

/**
 * Child logger with persistent context
 */
class ChildLogger {
  constructor(
    private parent: Logger,
    private persistentContext: LogContext
  ) {}

  private mergeContext(context?: LogContext): LogContext {
    return { ...this.persistentContext, ...context };
  }

  debug(message: string, context?: LogContext): void {
    this.parent.debug(message, this.mergeContext(context));
  }

  info(message: string, context?: LogContext): void {
    this.parent.info(message, this.mergeContext(context));
  }

  warn(message: string, context?: LogContext): void {
    this.parent.warn(message, this.mergeContext(context));
  }

  error(message: string, error?: Error, context?: LogContext): void {
    this.parent.error(message, error, this.mergeContext(context));
  }

  fatal(message: string, error?: Error, context?: LogContext): void {
    this.parent.fatal(message, error, this.mergeContext(context));
  }
}

/**
 * Performance measurement utility
 */
export class PerformanceTimer {
  private startTime: number;

  constructor(private logger: Logger, private operation: string) {
    this.startTime = Date.now();
    this.logger.debug(`Starting: ${operation}`);
  }

  /**
   * End timer and log duration
   */
  end(context?: LogContext): number {
    const duration = Date.now() - this.startTime;
    this.logger.debug(`Completed: ${this.operation}`, {
      duration: `${duration}ms`,
      ...context,
    });
    return duration;
  }

  /**
   * End timer with error
   */
  endWithError(error: Error, context?: LogContext): number {
    const duration = Date.now() - this.startTime;
    this.logger.error(`Failed: ${this.operation}`, error, {
      duration: `${duration}ms`,
      ...context,
    });
    return duration;
  }
}

// Export singleton instance
export const logger = new Logger();

// Export timer factory
export function startTimer(operation: string): PerformanceTimer {
  return new PerformanceTimer(logger, operation);
}

// Example usage:
// import { logger, startTimer } from '@/lib/logger';
//
// logger.info('Server started', { port: 9002 });
// logger.error('Database connection failed', error, { connectionString: '...' });
//
// const timer = startTimer('API call');
// // ... do work
// timer.end({ result: 'success' });
