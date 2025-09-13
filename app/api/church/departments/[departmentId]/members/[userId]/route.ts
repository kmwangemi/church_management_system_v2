import { connectDB } from '@/lib/mongodb';
import Department, { MemberRole } from '@/models/Department';
import mongoose from 'mongoose';
import { type NextRequest, NextResponse } from 'next/server';

// /api/church/departments/[id]/members/[userId]/route.ts
// PUT /api/church/departments/[id]/members/[userId] - Update member role/skills
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; userId: string } }
) {
  try {
    await connectDB();

    const { id, userId } = params;
    const body = await request.json();

    // Validate ObjectIds
    if (
      !(
        mongoose.Types.ObjectId.isValid(id) &&
        mongoose.Types.ObjectId.isValid(userId)
      )
    ) {
      return NextResponse.json(
        { error: 'Invalid department ID or user ID' },
        { status: 400 }
      );
    }

    const { role, skills, isActive, notes } = body;

    // Validate role if provided
    if (role && !Object.values(MemberRole).includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    const department = await Department.findById(id);

    if (!department) {
      return NextResponse.json(
        { error: 'Department not found' },
        { status: 404 }
      );
    }

    // Find the member
    const memberIndex = department.members.findIndex(
      (member) => member.userId.toString() === userId
    );

    if (memberIndex === -1) {
      return NextResponse.json(
        { error: 'Member not found in this department' },
        { status: 404 }
      );
    }

    // Update member fields
    if (role !== undefined) department.members[memberIndex].role = role;
    if (skills !== undefined) department.members[memberIndex].skills = skills;
    if (isActive !== undefined)
      department.members[memberIndex].isActive = isActive;
    if (notes !== undefined) department.members[memberIndex].notes = notes;

    await department.save();

    // Populate member details
    await department.populate('members.userId', 'firstName lastName email');

    return NextResponse.json({
      success: true,
      message: 'Member updated successfully',
      data: department.members[memberIndex],
    });
  } catch (error) {
    console.error('Error updating member:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/church/departments/[id]/members/[userId] - Remove member
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; userId: string } }
) {
  try {
    await connectDB();

    const { id, userId } = params;

    // Validate ObjectIds
    if (
      !(
        mongoose.Types.ObjectId.isValid(id) &&
        mongoose.Types.ObjectId.isValid(userId)
      )
    ) {
      return NextResponse.json(
        { error: 'Invalid department ID or user ID' },
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

    // Find and remove the member
    const memberIndex = department.members.findIndex(
      (member) => member.userId.toString() === userId
    );

    if (memberIndex === -1) {
      return NextResponse.json(
        { error: 'Member not found in this department' },
        { status: 404 }
      );
    }

    // Remove member from array
    department.members.splice(memberIndex, 1);
    await department.save();

    return NextResponse.json({
      success: true,
      message: 'Member removed successfully',
      data: { userId },
    });
  } catch (error) {
    console.error('Error removing member:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
