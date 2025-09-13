import { connectDB } from '@/lib/mongodb';
import Department, { GoalStatus } from '@/models/Department';
import mongoose from 'mongoose';
import { type NextRequest, NextResponse } from 'next/server';

// PUT /api/church/departments/[id]/goals/[goalId]/milestones/[milestoneIndex] - Update milestone
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; goalId: string } }
) {
  try {
    await connectDB();

    const { id, goalId } = params;
    const body = await request.json();
    const { milestoneIndex, isCompleted } = body;

    // Validate ObjectIds
    if (
      !(
        mongoose.Types.ObjectId.isValid(id) &&
        mongoose.Types.ObjectId.isValid(goalId)
      )
    ) {
      return NextResponse.json(
        { error: 'Invalid department ID or goal ID' },
        { status: 400 }
      );
    }

    if (milestoneIndex === undefined || isCompleted === undefined) {
      return NextResponse.json(
        { error: 'milestoneIndex and isCompleted are required' },
        { status: 400 }
      );
    }

    const department = await Department.findById(id);

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
      const completedMilestones = goal.milestones.filter(
        (m) => m.isCompleted
      ).length;
      goal.progress = Math.round(
        (completedMilestones / goal.milestones.length) * 100
      );

      // Update status based on progress
      if (goal.progress === 100) {
        goal.status = GoalStatus.COMPLETED;
      } else if (goal.progress > 0) {
        goal.status = GoalStatus.IN_PROGRESS;
      }
    }

    goal.updatedAt = new Date();
    await department.save();

    return NextResponse.json({
      success: true,
      message: 'Milestone updated successfully',
      data: {
        milestone: goal.milestones[milestoneIndex],
        goalProgress: goal.progress,
        goalStatus: goal.status,
      },
    });
  } catch (error) {
    console.error('Error updating milestone:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
