import { requireAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { withApiLogger } from '@/lib/middleware/api-logger';
import dbConnect from '@/lib/mongodb';
import { calculateDateRange } from '@/lib/utils';
import mongoose from 'mongoose';
import { type NextRequest, NextResponse } from 'next/server';

// /api/reports/preview/route.ts - Report preview
export async function getReportPreviewHandler(
  request: NextRequest
): Promise<NextResponse> {
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    { requestId, endpoint: '/api/reports/preview' },
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
    const previewData = await request.json();
    const { type, departments, dateRange, customStartDate, customEndDate } =
      previewData;
    // Calculate department counts (reuse helper from main route)
    const departmentCounts = await calculateDepartmentCounts(
      departments,
      new mongoose.Types.ObjectId(user.user?.churchId)
    );
    // Calculate date range
    const { startDate, endDate } = calculateDateRange(
      dateRange,
      customStartDate,
      customEndDate
    );
    // Estimate file size based on record count and type
    const estimateFileSize = (recordCount: number, reportType: string) => {
      const baseSize = 50; // KB base size
      let recordSize = 0.5; // KB per record
      if (reportType === 'financial') recordSize = 1.2;
      if (reportType === 'attendance') recordSize = 0.8;
      const totalSizeKB = baseSize + recordCount * recordSize;
      if (totalSizeKB < 1024) return `${Math.round(totalSizeKB)} KB`;
      return `${Math.round((totalSizeKB / 1024) * 100) / 100} MB`;
    };
    // Estimate generation time
    const estimateGenerationTime = (recordCount: number) => {
      const baseTime = 5; // seconds
      const timePerRecord = 0.01; // seconds per record
      const totalSeconds = baseTime + recordCount * timePerRecord;
      if (totalSeconds < 60) return `${Math.round(totalSeconds)}s`;
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = Math.round(totalSeconds % 60);
      return `${minutes}m ${seconds}s`;
    };
    return NextResponse.json({
      success: true,
      data: {
        estimatedRecords: departmentCounts.totalCount,
        departmentBreakdown: departmentCounts.departmentCounts,
        dateRangeUsed: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
        estimatedSize: estimateFileSize(departmentCounts.totalCount, type),
        estimatedGenerationTime: estimateGenerationTime(
          departmentCounts.totalCount
        ),
      },
    });
  } catch (error) {
    contextLogger.error('Unexpected error in getReportPreviewHandler', error);
    return NextResponse.json(
      { error: 'Failed to generate report preview' },
      { status: 500 }
    );
  }
}

// Export handlers with logging middleware
export const GET = withApiLogger(getReportPreviewHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});
