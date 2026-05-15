// app/api/logs/route.ts - Enhanced Logging Route with Better Auth
/** biome-ignore-all lint/suspicious/noConsole: ignore console */
import type { LogLevel, LogSource } from '@/generated/prisma';
import { auth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import prisma from '@/lib/prisma';
import { type NextRequest, NextResponse } from 'next/server';

// Helper to get session from Better Auth
async function getSession(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    return session;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { level, message, error, metadata } = body;
    // Get authenticated user from Better Auth session
    const session = await getSession(request);
    const userId = session?.user?.id;
    const organizationId =
      session?.session?.activeOrganizationId || body.organizationId;
    // Validate required fields
    if (!(level && message)) {
      return NextResponse.json(
        { error: 'Level and message are required' },
        { status: 400 }
      );
    }
    // Validate log level - convert to uppercase for Prisma enum
    const upperLevel = level.toUpperCase();
    if (!['ERROR', 'WARN', 'INFO', 'DEBUG'].includes(upperLevel)) {
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
      sessionId: session?.session?.id,
    };
    // Log based on level
    const logLevel = upperLevel as LogLevel;
    const logSource: LogSource = 'CLIENT';
    switch (logLevel) {
      case 'ERROR':
        await logger.error(
          message,
          error,
          requestMetadata,
          logSource,
          userId,
          organizationId
        );
        break;
      case 'WARN':
        await logger.warn(
          message,
          requestMetadata,
          logSource,
          userId,
          organizationId
        );
        break;
      case 'INFO':
        await logger.info(
          message,
          requestMetadata,
          logSource,
          userId,
          organizationId
        );
        break;
      case 'DEBUG':
        await logger.debug(
          message,
          requestMetadata,
          logSource,
          userId,
          organizationId
        );
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid log level' },
          { status: 400 }
        );
    }
    return NextResponse.json({ success: true });
  } catch (_error) {
    console.error('Error in log API:', _error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve logs (admin only)
export async function GET(request: NextRequest) {
  try {
    // Check authentication and authorization
    const session = await getSession(request);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Check if user has admin role (adjust based on your role system)
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });
    if (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }
    const { searchParams } = new URL(request.url);
    const level = searchParams.get('level')?.toUpperCase() as LogLevel | null;
    const source = searchParams
      .get('source')
      ?.toUpperCase() as LogSource | null;
    const userId = searchParams.get('userId');
    const environment = searchParams.get('environment')?.toUpperCase();
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = Number.parseInt(searchParams.get('limit') || '100', 10);
    const page = Number.parseInt(searchParams.get('page') || '1', 10);
    // Build query - restrict to user's organization
    const where: any = {
      organizationId: session?.session?.activeOrganizationId || 'default',
    };
    if (level) where.level = level;
    if (source) where.source = source;
    if (userId) where.userId = userId;
    if (environment) where.environment = environment;
    // Date range filter
    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = new Date(startDate);
      if (endDate) where.timestamp.lte = new Date(endDate);
    }
    // Get logs with pagination
    const [logs, totalCount] = await Promise.all([
      prisma.log.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        take: limit,
        skip: (page - 1) * limit,
        select: {
          id: true,
          level: true,
          message: true,
          errorName: true,
          errorMessage: true,
          errorStack: true,
          errorCode: true,
          metadata: true,
          timestamp: true,
          source: true,
          environment: true,
          userId: true,
          organizationId: true,
          createdAt: true,
        },
      }),
      prisma.log.count({ where }),
    ]);
    return NextResponse.json({
      logs,
      pagination: {
        current: page,
        total: Math.ceil(totalCount / limit),
        count: logs.length,
        totalCount,
      },
    });
  } catch (error) {
    console.error('Error fetching logs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE endpoint to clear old logs (admin only)
export async function DELETE(request: NextRequest) {
  try {
    // Check authentication and authorization
    const session = await getSession(request);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Check if user has super admin role
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });
    if (user?.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden: Super admin access required' },
        { status: 403 }
      );
    }
    const { searchParams } = new URL(request.url);
    const daysToKeep = Number.parseInt(
      searchParams.get('daysToKeep') || '90',
      10
    );
    const level = searchParams.get('level')?.toUpperCase() as LogLevel | null;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    const where: any = {
      organizationId: session?.session?.activeOrganizationId,
      timestamp: {
        lt: cutoffDate,
      },
    };
    if (level) where.level = level;
    const deletedLogs = await prisma.log.deleteMany({
      where,
    });
    // Log the deletion action
    await logger.info(
      'Log cleanup completed',
      {
        deletedCount: deletedLogs.count,
        daysToKeep,
        level: level || 'all',
        performedBy: session.user.id,
      },
      'SERVER',
      session.user.id,
      session?.session?.activeOrganizationId || 'default'
    );
    return NextResponse.json({
      success: true,
      deletedCount: deletedLogs.count,
      message: `Deleted ${deletedLogs.count} logs older than ${daysToKeep} days`,
    });
  } catch (error) {
    console.error('Error deleting logs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
