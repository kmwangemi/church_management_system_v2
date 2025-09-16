// /api/church/departments/[departmentId]/activities/route.ts
import { requireAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { withApiLogger } from '@/lib/middleware/api-logger';
import dbConnect from '@/lib/mongodb';
import { DepartmentModel } from '@/models';
import { ActivityType } from '@/models/department';
import mongoose from 'mongoose';
import { type NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  params: {
    departmentId: string;
  };
}

// GET /api/church/departments/[departmentId]/activities - List activities
async function getActivitiesHandler(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { departmentId } = await params;
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    {
      requestId,
      endpoint: `/api/church/departments/${departmentId}/activities`,
    },
    'api'
  );
  try {
    // Check authentication and authorization
    const authResult = await requireAuth(['superadmin', 'admin', 'member'])(
      request
    );
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
    // Query parameters for filtering
    const type = searchParams.get('type');
    const status = searchParams.get('status'); // 'completed' or 'upcoming'
    const limit = Number.parseInt(searchParams.get('limit') || '50', 10);
    const page = Number.parseInt(searchParams.get('page') || '1', 10);
    const sortBy = searchParams.get('sortBy') || 'date';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(departmentId)) {
      return NextResponse.json(
        { error: 'Invalid department ID' },
        { status: 400 }
      );
    }
    // Check if department exists and belongs to the user's church
    const department = await DepartmentModel.findOne({
      _id: departmentId,
      churchId: user.user.churchId,
    })
      .populate('activities.organizedBy', 'firstName lastName')
      .populate('activities.participants', 'firstName lastName');
    if (!department) {
      return NextResponse.json(
        { error: 'Department not found' },
        { status: 404 }
      );
    }
    let activities = department.activities;
    // Apply filters
    if (type && Object.values(ActivityType).includes(type as ActivityType)) {
      activities = activities.filter((activity) => activity.type === type);
    }
    if (status === 'completed') {
      activities = activities.filter((activity) => activity.isCompleted);
    } else if (status === 'upcoming') {
      activities = activities.filter((activity) => !activity.isCompleted);
    }
    // Sort activities
    activities.sort((a, b) => {
      let aValue, bValue;
      switch (sortBy) {
        case 'date':
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
          break;
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'type':
          aValue = a.type;
          bValue = b.type;
          break;
        default:
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
      }
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      }
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    });
    // Apply pagination
    const startIndex = (page - 1) * limit;
    const paginatedActivities = activities.slice(
      startIndex,
      startIndex + limit
    );
    contextLogger.info('Department activities retrieved successfully', {
      departmentId,
      totalActivities: activities.length,
      filteredActivities: paginatedActivities.length,
    });
    return NextResponse.json({
      success: true,
      data: {
        activities: paginatedActivities,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(activities.length / limit),
          totalActivities: activities.length,
          hasMore: startIndex + limit < activities.length,
        },
      },
    });
  } catch (error: any) {
    contextLogger.error('Unexpected error in getActivitiesHandler', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/church/departments/[departmentId]/activities - Add activity
async function addActivityHandler(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { departmentId } = await params;
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    {
      requestId,
      endpoint: `/api/church/departments/${departmentId}/activities`,
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
    const body = await request.json();
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(departmentId)) {
      return NextResponse.json(
        { error: 'Invalid department ID' },
        { status: 400 }
      );
    }
    const {
      title,
      description,
      type,
      date,
      startTime,
      endTime,
      location,
      participants,
      notes,
    } = body;
    // Validate required fields
    if (
      !(
        title &&
        description &&
        type &&
        date &&
        startTime &&
        endTime &&
        location
      )
    ) {
      return NextResponse.json(
        {
          error:
            'title, description, type, date, startTime, endTime and location are required',
        },
        { status: 400 }
      );
    }
    // Validate activity type
    if (!Object.values(ActivityType).includes(type)) {
      return NextResponse.json(
        { error: 'Invalid activity type' },
        { status: 400 }
      );
    }
    // Check if department exists and belongs to the user's church
    const department = await DepartmentModel.findOne({
      _id: departmentId,
      churchId: user.user.churchId,
    });
    if (!department) {
      return NextResponse.json(
        { error: 'Department not found' },
        { status: 404 }
      );
    }
    // Create new activity
    const newActivity = {
      _id: new mongoose.Types.ObjectId(),
      title,
      description,
      type,
      date: new Date(date),
      startTime: startTime || undefined,
      endTime: endTime || undefined,
      location: location || undefined,
      participants: participants
        ? participants.map((p: string) => new mongoose.Types.ObjectId(p))
        : [],
      notes: notes || undefined,
      isCompleted: false,
      createdAt: new Date(),
    };
    department.activities.push(newActivity);
    await department.save();
    // Populate the new activity
    await department.populate([
      { path: 'activities.participants', select: 'firstName lastName' },
    ]);
    const addedActivity = department.activities.at(-1);
    contextLogger.info('Department activity added successfully', {
      departmentId,
      activityId: newActivity._id,
      title,
      type,
    });
    return NextResponse.json(
      {
        success: true,
        message: 'Activity added successfully',
        data: addedActivity,
      },
      { status: 201 }
    );
  } catch (error: any) {
    contextLogger.error('Unexpected error in addActivityHandler', error);
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.message },
        { status: 400 }
      );
    }
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

export const POST = withApiLogger(addActivityHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});
