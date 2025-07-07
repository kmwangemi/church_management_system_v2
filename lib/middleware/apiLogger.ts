import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export interface ApiLoggerOptions {
  logRequests?: boolean;
  logResponses?: boolean;
  logErrors?: boolean;
  excludePaths?: string[];
}

export function withApiLogger(
  handler: (req: NextRequest, context?: any) => Promise<NextResponse>,
  options: ApiLoggerOptions = {},
) {
  const {
    logRequests = true,
    logResponses = false,
    logErrors = true,
    excludePaths = ['/api/health', '/api/ping'],
  } = options;

  return async (req: NextRequest, context?: any): Promise<NextResponse> => {
    const requestId = uuidv4();
    const startTime = Date.now();

    // Extract request metadata
    const metadata = {
      requestId,
      method: req.method,
      endpoint: req.nextUrl.pathname,
      userAgent: req.headers.get('user-agent') || 'unknown',
      ip:
        req.headers.get('x-forwarded-for') ||
        req.headers.get('x-real-ip') ||
        'unknown',
      timestamp: new Date().toISOString(),
    };

    // Skip logging for excluded paths
    const shouldSkip = excludePaths.some(path =>
      req.nextUrl.pathname.startsWith(path),
    );

    if (shouldSkip) {
      return handler(req, context);
    }

    // Log incoming request
    if (logRequests) {
      await logger.info(
        `Incoming ${req.method} request to ${req.nextUrl.pathname}`,
        metadata,
        'api',
      );
    }

    try {
      // Execute the handler
      const response = await handler(req, context);
      const duration = Date.now() - startTime;

      // Log successful response
      if (logResponses) {
        await logger.info(
          `${req.method} ${req.nextUrl.pathname} completed successfully`,
          {
            ...metadata,
            statusCode: response.status,
            duration: `${duration}ms`,
          },
          'api',
        );
      }

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;

      // Log error
      if (logErrors) {
        await logger.error(
          `Error in ${req.method} ${req.nextUrl.pathname}`,
          error,
          {
            ...metadata,
            duration: `${duration}ms`,
          },
          'api',
        );
      }

      // Re-throw the error so it can be handled by the caller
      throw error;
    }
  };
}
