// /api/church/attendance/[attendanceId]/route.ts
import { requireAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { withApiLogger } from '@/lib/middleware/api-logger';
import dbConnect from '@/lib/mongodb';
import { AttendanceModel } from '@/models';
import mongoose from 'mongoose';
import { type NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  params: {
    attendanceId: string;
  };
}

interface CreateAttendancePayload {
  serviceScheduleId: string;
  attendanceDate: string;
  records: Array<{
    userId: string;
    status: 'present' | 'late' | 'absent' | 'excused';
    checkInTime?: string;
    checkOutTime?: string;
    notes?: string;
  }>;
  remarks?: string;
  weatherConditions?: string;
  specialEvents?: string[];
}

// GET /api/church/attendance/[attendanceId] - Get single attendance record by ID
async function getAttendanceByIdHandler(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { attendanceId } = await params;
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    { requestId, endpoint: `/api/church/attendance/${attendanceId}` },
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
    if (!mongoose.Types.ObjectId.isValid(attendanceId)) {
      return NextResponse.json(
        { error: 'Invalid attendance ID format' },
        { status: 400 }
      );
    }
    await dbConnect();
    const query: any = {
      _id: attendanceId,
      churchId: user.user.churchId,
    };
    // Add branch filter for non-admin users
    if (user.user.role === 'pastor' || user.user.role === 'secretary') {
      query.branchId = user.user.branchId;
    }
    const attendance = await AttendanceModel.findOne(query)
      .populate('serviceScheduleId', 'service day time type duration')
      .populate('branchId', 'branchName')
      .populate('takenBy', 'firstName lastName email')
      .populate('records.userId', 'firstName lastName email profilePictureUrl');
    if (!attendance) {
      return NextResponse.json(
        { error: 'Attendance record not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ attendance });
  } catch (error) {
    contextLogger.error('Unexpected error in getAttendanceByIdHandler', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/church/attendance/[attendanceId] - Update attendance record
async function updateAttendanceHandler(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { attendanceId } = await params;
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    { requestId, endpoint: `/api/church/attendance/${attendanceId}` },
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
    if (!mongoose.Types.ObjectId.isValid(attendanceId)) {
      return NextResponse.json(
        { error: 'Invalid attendance ID format' },
        { status: 400 }
      );
    }
    await dbConnect();
    const updateData: Partial<CreateAttendancePayload> = await request.json();
    const query: any = {
      _id: attendanceId,
      churchId: user.user.churchId,
    };
    // Add branch filter for non-admin users
    if (user.user.role === 'pastor' || user.user.role === 'secretary') {
      query.branchId = user.user.branchId;
    }
    // Check if attendance exists and belongs to user's church/branch
    const existingAttendance = await AttendanceModel.findOne(query);
    if (!existingAttendance) {
      return NextResponse.json(
        { error: 'Attendance record not found' },
        { status: 404 }
      );
    }
    // Only allow updates if status is draft or submitted (not approved/archived)
    if (
      existingAttendance.status === 'approved' &&
      user.user.role !== 'superadmin' &&
      user.user.role !== 'admin'
    ) {
      return NextResponse.json(
        { error: 'Cannot update approved attendance records' },
        { status: 403 }
      );
    }
    // Process records if provided
    let processedRecords: any;
    if (updateData.records) {
      processedRecords = updateData.records.map((record) => ({
        userId: record.userId,
        status: record.status,
        checkInTime: record.checkInTime
          ? new Date(record.checkInTime)
          : new Date(),
        checkOutTime: record.checkOutTime
          ? new Date(record.checkOutTime)
          : undefined,
        notes: record.notes,
      }));
    }
    const updatePayload: any = {
      ...updateData,
      updatedAt: new Date(),
    };
    if (processedRecords) {
      updatePayload.records = processedRecords;
    }
    if (updateData.attendanceDate) {
      updatePayload.attendanceDate = new Date(updateData.attendanceDate);
    }
    // Update the attendance record
    const updatedAttendance = await AttendanceModel.findByIdAndUpdate(
      attendanceId,
      updatePayload,
      {
        new: true,
        runValidators: true,
      }
    )
      .populate('serviceScheduleId', 'service day time type')
      .populate('branchId', 'branchName')
      .populate('takenBy', 'firstName lastName email')
      .populate('records.userId', 'firstName lastName email');
    contextLogger.info('Attendance record updated successfully', {
      attendanceId,
      updatedFields: Object.keys(updateData),
    });
    return NextResponse.json({
      attendance: updatedAttendance,
      message: 'Attendance record updated successfully',
    });
  } catch (error) {
    contextLogger.error('Unexpected error in updateAttendanceHandler', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/church/attendance/[attendanceId] - Delete attendance record
async function deleteAttendanceHandler(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { attendanceId } = await params;
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    { requestId, endpoint: `/api/church/attendance/${attendanceId}` },
    'api'
  );
  try {
    // Check authentication and authorization - only admins can delete
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
    if (!mongoose.Types.ObjectId.isValid(attendanceId)) {
      return NextResponse.json(
        { error: 'Invalid attendance ID format' },
        { status: 400 }
      );
    }
    await dbConnect();
    // Check if attendance exists and belongs to user's church
    const existingAttendance = await AttendanceModel.findOne({
      _id: attendanceId,
      churchId: user.user.churchId,
    });
    if (!existingAttendance) {
      return NextResponse.json(
        { error: 'Attendance record not found' },
        { status: 404 }
      );
    }
    // Get query parameter to determine if it's a soft delete or hard delete
    const { searchParams } = new URL(request.url);
    const forceDelete = searchParams.get('force') === 'true';
    if (forceDelete) {
      // Hard delete - permanently remove the attendance record
      await AttendanceModel.findByIdAndDelete(attendanceId);
      contextLogger.info('Attendance record permanently deleted', {
        attendanceId,
      });
      return NextResponse.json({
        message: 'Attendance record permanently deleted successfully',
      });
    }
    // Soft delete - mark as archived
    const archivedAttendance = await AttendanceModel.findByIdAndUpdate(
      attendanceId,
      {
        status: 'archived',
        isActive: false,
        updatedAt: new Date(),
      },
      { new: true }
    );
    contextLogger.info('Attendance record archived (soft delete)', {
      attendanceId,
    });
    return NextResponse.json({
      attendance: archivedAttendance,
      message: 'Attendance record archived successfully',
    });
  } catch (error) {
    contextLogger.error('Unexpected error in deleteAttendanceHandler', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Export the handlers for individual attendance record operations
export const GET_BY_ID = withApiLogger(getAttendanceByIdHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});

export const PUT = withApiLogger(updateAttendanceHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});

export const DELETE = withApiLogger(deleteAttendanceHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});
