import { requireAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { withApiLogger } from '@/lib/middleware/api-logger';
import dbConnect from '@/lib/mongodb';
import type { AddServiceSchedulePayload } from '@/lib/validations/service-schedule';
import { ServiceScheduleModel } from '@/models';
import { type NextRequest, NextResponse } from 'next/server';

async function getServiceSchedulesHandler(
  request: NextRequest
): Promise<NextResponse> {
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    { requestId, endpoint: '/api/service-schedules' },
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
    const { searchParams } = new URL(request.url);
    const page = Number.parseInt(searchParams.get('page') || '1', 10);
    const limit = Number.parseInt(searchParams.get('limit') || '10', 10);
    const search = searchParams.get('search') || '';
    const day = searchParams.get('day'); // Filter by specific day
    const type = searchParams.get('type'); // Filter by service type
    const branchId = searchParams.get('branchId'); // Filter by branch
    const status = searchParams.get('status'); // 'active', 'inactive', or undefined for all
    // Build base query
    const query: any = { churchId: user.user.churchId };
    // Add filters
    if (day) {
      query.day = day;
    }
    if (type) {
      query.type = type;
    }
    if (branchId) {
      query.branchId = branchId;
    }
    if (status === 'active') {
      query.isActive = true;
    } else if (status === 'inactive') {
      query.isActive = false;
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
    const response: any = {
      schedules,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
    // Add metadata
    if (search) {
      response.searchTerm = search;
      response.searchResults = total;
    }
    if (day) response.dayFilter = day;
    if (type) response.typeFilter = type;
    if (branchId) response.branchFilter = branchId;
    if (status) response.statusFilter = status;
    return NextResponse.json(response);
  } catch (error) {
    contextLogger.error(
      'Unexpected error in getServiceSchedulesHandler',
      error
    );
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function createServiceScheduleHandler(
  request: NextRequest
): Promise<NextResponse> {
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    { requestId, endpoint: '/api/service-schedules' },
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
    const scheduleData: AddServiceSchedulePayload = await request.json();
    // Check for duplicate service schedule (same branch, day, time)
    const existingSchedule = await ServiceScheduleModel.findOne({
      churchId: user.user.churchId,
      branchId: scheduleData.branchId,
      day: scheduleData.day,
      time: scheduleData.time,
      isActive: true,
    });
    if (existingSchedule) {
      return NextResponse.json(
        {
          error:
            'A service is already scheduled for this branch, day, and time',
        },
        { status: 400 }
      );
    }
    const serviceSchedule = new ServiceScheduleModel({
      ...scheduleData,
      churchId: user.user.churchId,
    });
    await serviceSchedule.save();
    // Populate branch info before returning
    await serviceSchedule.populate('branchId', 'branchName location');
    contextLogger.info('Service schedule created successfully', {
      scheduleId: serviceSchedule._id,
      service: scheduleData.service,
    });
    return NextResponse.json(serviceSchedule, { status: 201 });
  } catch (error) {
    contextLogger.error(
      'Unexpected error in createServiceScheduleHandler',
      error
    );
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Export the handlers wrapped with logging middleware
export const GET = withApiLogger(getServiceSchedulesHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});

export const POST = withApiLogger(createServiceScheduleHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});
