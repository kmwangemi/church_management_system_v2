/** biome-ignore-all lint/suspicious/noConsole: ignore lint issue */
/** biome-ignore-all lint/style/noNestedTernary: ignore lint issue */
/** biome-ignore-all lint/suspicious/useAwait: ignore lint issue */
/** biome-ignore-all lint/style/useConsistentMemberAccessibility: ignore lint issue */
/** biome-ignore-all lint/suspicious/noExplicitAny: ignore lint issue */
import dbConnect from '@/lib/mongodb';
import { Log } from '@/models/log';

export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

export interface LogContext {
  userId?: string;
  churchId?: string;
  endpoint?: string;
  method?: string;
  userAgent?: string;
  ip?: string;
  requestId?: string;
  [key: string]: any;
}

export interface LogOptions {
  level: LogLevel;
  message: string;
  error?: Error | any;
  metadata?: LogContext;
  source?: string;
}

class Logger {
  private static instance: Logger;
  private isProduction: boolean;
  private environment: string;

  private constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
    this.environment = process.env.NODE_ENV || 'development';
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private async logToDatabase(options: LogOptions): Promise<void> {
    try {
      await dbConnect();

      const logEntry = {
        level: options.level,
        message: options.message,
        error: options.error
          ? {
              name: options.error.name,
              message: options.error.message,
              stack: options.error.stack,
              code: options.error.code,
            }
          : undefined,
        metadata: options.metadata || {},
        timestamp: new Date(),
        source: options.source || 'unknown',
        environment: this.environment,
      };

      const log = new Log(logEntry);
      await log.save();
    } catch (dbError) {
      // Fallback to console if database logging fails
      console.error('Failed to log to database:', dbError);
      console.error('Original log entry:', options);
    }
  }

  private logToConsole(options: LogOptions): void {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${options.level.toUpperCase()}] [${
      options.source || 'unknown'
    }]`;

    const logMethod =
      options.level === 'error'
        ? console.error
        : options.level === 'warn'
          ? console.warn
          : options.level === 'debug'
            ? console.debug
            : console.log;

    if (options.error) {
      logMethod(`${prefix} ${options.message}`, options.error);
    } else {
      logMethod(`${prefix} ${options.message}`);
    }

    if (options.metadata && Object.keys(options.metadata).length > 0) {
      console.log('Metadata:', options.metadata);
    }
  }

  private async log(options: LogOptions): Promise<void> {
    // Always log to console in development
    if (!this.isProduction) {
      this.logToConsole(options);
    }

    // Log to database (async, non-blocking)
    this.logToDatabase(options).catch((error) => {
      console.error('Logger: Failed to log to database:', error);
    });
  }

  public async error(
    message: string,
    error?: Error | any,
    metadata?: LogContext,
    source?: string
  ): Promise<void> {
    await this.log({
      level: 'error',
      message,
      error,
      metadata,
      source: source || 'application',
    });
  }

  public async warn(
    message: string,
    metadata?: LogContext,
    source?: string
  ): Promise<void> {
    await this.log({
      level: 'warn',
      message,
      metadata,
      source: source || 'application',
    });
  }

  public async info(
    message: string,
    metadata?: LogContext,
    source?: string
  ): Promise<void> {
    await this.log({
      level: 'info',
      message,
      metadata,
      source: source || 'application',
    });
  }

  public async debug(
    message: string,
    metadata?: LogContext,
    source?: string
  ): Promise<void> {
    // Only log debug in development
    if (!this.isProduction) {
      await this.log({
        level: 'debug',
        message,
        metadata,
        source: source || 'application',
      });
    }
  }

  // Utility method to create a logger with context
  public createContextLogger(
    defaultMetadata: LogContext,
    defaultSource?: string
  ) {
    return {
      error: (
        message: string,
        error?: Error | any,
        additionalMetadata?: LogContext
      ) =>
        this.error(
          message,
          error,
          { ...defaultMetadata, ...additionalMetadata },
          defaultSource
        ),
      warn: (message: string, additionalMetadata?: LogContext) =>
        this.warn(
          message,
          { ...defaultMetadata, ...additionalMetadata },
          defaultSource
        ),
      info: (message: string, additionalMetadata?: LogContext) =>
        this.info(
          message,
          { ...defaultMetadata, ...additionalMetadata },
          defaultSource
        ),
      debug: (message: string, additionalMetadata?: LogContext) =>
        this.debug(
          message,
          { ...defaultMetadata, ...additionalMetadata },
          defaultSource
        ),
    };
  }
}

// Export singleton instance
export const logger = Logger.getInstance();

// Export convenience functions
export const logError = (
  message: string,
  error?: Error | any,
  metadata?: LogContext,
  source?: string
) => logger.error(message, error, metadata, source);

export const logWarn = (
  message: string,
  metadata?: LogContext,
  source?: string
) => logger.warn(message, metadata, source);

export const logInfo = (
  message: string,
  metadata?: LogContext,
  source?: string
) => logger.info(message, metadata, source);

export const logDebug = (
  message: string,
  metadata?: LogContext,
  source?: string
) => logger.debug(message, metadata, source);
