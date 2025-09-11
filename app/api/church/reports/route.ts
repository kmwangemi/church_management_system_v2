import { requireAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { withApiLogger } from '@/lib/middleware/api-logger';
import dbConnect from '@/lib/mongodb';
import { calculateDateRange } from '@/lib/utils';
import { ReportModel } from '@/models';
import mongoose from 'mongoose';
import { type NextRequest, NextResponse } from 'next/server';

// GET /api/reports - Fetch reports with filtering and pagination
async function getReportsHandler(request: NextRequest): Promise<NextResponse> {
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    { requestId, endpoint: '/api/church/reports' },
    'api'
  );
  try {
    // Check authentication and authorization
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
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = Math.max(
      1,
      Number.parseInt(searchParams.get('page') || '1', 10)
    );
    const limit = Math.min(
      20,
      Math.max(1, Number.parseInt(searchParams.get('limit') || '10', 10))
    );
    const search = searchParams.get('search')?.trim() || '';
    const type = searchParams.get('type') || '';
    const status = searchParams.get('status') || '';
    const dateRange = searchParams.get('dateRange') || '';
    // Build query object
    const query: any = {
      churchId: new mongoose.Types.ObjectId(user.user?.churchId),
    };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    if (
      type &&
      [
        'attendance',
        'financial',
        'membership',
        'events',
        'giving',
        'activities',
      ].includes(type)
    ) {
      query.type = type;
    }
    if (
      status &&
      ['generating', 'completed', 'failed', 'cancelled'].includes(status)
    ) {
      query.status = status;
    }
    if (
      dateRange &&
      [
        'last7days',
        'last30days',
        'last3months',
        'last6months',
        'lastyear',
        'custom',
      ].includes(dateRange)
    ) {
      query.dateRange = dateRange;
    }
    const skip = (page - 1) * limit;
    // Execute queries
    const [reports, total] = await Promise.all([
      ReportModel.find(query)
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ReportModel.countDocuments(query),
    ]);
    return NextResponse.json({
      success: true,
      data: {
        reports,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    contextLogger.error('Unexpected error in getReportsHandler', error);
    return NextResponse.json(
      { error: 'Failed to fetch reports' },
      { status: 500 }
    );
  }
}

// POST /api/reports - Create a new report
async function createReportHandler(
  request: NextRequest
): Promise<NextResponse> {
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    { requestId, endpoint: '/api/church/reports' },
    'api'
  );
  try {
    // Check authentication and authorization
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
    const reportData = await request.json();
    // Validate required fields
    const requiredFields = [
      'name',
      'type',
      'description',
      'dateRange',
      'format',
      'departments',
    ];
    for (const field of requiredFields) {
      if (!reportData[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }
    // Validate report type
    if (
      ![
        'attendance',
        'financial',
        'membership',
        'events',
        'giving',
        'activities',
      ].includes(reportData.type)
    ) {
      return NextResponse.json(
        { error: 'Invalid report type' },
        { status: 400 }
      );
    }
    // Validate date range
    if (
      ![
        'last7days',
        'last30days',
        'last3months',
        'last6months',
        'lastyear',
        'custom',
      ].includes(reportData.dateRange)
    ) {
      return NextResponse.json(
        { error: 'Invalid date range' },
        { status: 400 }
      );
    }
    // Validate custom date requirements
    if (reportData.dateRange === 'custom') {
      if (!(reportData.customStartDate && reportData.customEndDate)) {
        return NextResponse.json(
          { error: 'Custom start and end dates are required' },
          { status: 400 }
        );
      }
      const startDate = new Date(reportData.customStartDate);
      const endDate = new Date(reportData.customEndDate);
      if (startDate >= endDate) {
        return NextResponse.json(
          { error: 'Start date must be before end date' },
          { status: 400 }
        );
      }

      if (endDate > new Date()) {
        return NextResponse.json(
          { error: 'End date cannot be in the future' },
          { status: 400 }
        );
      }
    }
    // Validate format
    if (!['pdf', 'excel', 'csv'].includes(reportData.format)) {
      return NextResponse.json(
        { error: 'Invalid output format' },
        { status: 400 }
      );
    }
    // // Calculate department counts and validate departments exist
    // const departmentCounts = await calculateDepartmentCounts(
    //   reportData.departments,
    //   new mongoose.Types.ObjectId(user.user?.churchId)
    // );
    // if (departmentCounts.totalCount === 0) {
    //   return NextResponse.json(
    //     { error: 'No valid members found for the selected departments' },
    //     { status: 400 }
    //   );
    // }
    // Calculate actual date range
    const { startDate, endDate } = calculateDateRange(
      reportData.dateRange,
      reportData.customStartDate,
      reportData.customEndDate
    );
    // Create report object
    const reportObj = {
      ...reportData,
      churchId: user.user?.churchId,
      branchId: user.user?.branchId || null,
      createdBy: user.user?.sub,
      status: 'generating',
      reportData: {
        // totalRecords: departmentCounts.totalCount,
        // departmentCounts: departmentCounts.departmentCounts,
        dateRangeUsed: {
          startDate,
          endDate,
        },
        generationTime: 0,
      },
    };
    // Set custom dates if provided
    if (reportData.customStartDate) {
      reportObj.customStartDate = new Date(reportData.customStartDate);
    }
    if (reportData.customEndDate) {
      reportObj.customEndDate = new Date(reportData.customEndDate);
    }
    // Create and save report
    const report = new ReportModel(reportObj);
    const savedReport = await report.save();
    // Populate the saved report for response
    const populatedReport = await ReportModel.findById(
      savedReport._id
    ).populate('createdBy', 'name email');
    contextLogger.info('Report created successfully', {
      reportId: savedReport._id,
      type: savedReport.type,
      dateRange: savedReport.dateRange,
      departmentCount: reportData.departments.length,
      // totalRecords: departmentCounts.totalCount,
    });

    // TODO: Add report generation to a queue for background processing
    // This would typically involve adding to a job queue like Bull or similar
    return NextResponse.json(
      {
        success: true,
        data: populatedReport,
        message: 'Report generation started successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    contextLogger.error('Unexpected error in createReportHandler', error);
    // Handle validation errors
    if (error instanceof mongoose.Error.ValidationError) {
      const validationErrors = Object.values(error.errors).map(
        (err) => err.message
      );
      return NextResponse.json(
        { error: 'Validation failed', details: validationErrors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create report' },
      { status: 500 }
    );
  }
}

// Export handlers with logging middleware
export const GET = withApiLogger(getReportsHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});

export const POST = withApiLogger(createReportHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});
