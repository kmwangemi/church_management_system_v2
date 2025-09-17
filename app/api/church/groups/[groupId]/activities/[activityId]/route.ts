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
    activityId: string;
  };
}

// GET /api/church/groups/[groupId]/activities/[activityId] - Get single activity
async function getSingleActivityHandler(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { groupId, activityId } = await params;
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    {
      requestId,
      endpoint: `/api/church/groups/${groupId}/activities/${activityId}`,
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
    // Validate MongoDB ObjectId formats
    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return NextResponse.json(
        { error: 'Invalid group ID format' },
        { status: 400 }
      );
    }
    if (!mongoose.Types.ObjectId.isValid(activityId)) {
      return NextResponse.json(
        { error: 'Invalid activity ID format' },
        { status: 400 }
      );
    }
    await dbConnect();
    const group = await GroupModel.findOne({
      _id: groupId,
      churchId: user.user.churchId,
    })
      .populate('activities.organizedBy', 'firstName lastName')
      .populate('activities.plannedParticipants', 'firstName lastName')
      .populate('activities.actualParticipants', 'firstName lastName')
      .populate('activities.attendance.userId', 'firstName lastName');
    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }
    const activity = group.activities.find(
      (activity) => activity._id?.toString() === activityId
    );

    if (!activity) {
      return NextResponse.json(
        { error: 'Activity not found' },
        { status: 404 }
      );
    }
    contextLogger.info('Group activity fetched successfully', {
      groupId,
      activityId,
      activityTitle: activity.title,
    });
    return NextResponse.json({
      success: true,
      activity,
    });
  } catch (error) {
    contextLogger.error('Unexpected error in getSingleActivityHandler', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/church/groups/[groupId]/activities/[activityId] - Update activity
async function updateActivityHandler(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { groupId, activityId } = await params;
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    {
      requestId,
      endpoint: `/api/church/groups/${groupId}/activities/${activityId}`,
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
    // Validate MongoDB ObjectId formats
    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return NextResponse.json(
        { error: 'Invalid group ID format' },
        { status: 400 }
      );
    }
    if (!mongoose.Types.ObjectId.isValid(activityId)) {
      return NextResponse.json(
        { error: 'Invalid activity ID format' },
        { status: 400 }
      );
    }
    await dbConnect();
    const body = await request.json();
    // Check if group exists and belongs to the user's church
    const group = await GroupModel.findOne({
      _id: groupId,
      churchId: user.user.churchId,
    });
    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }
    const activityIndex = group.activities.findIndex(
      (activity) => activity._id?.toString() === activityId
    );
    if (activityIndex === -1) {
      return NextResponse.json(
        { error: 'Activity not found' },
        { status: 404 }
      );
    }
    // Extract allowed update fields
    const {
      title,
      description,
      type,
      date,
      duration,
      location,
      plannedParticipants,
      actualParticipants,
      organizedBy,
      materials,
      notes,
      isCompleted,
    } = body;
    const updateData: any = {};
    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (type !== undefined) updateData.type = type;
    if (date !== undefined) {
      const activityDate = new Date(date);
      if (Number.isNaN(activityDate.getTime())) {
        return NextResponse.json(
          { error: 'Invalid date format' },
          { status: 400 }
        );
      }
      updateData.date = activityDate;
    }
    if (duration !== undefined) updateData.duration = duration;
    if (location !== undefined) updateData.location = location.trim();
    if (plannedParticipants !== undefined)
      updateData.plannedParticipants = plannedParticipants;
    if (actualParticipants !== undefined)
      updateData.actualParticipants = actualParticipants;
    if (organizedBy !== undefined) {
      if (!mongoose.Types.ObjectId.isValid(organizedBy)) {
        return NextResponse.json(
          { error: 'Invalid organizer ID format' },
          { status: 400 }
        );
      }
      updateData.organizedBy = organizedBy;
    }
    if (materials !== undefined) updateData.materials = materials;
    if (notes !== undefined) updateData.notes = notes.trim();
    if (isCompleted !== undefined) updateData.isCompleted = isCompleted;
    // Update activity fields
    Object.assign(group.activities[activityIndex], {
      ...updateData,
      updatedAt: new Date(),
    });
    await group.save();
    const updatedGroup = await GroupModel.findById(groupId)
      .populate('activities.organizedBy', 'firstName lastName')
      .populate('activities.plannedParticipants', 'firstName lastName')
      .populate('activities.actualParticipants', 'firstName lastName');
    const updatedActivity = updatedGroup.activities[activityIndex];
    contextLogger.info('Group activity updated successfully', {
      groupId,
      activityId,
      updatedFields: Object.keys(updateData),
    });
    return NextResponse.json({
      success: true,
      message: 'Activity updated successfully',
      data: updatedActivity,
    });
  } catch (error: any) {
    contextLogger.error('Unexpected error in updateActivityHandler', error);
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

// DELETE /api/church/groups/[groupId]/activities/[activityId] - Delete activity
async function deleteActivityHandler(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { groupId, activityId } = await params;
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    {
      requestId,
      endpoint: `/api/church/groups/${groupId}/activities/${activityId}`,
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
    // Validate MongoDB ObjectId formats
    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return NextResponse.json(
        { error: 'Invalid group ID format' },
        { status: 400 }
      );
    }
    if (!mongoose.Types.ObjectId.isValid(activityId)) {
      return NextResponse.json(
        { error: 'Invalid activity ID format' },
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
    const activityIndex = group.activities.findIndex(
      (activity) => activity._id?.toString() === activityId
    );
    if (activityIndex === -1) {
      return NextResponse.json(
        { error: 'Activity not found' },
        { status: 404 }
      );
    }
    // Store activity details for logging before deletion
    const activityToDelete = group.activities[activityIndex];
    const activityTitle = activityToDelete.title;
    // Get query parameter to determine if it's a soft delete or hard delete
    const { searchParams } = new URL(request.url);
    const forceDelete = searchParams.get('force') === 'true';
    if (forceDelete) {
      // Hard delete - permanently remove the activity
      group.activities.splice(activityIndex, 1);
      await group.save();
      contextLogger.info('Group activity permanently deleted', {
        groupId,
        activityId,
        activityTitle,
      });
      return NextResponse.json({
        success: true,
        message: 'Activity permanently deleted successfully',
      });
    }
    // Check if the activity has a soft delete capability (mark as inactive)
    if (Object.hasOwn(group.activities[activityIndex], 'isActive')) {
      group.activities[activityIndex].isActive = false;
      group.activities[activityIndex].updatedAt = new Date();
      await group.save();
      contextLogger.info('Group activity deactivated (soft delete)', {
        groupId,
        activityId,
        activityTitle,
      });
      return NextResponse.json({
        success: true,
        message: 'Activity deactivated successfully',
        data: { id: activityId },
      });
    }
    // Fallback to hard delete if soft delete is not available
    group.activities.splice(activityIndex, 1);
    await group.save();
    contextLogger.info('Group activity deleted', {
      groupId,
      activityId,
      activityTitle,
    });
    return NextResponse.json({
      success: true,
      message: 'Activity deleted successfully',
      data: { id: activityId },
    });
  } catch (error) {
    contextLogger.error('Unexpected error in deleteActivityHandler', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Export the handlers wrapped with logging middleware
export const GET = withApiLogger(getSingleActivityHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});

export const PUT = withApiLogger(updateActivityHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});

export const DELETE = withApiLogger(deleteActivityHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});
