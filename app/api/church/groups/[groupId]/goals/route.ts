import { requireAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { withApiLogger } from '@/lib/middleware/api-logger';
import dbConnect from '@/lib/mongodb';
import { GroupModel } from '@/models';
import { GroupGoalStatus } from '@/models/group';
import mongoose from 'mongoose';
import { type NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  params: {
    groupId: string;
  };
}

// GET /api/church/groups/[groupId]/goals - List group goals
async function getGroupGoalsHandler(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { groupId } = await params;
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    { requestId, endpoint: `/api/church/groups/${groupId}/goals` },
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
    const status = searchParams.get('status') as GroupGoalStatus;
    const page = Number.parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(
      Number.parseInt(searchParams.get('limit') || '20', 10),
      100
    ); // Cap at 100
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const overdue = searchParams.get('overdue') === 'true';
    // Validate pagination parameters
    if (page < 1 || limit < 1) {
      return NextResponse.json(
        { error: 'Invalid pagination parameters' },
        { status: 400 }
      );
    }
    // Validate status filter
    if (status && !Object.values(GroupGoalStatus).includes(status)) {
      return NextResponse.json(
        { error: `Invalid goal status: ${status}` },
        { status: 400 }
      );
    }
    // Validate sort parameters
    const validSortFields = ['createdAt', 'updatedAt', 'targetDate', 'title'];
    if (!validSortFields.includes(sortBy)) {
      return NextResponse.json(
        { error: `Invalid sort field: ${sortBy}` },
        { status: 400 }
      );
    }
    if (!['asc', 'desc'].includes(sortOrder)) {
      return NextResponse.json(
        { error: `Invalid sort order: ${sortOrder}` },
        { status: 400 }
      );
    }
    // Check if group exists and belongs to the user's church
    const group = await GroupModel.findOne({
      _id: groupId,
      churchId: user.user.churchId,
    })
      .populate('goals.createdBy', 'firstName lastName')
      .populate('goals.assignee', 'firstName lastName');
    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }
    let goals = [...group.goals];
    // Apply filters
    if (status) {
      goals = goals.filter((goal) => goal.status === status);
    }
    if (overdue) {
      const now = new Date();
      goals = goals.filter(
        (goal) =>
          goal.targetDate < now &&
          goal.status !== GroupGoalStatus.COMPLETED &&
          goal.status !== GroupGoalStatus.CANCELLED
      );
    }
    // Apply sorting
    goals.sort((a, b) => {
      let aValue, bValue;
      switch (sortBy) {
        case 'createdAt':
        case 'updatedAt':
        case 'targetDate':
          aValue = new Date(a[sortBy]).getTime();
          bValue = new Date(b[sortBy]).getTime();
          break;
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'progress':
          aValue = a.progress || 0;
          bValue = b.progress || 0;
          break;
        default:
          aValue = a.createdAt;
          bValue = b.createdAt;
      }
      if (sortOrder === 'desc') {
        return bValue > aValue ? 1 : bValue < aValue ? -1 : 0;
      }
      return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
    });
    // Apply pagination
    const skip = (page - 1) * limit;
    const paginatedGoals = goals.slice(skip, skip + limit);
    // Calculate summary statistics
    const summary = {
      total: goals.length,
      planned: goals.filter((g) => g.status === GroupGoalStatus.PLANNED).length,
      inProgress: goals.filter((g) => g.status === GroupGoalStatus.IN_PROGRESS)
        .length,
      completed: goals.filter((g) => g.status === GroupGoalStatus.COMPLETED)
        .length,
      cancelled: goals.filter((g) => g.status === GroupGoalStatus.CANCELLED)
        .length,
      overdue: goals.filter((g) => {
        const now = new Date();
        return (
          g.targetDate < now &&
          g.status !== GroupGoalStatus.COMPLETED &&
          g.status !== GroupGoalStatus.CANCELLED
        );
      }).length,
      averageProgress:
        goals.length > 0
          ? Math.round(
              goals.reduce((sum, g) => sum + (g.progress || 0), 0) /
                goals.length
            )
          : 0,
    };
    contextLogger.info('Group goals fetched successfully', {
      groupId,
      totalGoals: goals.length,
      returnedGoals: paginatedGoals.length,
      filters: { status, overdue, sortBy, sortOrder },
      summary,
    });
    return NextResponse.json({
      success: true,
      data: {
        goals: paginatedGoals,
        summary,
        pagination: {
          page,
          limit,
          total: goals.length,
          pages: Math.ceil(goals.length / limit),
        },
      },
    });
  } catch (error) {
    contextLogger.error('Unexpected error in getGroupGoalsHandler', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/church/groups/[groupId]/goals - Create new goal
async function createGroupGoalHandler(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { groupId } = await params;
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    { requestId, endpoint: `/api/church/groups/${groupId}/goals` },
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
      priority,
      targetDate,
      category,
      assignee,
      success,
    } = body;
    // Validate required fields
    if (!(title && description && targetDate && category && priority)) {
      return NextResponse.json(
        {
          error:
            'title, description, category, priority and targetDate are required',
        },
        { status: 400 }
      );
    }
    // Validate field formats and values
    if (typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json(
        { error: 'Title must be a non-empty string' },
        { status: 400 }
      );
    }
    if (typeof description !== 'string' || description.trim().length === 0) {
      return NextResponse.json(
        { error: 'Description must be a non-empty string' },
        { status: 400 }
      );
    }
    // Validate target date is in the future
    const target = new Date(targetDate);
    if (target <= new Date()) {
      return NextResponse.json(
        { error: 'Target date must be in the future' },
        { status: 400 }
      );
    }
    // Validate priority
    const validPriorities = ['low', 'medium', 'high'];
    if (!validPriorities.includes(priority)) {
      return NextResponse.json(
        {
          error: `Invalid priority. Must be one of: ${validPriorities.join(', ')}`,
        },
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
    const newGoal = {
      _id: new mongoose.Types.ObjectId(),
      title,
      description,
      targetDate: target,
      status: GroupGoalStatus.PLANNED,
      priority,
      assignee,
      category,
      success,
      createdBy: user.user.sub,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    group.goals.push(newGoal);
    await group.save();
    // Populate the new goal
    await group.populate([
      { path: 'goals.createdBy', select: 'firstName lastName' },
      { path: 'goals.assignee', select: 'firstName lastName' },
    ]);
    const addedGoal = group.goals.at(-1);
    contextLogger.info('Group goal created successfully', {
      groupId,
      goalId: newGoal._id,
      title,
      targetDate: target.toISOString(),
    });
    return NextResponse.json(
      {
        success: true,
        message: 'Goal created successfully',
        data: addedGoal,
      },
      { status: 201 }
    );
  } catch (error: any) {
    contextLogger.error('Unexpected error in createGroupGoalHandler', error);
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
export const GET = withApiLogger(getGroupGoalsHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});

export const POST = withApiLogger(createGroupGoalHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});
