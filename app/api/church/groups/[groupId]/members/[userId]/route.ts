import { requireAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { withApiLogger } from '@/lib/middleware/api-logger';
import dbConnect from '@/lib/mongodb';
import { GroupModel } from '@/models';
import { GroupMemberRole } from '@/models/group';
import mongoose from 'mongoose';
import { type NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  params: {
    groupId: string;
    userId: string;
  };
}

// GET /api/church/groups/[groupId]/members/[userId] - Get single member details
async function getSingleMemberHandler(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { groupId, userId } = await params;
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    { requestId, endpoint: `/api/church/groups/${groupId}/members/${userId}` },
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
    // Validate MongoDB ObjectId formats
    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return NextResponse.json(
        { error: 'Invalid group ID format' },
        { status: 400 }
      );
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { error: 'Invalid user ID format' },
        { status: 400 }
      );
    }
    await dbConnect();
    // Check if group exists and belongs to the user's church
    const group = await GroupModel.findOne({
      _id: groupId,
      churchId: user.user.churchId,
    }).populate('members.userId', 'firstName lastName email phone avatar');
    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }
    const member = group.members.find(
      (member) => member.userId._id?.toString() === userId
    );
    if (!member) {
      return NextResponse.json(
        { error: 'Member not found in this group' },
        { status: 404 }
      );
    }
    contextLogger.info('Group member details fetched successfully', {
      groupId,
      userId,
      memberRole: member.role,
      isActive: member.isActive,
    });
    return NextResponse.json({
      success: true,
      data: member,
    });
  } catch (error) {
    contextLogger.error('Unexpected error in getSingleMemberHandler', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/church/groups/[groupId]/members/[userId] - Update member role/info
async function updateMemberHandler(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { groupId, userId } = await params;
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    { requestId, endpoint: `/api/church/groups/${groupId}/members/${userId}` },
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
    // Validate MongoDB ObjectId formats
    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return NextResponse.json(
        { error: 'Invalid group ID format' },
        { status: 400 }
      );
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { error: 'Invalid user ID format' },
        { status: 400 }
      );
    }
    await dbConnect();
    const body = await request.json();
    const { role, notes, contactInfo, isActive } = body;
    // Check if group exists and belongs to the user's church
    const group = await GroupModel.findOne({
      _id: groupId,
      churchId: user.user.churchId,
    });
    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }
    const memberIndex = group.members.findIndex(
      (member) => member.userId.toString() === userId
    );
    if (memberIndex === -1) {
      return NextResponse.json(
        { error: 'Member not found in this group' },
        { status: 404 }
      );
    }
    const currentMember = group.members[memberIndex];
    const updateData: any = {};
    // Validate and update role if provided
    if (role !== undefined) {
      if (!Object.values(GroupMemberRole).includes(role)) {
        return NextResponse.json(
          { error: `Invalid member role: ${role}` },
          { status: 400 }
        );
      }
      // Check if trying to assign leader role when another leader exists
      if (
        role === GroupMemberRole.LEADER &&
        currentMember.role !== GroupMemberRole.LEADER
      ) {
        const existingLeader = group.members.find(
          (member) =>
            member.role === GroupMemberRole.LEADER &&
            member.isActive &&
            member.userId.toString() !== userId
        );
        if (existingLeader) {
          return NextResponse.json(
            {
              error: 'Group already has an active leader',
              suggestion:
                'Remove the existing leader first or assign Assistant Leader role',
            },
            { status: 400 }
          );
        }
      }
      updateData.role = role;
    }
    // Validate and update notes if provided
    if (notes !== undefined) {
      if (typeof notes !== 'string') {
        return NextResponse.json(
          { error: 'Notes must be a string' },
          { status: 400 }
        );
      }
      updateData.notes = notes.trim();
    }
    // Validate and update contact info if provided
    if (contactInfo !== undefined) {
      updateData.contactInfo = {
        ...currentMember.contactInfo,
        ...contactInfo,
      };
    }
    // Update active status if provided
    if (isActive !== undefined) {
      if (typeof isActive !== 'boolean') {
        return NextResponse.json(
          { error: 'isActive must be a boolean' },
          { status: 400 }
        );
      }
      updateData.isActive = isActive;
    }
    // Check if there are any changes to make
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid update fields provided' },
        { status: 400 }
      );
    }
    // Apply updates
    Object.assign(group.members[memberIndex], {
      ...updateData,
      updatedAt: new Date(),
    });
    await group.save();
    const updatedGroup = await GroupModel.findById(groupId).populate(
      'members.userId',
      'firstName lastName email phone avatar'
    );
    const updatedMember = updatedGroup.members[memberIndex];
    contextLogger.info('Group member updated successfully', {
      groupId,
      userId,
      updatedFields: Object.keys(updateData),
      newRole: updateData.role,
      newActiveStatus: updateData.isActive,
    });
    return NextResponse.json({
      success: true,
      message: 'Member updated successfully',
      data: updatedMember,
    });
  } catch (error: any) {
    contextLogger.error('Unexpected error in updateMemberHandler', error);
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

// DELETE /api/church/groups/[groupId]/members/[userId] - Remove member from group
async function removeMemberHandler(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { groupId, userId } = await params;
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    { requestId, endpoint: `/api/church/groups/${groupId}/members/${userId}` },
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
    // Validate MongoDB ObjectId formats
    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return NextResponse.json(
        { error: 'Invalid group ID format' },
        { status: 400 }
      );
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { error: 'Invalid user ID format' },
        { status: 400 }
      );
    }
    await dbConnect();
    // Check if group exists and belongs to the user's church
    const group = await GroupModel.findOne({
      _id: groupId,
      churchId: user.user.churchId,
    });
    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }
    const memberIndex = group.members.findIndex(
      (member) => member.userId.toString() === userId
    );
    if (memberIndex === -1) {
      return NextResponse.json(
        { error: 'Member not found in this group' },
        { status: 404 }
      );
    }
    const memberToRemove = group.members[memberIndex];
    const memberRole = memberToRemove.role;
    // Get query parameter to determine if it's a soft delete or hard delete
    const { searchParams } = new URL(request.url);
    const forceDelete = searchParams.get('force') === 'true';
    const reason = searchParams.get('reason')?.trim() || 'No reason provided';
    if (forceDelete) {
      // Hard delete - permanently remove the member
      group.members.splice(memberIndex, 1);
      await group.save();
      contextLogger.info('Group member permanently removed', {
        groupId,
        userId,
        memberRole,
        reason,
        remainingMembers: group.members.length,
      });
      return NextResponse.json({
        success: true,
        message: 'Member permanently removed from group',
        data: {
          userId,
          action: 'permanent_removal',
          reason,
        },
      });
    }
    // Soft delete - set isActive to false (default behavior)
    if (memberToRemove.isActive) {
      memberToRemove.isActive = false;
      memberToRemove.removedAt = new Date();
      memberToRemove.removalReason = reason;
      memberToRemove.updatedAt = new Date();
      await group.save();
      contextLogger.info('Group member deactivated (soft delete)', {
        groupId,
        userId,
        memberRole,
        reason,
        activeMembers: group.members.filter((m) => m.isActive).length,
      });
      return NextResponse.json({
        success: true,
        message: 'Member deactivated successfully',
        data: {
          userId,
          action: 'deactivation',
          reason,
          canReactivate: true,
        },
      });
    }
    // Member is already inactive
    return NextResponse.json({
      success: true,
      message: 'Member is already inactive',
      data: {
        userId,
        action: 'no_change',
        status: 'already_inactive',
      },
    });
  } catch (error) {
    contextLogger.error('Unexpected error in removeMemberHandler', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/church/groups/[groupId]/members/[userId] - Partial update member
async function patchMemberHandler(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { groupId, userId } = await params;
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    { requestId, endpoint: `/api/church/groups/${groupId}/members/${userId}` },
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
    // Validate MongoDB ObjectId formats
    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return NextResponse.json(
        { error: 'Invalid group ID format' },
        { status: 400 }
      );
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { error: 'Invalid user ID format' },
        { status: 400 }
      );
    }
    await dbConnect();
    const body = await request.json();
    const { action, data } = body;
    // Check if group exists and belongs to the user's church
    const group = await GroupModel.findOne({
      _id: groupId,
      churchId: user.user.churchId,
    });
    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }
    const memberIndex = group.members.findIndex(
      (member) => member.userId.toString() === userId
    );
    if (memberIndex === -1) {
      return NextResponse.json(
        { error: 'Member not found in this group' },
        { status: 404 }
      );
    }
    const member = group.members[memberIndex];
    let actionPerformed = '';
    let updatedData = {};
    // Handle specific actions
    switch (action) {
      case 'activate':
        if (member.isActive) {
          return NextResponse.json({
            success: true,
            message: 'Member is already active',
            data: { userId, status: 'already_active' },
          });
        }
        member.isActive = true;
        member.reactivatedAt = new Date();
        actionPerformed = 'Member activated';
        updatedData = { isActive: true };
        break;
      case 'deactivate':
        if (member.isActive) {
          member.isActive = false;
          member.removedAt = new Date();
          member.removalReason = data?.reason || 'Deactivated via PATCH';
          actionPerformed = 'Member deactivated';
          updatedData = { isActive: false };
        } else {
          return NextResponse.json({
            success: true,
            message: 'Member is already inactive',
            data: { userId, status: 'already_inactive' },
          });
        }
        break;
      case 'updateRole':
        if (!data?.newRole) {
          return NextResponse.json(
            { error: 'newRole is required for updateRole action' },
            { status: 400 }
          );
        }
        if (!Object.values(GroupMemberRole).includes(data.newRole)) {
          return NextResponse.json(
            { error: `Invalid role: ${data.newRole}` },
            { status: 400 }
          );
        }
        if (member.role !== data.newRole) {
          member.role = data.newRole;
          actionPerformed = `Role updated to ${data.newRole}`;
          updatedData = { role: data.newRole };
        } else {
          return NextResponse.json({
            success: true,
            message: 'Member already has this role',
            data: { userId, currentRole: member.role },
          });
        }
        break;
      case 'updateNotes': {
        const newNotes = data?.notes?.trim() || '';
        if (member.notes !== newNotes) {
          member.notes = newNotes;
          actionPerformed = 'Notes updated';
          updatedData = { notes: newNotes };
        } else {
          return NextResponse.json({
            success: true,
            message: 'Notes unchanged',
            data: { userId, notes: member.notes },
          });
        }
        break;
      }
      default:
        return NextResponse.json(
          {
            error: `Invalid action: ${action}. Valid actions: activate, deactivate, updateRole, updateNotes`,
          },
          { status: 400 }
        );
    }
    member.updatedAt = new Date();
    await group.save();
    contextLogger.info('Group member patched successfully', {
      groupId,
      userId,
      action,
      actionPerformed,
      updatedData,
    });
    return NextResponse.json({
      success: true,
      message: actionPerformed,
      data: {
        userId,
        action,
        changes: updatedData,
        updatedAt: member.updatedAt,
      },
    });
  } catch (error: any) {
    contextLogger.error('Unexpected error in patchMemberHandler', error);
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

// Export the handlers wrapped with logging middleware
export const GET = withApiLogger(getSingleMemberHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});

export const PUT = withApiLogger(updateMemberHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});

export const DELETE = withApiLogger(removeMemberHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});

export const PATCH = withApiLogger(patchMemberHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});
