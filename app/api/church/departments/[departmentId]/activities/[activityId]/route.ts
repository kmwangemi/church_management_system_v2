import { connectDB } from '@/lib/mongodb';
import Department, { ActivityType } from '@/models/Department';
import mongoose from 'mongoose';
import { type NextRequest, NextResponse } from 'next/server';

// /api/church/departments/[id]/activities/[activityId]/route.ts
// PUT /api/church/departments/[id]/activities/[activityId] - Update activity
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; activityId: string } }
) {
  try {
    await connectDB();

    const { id, activityId } = params;
    const body = await request.json();

    // Validate ObjectIds
    if (
      !(
        mongoose.Types.ObjectId.isValid(id) &&
        mongoose.Types.ObjectId.isValid(activityId)
      )
    ) {
      return NextResponse.json(
        { error: 'Invalid department ID or activity ID' },
        { status: 400 }
      );
    }

    const {
      title,
      description,
      type,
      date,
      duration,
      location,
      participants,
      notes,
      isCompleted,
    } = body;

    // Validate activity type if provided
    if (type && !Object.values(ActivityType).includes(type)) {
      return NextResponse.json(
        { error: 'Invalid activity type' },
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

    // Find the activity
    const activityIndex = department.activities.findIndex(
      (activity) => activity._id?.toString() === activityId
    );

    if (activityIndex === -1) {
      return NextResponse.json(
        { error: 'Activity not found' },
        { status: 404 }
      );
    }

    // Update activity fields
    const activity = department.activities[activityIndex];

    if (title !== undefined) activity.title = title;
    if (description !== undefined) activity.description = description;
    if (type !== undefined) activity.type = type;
    if (date !== undefined) activity.date = new Date(date);
    if (duration !== undefined) activity.duration = duration;
    if (location !== undefined) activity.location = location;
    if (participants !== undefined) {
      activity.participants = participants.map(
        (p: string) => new mongoose.Types.ObjectId(p)
      );
    }
    if (notes !== undefined) activity.notes = notes;
    if (isCompleted !== undefined) activity.isCompleted = isCompleted;

    await department.save();

    // Populate the updated activity
    await department.populate([
      { path: 'activities.organizedBy', select: 'firstName lastName' },
      { path: 'activities.participants', select: 'firstName lastName' },
    ]);

    return NextResponse.json({
      success: true,
      message: 'Activity updated successfully',
      data: department.activities[activityIndex],
    });
  } catch (error) {
    console.error('Error updating activity:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
