import { requireAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { withApiLogger } from '@/lib/middleware/api-logger';
import dbConnect from '@/lib/mongodb';
import Report from '@/models/report';
import mongoose from 'mongoose';
import { type NextRequest, NextResponse } from 'next/server';

// /api/reports/stats/route.ts - Report statistics
export async function getReportStatsHandler(
  request: NextRequest
): Promise<NextResponse> {
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    { requestId, endpoint: '/api/reports/stats' },
    'api'
  );

  try {
    const authResult = await requireAuth(['superadmin', 'admin'])(request);
    if (authResult instanceof Response) {
      const body = await authResult.text();
      return new NextResponse(body, {
        status: authResult.status,
        statusText: authResult.statusText,
        headers: authResult.headers,
      });
    }

    const user = authResult;
    if (!user.user?.churchId) {
      return NextResponse.json(
        { error: 'Church ID not found' },
        { status: 400 }
      );
    }

    await dbConnect();

    const churchId = new mongoose.Types.ObjectId(user.user?.churchId);

    // Get aggregated statistics
    const [
      totalReports,
      completedReports,
      generatingReports,
      failedReports,
      reportsByType,
      reportsByStatus,
      recentReports,
    ] = await Promise.all([
      Report.countDocuments({ churchId }),
      Report.countDocuments({ churchId, status: 'completed' }),
      Report.countDocuments({ churchId, status: 'generating' }),
      Report.countDocuments({ churchId, status: 'failed' }),
      Report.aggregate([
        { $match: { churchId } },
        { $group: { _id: '$type', count: { $sum: 1 } } },
        { $project: { type: '$_id', count: 1, _id: 0 } },
      ]),
      Report.aggregate([
        { $match: { churchId } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $project: { status: '$_id', count: 1, _id: 0 } },
      ]),
      Report.find({ churchId })
        .populate('createdBy', 'name')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        totalReports,
        completedReports,
        generatingReports,
        failedReports,
        reportsByType,
        reportsByStatus,
        recentReports,
      },
    });
  } catch (error) {
    contextLogger.error('Unexpected error in getReportStatsHandler', error);
    return NextResponse.json(
      { error: 'Failed to fetch report statistics' },
      { status: 500 }
    );
  }
}