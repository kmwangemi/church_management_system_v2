// /api/church/groups/[groupId]/goals/[goalId]/milestones/route.ts
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
    goalId: string;
  };
}

// PATCH /api/church/groups/[groupId]/goals/[goalId]/milestones - Update milestone
async function updateMilestoneHandler(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { groupId, goalId } = await params;
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    {
      requestId,
      endpoint: `/api/church/groups/${groupId}/goals/${goalId}/milestones`,
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
        mongoose.Types.ObjectId.isValid(groupId) &&
        mongoose.Types.ObjectId.isValid(goalId)
      )
    ) {
      return NextResponse.json(
        { error: 'Invalid group ID or goal ID' },
        { status: 400 }
      );
    }
    await dbConnect();
    const body = await request.json();
    const { milestoneIndex, isCompleted } = body;
    if (milestoneIndex === undefined || isCompleted === undefined) {
      return NextResponse.json(
        { error: 'milestoneIndex and isCompleted are required' },
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
    // Find the goal
    interface Goal {
      _id: mongoose.Types.ObjectId;
      milestones: Milestone[];
      progress: number;
      status: GroupGoalStatus;
      updatedAt: Date;
    }
    interface Milestone {
      isCompleted: boolean;
      completedDate?: Date;
    }
    const goalIndex: number = group.goals.findIndex(
      (goal: Goal) => goal._id?.toString() === goalId
    );
    if (goalIndex === -1) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }
    const goal = group.goals[goalIndex];
    if (!goal.milestones || milestoneIndex >= goal.milestones.length) {
      return NextResponse.json(
        { error: 'Milestone not found' },
        { status: 404 }
      );
    }
    // Update milestone
    goal.milestones[milestoneIndex].isCompleted = isCompleted;
    if (isCompleted) {
      goal.milestones[milestoneIndex].completedDate = new Date();
    } else {
      goal.milestones[milestoneIndex].completedDate = undefined;
    }
    // Auto-calculate progress based on completed milestones
    if (goal.milestones.length > 0) {
      const completedMilestones: number = goal.milestones.filter(
        (m: Milestone) => m.isCompleted
      ).length;
      goal.progress = Math.round(
        (completedMilestones / goal.milestones.length) * 100
      );
      // Update status based on progress
      if (goal.progress === 100) {
        goal.status = GroupGoalStatus.COMPLETED;
      } else if (goal.progress > 0) {
        goal.status = GroupGoalStatus.IN_PROGRESS;
      }
    }
    goal.updatedAt = new Date();
    await group.save();
    contextLogger.info('Goal milestone updated successfully', {
      groupId,
      goalId,
      milestoneIndex,
      isCompleted,
      goalProgress: goal.progress,
      goalStatus: goal.status,
    });
    return NextResponse.json({
      success: true,
      message: 'Milestone updated successfully',
      data: {
        milestone: goal.milestones[milestoneIndex],
        goalProgress: goal.progress,
        goalStatus: goal.status,
      },
    });
  } catch (error: any) {
    contextLogger.error('Unexpected error in updateMilestoneHandler', error);
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

// Export the handler wrapped with logging middleware
export const PATCH = withApiLogger(updateMilestoneHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});
