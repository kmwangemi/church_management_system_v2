import { requireAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { withApiLogger } from '@/lib/middleware/api-logger';
import dbConnect from '@/lib/mongodb';
import { GroupModel } from '@/models';
import mongoose from 'mongoose';
import { type NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  params: {
    groupId: string;
  };
}

// GET /api/church/groups/[groupId] - Get single group
async function getGroupByIdHandler(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { groupId } = await params;
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    { requestId, endpoint: `/api/church/groups/${groupId}` },
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
    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return NextResponse.json(
        { error: 'Invalid group ID format' },
        { status: 400 }
      );
    }
    await dbConnect();
    const group = await GroupModel.findOne({
      _id: groupId,
      churchId: user.user.churchId,
    })
      .populate('leaderId', 'firstName lastName email phoneNumber');
    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, group });
  } catch (error) {
    contextLogger.error('Unexpected error in getGroupByIdHandler', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/church/groups/[groupId] - Update group
async function updateGroupHandler(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { groupId } = await params;
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    { requestId, endpoint: `/api/church/groups/${groupId}` },
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
    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return NextResponse.json(
        { error: 'Invalid group ID format' },
        { status: 400 }
      );
    }
    await dbConnect();
    const body = await request.json();
    // Check if group exists and belongs to the user's church
    const existingGroup = await GroupModel.findOne({
      _id: groupId,
      churchId: user.user.churchId,
    });
    if (!existingGroup) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }
    // Extract allowed update fields
    const {
      groupName,
      description,
      meetingDay,
      meetingTime,
      leaderId,
      branchId,
      isActive,
      totalBudget,
    } = body;
    const updateData: any = {};
    if (groupName !== undefined) updateData.groupName = groupName;
    if (description !== undefined) updateData.description = description;
    if (meetingDay !== undefined) updateData.meetingDay = meetingDay;
    if (meetingTime !== undefined) updateData.meetingTime = meetingTime;
    if (leaderId !== undefined) updateData.leaderId = leaderId;
    if (branchId !== undefined) updateData.branchId = branchId;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (totalBudget !== undefined) updateData.totalBudget = totalBudget;
    // Check for duplicate group name if groupName is being updated
    if (
      updateData.groupName &&
      updateData.groupName !== existingGroup.groupName
    ) {
      const duplicateGroup = await GroupModel.findOne({
        groupName: updateData.groupName,
        churchId: user.user.churchId,
        _id: { $ne: groupId }, // Exclude current group from search
      });
      if (duplicateGroup) {
        return NextResponse.json(
          { error: 'Group name already exists in this church' },
          { status: 400 }
        );
      }
    }
    const updatedGroup = await GroupModel.findByIdAndUpdate(
      groupId,
      {
        ...updateData,
        updatedAt: new Date(),
      },
      { new: true, runValidators: true }
    )
      .populate('churchId', 'name')
      .populate('leaderId', 'firstName lastName email')
      .populate('branchId', 'name');
    contextLogger.info('Group updated successfully', {
      groupId,
      updatedFields: Object.keys(updateData),
    });
    return NextResponse.json({
      success: true,
      message: 'Group updated successfully',
      data: updatedGroup,
    });
  } catch (error: any) {
    contextLogger.error('Unexpected error in updateGroupHandler', error);
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

// DELETE /api/church/groups/[groupId] - Delete group
async function deleteGroupHandler(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { groupId } = await params;
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    { requestId, endpoint: `/api/church/groups/${groupId}` },
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
    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return NextResponse.json(
        { error: 'Invalid group ID format' },
        { status: 400 }
      );
    }
    await dbConnect();
    // Check if group exists and belongs to the user's church
    const existingGroup = await GroupModel.findOne({
      _id: groupId,
      churchId: user.user.churchId,
    });
    if (!existingGroup) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }
    // Get query parameter to determine if it's a soft delete or hard delete
    const { searchParams } = new URL(request.url);
    const forceDelete = searchParams.get('force') === 'true';
    if (forceDelete) {
      // Hard delete - permanently remove the group
      await GroupModel.findByIdAndDelete(groupId);
      contextLogger.info('Group permanently deleted', { groupId });
      return NextResponse.json({
        message: 'Group permanently deleted successfully',
      });
    }
    // Check if the group model has a softDelete method
    if (typeof existingGroup.softDelete === 'function') {
      // Soft delete - mark as inactive
      const deactivatedGroup = await existingGroup.softDelete();
      contextLogger.info('Group deactivated (soft delete)', { groupId });
      return NextResponse.json({
        success: true,
        message: 'Group deactivated successfully',
        data: { id: deactivatedGroup._id },
      });
    }
    // Fallback to hard delete if soft delete is not available
    const deletedGroup = await GroupModel.findByIdAndDelete(groupId);
    contextLogger.info('Group deleted', { groupId });
    return NextResponse.json({
      success: true,
      message: 'Group deleted successfully',
      data: { id: deletedGroup._id },
    });
  } catch (error) {
    contextLogger.error('Unexpected error in deleteGroupHandler', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Export the handlers wrapped with logging middleware
export const GET = withApiLogger(getGroupByIdHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});

export const PUT = withApiLogger(updateGroupHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});

export const DELETE = withApiLogger(deleteGroupHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});
