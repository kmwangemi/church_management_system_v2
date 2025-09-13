// api/church/groups/[id]/members/[userId]/route.ts
import { connectDB } from '@/lib/mongodb';
import Group from '@/models/Group';
import { type NextRequest, NextResponse } from 'next/server';

// PUT /api/church/groups/[id]/members/[userId] - Update member role/info
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; userId: string } }
) {
  try {
    await connectDB();

    const body = await request.json();

    const group = await Group.findById(params.id);
    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    const memberIndex = group.members.findIndex(
      (member) => member.userId.toString() === params.userId
    );

    if (memberIndex === -1) {
      return NextResponse.json(
        { error: 'Member not found in this group' },
        { status: 404 }
      );
    }

    // Update member information
    Object.assign(group.members[memberIndex], body);
    await group.save();

    const updatedGroup = await Group.findById(params.id).populate(
      'members.userId',
      'firstName lastName email'
    );

    return NextResponse.json(updatedGroup.members[memberIndex]);
  } catch (error) {
    console.error('Error updating group member:', error);
    return NextResponse.json(
      { error: 'Failed to update group member' },
      { status: 500 }
    );
  }
}

// DELETE /api/church/groups/[id]/members/[userId] - Remove member from group
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; userId: string } }
) {
  try {
    await connectDB();

    const group = await Group.findById(params.id);
    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    const memberIndex = group.members.findIndex(
      (member) => member.userId.toString() === params.userId
    );

    if (memberIndex === -1) {
      return NextResponse.json(
        { error: 'Member not found in this group' },
        { status: 404 }
      );
    }

    // Soft delete - set isActive to false
    group.members[memberIndex].isActive = false;
    await group.save();

    return NextResponse.json({ message: 'Member removed successfully' });
  } catch (error) {
    console.error('Error removing group member:', error);
    return NextResponse.json(
      { error: 'Failed to remove group member' },
      { status: 500 }
    );
  }
}
