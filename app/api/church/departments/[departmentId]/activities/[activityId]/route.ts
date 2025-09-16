// /api/church/departments/[departmentId]/activities/[activityId]/route.ts
import { requireAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { withApiLogger } from '@/lib/middleware/api-logger';
import dbConnect from '@/lib/mongodb';
import { DepartmentModel } from '@/models';
import { ActivityType } from '@/models/department';
import mongoose from 'mongoose';
import { type NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  params: {
    departmentId: string;
    activityId: string;
  };
}

// PUT /api/church/departments/[departmentId]/activities/[activityId] - Update activity
async function updateActivityHandler(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { departmentId, activityId } = await params;
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    {
      requestId,
      endpoint: `/api/church/departments/${departmentId}/activities/${activityId}`,
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
        mongoose.Types.ObjectId.isValid(activityId)
      )
    ) {
      return NextResponse.json(
        { error: 'Invalid department ID or activity ID' },
        { status: 400 }
      );
    }
    await dbConnect();
    const body = await request.json();
    const {
      title,
      description,
      type,
      date,
      duration,
      location,
      participants,
      notes,
      isCompleted,
    } = body;
    // Validate activity type if provided
    if (type && !Object.values(ActivityType).includes(type)) {
      return NextResponse.json(
        { error: 'Invalid activity type' },
        { status: 400 }
      );
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
    // Find the activity
    const activityIndex = department.activities.findIndex(
      (activity: any) => activity._id?.toString() === activityId
    );
    if (activityIndex === -1) {
      return NextResponse.json(
        { error: 'Activity not found' },
        { status: 404 }
      );
    }
    // Update activity fields
    const activity = department.activities[activityIndex];
    const updateFields: string[] = [];
    if (title !== undefined) {
      activity.title = title;
      updateFields.push('title');
    }
    if (description !== undefined) {
      activity.description = description;
      updateFields.push('description');
    }
    if (type !== undefined) {
      activity.type = type;
      updateFields.push('type');
    }
    if (date !== undefined) {
      activity.date = new Date(date);
      updateFields.push('date');
    }
    if (duration !== undefined) {
      activity.duration = duration;
      updateFields.push('duration');
    }
    if (location !== undefined) {
      activity.location = location;
      updateFields.push('location');
    }
    if (participants !== undefined) {
      activity.participants = participants.map(
        (p: string) => new mongoose.Types.ObjectId(p)
      );
      updateFields.push('participants');
    }
    if (notes !== undefined) {
      activity.notes = notes;
      updateFields.push('notes');
    }
    if (isCompleted !== undefined) {
      activity.isCompleted = isCompleted;
      updateFields.push('isCompleted');
    }
    await department.save();
    // Populate the updated activity
    await department.populate([
      { path: 'activities.organizedBy', select: 'firstName lastName' },
      { path: 'activities.participants', select: 'firstName lastName' },
    ]);
    contextLogger.info('Department activity updated successfully', {
      departmentId,
      activityId,
      updateFields,
    });
    return NextResponse.json({
      success: true,
      message: 'Activity updated successfully',
      data: department.activities[activityIndex],
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

// DELETE /api/church/departments/[departmentId]/activities/[activityId] - Remove activity
async function removeActivityHandler(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { departmentId, activityId } = await params;
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    {
      requestId,
      endpoint: `/api/church/departments/${departmentId}/activities/${activityId}`,
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
        mongoose.Types.ObjectId.isValid(activityId)
      )
    ) {
      return NextResponse.json(
        { error: 'Invalid department ID or activity ID' },
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
    // Find and remove the activity
    const activityIndex = department.activities.findIndex(
      (activity: any) => activity._id?.toString() === activityId
    );
    if (activityIndex === -1) {
      return NextResponse.json(
        { error: 'Activity not found' },
        { status: 404 }
      );
    }
    // Store activity info for logging before removal
    const removedActivity = department.activities[activityIndex];
    // Remove activity from array
    department.activities.splice(activityIndex, 1);
    await department.save();
    contextLogger.info('Department activity removed successfully', {
      departmentId,
      activityId,
      activityTitle: removedActivity.title,
    });
    return NextResponse.json({
      success: true,
      message: 'Activity removed successfully',
      data: { activityId },
    });
  } catch (error: any) {
    contextLogger.error('Unexpected error in removeActivityHandler', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Export the handlers wrapped with logging middleware
export const PUT = withApiLogger(updateActivityHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});

export const DELETE = withApiLogger(removeActivityHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});
