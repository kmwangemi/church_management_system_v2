import { requireAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { withApiLogger } from '@/lib/middleware/api-logger';
import dbConnect from '@/lib/mongodb';
import type { AddActivityPayload } from '@/lib/validations/activity';
import { ActivityModel } from '@/models';
import { type NextRequest, NextResponse } from 'next/server';

async function getActivitiesHandler(
  request: NextRequest
): Promise<NextResponse> {
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    { requestId, endpoint: '/api/church/activities' },
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
    const type = searchParams.get('type'); // Filter by activity type
    const status = searchParams.get('status'); // Filter by activity status
    const branchId = searchParams.get('branchId'); // Filter by branch
    const dateFrom = searchParams.get('dateFrom'); // Filter activities from date
    const dateTo = searchParams.get('dateTo'); // Filter activities to date
    // Build base query
    const query: any = { churchId: user.user.churchId };
    // Add filters
    if (type) {
      query.type = type;
    }
    if (status) {
      query.status = status;
    }
    if (branchId) {
      query.branchId = branchId;
    }
    // Date range filter
    if (dateFrom || dateTo) {
      query.date = {};
      if (dateFrom) {
        query.date.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999); // Include the entire end date
        query.date.$lte = endDate;
      }
    }
    // Handle search
    if (search && search.length > 0) {
      query.$text = { $search: search };
    }
    const skip = (page - 1) * limit;
    // Build the find query
    let findQuery = ActivityModel.find(query);
    // Sort by text relevance if searching, otherwise by date (newest first)
    if (search && query.$text) {
      findQuery = findQuery.sort({
        score: { $meta: 'textScore' },
        date: -1,
      });
    } else {
      findQuery = findQuery.sort({ date: -1 });
    }
    const [activities, total] = await Promise.all([
      findQuery
        .populate('branchId', 'branchName location')
        .skip(skip)
        .limit(limit),
      ActivityModel.countDocuments(query),
    ]);
    const response: any = {
      activities,
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
    if (type) response.typeFilter = type;
    if (status) response.statusFilter = status;
    if (branchId) response.branchFilter = branchId;
    if (dateFrom) response.dateFromFilter = dateFrom;
    if (dateTo) response.dateToFilter = dateTo;
    return NextResponse.json(response);
  } catch (error) {
    contextLogger.error('Unexpected error in getActivitiesHandler', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function createActivityHandler(
  request: NextRequest
): Promise<NextResponse> {
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    { requestId, endpoint: '/api/church/activities' },
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
    const activityData: AddActivityPayload = await request.json();
    // Optional: Check for duplicate activities (same branch, date, activity name)
    // This is optional since activities can be similar on the same day
    const existingActivity = await ActivityModel.findOne({
      churchId: user.user.churchId,
      branchId: activityData.branchId,
      date: {
        $gte: new Date(new Date(activityData.date).setHours(0, 0, 0, 0)),
        $lt: new Date(new Date(activityData.date).setHours(23, 59, 59, 999)),
      },
      activity: { $regex: new RegExp(`^${activityData.activity}$`, 'i') },
      status: { $nin: ['cancelled', 'completed'] }, // Only check for active activities
    });
    if (existingActivity) {
      contextLogger.warn('Duplicate activity detected', {
        existingActivityId: existingActivity._id,
        newActivity: activityData.activity,
      });
      // You can choose to allow duplicates or prevent them
      // For now, we'll allow duplicates but log a warning
    }
    const activity = new ActivityModel({
      ...activityData,
      churchId: user.user.churchId,
    });
    await activity.save();
    // Populate branch info before returning
    await activity.populate('branchId', 'branchName location');
    contextLogger.info('Activity created successfully', {
      activityId: activity._id,
      activity: activityData.activity,
      date: activityData.date,
    });
    return NextResponse.json(activity, { status: 201 });
  } catch (error) {
    contextLogger.error('Unexpected error in createActivityHandler', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Export the handlers wrapped with logging middleware
export const GET = withApiLogger(getActivitiesHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});

export const POST = withApiLogger(createActivityHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});
