import { requireAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { withApiLogger } from '@/lib/middleware/api-logger';
import dbConnect from '@/lib/mongodb';
import { GroupModel } from '@/models';
import { AttendanceStatus } from '@/models/group';
import mongoose from 'mongoose';
import { type NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  params: {
    groupId: string;
    activityId: string;
  };
}

// POST /api/church/groups/[groupId]/activities/[activityId]/attendance - Record attendance
async function recordAttendanceHandler(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { groupId, activityId } = await params;
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    {
      requestId,
      endpoint: `/api/church/groups/${groupId}/activities/${activityId}/attendance`,
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
    const { attendanceRecords } = body; // Array of { userId, status, arrivalTime?, notes? }
    // Validate attendance records
    if (!Array.isArray(attendanceRecords)) {
      return NextResponse.json(
        { error: 'Attendance records must be an array' },
        { status: 400 }
      );
    }
    if (attendanceRecords.length === 0) {
      return NextResponse.json(
        { error: 'Attendance records cannot be empty' },
        { status: 400 }
      );
    }
    // Validate each attendance record
    for (const record of attendanceRecords) {
      if (!(record.userId && record.status)) {
        return NextResponse.json(
          { error: 'Each attendance record must have userId and status' },
          { status: 400 }
        );
      }
      if (!mongoose.Types.ObjectId.isValid(record.userId)) {
        return NextResponse.json(
          { error: `Invalid user ID format: ${record.userId}` },
          { status: 400 }
        );
      }
      if (!Object.values(AttendanceStatus).includes(record.status)) {
        return NextResponse.json(
          { error: `Invalid attendance status: ${record.status}` },
          { status: 400 }
        );
      }
      // Validate arrival time if provided
      if (record.arrivalTime) {
        const arrivalTime = new Date(record.arrivalTime);
        if (Number.isNaN(arrivalTime.getTime())) {
          return NextResponse.json(
            { error: `Invalid arrival time format for user ${record.userId}` },
            { status: 400 }
          );
        }
      }
    }
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
    // Clear existing attendance and add new records
    group.activities[activityIndex].attendance = attendanceRecords.map(
      (record) => ({
        userId: record.userId,
        status: record.status,
        arrivalTime: record.arrivalTime
          ? new Date(record.arrivalTime)
          : undefined,
        notes: record.notes?.trim() || '',
      })
    );
    // Update actual participants based on attendance
    group.activities[activityIndex].actualParticipants = attendanceRecords
      .filter(
        (record) =>
          record.status === AttendanceStatus.PRESENT ||
          record.status === AttendanceStatus.LATE
      )
      .map((record) => record.userId);
    // Update activity timestamp
    group.activities[activityIndex].updatedAt = new Date();
    await group.save();
    const updatedGroup = await GroupModel.findById(groupId).populate(
      'activities.attendance.userId',
      'firstName lastName'
    );
    const updatedAttendance = updatedGroup.activities[activityIndex].attendance;
    contextLogger.info('Attendance recorded successfully', {
      groupId,
      activityId,
      recordsCount: attendanceRecords.length,
      presentCount: attendanceRecords.filter(
        (r) =>
          r.status === AttendanceStatus.PRESENT ||
          r.status === AttendanceStatus.LATE
      ).length,
    });
    return NextResponse.json({
      success: true,
      message: 'Attendance recorded successfully',
      data: updatedAttendance,
    });
  } catch (error: any) {
    contextLogger.error('Unexpected error in recordAttendanceHandler', error);
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

// GET /api/church/groups/[groupId]/activities/[activityId]/attendance - Get activity attendance
async function getAttendanceHandler(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { groupId, activityId } = await params;
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    {
      requestId,
      endpoint: `/api/church/groups/${groupId}/activities/${activityId}/attendance`,
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
    }).populate('activities.attendance.userId', 'firstName lastName email');
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
    // Calculate attendance statistics
    const totalExpected = activity.plannedParticipants.length;
    const presentCount = activity.attendance.filter(
      (a) => a.status === AttendanceStatus.PRESENT
    ).length;
    const absentCount = activity.attendance.filter(
      (a) => a.status === AttendanceStatus.ABSENT
    ).length;
    const lateCount = activity.attendance.filter(
      (a) => a.status === AttendanceStatus.LATE
    ).length;
    const excusedCount = activity.attendance.filter(
      (a) => a.status === AttendanceStatus.EXCUSED
    ).length;
    const attendanceRate =
      totalExpected > 0
        ? Math.round(((presentCount + lateCount) / totalExpected) * 100)
        : 0;
    const summary = {
      totalExpected,
      totalPresent: presentCount,
      totalAbsent: absentCount,
      totalLate: lateCount,
      totalExcused: excusedCount,
      attendanceRate,
    };
    contextLogger.info('Attendance data fetched successfully', {
      groupId,
      activityId,
      attendanceRate,
      totalRecords: activity.attendance.length,
    });
    return NextResponse.json({
      success: true,
      attendance: activity.attendance,
      summary,
    });
  } catch (error) {
    contextLogger.error('Unexpected error in getAttendanceHandler', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/church/groups/[groupId]/activities/[activityId]/attendance - Update specific attendance record
async function updateAttendanceHandler(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { groupId, activityId } = await params;
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    {
      requestId,
      endpoint: `/api/church/groups/${groupId}/activities/${activityId}/attendance`,
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
    const { userId, status, arrivalTime, notes } = body;
    // Validate required fields
    if (!(userId && status)) {
      return NextResponse.json(
        { error: 'userId and status are required' },
        { status: 400 }
      );
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { error: 'Invalid user ID format' },
        { status: 400 }
      );
    }
    if (!Object.values(AttendanceStatus).includes(status)) {
      return NextResponse.json(
        { error: `Invalid attendance status: ${status}` },
        { status: 400 }
      );
    }
    // Validate arrival time if provided
    if (arrivalTime) {
      const arrivalTimeDate = new Date(arrivalTime);
      if (Number.isNaN(arrivalTimeDate.getTime())) {
        return NextResponse.json(
          { error: 'Invalid arrival time format' },
          { status: 400 }
        );
      }
    }
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
    // Find or create attendance record for the user
    const attendanceIndex = group.activities[
      activityIndex
    ].attendance.findIndex((record) => record.userId.toString() === userId);
    const attendanceRecord = {
      userId,
      status,
      arrivalTime: arrivalTime ? new Date(arrivalTime) : undefined,
      notes: notes?.trim() || '',
    };
    if (attendanceIndex >= 0) {
      // Update existing record
      group.activities[activityIndex].attendance[attendanceIndex] =
        attendanceRecord;
    } else {
      // Add new record
      group.activities[activityIndex].attendance.push(attendanceRecord);
    }
    // Update actual participants based on attendance
    const presentUsers = group.activities[activityIndex].attendance
      .filter(
        (record) =>
          record.status === AttendanceStatus.PRESENT ||
          record.status === AttendanceStatus.LATE
      )
      .map((record) => record.userId);
    group.activities[activityIndex].actualParticipants = presentUsers;
    group.activities[activityIndex].updatedAt = new Date();
    await group.save();
    contextLogger.info('Individual attendance record updated successfully', {
      groupId,
      activityId,
      userId,
      status,
      operation: attendanceIndex >= 0 ? 'update' : 'create',
    });
    return NextResponse.json({
      success: true,
      message: 'Attendance record updated successfully',
      data: attendanceRecord,
    });
  } catch (error: any) {
    contextLogger.error('Unexpected error in updateAttendanceHandler', error);
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
export const POST = withApiLogger(recordAttendanceHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});

export const GET = withApiLogger(getAttendanceHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});

export const PUT = withApiLogger(updateAttendanceHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});
