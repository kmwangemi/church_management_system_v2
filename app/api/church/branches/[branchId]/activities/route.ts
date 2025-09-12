import { requireAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { withApiLogger } from '@/lib/middleware/api-logger';
import dbConnect from '@/lib/mongodb';
import type { AddActivityPayload } from '@/lib/validations/activity';
import { ActivityModel, BranchModel } from '@/models';
import { type NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  params: {
    branchId: string;
  };
}

async function getBranchActivitiesHandler(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { branchId } = await params;
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    { requestId, endpoint: `/api/church/branches/${branchId}/activities` },
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
    const type = searchParams.get('type'); // Filter by activity type
    const status = searchParams.get('status'); // Filter by activity status
    const dateFrom = searchParams.get('dateFrom'); // Filter activities from date
    const dateTo = searchParams.get('dateTo'); // Filter activities to date
    // Build base query for activities
    const query: any = {
      branchId,
      churchId: user.user.churchId, // Extra security check
    };
    // Add filters
    if (type) {
      query.type = type;
    }
    if (status) {
      query.status = status;
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
    // Build response
    const response: any = {
      activities,
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
    if (type) response.typeFilter = type;
    if (status) response.statusFilter = status;
    if (dateFrom) response.dateFromFilter = dateFrom;
    if (dateTo) response.dateToFilter = dateTo;
    contextLogger.info(
      `Retrieved ${activities.length} activities for branch ${branchId}${
        status ? ` with status: ${status}` : ''
      }${type ? ` and type: ${type}` : ''}`
    );
    return NextResponse.json(response);
  } catch (error) {
    contextLogger.error(
      'Unexpected error in getBranchActivitiesHandler',
      error
    );
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function createBranchActivityHandler(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { branchId } = await params;
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    { requestId, endpoint: `/api/church/branches/${branchId}/activities` },
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
    const activityData: AddActivityPayload = await request.json();
    // Ensure the activity is assigned to the correct branch
    const activityWithBranch = {
      ...activityData,
      branchId, // Override with the branchId from the route
    };
    // Optional: Check for duplicate activities (same branch, date, activity name)
    const existingActivity = await ActivityModel.findOne({
      churchId: user.user.churchId,
      branchId,
      date: {
        $gte: new Date(new Date(activityData.date).setHours(0, 0, 0, 0)),
        $lt: new Date(new Date(activityData.date).setHours(23, 59, 59, 999)),
      },
      activity: { $regex: new RegExp(`^${activityData.activity}$`, 'i') },
      status: { $nin: ['cancelled', 'completed'] }, // Only check for active activities
    });
    if (existingActivity) {
      contextLogger.warn('Duplicate activity detected for branch', {
        branchId,
        existingActivityId: existingActivity._id,
        newActivity: activityData.activity,
      });
      // Allow duplicates but log a warning
    }
    const activity = new ActivityModel({
      ...activityWithBranch,
      churchId: user.user.churchId,
    });
    await activity.save();
    // Populate branch info before returning
    await activity.populate('branchId', 'branchName location');
    contextLogger.info('Activity created successfully for branch', {
      branchId,
      activityId: activity._id,
      activity: activityData.activity,
      date: activityData.date,
    });
    return NextResponse.json(activity, { status: 201 });
  } catch (error) {
    contextLogger.error(
      'Unexpected error in createBranchActivityHandler',
      error
    );
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Export the handlers wrapped with logging middleware
export const GET = withApiLogger(getBranchActivitiesHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});

export const POST = withApiLogger(createBranchActivityHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});
