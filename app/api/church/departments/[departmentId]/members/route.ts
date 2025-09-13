// /api/church/departments/[id]/members/route.ts
import { connectDB } from '@/lib/mongodb';
import Department, { MemberRole } from '@/models/Department';
import mongoose from 'mongoose';
import { type NextRequest, NextResponse } from 'next/server';

// POST /api/church/departments/[id]/members - Add member to department
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const { id } = params;
    const body = await request.json();

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid department ID' },
        { status: 400 }
      );
    }

    const { userId, role, skills, notes } = body;

    // Validate required fields
    if (!(userId && role)) {
      return NextResponse.json(
        { error: 'userId and role are required' },
        { status: 400 }
      );
    }

    // Validate role
    if (!Object.values(MemberRole).includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    const department = await Department.findById(id);

    if (!department) {
      return NextResponse.json(
        { error: 'Department not found' },
        { status: 404 }
      );
    }

    // Check if user is already a member
    const existingMember = department.members.find(
      (member) => member.userId.toString() === userId
    );

    if (existingMember) {
      return NextResponse.json(
        { error: 'User is already a member of this department' },
        { status: 409 }
      );
    }

    // Add new member
    const newMember = {
      userId: new mongoose.Types.ObjectId(userId),
      role,
      skills: skills || [],
      joinedDate: new Date(),
      isActive: true,
      notes: notes || undefined,
    };

    department.members.push(newMember);
    await department.save();

    // Populate the new member details
    await department.populate('members.userId', 'firstName lastName email');

    return NextResponse.json(
      {
        success: true,
        message: 'Member added successfully',
        data: department.members[department.members.length - 1],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error adding member:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
