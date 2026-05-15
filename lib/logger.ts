// lib/logger.ts - Enhanced Logger Implementation
/** biome-ignore-all lint/suspicious/noConsole: ignore console */
import type { Environment, LogLevel, LogSource } from '@/generated/prisma';
import prisma from '@/lib/prisma';

class Logger {
  private async createLog(
    level: LogLevel,
    message: string,
    metadata?: any,
    source: LogSource = 'SERVER',
    error?: any,
    userId?: string,
    organizationId?: string
  ) {
    try {
      const environment = (process.env.NODE_ENV?.toUpperCase() ||
        'DEVELOPMENT') as Environment;
      // Extract error details if present
      const errorDetails = error
        ? {
            errorName: error.name || 'Error',
            errorMessage: error.message || String(error),
            errorStack: error.stack,
            errorCode: error.code,
          }
        : {};
      // If no organizationId is provided, try to use a system default or skip for non-critical logs
      if (!organizationId) {
        // For ERROR level, still log to console but skip database
        if (level === 'ERROR') {
          console.error(
            'ERROR log without organizationId - logging to console only:',
            {
              level,
              message,
              metadata,
              error,
            }
          );
        } else {
          console.warn(
            'No organizationId provided for log, skipping database entry:',
            {
              level,
              message,
              metadata,
            }
          );
        }
        return;
      }
      // Build data object conditionally to avoid undefined values
      const logData: any = {
        level,
        message,
        source,
        environment,
        metadata: metadata || {},
        organizationId,
        ...errorDetails,
      };
      // Only add userId if it's provided
      if (userId) {
        logData.userId = userId;
      }
      await prisma.log.create({
        data: logData,
      });
    } catch (logError) {
      // Fallback to console if database logging fails
      console.error('Failed to create log entry:', logError);
      console.error('Original log:', { level, message, metadata, error });
    }
  }
  async error(
    message: string,
    error?: any,
    metadata?: any,
    source: LogSource = 'SERVER',
    userId?: string,
    organizationId?: string
  ) {
    console.error(message, error, metadata);
    await this.createLog(
      'ERROR',
      message,
      metadata,
      source,
      error,
      userId,
      organizationId
    );
  }
  async warn(
    message: string,
    metadata?: any,
    source: LogSource = 'SERVER',
    userId?: string,
    organizationId?: string
  ) {
    console.warn(message, metadata);
    await this.createLog(
      'WARN',
      message,
      metadata,
      source,
      undefined,
      userId,
      organizationId
    );
  }
  async info(
    message: string,
    metadata?: any,
    source: LogSource = 'SERVER',
    userId?: string,
    organizationId?: string
  ) {
    console.info(message, metadata);
    await this.createLog(
      'INFO',
      message,
      metadata,
      source,
      undefined,
      userId,
      organizationId
    );
  }
  async debug(
    message: string,
    metadata?: any,
    source: LogSource = 'SERVER',
    userId?: string,
    organizationId?: string
  ) {
    console.debug(message, metadata);
    await this.createLog(
      'DEBUG',
      message,
      metadata,
      source,
      undefined,
      userId,
      organizationId
    );
  }
}

export const logger = new Logger();
