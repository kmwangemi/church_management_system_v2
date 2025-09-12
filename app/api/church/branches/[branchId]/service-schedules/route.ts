import { requireAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { withApiLogger } from '@/lib/middleware/api-logger';
import dbConnect from '@/lib/mongodb';
import type { AddServiceSchedulePayload } from '@/lib/validations/service-schedule';
import { BranchModel, ServiceScheduleModel } from '@/models';
import { type NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  params: {
    branchId: string;
  };
}

async function getBranchServiceSchedulesHandler(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { branchId } = await params;
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    {
      requestId,
      endpoint: `/api/church/branches/${branchId}/service-schedules`,
    },
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
    if (!branchId) {
      return NextResponse.json(
        { error: 'Branch ID is required' },
        { status: 400 }
      );
    }
    // Verify the branch exists and belongs to the user's church
    const branch = await BranchModel.findOne({
      _id: branchId,
      churchId: user.user.churchId,
    });
    if (!branch) {
      return NextResponse.json(
        { error: 'Branch not found or access denied' },
        { status: 404 }
      );
    }
    // Get pagination and search parameters from query string
    const { searchParams } = new URL(request.url);
    const page = Number.parseInt(searchParams.get('page') || '1', 10);
    const limit = Number.parseInt(searchParams.get('limit') || '10', 10);
    const search = searchParams.get('search') || '';
    const day = searchParams.get('day'); // Filter by specific day
    const type = searchParams.get('type'); // Filter by service type
    const status = searchParams.get('status'); // 'active', 'inactive', or undefined for all
    // Build base query for service schedules
    const query: any = {
      branchId,
      churchId: user.user.churchId, // Extra security check
    };
    // Add filters
    if (day) {
      query.day = day;
    }
    if (type) {
      query.type = type;
    }
    if (status === 'active') {
      query.isActive = true;
    } else if (status === 'inactive') {
      query.isActive = false;
    } else if (status && status !== 'all') {
      return NextResponse.json(
        { error: 'Invalid status. Must be "active", "inactive", or "all"' },
        { status: 400 }
      );
    }
    // Handle search
    if (search && search.length > 0) {
      query.$text = { $search: search };
    }
    const skip = (page - 1) * limit;
    // Build the find query
    let findQuery = ServiceScheduleModel.find(query);
    // Sort by text relevance if searching, otherwise by day and time
    if (search && query.$text) {
      findQuery = findQuery.sort({
        score: { $meta: 'textScore' },
        day: 1,
        time: 1,
      });
    } else {
      // Sort by day and then by time
      findQuery = findQuery.sort({ day: 1, time: 1 });
    }
    const [schedules, total] = await Promise.all([
      findQuery
        .populate('branchId', 'branchName location')
        .skip(skip)
        .limit(limit),
      ServiceScheduleModel.countDocuments(query),
    ]);
    // Build response
    const response: any = {
      schedules,
      branch: {
        id: branch._id,
        name: branch.branchName,
        description: branch.description,
        // location: branch.location,
      },
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
    // Add search metadata if search was performed
    if (search) {
      response.searchTerm = search;
      response.searchResults = total;
    }
    // Add filter metadata
    if (day) response.dayFilter = day;
    if (type) response.typeFilter = type;
    if (status) response.statusFilter = status;
    contextLogger.info(
      `Retrieved ${schedules.length} service schedules for branch ${branchId}${
        status ? ` with status: ${status}` : ''
      }${day ? ` for day: ${day}` : ''}${type ? ` of type: ${type}` : ''}`
    );
    return NextResponse.json(response);
  } catch (error) {
    contextLogger.error(
      'Unexpected error in getBranchServiceSchedulesHandler',
      error
    );
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function createBranchServiceScheduleHandler(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { branchId } = await params;
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    {
      requestId,
      endpoint: `/api/church/branches/${branchId}/service-schedules`,
    },
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
    if (!branchId) {
      return NextResponse.json(
        { error: 'Branch ID is required' },
        { status: 400 }
      );
    }
    // Verify the branch exists and belongs to the user's church
    const branch = await BranchModel.findOne({
      _id: branchId,
      churchId: user.user.churchId,
    });
    if (!branch) {
      return NextResponse.json(
        { error: 'Branch not found or access denied' },
        { status: 404 }
      );
    }
    const scheduleData: AddServiceSchedulePayload = await request.json();
    // Ensure the service schedule is assigned to the correct branch
    const scheduleWithBranch = {
      ...scheduleData,
      branchId, // Override with the branchId from the route
    };
    // Check for duplicate service schedule (same branch, day, time)
    const existingSchedule = await ServiceScheduleModel.findOne({
      churchId: user.user.churchId,
      branchId,
      day: scheduleData.day,
      time: scheduleData.time,
      isActive: true,
    });
    if (existingSchedule) {
      contextLogger.warn('Duplicate service schedule detected for branch', {
        branchId,
        existingScheduleId: existingSchedule._id,
        day: scheduleData.day,
        time: scheduleData.time,
      });
      return NextResponse.json(
        {
          error:
            'A service is already scheduled for this branch, day, and time',
          existingSchedule: {
            id: existingSchedule._id,
            service: existingSchedule.service,
            day: existingSchedule.day,
            time: existingSchedule.time,
          },
        },
        { status: 409 } // 409 Conflict is more appropriate for duplicates
      );
    }
    const serviceSchedule = new ServiceScheduleModel({
      ...scheduleWithBranch,
      churchId: user.user.churchId,
    });
    await serviceSchedule.save();
    // Populate branch info before returning
    await serviceSchedule.populate('branchId', 'branchName location');
    contextLogger.info('Service schedule created successfully for branch', {
      branchId,
      scheduleId: serviceSchedule._id,
      service: scheduleData.service,
      day: scheduleData.day,
      time: scheduleData.time,
    });
    return NextResponse.json(serviceSchedule, { status: 201 });
  } catch (error) {
    contextLogger.error(
      'Unexpected error in createBranchServiceScheduleHandler',
      error
    );
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Export the handlers wrapped with logging middleware
export const GET = withApiLogger(getBranchServiceSchedulesHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});

export const POST = withApiLogger(createBranchServiceScheduleHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});
