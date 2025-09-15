import { requireAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { withApiLogger } from '@/lib/middleware/api-logger';
import dbConnect from '@/lib/mongodb';
import { DepartmentModel } from '@/models';
import { MemberRole } from '@/models/department';
import mongoose from 'mongoose';
import { type NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  params: {
    departmentId: string;
    userId: string;
  };
}

// PUT /api/church/departments/[departmentId]/members/[userId] - Update member role/skills
async function updateDepartmentMemberHandler(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { departmentId, userId } = await params;
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    {
      requestId,
      endpoint: `/api/church/departments/${departmentId}/members/${userId}`,
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
        mongoose.Types.ObjectId.isValid(departmentId) &&
        mongoose.Types.ObjectId.isValid(userId)
      )
    ) {
      return NextResponse.json(
        { error: 'Invalid department ID or user ID format' },
        { status: 400 }
      );
    }
    await dbConnect();
    const body = await request.json();
    const { role, skills, isActive, notes } = body;
    // Validate role if provided
    if (role && !Object.values(MemberRole).includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }
    // Check if department exists and belongs to the user's church
    const department = await DepartmentModel.findOne({
      _id: departmentId,
      churchId: user.user.churchId,
    });
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
    const updateFields: string[] = [];
    if (role !== undefined) {
      department.members[memberIndex].role = role;
      updateFields.push('role');
    }
    if (skills !== undefined) {
      department.members[memberIndex].skills = skills;
      updateFields.push('skills');
    }
    if (isActive !== undefined) {
      department.members[memberIndex].isActive = isActive;
      updateFields.push('isActive');
    }
    if (notes !== undefined) {
      department.members[memberIndex].notes = notes;
      updateFields.push('notes');
    }
    await department.save();
    // Populate member details
    await department.populate('members.userId', 'firstName lastName email');
    contextLogger.info('Department member updated successfully', {
      departmentId,
      userId,
      updatedFields: updateFields,
    });
    return NextResponse.json({
      success: true,
      message: 'Member updated successfully',
      data: department.members[memberIndex],
    });
  } catch (error: any) {
    contextLogger.error(
      'Unexpected error in updateDepartmentMemberHandler',
      error
    );
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

// DELETE /api/church/departments/[departmentId]/members/[userId] - Remove member
async function removeDepartmentMemberHandler(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { departmentId, userId } = await params;
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    {
      requestId,
      endpoint: `/api/church/departments/${departmentId}/members/${userId}`,
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
        mongoose.Types.ObjectId.isValid(departmentId) &&
        mongoose.Types.ObjectId.isValid(userId)
      )
    ) {
      return NextResponse.json(
        { error: 'Invalid department ID or user ID format' },
        { status: 400 }
      );
    }
    await dbConnect();
    // Check if department exists and belongs to the user's church
    const department = await DepartmentModel.findOne({
      _id: departmentId,
      churchId: user.user.churchId,
    });
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
    // Store member info for logging before removal
    const removedMember = department.members[memberIndex];
    // Remove member from array
    department.members.splice(memberIndex, 1);
    await department.save();
    contextLogger.info('Department member removed successfully', {
      departmentId,
      userId,
      memberRole: removedMember.role,
    });
    return NextResponse.json({
      success: true,
      message: 'Member removed successfully',
      data: { userId },
    });
  } catch (error) {
    contextLogger.error(
      'Unexpected error in removeDepartmentMemberHandler',
      error
    );
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Export the handlers wrapped with logging middleware
export const PUT = withApiLogger(updateDepartmentMemberHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});

export const DELETE = withApiLogger(removeDepartmentMemberHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});
