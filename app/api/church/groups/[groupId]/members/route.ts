// api/church/groups/[id]/members/route.ts
import { connectDB } from '@/lib/mongodb';
import Group, { GroupMemberRole } from '@/models/Group';
import { type NextRequest, NextResponse } from 'next/server';

// GET /api/church/groups/[id]/members - List all group members
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('isActive');
    const role = searchParams.get('role') as GroupMemberRole;

    const group = await Group.findById(params.id).populate(
      'members.userId',
      'firstName lastName email phone avatar'
    );

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    let members = group.members;

    if (isActive !== null && isActive !== undefined) {
      members = members.filter(
        (member) => member.isActive === (isActive === 'true')
      );
    }

    if (role) {
      members = members.filter((member) => member.role === role);
    }

    return NextResponse.json({ members });
  } catch (error) {
    console.error('Error fetching group members:', error);
    return NextResponse.json(
      { error: 'Failed to fetch group members' },
      { status: 500 }
    );
  }
}

// POST /api/church/groups/[id]/members - Add member to group
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const body = await request.json();
    const { userId, role = GroupMemberRole.MEMBER, notes, contactInfo } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const group = await Group.findById(params.id);
    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    // Check if user is already a member
    const existingMember = group.members.find(
      (member) => member.userId.toString() === userId
    );

    if (existingMember) {
      return NextResponse.json(
        { error: 'User is already a member of this group' },
        { status: 409 }
      );
    }

    // Check capacity
    if (group.isAtCapacity()) {
      return NextResponse.json(
        { error: 'Group is at full capacity' },
        { status: 400 }
      );
    }

    const newMember = {
      userId,
      role,
      joinedDate: new Date(),
      isActive: true,
      notes,
      contactInfo,
    };

    group.members.push(newMember);
    await group.save();

    const updatedGroup = await Group.findById(params.id).populate(
      'members.userId',
      'firstName lastName email'
    );

    return NextResponse.json(updatedGroup.members.slice(-1)[0], {
      status: 201,
    });
  } catch (error) {
    console.error('Error adding group member:', error);
    return NextResponse.json(
      { error: 'Failed to add group member' },
      { status: 500 }
    );
  }
}
