// /api/church/attendance/route.ts
import { requireAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { withApiLogger } from '@/lib/middleware/api-logger';
import dbConnect from '@/lib/mongodb';
import { AttendanceModel, ServiceScheduleModel } from '@/models';
import { type NextRequest, NextResponse } from 'next/server';

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

// GET /api/church/attendance - Get attendance records with filtering and pagination
async function getAttendanceHandler(
  request: NextRequest
): Promise<NextResponse> {
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    { requestId, endpoint: '/api/church/attendance' },
    'api'
  );
  try {
    // Check authentication and authorization
    const authResult = await requireAuth([
      'superadmin',
      'admin',
    ])(request);
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
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const page = Number.parseInt(searchParams.get('page') || '1', 10);
    const limit = Number.parseInt(searchParams.get('limit') || '10', 10);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status'); // 'draft', 'submitted', 'approved', 'archived'
    const branchId = searchParams.get('branchId');
    const serviceScheduleId = searchParams.get('serviceScheduleId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    // Build base query
    const query: any = { churchId: user.user.churchId };
    // Add branch filter if user is not superadmin/admin
    if (user.user.role === 'pastor' || user.user.role === 'secretary') {
      query.branchId = user.user.branchId;
    } else if (branchId) {
      query.branchId = branchId;
    }
    // Add status filter
    if (status) {
      query.status = status;
    }
    // Add service schedule filter
    if (serviceScheduleId) {
      query.serviceScheduleId = serviceScheduleId;
    }
    // Add date range filter
    if (startDate || endDate) {
      query.attendanceDate = {};
      if (startDate) {
        query.attendanceDate.$gte = new Date(startDate);
      }
      if (endDate) {
        query.attendanceDate.$lte = new Date(endDate);
      }
    }
    // Handle search
    if (search && search.length > 0) {
      query.$text = { $search: search };
    }
    const skip = (page - 1) * limit;
    // Build the find query
    let findQuery = AttendanceModel.find(query);
    // Sort by relevance if searching, otherwise by date
    if (search && query.$text) {
      findQuery = findQuery.sort({
        score: { $meta: 'textScore' },
        attendanceDate: -1,
      });
    } else {
      findQuery = findQuery.sort({ attendanceDate: -1 });
    }
    const [attendanceRecords, total] = await Promise.all([
      findQuery
        .populate('serviceScheduleId', 'service day time type')
        .populate('branchId', 'branchName')
        .populate('takenBy', 'firstName lastName email')
        .populate('records.userId', 'firstName lastName email')
        .skip(skip)
        .limit(limit),
      AttendanceModel.countDocuments(query),
    ]);
    const response: any = {
      attendance: attendanceRecords,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
    // Add search metadata
    if (search) {
      response.searchTerm = search;
      response.searchResults = total;
    }
    if (status) {
      response.statusFilter = status;
    }
    return NextResponse.json(response);
  } catch (error) {
    contextLogger.error('Unexpected error in getAttendanceHandler', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/church/attendance - Create new attendance record
async function createAttendanceHandler(
  request: NextRequest
): Promise<NextResponse> {
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    { requestId, endpoint: '/api/church/attendance' },
    'api'
  );
  try {
    // Check authentication and authorization
    const authResult = await requireAuth([
      'superadmin',
      'admin',
    ])(request);
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
    await dbConnect();
    const attendanceData: CreateAttendancePayload = await request.json();
    // Verify service schedule exists and belongs to user's church
    const serviceSchedule = await ServiceScheduleModel.findOne({
      _id: attendanceData.serviceScheduleId,
      churchId: user.user.churchId,
      isActive: true,
    });
    if (!serviceSchedule) {
      return NextResponse.json(
        { error: 'Service schedule not found or inactive' },
        { status: 404 }
      );
    }
    // Check if attendance already exists for this service and date
    const existingAttendance = await AttendanceModel.findOne({
      serviceScheduleId: attendanceData.serviceScheduleId,
      attendanceDate: new Date(attendanceData.attendanceDate),
    });
    if (existingAttendance) {
      return NextResponse.json(
        { error: 'Attendance record already exists for this service and date' },
        { status: 400 }
      );
    }
    // Process attendance records
    const processedRecords = attendanceData.records.map((record) => ({
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
    const attendance = new AttendanceModel({
      churchId: user.user.churchId,
      branchId: serviceSchedule.branchId,
      serviceScheduleId: attendanceData.serviceScheduleId,
      attendanceDate: new Date(attendanceData.attendanceDate),
      records: processedRecords,
      takenBy: user.user.sub,
      remarks: attendanceData.remarks,
      weatherConditions: attendanceData.weatherConditions,
      specialEvents: attendanceData.specialEvents,
      status: 'draft',
    });
    await attendance.save();
    // Populate the saved record for response
    const populatedAttendance = await AttendanceModel.findById(attendance._id)
      .populate('serviceScheduleId', 'service day time type')
      .populate('branchId', 'branchName')
      .populate('takenBy', 'firstName lastName email')
      .populate('records.userId', 'firstName lastName email');
    contextLogger.info('Attendance record created successfully', {
      attendanceId: attendance._id,
      serviceScheduleId: attendanceData.serviceScheduleId,
    });
    return NextResponse.json(populatedAttendance, { status: 201 });
  } catch (error) {
    contextLogger.error('Unexpected error in createAttendanceHandler', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Export the handlers wrapped with logging middleware
export const GET = withApiLogger(getAttendanceHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});

export const POST = withApiLogger(createAttendanceHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});
