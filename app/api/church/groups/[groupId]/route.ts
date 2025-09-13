// api/church/groups/index.ts
import { connectDB } from '@/lib/mongodb';
import Group from '@/models/Group';
import { type NextRequest, NextResponse } from 'next/server';

// GET /api/church/groups/[id] - Get single group details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const group = await Group.findById(params.id)
      .populate('leaderId', 'firstName lastName email phone')
      .populate('members.userId', 'firstName lastName email phone')
      .populate('activities.organizedBy', 'firstName lastName')
      .populate('activities.plannedParticipants', 'firstName lastName')
      .populate('activities.actualParticipants', 'firstName lastName')
      .populate('goals.createdBy', 'firstName lastName')
      .populate('goals.assignedTo', 'firstName lastName');

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    return NextResponse.json(group);
  } catch (error) {
    console.error('Error fetching group:', error);
    return NextResponse.json(
      { error: 'Failed to fetch group' },
      { status: 500 }
    );
  }
}

// PUT /api/church/groups/[id] - Update group information
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const body = await request.json();
    const updateData = { ...body };
    delete updateData._id;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    const updatedGroup = await Group.findByIdAndUpdate(params.id, updateData, {
      new: true,
      runValidators: true,
    }).populate('leaderId', 'firstName lastName email');

    if (!updatedGroup) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    return NextResponse.json(updatedGroup);
  } catch (error) {
    console.error('Error updating group:', error);
    return NextResponse.json(
      { error: 'Failed to update group' },
      { status: 500 }
    );
  }
}

// DELETE /api/church/groups/[id] - Delete group (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const updatedGroup = await Group.findByIdAndUpdate(
      params.id,
      { isActive: false },
      { new: true }
    );

    if (!updatedGroup) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Group deactivated successfully' });
  } catch (error) {
    console.error('Error deleting group:', error);
    return NextResponse.json(
      { error: 'Failed to delete group' },
      { status: 500 }
    );
  }
}
