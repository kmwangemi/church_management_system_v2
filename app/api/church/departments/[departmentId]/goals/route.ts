// /api/church/departments/[departmentId]/goals/route.ts
import { requireAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { withApiLogger } from '@/lib/middleware/api-logger';
import dbConnect from '@/lib/mongodb';
import { DepartmentModel } from '@/models';
import { GoalStatus } from '@/models/department';
import mongoose from 'mongoose';
import { type NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  params: {
    departmentId: string;
  };
}

// GET /api/church/departments/[departmentId]/goals - List goals
async function getGoalsHandler(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { departmentId } = await params;
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    {
      requestId,
      endpoint: `/api/church/departments/${departmentId}/goals`,
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
    const status = searchParams.get('status');
    const limit = Number.parseInt(searchParams.get('limit') || '50', 10);
    const page = Number.parseInt(searchParams.get('page') || '1', 10);
    const sortBy = searchParams.get('sortBy') || 'createdAt';
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
      .populate('goals.createdBy', 'firstName lastName')
      .populate('goals.assignedTo', 'firstName lastName');
    if (!department) {
      return NextResponse.json(
        { error: 'Department not found' },
        { status: 404 }
      );
    }
    let goals = department.goals;
    // Apply status filter
    if (status && Object.values(GoalStatus).includes(status as GoalStatus)) {
      goals = goals.filter((goal) => goal.status === status);
    }
    // Sort goals
    goals.sort((a, b) => {
      let aValue, bValue;
      switch (sortBy) {
        case 'targetDate':
          aValue = new Date(a.targetDate).getTime();
          bValue = new Date(b.targetDate).getTime();
          break;
        case 'progress':
          aValue = a.progress;
          bValue = b.progress;
          break;
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
      }
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      }
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    });
    // Apply pagination
    const startIndex = (page - 1) * limit;
    const paginatedGoals = goals.slice(startIndex, startIndex + limit);
    // Calculate statistics
    const stats = {
      total: goals.length,
      planned: goals.filter((g) => g.status === GoalStatus.PLANNED).length,
      inProgress: goals.filter((g) => g.status === GoalStatus.IN_PROGRESS)
        .length,
      completed: goals.filter((g) => g.status === GoalStatus.COMPLETED).length,
      cancelled: goals.filter((g) => g.status === GoalStatus.CANCELLED).length,
      averageProgress:
        goals.length > 0
          ? goals.reduce((sum, g) => sum + g.progress, 0) / goals.length
          : 0,
    };
    contextLogger.info('Department goals retrieved successfully', {
      departmentId,
      totalGoals: goals.length,
      filteredGoals: paginatedGoals.length,
      statistics: stats,
    });
    return NextResponse.json({
      success: true,
      data: {
        goals: paginatedGoals,
        statistics: stats,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(goals.length / limit),
          totalGoals: goals.length,
          hasMore: startIndex + limit < goals.length,
        },
      },
    });
  } catch (error: any) {
    contextLogger.error('Unexpected error in getGoalsHandler', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/church/departments/[departmentId]/goals - Add goal
async function addGoalHandler(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { departmentId } = await params;
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    {
      requestId,
      endpoint: `/api/church/departments/${departmentId}/goals`,
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
    // Validate target date is in the future
    const target = new Date(targetDate);
    if (target <= new Date()) {
      return NextResponse.json(
        { error: 'Target date must be in the future' },
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
    // Create new goal
    const newGoal = {
      _id: new mongoose.Types.ObjectId(),
      title,
      description,
      targetDate: target,
      status: GoalStatus.PLANNED,
      priority,
      assignee,
      category,
      success,
      createdBy: user.user.sub,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    department.goals.push(newGoal);
    await department.save();
    // Populate the new goal
    await department.populate([
      { path: 'goals.createdBy', select: 'firstName lastName' },
      { path: 'goals.assignedTo', select: 'firstName lastName' },
    ]);
    const addedGoal = department.goals.at(-1);
    contextLogger.info('Department goal added successfully', {
      departmentId,
      goalId: newGoal._id,
      title,
      targetDate: target.toISOString(),
    });
    return NextResponse.json(
      {
        success: true,
        message: 'Goal added successfully',
        data: addedGoal,
      },
      { status: 201 }
    );
  } catch (error: any) {
    contextLogger.error('Unexpected error in addGoalHandler', error);
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
export const GET = withApiLogger(getGoalsHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});

export const POST = withApiLogger(addGoalHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});
