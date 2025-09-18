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
    goalId: string;
  };
}

// PUT /api/church/departments/[id]/goals/[goalId] - Update department goal progress
async function updateDepartmentGoalHandler(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { departmentId, goalId } = await params;
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    {
      requestId,
      endpoint: `/api/church/departments/${departmentId}/goals/${goalId}`,
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
    // Validate MongoDB ObjectId formats
    if (!mongoose.Types.ObjectId.isValid(departmentId)) {
      return NextResponse.json(
        { error: 'Invalid department ID format' },
        { status: 400 }
      );
    }
    if (!mongoose.Types.ObjectId.isValid(goalId)) {
      return NextResponse.json(
        { error: 'Invalid goal ID format' },
        { status: 400 }
      );
    }
    await dbConnect();
    const body = await request.json();
    const {
      title,
      description,
      targetDate,
      status,
      progress,
      assignee,
      priority,
      category,
      success,
    } = body;
    // Validate request body
    if (!body || Object.keys(body).length === 0) {
      return NextResponse.json(
        { error: 'Request body cannot be empty' },
        { status: 400 }
      );
    }
    // Validate status if provided
    if (status && !Object.values(GoalStatus).includes(status)) {
      return NextResponse.json(
        {
          error: `Invalid goal status. Must be one of: ${Object.values(GoalStatus).join(', ')}`,
        },
        { status: 400 }
      );
    }
    // Validate progress if provided
    if (
      progress !== undefined &&
      (typeof progress !== 'number' || progress < 0 || progress > 100)
    ) {
      return NextResponse.json(
        { error: 'Progress must be a number between 0 and 100' },
        { status: 400 }
      );
    }
    // Validate priority if provided
    if (priority && !['low', 'medium', 'high'].includes(priority)) {
      return NextResponse.json(
        {
          error:
            'Invalid priority. Must be one of: low, medium, high, critical',
        },
        { status: 400 }
      );
    }
    // Validate target date if provided
    if (targetDate) {
      const parsedDate = new Date(targetDate);
      if (Number.isNaN(parsedDate.getTime())) {
        return NextResponse.json(
          { error: 'Invalid target date format' },
          { status: 400 }
        );
      }
      // Check if target date is in the past (only for new goals or when moving date backwards)
      const now = new Date();
      if (parsedDate < now) {
        contextLogger.warn('Target date is in the past', {
          departmentId,
          goalId,
          targetDate: parsedDate.toISOString(),
        });
      }
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
    // Find the goal
    const goalIndex = department.goals.findIndex(
      (goal) => goal._id?.toString() === goalId
    );
    if (goalIndex === -1) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }
    const goal = department.goals[goalIndex];
    const originalStatus = goal.status;
    const originalProgress = goal.progress || 0;
    // Track what fields are being updated
    const updatedFields: string[] = [];
    // Update goal fields
    if (title !== undefined && title !== goal.title) {
      if (typeof title !== 'string' || title.trim().length === 0) {
        return NextResponse.json(
          { error: 'Title must be a non-empty string' },
          { status: 400 }
        );
      }
      goal.title = title.trim();
      updatedFields.push('title');
    }
    if (description !== undefined && description !== goal.description) {
      goal.description =
        typeof description === 'string' ? description.trim() : description;
      updatedFields.push('description');
    }
    if (targetDate !== undefined) {
      const parsedTargetDate = new Date(targetDate);
      if (parsedTargetDate.getTime() !== goal.targetDate?.getTime()) {
        goal.targetDate = parsedTargetDate;
        updatedFields.push('targetDate');
      }
    }
    if (status !== undefined && status !== goal.status) {
      goal.status = status;
      updatedFields.push('status');
    }
    if (progress !== undefined && progress !== goal.progress) {
      goal.progress = progress;
      updatedFields.push('progress');
      // Auto-update status based on progress
      if (progress === 100 && goal.status !== GoalStatus.COMPLETED) {
        goal.status = GoalStatus.COMPLETED;
        goal.completedAt = new Date();
        updatedFields.push('status (auto-updated)');
      } else if (progress > 0 && goal.status === GoalStatus.PLANNED) {
        goal.status = GoalStatus.IN_PROGRESS;
        updatedFields.push('status (auto-updated)');
      } else if (progress === 0 && goal.status === GoalStatus.IN_PROGRESS) {
        goal.status = GoalStatus.PLANNED;
        updatedFields.push('status (auto-updated)');
      }
    }
    if (priority !== undefined && priority !== goal.priority) {
      goal.priority = priority;
      updatedFields.push('priority');
    }
    if (category !== undefined && category !== goal.category) {
      goal.category = category;
      updatedFields.push('category');
    }
    if (success !== undefined && success !== goal.success) {
      goal.success = success;
      updatedFields.push('success');
    }
    if (assignee !== undefined && assignee !== goal.assignee) {
      goal.assignee = assignee;
      updatedFields.push('assignee');
    }
    // Check if any changes were made
    if (updatedFields.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No changes detected',
        data: goal,
      });
    }
    // Update metadata
    goal.updatedAt = new Date();
    goal.updatedBy = user.user.sub;
    // Save the department
    await department.save();
    // Populate the updated goal for response
    await department.populate([
      { path: 'goals.createdBy', select: 'firstName lastName email' },
      { path: 'goals.assignee', select: 'firstName lastName email' },
      { path: 'goals.updatedBy', select: 'firstName lastName email' },
    ]);
    const updatedGoal = department.goals[goalIndex];
    contextLogger.info('Department goal updated successfully', {
      departmentId,
      goalId,
      updatedFields,
      statusChange:
        originalStatus !== goal.status
          ? `${originalStatus} -> ${goal.status}`
          : null,
      progressChange:
        originalProgress !== goal.progress
          ? `${originalProgress}% -> ${goal.progress}%`
          : null,
    });
    return NextResponse.json({
      success: true,
      message: 'Goal updated successfully',
      data: {
        ...updatedGoal.toObject(),
      },
      changes: {
        updatedFields,
        statusChanged: originalStatus !== goal.status,
        progressChanged: originalProgress !== goal.progress,
      },
    });
  } catch (error: any) {
    contextLogger.error(
      'Unexpected error in updateDepartmentGoalHandler',
      error
    );
    if (error.name === 'CastError') {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.message },
        { status: 400 }
      );
    }
    if (error.code === 11_000) {
      return NextResponse.json(
        { error: 'Duplicate field value' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/church/departments/[departmentId]/goals/[goalId] - Remove department goal
async function removeDepartmentGoalHandler(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { departmentId, goalId } = await params;
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    {
      requestId,
      endpoint: `/api/church/departments/${departmentId}/goals/${goalId}`,
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
    // Validate MongoDB ObjectId format
    if (
      !(
        mongoose.Types.ObjectId.isValid(departmentId) &&
        mongoose.Types.ObjectId.isValid(goalId)
      )
    ) {
      return NextResponse.json(
        { error: 'Invalid department ID or goal ID' },
        { status: 400 }
      );
    }
    await dbConnect();
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
    // Find and remove the goal
    const goalIndex = department.goals.findIndex(
      (goal: any) => goal._id?.toString() === goalId
    );
    if (goalIndex === -1) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }
    // Store goal info for logging before removal
    const removedGoal = department.goals[goalIndex];
    // Remove goal from array
    department.goals.splice(goalIndex, 1);
    await department.save();
    contextLogger.info('Department goal removed successfully', {
      departmentId,
      goalId,
      goalTitle: removedGoal.title,
      goalStatus: removedGoal.status,
    });
    return NextResponse.json({
      success: true,
      message: 'Goal removed successfully',
      data: { goalId },
    });
  } catch (error: any) {
    contextLogger.error(
      'Unexpected error in removeDepartmentGoalHandler',
      error
    );
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Export the handlers wrapped with logging middleware
export const PUT = withApiLogger(updateDepartmentGoalHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});

export const DELETE = withApiLogger(removeDepartmentGoalHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});
