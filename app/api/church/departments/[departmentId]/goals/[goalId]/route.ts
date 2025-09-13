import { connectDB } from '@/lib/mongodb';
import Department, { GoalStatus } from '@/models/Department';
import mongoose from 'mongoose';
import { type NextRequest, NextResponse } from 'next/server';

// /api/church/departments/[id]/goals/[goalId]/route.ts
// PUT /api/church/departments/[id]/goals/[goalId] - Update goal progress
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; goalId: string } }
) {
  try {
    await connectDB();

    const { id, goalId } = params;
    const body = await request.json();

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

    const {
      title,
      description,
      targetDate,
      status,
      progress,
      assignedTo,
      milestones,
    } = body;

    // Validate status if provided
    if (status && !Object.values(GoalStatus).includes(status)) {
      return NextResponse.json(
        { error: 'Invalid goal status' },
        { status: 400 }
      );
    }

    // Validate progress if provided
    if (progress !== undefined && (progress < 0 || progress > 100)) {
      return NextResponse.json(
        { error: 'Progress must be between 0 and 100' },
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

    // Update goal fields
    const goal = department.goals[goalIndex];

    if (title !== undefined) goal.title = title;
    if (description !== undefined) goal.description = description;
    if (targetDate !== undefined) goal.targetDate = new Date(targetDate);
    if (status !== undefined) goal.status = status;
    if (progress !== undefined) {
      goal.progress = progress;
      // Auto-update status based on progress
      if (progress === 100 && goal.status !== GoalStatus.COMPLETED) {
        goal.status = GoalStatus.COMPLETED;
      } else if (progress > 0 && goal.status === GoalStatus.PLANNED) {
        goal.status = GoalStatus.IN_PROGRESS;
      }
    }
    if (assignedTo !== undefined) {
      goal.assignedTo = assignedTo.map(
        (userId: string) => new mongoose.Types.ObjectId(userId)
      );
    }
    if (milestones !== undefined) {
      goal.milestones = milestones.map((milestone: any) => ({
        title: milestone.title,
        description: milestone.description || undefined,
        targetDate: new Date(milestone.targetDate),
        isCompleted: milestone.isCompleted,
        completedDate: milestone.completedDate
          ? new Date(milestone.completedDate)
          : undefined,
      }));
    }

    goal.updatedAt = new Date();

    await department.save();

    // Populate the updated goal
    await department.populate([
      { path: 'goals.createdBy', select: 'firstName lastName' },
      { path: 'goals.assignedTo', select: 'firstName lastName' },
    ]);

    return NextResponse.json({
      success: true,
      message: 'Goal updated successfully',
      data: department.goals[goalIndex],
    });
  } catch (error) {
    console.error('Error updating goal:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
