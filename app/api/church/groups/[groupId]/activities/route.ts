import { requireAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { withApiLogger } from '@/lib/middleware/api-logger';
import dbConnect from '@/lib/mongodb';
import { GroupModel } from '@/models';
import type { GroupActivityType } from '@/models/group';
import mongoose from 'mongoose';
import { type NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  params: {
    groupId: string;
  };
}

// GET /api/church/groups/[groupId]/activities - List group activities
async function getGroupActivitiesHandler(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { groupId } = await params;
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    { requestId, endpoint: `/api/church/groups/${groupId}/activities` },
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
    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return NextResponse.json(
        { error: 'Invalid group ID format' },
        { status: 400 }
      );
    }
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const page = Number.parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(
      Number.parseInt(searchParams.get('limit') || '10', 10),
      100
    ); // Cap at 100
    const type = searchParams.get('type') as GroupActivityType;
    const upcoming = searchParams.get('upcoming') === 'true';
    const completed = searchParams.get('completed');
    // Validate pagination parameters
    if (page < 1 || limit < 1) {
      return NextResponse.json(
        { error: 'Invalid pagination parameters' },
        { status: 400 }
      );
    }
    const group = await GroupModel.findOne({
      _id: groupId,
      churchId: user.user.churchId,
    })
      .populate('activities.organizedBy', 'firstName lastName')
      .populate('activities.plannedParticipants', 'firstName lastName')
      .populate('activities.actualParticipants', 'firstName lastName');
    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }
    let activities = [...group.activities];
    // Apply filters
    if (type) {
      activities = activities.filter((activity) => activity.type === type);
    }
    if (upcoming) {
      const now = new Date();
      activities = activities.filter(
        (activity) => activity.date > now && !activity.isCompleted
      );
    }
    if (completed !== null && completed !== undefined) {
      activities = activities.filter(
        (activity) => activity.isCompleted === (completed === 'true')
      );
    }
    // Sort by date (most recent first)
    activities.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    // Pagination
    const skip = (page - 1) * limit;
    const paginatedActivities = activities.slice(skip, skip + limit);
    contextLogger.info('Group activities fetched successfully', {
      groupId,
      totalActivities: activities.length,
      returnedActivities: paginatedActivities.length,
      filters: { type, upcoming, completed },
    });
    return NextResponse.json({
      success: true,
      activities: paginatedActivities,
      pagination: {
        page,
        limit,
        total: activities.length,
        pages: Math.ceil(activities.length / limit),
      },
    });
  } catch (error) {
    contextLogger.error('Unexpected error in getGroupActivitiesHandler', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/church/groups/[groupId]/activities - Create new activity
async function createGroupActivityHandler(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { groupId } = await params;
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    { requestId, endpoint: `/api/church/groups/${groupId}/activities` },
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
    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return NextResponse.json(
        { error: 'Invalid group ID format' },
        { status: 400 }
      );
    }
    await dbConnect();
    const body = await request.json();
    const {
      title,
      description,
      type,
      date,
      duration,
      location,
      plannedParticipants = [],
      organizedBy,
      materials = [],
      notes,
    } = body;
    // Validate required fields
    if (!(title && description && type && date && organizedBy)) {
      return NextResponse.json(
        {
          error: 'Missing required fields',
          required: ['title', 'description', 'type', 'date', 'organizedBy'],
        },
        { status: 400 }
      );
    }
    // Validate date format
    const activityDate = new Date(date);
    if (Number.isNaN(activityDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400 }
      );
    }
    // Validate organizedBy is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(organizedBy)) {
      return NextResponse.json(
        { error: 'Invalid organizer ID format' },
        { status: 400 }
      );
    }
    // Check if group exists and belongs to the user's church
    const group = await GroupModel.findOne({
      _id: groupId,
      churchId: user.user.churchId,
    });
    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }
    const newActivity = {
      _id: new mongoose.Types.ObjectId(),
      title: title.trim(),
      description: description.trim(),
      type,
      date: activityDate,
      duration,
      location: location?.trim() || '',
      plannedParticipants,
      actualParticipants: [],
      organizedBy,
      materials,
      notes: notes?.trim() || '',
      attendance: [],
      isCompleted: false,
      createdAt: new Date(),
    };
    group.activities.push(newActivity);
    await group.save();
    const updatedGroup = await GroupModel.findById(groupId)
      .populate('activities.organizedBy', 'firstName lastName')
      .populate('activities.plannedParticipants', 'firstName lastName');
    const createdActivity = updatedGroup.activities.find(
      (activity) => activity._id?.toString() === newActivity._id.toString()
    );
    contextLogger.info('Group activity created successfully', {
      groupId,
      activityId: newActivity._id,
      activityTitle: title,
      activityType: type,
    });
    return NextResponse.json(
      {
        success: true,
        message: 'Activity created successfully',
        data: createdActivity,
      },
      { status: 201 }
    );
  } catch (error: any) {
    contextLogger.error(
      'Unexpected error in createGroupActivityHandler',
      error
    );
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
export const GET = withApiLogger(getGroupActivitiesHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});

export const POST = withApiLogger(createGroupActivityHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});
