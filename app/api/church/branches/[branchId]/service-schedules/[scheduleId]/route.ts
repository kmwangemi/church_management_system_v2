import { requireAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { withApiLogger } from '@/lib/middleware/api-logger';
import dbConnect from '@/lib/mongodb';
import { BranchModel, ServiceScheduleModel } from '@/models';
import mongoose from 'mongoose';
import { type NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  params: {
    branchId: string;
    scheduleId: string;
  };
}

interface UpdateServiceSchedulePayload {
  branchId?: string;
  day?:
    | 'Sunday'
    | 'Monday'
    | 'Tuesday'
    | 'Wednesday'
    | 'Thursday'
    | 'Friday'
    | 'Saturday';
  time?: string;
  service?: string;
  attendance?: number;
  type?:
    | 'worship'
    | 'prayer'
    | 'bible_study'
    | 'youth'
    | 'children'
    | 'special'
    | 'fellowship';
  duration?: number;
  facilitator?: string;
  location?: string;
  recurring?: boolean;
  isActive?: boolean;
  startDate?: Date;
  endDate?: Date;
  notes?: string;
}

// GET api/church/branches/[branchId]/service-schedules/[scheduleId] - Get single service schedule by ID
async function getBranchServiceScheduleByIdHandler(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { branchId, scheduleId } = await params;
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    {
      requestId,
      endpoint: `/api/church/branches/${branchId}/service-schedules/${scheduleId}`,
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
    if (!mongoose.Types.ObjectId.isValid(scheduleId)) {
      return NextResponse.json(
        { error: 'Invalid service schedule ID format' },
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
    // Find service schedule that belongs to both the specific branch and user's church
    const schedule = await ServiceScheduleModel.findOne({
      _id: scheduleId,
      branchId,
      churchId: user.user.churchId,
    }).populate('branchId', 'branchName location');
    if (!schedule) {
      return NextResponse.json(
        { error: 'Service schedule not found in this branch' },
        { status: 404 }
      );
    }
    const response = {
      schedule,
      branch: {
        id: branch._id,
        name: branch.branchName,
        description: branch.description,
        // location: branch.location,
      },
    };
    contextLogger.info('Service schedule retrieved successfully', {
      branchId,
      scheduleId,
      service: schedule.service,
      day: schedule.day,
      time: schedule.time,
    });
    return NextResponse.json(response);
  } catch (error) {
    contextLogger.error(
      'Unexpected error in getBranchServiceScheduleByIdHandler',
      error
    );
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT api/church/branches/[branchId]/service-schedules/[scheduleId] - Update service schedule by ID
async function updateBranchServiceScheduleHandler(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { branchId, scheduleId } = await params;
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    {
      requestId,
      endpoint: `/api/church/branches/${branchId}/service-schedules/${scheduleId}`,
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
    if (!mongoose.Types.ObjectId.isValid(scheduleId)) {
      return NextResponse.json(
        { error: 'Invalid service schedule ID format' },
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
    const updateData: UpdateServiceSchedulePayload = await request.json();
    // Ensure branchId cannot be changed via update (maintain data integrity)
    if (updateData.branchId && updateData.branchId !== branchId) {
      return NextResponse.json(
        { error: 'Cannot change branch ID through this endpoint' },
        { status: 400 }
      );
    }
    // Remove branchId from update data to prevent accidental changes
    const { branchId: _, ...safeUpdateData } = updateData;
    // Check if schedule exists and belongs to the specific branch and church
    const existingSchedule = await ServiceScheduleModel.findOne({
      _id: scheduleId,
      branchId,
      churchId: user.user.churchId,
    });
    if (!existingSchedule) {
      return NextResponse.json(
        { error: 'Service schedule not found in this branch' },
        { status: 404 }
      );
    }
    // Check for scheduling conflicts if day or time is being updated
    if (safeUpdateData.day || safeUpdateData.time) {
      const conflictQuery: any = {
        churchId: user.user.churchId,
        branchId, // Always check within the same branch
        _id: { $ne: scheduleId }, // Exclude current schedule
        isActive: true,
      };
      // Use existing values if not being updated
      conflictQuery.day = safeUpdateData.day || existingSchedule.day;
      conflictQuery.time = safeUpdateData.time || existingSchedule.time;
      const conflictingSchedule =
        await ServiceScheduleModel.findOne(conflictQuery);
      if (conflictingSchedule) {
        contextLogger.warn('Scheduling conflict detected during update', {
          branchId,
          scheduleId,
          conflictingScheduleId: conflictingSchedule._id,
          day: conflictQuery.day,
          time: conflictQuery.time,
        });
        return NextResponse.json(
          {
            error:
              'A service is already scheduled for this branch, day, and time',
            conflictingSchedule: {
              id: conflictingSchedule._id,
              service: conflictingSchedule.service,
              day: conflictingSchedule.day,
              time: conflictingSchedule.time,
            },
          },
          { status: 409 } // 409 Conflict
        );
      }
    }
    // Update the service schedule
    const updatedSchedule = await ServiceScheduleModel.findByIdAndUpdate(
      scheduleId,
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
      schedule: updatedSchedule,
      branch: {
        id: branch._id,
        name: branch.branchName,
        description: branch.description,
        // location: branch.location,
      },
      message: 'Service schedule updated successfully',
    };
    contextLogger.info('Service schedule updated successfully', {
      branchId,
      scheduleId,
      updatedFields: Object.keys(safeUpdateData),
    });
    return NextResponse.json(response);
  } catch (error) {
    contextLogger.error(
      'Unexpected error in updateBranchServiceScheduleHandler',
      error
    );
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE api/church/branches/[branchId]/service-schedules/[scheduleId] - Delete service schedule by ID
async function deleteBranchServiceScheduleHandler(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { branchId, scheduleId } = await params;
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    {
      requestId,
      endpoint: `/api/church/branches/${branchId}/service-schedules/${scheduleId}`,
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
    if (!mongoose.Types.ObjectId.isValid(scheduleId)) {
      return NextResponse.json(
        { error: 'Invalid service schedule ID format' },
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
    // Check if schedule exists and belongs to the specific branch and church
    const existingSchedule = await ServiceScheduleModel.findOne({
      _id: scheduleId,
      branchId,
      churchId: user.user.churchId,
    });
    if (!existingSchedule) {
      return NextResponse.json(
        { error: 'Service schedule not found in this branch' },
        { status: 404 }
      );
    }
    // Get query parameter to determine if it's a soft delete or hard delete
    const { searchParams } = new URL(request.url);
    const forceDelete = searchParams.get('force') === 'true';
    if (forceDelete) {
      // Hard delete - permanently remove the schedule
      await ServiceScheduleModel.findByIdAndDelete(scheduleId);
      contextLogger.info('Service schedule permanently deleted', {
        branchId,
        scheduleId,
        service: existingSchedule.service,
        day: existingSchedule.day,
        time: existingSchedule.time,
      });
      return NextResponse.json({
        message: 'Service schedule permanently deleted successfully',
        branch: {
          id: branch._id,
          name: branch.branchName,
        },
      });
    }
    // Soft delete - mark as inactive
    const deactivatedSchedule = await ServiceScheduleModel.findByIdAndUpdate(
      scheduleId,
      {
        isActive: false,
        updatedAt: new Date(),
      },
      { new: true }
    ).populate('branchId', 'branchName location');
    contextLogger.info('Service schedule deactivated (soft delete)', {
      branchId,
      scheduleId,
      service: existingSchedule.service,
      day: existingSchedule.day,
      time: existingSchedule.time,
    });
    return NextResponse.json({
      schedule: deactivatedSchedule,
      branch: {
        id: branch._id,
        name: branch.branchName,
        description: branch.description,
        // location: branch.location,
      },
      message: 'Service schedule deactivated successfully',
    });
  } catch (error) {
    contextLogger.error(
      'Unexpected error in deleteBranchServiceScheduleHandler',
      error
    );
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Export the handlers wrapped with logging middleware
export const GET = withApiLogger(getBranchServiceScheduleByIdHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});

export const PUT = withApiLogger(updateBranchServiceScheduleHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});

export const DELETE = withApiLogger(deleteBranchServiceScheduleHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});
