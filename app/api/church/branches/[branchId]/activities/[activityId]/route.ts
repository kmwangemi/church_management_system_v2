import { requireAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { withApiLogger } from '@/lib/middleware/api-logger';
import dbConnect from '@/lib/mongodb';
import { ActivityModel, BranchModel } from '@/models';
import mongoose from 'mongoose';
import { type NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  params: {
    branchId: string;
    activityId: string;
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

// GET api/church/branches/[branchId]/activities/[activityId] - Get single activity by ID
async function getBranchActivityByIdHandler(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { branchId, activityId } = await params;
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    {
      requestId,
      endpoint: `/api/church/branches/${branchId}/activities/${activityId}`,
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
    if (!mongoose.Types.ObjectId.isValid(branchId)) {
      return NextResponse.json(
        { error: 'Invalid branch ID format' },
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
    // Verify the branch exists and belongs to the user's church
    const branch = await BranchModel.findOne({
      _id: branchId,
      churchId: user.user.churchId,
    });
    if (!branch) {
      return NextResponse.json(
        { error: 'Branch not found or access denied' },
        { status: 404 }
      );
    }
    // Find activity that belongs to both the specific branch and user's church
    const activity = await ActivityModel.findOne({
      _id: activityId,
      branchId,
      churchId: user.user.churchId,
    }).populate('branchId', 'branchName location');
    if (!activity) {
      return NextResponse.json(
        { error: 'Activity not found in this branch' },
        { status: 404 }
      );
    }
    const response = {
      activity,
      branch: {
        id: branch._id,
        name: branch.branchName,
        description: branch.description,
        // location: branch.location,
      },
    };
    contextLogger.info('Activity retrieved successfully', {
      branchId,
      activityId,
      activityName: activity.activity,
    });
    return NextResponse.json(response);
  } catch (error) {
    contextLogger.error(
      'Unexpected error in getBranchActivityByIdHandler',
      error
    );
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT api/church/branches/[branchId]/activities/[activityId] - Update activity by ID
async function updateBranchActivityHandler(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { branchId, activityId } = await params;
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    {
      requestId,
      endpoint: `/api/church/branches/${branchId}/activities/${activityId}`,
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
    if (!mongoose.Types.ObjectId.isValid(branchId)) {
      return NextResponse.json(
        { error: 'Invalid branch ID format' },
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
    // Verify the branch exists and belongs to the user's church
    const branch = await BranchModel.findOne({
      _id: branchId,
      churchId: user.user.churchId,
    });
    if (!branch) {
      return NextResponse.json(
        { error: 'Branch not found or access denied' },
        { status: 404 }
      );
    }
    const updateData: UpdateActivityPayload = await request.json();
    // Ensure branchId cannot be changed via update (maintain data integrity)
    if (updateData.branchId && updateData.branchId !== branchId) {
      return NextResponse.json(
        { error: 'Cannot change branch ID through this endpoint' },
        { status: 400 }
      );
    }
    // Remove branchId from update data to prevent accidental changes
    const { branchId: _, ...safeUpdateData } = updateData;
    // Check if activity exists and belongs to the specific branch and church
    const existingActivity = await ActivityModel.findOne({
      _id: activityId,
      branchId,
      churchId: user.user.churchId,
    });
    if (!existingActivity) {
      return NextResponse.json(
        { error: 'Activity not found in this branch' },
        { status: 404 }
      );
    }
    // Optional: Check for duplicate activity names on same date if activity name is being updated
    if (
      safeUpdateData.activity &&
      safeUpdateData.activity !== existingActivity.activity
    ) {
      const activityDate = safeUpdateData.date || existingActivity.date;
      const duplicateActivity = await ActivityModel.findOne({
        churchId: user.user.churchId,
        branchId,
        date: {
          $gte: new Date(new Date(activityDate).setHours(0, 0, 0, 0)),
          $lt: new Date(new Date(activityDate).setHours(23, 59, 59, 999)),
        },
        activity: { $regex: new RegExp(`^${safeUpdateData.activity}$`, 'i') },
        _id: { $ne: activityId }, // Exclude current activity
        status: { $nin: ['cancelled', 'completed'] },
      });
      if (duplicateActivity) {
        contextLogger.warn('Duplicate activity name detected during update', {
          branchId,
          duplicateActivityId: duplicateActivity._id,
          activityName: safeUpdateData.activity,
        });
        // Allow duplicates but log warning
      }
    }
    // Update the activity
    const updatedActivity = await ActivityModel.findByIdAndUpdate(
      activityId,
      {
        ...safeUpdateData,
        updatedAt: new Date(),
      },
      {
        new: true,
        runValidators: true,
      }
    ).populate('branchId', 'branchName location');
    const response = {
      activity: updatedActivity,
      branch: {
        id: branch._id,
        name: branch.branchName,
        description: branch.description,
        // location: branch.location,
      },
      message: 'Activity updated successfully',
    };
    contextLogger.info('Activity updated successfully', {
      branchId,
      activityId,
      updatedFields: Object.keys(safeUpdateData),
    });
    return NextResponse.json(response);
  } catch (error) {
    contextLogger.error(
      'Unexpected error in updateBranchActivityHandler',
      error
    );
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE api/church/branches/[branchId]/activities/[activityId] - Delete activity by ID
async function deleteBranchActivityHandler(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { branchId, activityId } = await params;
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    {
      requestId,
      endpoint: `/api/church/branches/${branchId}/activities/${activityId}`,
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
    if (!mongoose.Types.ObjectId.isValid(branchId)) {
      return NextResponse.json(
        { error: 'Invalid branch ID format' },
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
    // Verify the branch exists and belongs to the user's church
    const branch = await BranchModel.findOne({
      _id: branchId,
      churchId: user.user.churchId,
    });
    if (!branch) {
      return NextResponse.json(
        { error: 'Branch not found or access denied' },
        { status: 404 }
      );
    }
    // Check if activity exists and belongs to the specific branch and church
    const existingActivity = await ActivityModel.findOne({
      _id: activityId,
      branchId,
      churchId: user.user.churchId,
    });
    if (!existingActivity) {
      return NextResponse.json(
        { error: 'Activity not found in this branch' },
        { status: 404 }
      );
    }
    // Get query parameters to determine delete behavior
    const { searchParams } = new URL(request.url);
    const forceDelete = searchParams.get('force') === 'true';
    const cancelActivity = searchParams.get('cancel') === 'true';
    if (forceDelete) {
      // Hard delete - permanently remove the activity
      await ActivityModel.findByIdAndDelete(activityId);
      contextLogger.info('Activity permanently deleted', {
        branchId,
        activityId,
        activityName: existingActivity.activity,
      });
      return NextResponse.json({
        message: 'Activity permanently deleted successfully',
        branch: {
          id: branch._id,
          name: branch.branchName,
        },
      });
    }
    if (cancelActivity) {
      // Cancel the activity instead of deleting
      const cancelledActivity = await ActivityModel.findByIdAndUpdate(
        activityId,
        {
          status: 'cancelled',
          updatedAt: new Date(),
        },
        { new: true }
      ).populate('branchId', 'branchName location');
      contextLogger.info('Activity cancelled', {
        branchId,
        activityId,
        activityName: existingActivity.activity,
      });
      return NextResponse.json({
        activity: cancelledActivity,
        branch: {
          id: branch._id,
          name: branch.branchName,
          description: branch.description,
          // location: branch.location,
        },
        message: 'Activity cancelled successfully',
      });
    }
    // Default: Hard delete (since activities don't have isActive field like branches)
    await ActivityModel.findByIdAndDelete(activityId);
    contextLogger.info('Activity deleted', {
      branchId,
      activityId,
      activityName: existingActivity.activity,
    });
    return NextResponse.json({
      message: 'Activity deleted successfully',
      branch: {
        id: branch._id,
        name: branch.branchName,
      },
    });
  } catch (error) {
    contextLogger.error(
      'Unexpected error in deleteBranchActivityHandler',
      error
    );
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Export the handlers wrapped with logging middleware
export const GET = withApiLogger(getBranchActivityByIdHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});

export const PUT = withApiLogger(updateBranchActivityHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});

export const DELETE = withApiLogger(deleteBranchActivityHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});
