import { logger } from '@/lib/logger';
import { type NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { level, message, error, metadata } = body;
    // Validate required fields
    if (!(level && message)) {
      return NextResponse.json(
        { error: 'Level and message are required' },
        { status: 400 }
      );
    }
    // Validate log level
    if (!['error', 'warn', 'info', 'debug'].includes(level)) {
      return NextResponse.json({ error: 'Invalid log level' }, { status: 400 });
    }
    // Add request metadata
    const requestMetadata = {
      ...metadata,
      ip:
        request.headers.get('x-forwarded-for') ||
        request.headers.get('x-real-ip') ||
        'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      timestamp: new Date().toISOString(),
    };
    // Log based on level
    switch (level) {
      case 'error':
        await logger.error(message, error, requestMetadata, 'client');
        break;
      case 'warn':
        await logger.warn(message, requestMetadata, 'client');
        break;
      case 'info':
        await logger.info(message, requestMetadata, 'client');
        break;
      case 'debug':
        await logger.debug(message, requestMetadata, 'client');
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid log level' },
          { status: 400 }
        );
    }
    return NextResponse.json({ success: true });
  } catch (_error) {
    // console.error('Error in log API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve logs (for admin dashboard)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const level = searchParams.get('level');
    const source = searchParams.get('source');
    const limit = Number.parseInt(searchParams.get('limit') || '100', 10);
    const page = Number.parseInt(searchParams.get('page') || '1', 10);
    // Import Log model dynamically to avoid circular dependencies
    const { LogModel } = await import('@/models');
    await (await import('@/lib/mongodb')).default();
    // Build query
    const query: any = {};
    if (level) query.level = level;
    if (source) query.source = source;
    // Get logs with pagination
    const logs = await LogModel.find(query)
      .sort({ timestamp: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .lean();
    const totalCount = await LogModel.countDocuments(query);
    return NextResponse.json({
      logs,
      pagination: {
        current: page,
        total: Math.ceil(totalCount / limit),
        count: logs.length,
        totalCount,
      },
    });
  } catch (_error) {
    // console.error('Error fetching logs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
