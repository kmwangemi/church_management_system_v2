import { requireAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { withApiLogger } from '@/lib/middleware/api-logger';
import dbConnect from '@/lib/mongodb';
import { ServiceScheduleModel } from '@/models';
import mongoose from 'mongoose';
import { type NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  params: {
    id: string;
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

// GET /api/service-schedules/[id] - Get single service schedule by ID
async function getServiceScheduleByIdHandler(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { id } = await params;
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    { requestId, endpoint: `/api/church/service-schedules/${id}` },
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
        { error: 'Invalid service schedule ID format' },
        { status: 400 }
      );
    }
    await dbConnect();
    const schedule = await ServiceScheduleModel.findOne({
      _id: id,
      churchId: user.user.churchId,
    }).populate('branchId', 'branchName location');
    if (!schedule) {
      return NextResponse.json(
        { error: 'Service schedule not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ schedule });
  } catch (error) {
    contextLogger.error(
      'Unexpected error in getServiceScheduleByIdHandler',
      error
    );
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/service-schedules/[id] - Update service schedule by ID
async function updateServiceScheduleHandler(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { id } = await params;
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    { requestId, endpoint: `/api/church/service-schedules/${id}` },
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
        { error: 'Invalid service schedule ID format' },
        { status: 400 }
      );
    }
    await dbConnect();
    const updateData: UpdateServiceSchedulePayload = await request.json();
    // Check if schedule exists and belongs to the user's church
    const existingSchedule = await ServiceScheduleModel.findOne({
      _id: id,
      churchId: user.user.churchId,
    });
    if (!existingSchedule) {
      return NextResponse.json(
        { error: 'Service schedule not found' },
        { status: 404 }
      );
    }
    // Check for scheduling conflicts if day, time, or branch is being updated
    if (updateData.day || updateData.time || updateData.branchId) {
      const conflictQuery: any = {
        churchId: user.user.churchId,
        _id: { $ne: id }, // Exclude current schedule
        isActive: true,
      };
      // Use existing values if not being updated
      conflictQuery.day = updateData.day || existingSchedule.day;
      conflictQuery.time = updateData.time || existingSchedule.time;
      conflictQuery.branchId = updateData.branchId || existingSchedule.branchId;
      const conflictingSchedule =
        await ServiceScheduleModel.findOne(conflictQuery);
      if (conflictingSchedule) {
        return NextResponse.json(
          {
            error:
              'A service is already scheduled for this branch, day, and time',
          },
          { status: 400 }
        );
      }
    }
    // Update the service schedule
    const updatedSchedule = await ServiceScheduleModel.findByIdAndUpdate(
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
    contextLogger.info('Service schedule updated successfully', {
      scheduleId: id,
      updatedFields: Object.keys(updateData),
    });
    return NextResponse.json({
      schedule: updatedSchedule,
      message: 'Service schedule updated successfully',
    });
  } catch (error) {
    contextLogger.error(
      'Unexpected error in updateServiceScheduleHandler',
      error
    );
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/service-schedules/[id] - Delete service schedule by ID
async function deleteServiceScheduleHandler(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { id } = await params;
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    { requestId, endpoint: `/api/church/service-schedules/${id}` },
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
        { error: 'Invalid service schedule ID format' },
        { status: 400 }
      );
    }
    await dbConnect();
    // Check if schedule exists and belongs to the user's church
    const existingSchedule = await ServiceScheduleModel.findOne({
      _id: id,
      churchId: user.user.churchId,
    });
    if (!existingSchedule) {
      return NextResponse.json(
        { error: 'Service schedule not found' },
        { status: 404 }
      );
    }
    // Get query parameter to determine if it's a soft delete or hard delete
    const { searchParams } = new URL(request.url);
    const forceDelete = searchParams.get('force') === 'true';
    if (forceDelete) {
      // Hard delete - permanently remove the schedule
      await ServiceScheduleModel.findByIdAndDelete(id);
      contextLogger.info('Service schedule permanently deleted', {
        scheduleId: id,
      });
      return NextResponse.json({
        message: 'Service schedule permanently deleted successfully',
      });
    }
    // Soft delete - mark as inactive
    const deactivatedSchedule = await ServiceScheduleModel.findByIdAndUpdate(
      id,
      {
        isActive: false,
        updatedAt: new Date(),
      },
      { new: true }
    ).populate('branchId', 'branchName location');
    contextLogger.info('Service schedule deactivated (soft delete)', {
      scheduleId: id,
    });
    return NextResponse.json({
      schedule: deactivatedSchedule,
      message: 'Service schedule deactivated successfully',
    });
  } catch (error) {
    contextLogger.error(
      'Unexpected error in deleteServiceScheduleHandler',
      error
    );
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Export the handlers wrapped with logging middleware
export const GET = withApiLogger(getServiceScheduleByIdHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});

export const PUT = withApiLogger(updateServiceScheduleHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});

export const DELETE = withApiLogger(deleteServiceScheduleHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});
