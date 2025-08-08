import { requireAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { withApiLogger } from '@/lib/middleware/api-logger';
import dbConnect from '@/lib/mongodb';
import Report from '@/models/report';
import mongoose from 'mongoose';
import { type NextRequest, NextResponse } from 'next/server';

// GET /api/reports/[id] - Fetch single report
async function getReportHandler(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    { requestId, endpoint: `/api/reports/${params.id}` },
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
    const report = await Report.findOne({
      _id: new mongoose.Types.ObjectId(params.id),
      churchId: new mongoose.Types.ObjectId(user.user?.churchId),
    }).populate('createdBy', 'firstName lastName email');
    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }
    return NextResponse.json({
      success: true,
      data: report,
    });
  } catch (error) {
    contextLogger.error('Unexpected error in getReportHandler', error);
    return NextResponse.json(
      { error: 'Failed to fetch report' },
      { status: 500 }
    );
  }
}

// PATCH /api/reports/[id]/cancel - Cancel report generation
async function cancelReportHandler(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    { requestId, endpoint: `/api/reports/${params.id}/cancel` },
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
    await dbConnect();
    const report = await Report.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(params.id),
        churchId: new mongoose.Types.ObjectId(user.user?.churchId),
        status: 'generating',
      },
      { status: 'cancelled' },
      { new: true }
    );
    if (!report) {
      return NextResponse.json(
        { error: 'Report not found or cannot be cancelled' },
        { status: 404 }
      );
    }
    contextLogger.info('Report cancelled', { reportId: params.id });
    return NextResponse.json({
      success: true,
      message: 'Report cancelled successfully',
    });
  } catch (error) {
    contextLogger.error('Unexpected error in cancelReportHandler', error);
    return NextResponse.json(
      { error: 'Failed to cancel report' },
      { status: 500 }
    );
  }
}

// DELETE /api/reports/[id] - Delete report
async function deleteReportHandler(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    { requestId, endpoint: `/api/reports/${params.id}` },
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
    await dbConnect();
    const report = await Report.findOneAndDelete({
      _id: new mongoose.Types.ObjectId(params.id),
      churchId: new mongoose.Types.ObjectId(user.user?.churchId),
    });
    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }
    // TODO: Clean up associated files from storage
    // if (report.fileUrl) {
    //   await deleteFileFromStorage(report.fileUrl);
    // }
    contextLogger.info('Report deleted', { reportId: params.id });
    return NextResponse.json({
      success: true,
      message: 'Report deleted successfully',
    });
  } catch (error) {
    contextLogger.error('Unexpected error in deleteReportHandler', error);
    return NextResponse.json(
      { error: 'Failed to delete report' },
      { status: 500 }
    );
  }
}

export const GET = withApiLogger(getReportHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});

export const PATCH = withApiLogger(cancelReportHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});

export const DELETE = withApiLogger(deleteReportHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});
