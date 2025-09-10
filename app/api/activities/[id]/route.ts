import { requireAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { withApiLogger } from '@/lib/middleware/api-logger';
import dbConnect from '@/lib/mongodb';
import { ActivityModel } from '@/models';
import mongoose from 'mongoose';
import { type NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  params: {
    id: string;
  };
}

interface UpdateActivityPayload {
  branchId?: string;
  date?: Date;
  activity?: string;
  participants?: number;
  type?:
    | 'service'
    | 'meeting'
    | 'event'
    | 'program'
    | 'ministry'
    | 'social'
    | 'outreach';
  status?: 'planned' | 'ongoing' | 'completed' | 'cancelled' | 'postponed';
  startTime?: string;
  endTime?: string;
  location?: string;
  facilitator?: string;
  budget?: number;
  description?: string;
}

// GET /api/activities/[id] - Get single activity by ID
async function getActivityByIdHandler(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { id } = await params;
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    { requestId, endpoint: `/api/activities/${id}` },
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
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid activity ID format' },
        { status: 400 }
      );
    }
    await dbConnect();
    const activity = await ActivityModel.findOne({
      _id: id,
      churchId: user.user.churchId,
    }).populate('branchId', 'branchName location');
    if (!activity) {
      return NextResponse.json(
        { error: 'Activity not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ activity });
  } catch (error) {
    contextLogger.error('Unexpected error in getActivityByIdHandler', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/activities/[id] - Update activity by ID
async function updateActivityHandler(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { id } = await params;
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    { requestId, endpoint: `/api/activities/${id}` },
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
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid activity ID format' },
        { status: 400 }
      );
    }
    await dbConnect();
    const updateData: UpdateActivityPayload = await request.json();
    // Check if activity exists and belongs to the user's church
    const existingActivity = await ActivityModel.findOne({
      _id: id,
      churchId: user.user.churchId,
    });
    if (!existingActivity) {
      return NextResponse.json(
        { error: 'Activity not found' },
        { status: 404 }
      );
    }
    // Optional: Check for duplicate activity names on same date if activity name is being updated
    if (
      updateData.activity &&
      updateData.activity !== existingActivity.activity
    ) {
      const activityDate = updateData.date || existingActivity.date;
      const duplicateActivity = await ActivityModel.findOne({
        churchId: user.user.churchId,
        branchId: updateData.branchId || existingActivity.branchId,
        date: {
          $gte: new Date(new Date(activityDate).setHours(0, 0, 0, 0)),
          $lt: new Date(new Date(activityDate).setHours(23, 59, 59, 999)),
        },
        activity: { $regex: new RegExp(`^${updateData.activity}$`, 'i') },
        _id: { $ne: id }, // Exclude current activity
        status: { $nin: ['cancelled', 'completed'] },
      });
      if (duplicateActivity) {
        contextLogger.warn('Duplicate activity name detected during update', {
          duplicateActivityId: duplicateActivity._id,
          activityName: updateData.activity,
        });
        // Allow duplicates but log warning
      }
    }
    // Update the activity
    const updatedActivity = await ActivityModel.findByIdAndUpdate(
      id,
      {
        ...updateData,
        updatedAt: new Date(),
      },
      {
        new: true,
        runValidators: true,
      }
    ).populate('branchId', 'branchName location');
    contextLogger.info('Activity updated successfully', {
      activityId: id,
      updatedFields: Object.keys(updateData),
    });
    return NextResponse.json({
      activity: updatedActivity,
      message: 'Activity updated successfully',
    });
  } catch (error) {
    contextLogger.error('Unexpected error in updateActivityHandler', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/activities/[id] - Delete activity by ID
async function deleteActivityHandler(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { id } = await params;
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    { requestId, endpoint: `/api/activities/${id}` },
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
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid activity ID format' },
        { status: 400 }
      );
    }
    await dbConnect();
    // Check if activity exists and belongs to the user's church
    const existingActivity = await ActivityModel.findOne({
      _id: id,
      churchId: user.user.churchId,
    });
    if (!existingActivity) {
      return NextResponse.json(
        { error: 'Activity not found' },
        { status: 404 }
      );
    }
    // Get query parameter to determine if it's a hard delete or status change
    const { searchParams } = new URL(request.url);
    const forceDelete = searchParams.get('force') === 'true';
    const cancelActivity = searchParams.get('cancel') === 'true';
    if (forceDelete) {
      // Hard delete - permanently remove the activity
      await ActivityModel.findByIdAndDelete(id);
      contextLogger.info('Activity permanently deleted', { activityId: id });
      return NextResponse.json({
        message: 'Activity permanently deleted successfully',
      });
    }
    if (cancelActivity) {
      // Cancel the activity instead of deleting
      const cancelledActivity = await ActivityModel.findByIdAndUpdate(
        id,
        {
          status: 'cancelled',
          updatedAt: new Date(),
        },
        { new: true }
      ).populate('branchId', 'branchName location');
      contextLogger.info('Activity cancelled', { activityId: id });
      return NextResponse.json({
        activity: cancelledActivity,
        message: 'Activity cancelled successfully',
      });
    }
    // Default: Hard delete (since activities don't have isActive field like branches)
    await ActivityModel.findByIdAndDelete(id);
    contextLogger.info('Activity deleted', { activityId: id });
    return NextResponse.json({
      message: 'Activity deleted successfully',
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
export const GET = withApiLogger(getActivityByIdHandler, {
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
