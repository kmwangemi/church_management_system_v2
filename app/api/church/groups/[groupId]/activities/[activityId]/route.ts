// api/church/groups/[id]/activities/[activityId]/route.ts
import { connectDB } from '@/lib/mongodb';
import Group from '@/models/Group';
import { type NextRequest, NextResponse } from 'next/server';

// GET /api/church/groups/[id]/activities/[activityId] - Get single activity
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; activityId: string } }
) {
  try {
    await connectDB();

    const group = await Group.findById(params.id)
      .populate('activities.organizedBy', 'firstName lastName')
      .populate('activities.plannedParticipants', 'firstName lastName')
      .populate('activities.actualParticipants', 'firstName lastName')
      .populate('activities.attendance.userId', 'firstName lastName');

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    const activity = group.activities.find(
      (activity) => activity._id?.toString() === params.activityId
    );

    if (!activity) {
      return NextResponse.json(
        { error: 'Activity not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(activity);
  } catch (error) {
    console.error('Error fetching group activity:', error);
    return NextResponse.json(
      { error: 'Failed to fetch group activity' },
      { status: 500 }
    );
  }
}

// PUT /api/church/groups/[id]/activities/[activityId] - Update activity
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; activityId: string } }
) {
  try {
    await connectDB();

    const body = await request.json();

    const group = await Group.findById(params.id);
    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    const activityIndex = group.activities.findIndex(
      (activity) => activity._id?.toString() === params.activityId
    );

    if (activityIndex === -1) {
      return NextResponse.json(
        { error: 'Activity not found' },
        { status: 404 }
      );
    }

    // Update activity
    Object.assign(group.activities[activityIndex], body);
    await group.save();

    const updatedGroup = await Group.findById(params.id).populate(
      'activities.organizedBy',
      'firstName lastName'
    );

    return NextResponse.json(updatedGroup.activities[activityIndex]);
  } catch (error) {
    console.error('Error updating group activity:', error);
    return NextResponse.json(
      { error: 'Failed to update group activity' },
      { status: 500 }
    );
  }
}

// DELETE /api/church/groups/[id]/activities/[activityId] - Delete activity
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; activityId: string } }
) {
  try {
    await connectDB();

    const group = await Group.findById(params.id);
    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    const activityIndex = group.activities.findIndex(
      (activity) => activity._id?.toString() === params.activityId
    );

    if (activityIndex === -1) {
      return NextResponse.json(
        { error: 'Activity not found' },
        { status: 404 }
      );
    }

    group.activities.splice(activityIndex, 1);
    await group.save();

    return NextResponse.json({ message: 'Activity deleted successfully' });
  } catch (error) {
    console.error('Error deleting group activity:', error);
    return NextResponse.json(
      { error: 'Failed to delete group activity' },
      { status: 500 }
    );
  }
}
