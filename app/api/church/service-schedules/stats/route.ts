import { requireAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { withApiLogger } from '@/lib/middleware/api-logger';
import dbConnect from '@/lib/mongodb';
import { ServiceScheduleModel } from '@/models';
import { type NextRequest, NextResponse } from 'next/server';

// GET /api/service-schedules/stats - Get service schedule statistics
async function getServiceScheduleStatsHandler(
  request: NextRequest
): Promise<NextResponse> {
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    { requestId, endpoint: '/api/church/service-schedules/stats' },
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
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const branchId = searchParams.get('branchId'); // Filter by specific branch
    // Build base query
    const baseQuery: any = { churchId: user.user.churchId };
    if (branchId) {
      baseQuery.branchId = branchId;
    }
    // Run aggregation queries in parallel
    const [
      totalSchedules,
      activeSchedules,
      inactiveSchedules,
      schedulesByDay,
      schedulesByType,
      schedulesByBranch,
      averageAttendance,
      totalAttendance,
      upcomingServices,
    ] = await Promise.all([
      // Total schedules
      ServiceScheduleModel.countDocuments(baseQuery),
      // Active schedules
      ServiceScheduleModel.countDocuments({ ...baseQuery, isActive: true }),
      // Inactive schedules
      ServiceScheduleModel.countDocuments({ ...baseQuery, isActive: false }),
      // Schedules by day
      ServiceScheduleModel.aggregate([
        { $match: { ...baseQuery, isActive: true } },
        {
          $group: {
            _id: '$day',
            count: { $sum: 1 },
            totalAttendance: { $sum: { $ifNull: ['$attendance', 0] } },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      // Schedules by type
      ServiceScheduleModel.aggregate([
        { $match: { ...baseQuery, isActive: true } },
        {
          $group: {
            _id: '$type',
            count: { $sum: 1 },
            totalAttendance: { $sum: { $ifNull: ['$attendance', 0] } },
            averageDuration: { $avg: { $ifNull: ['$duration', 0] } },
          },
        },
        { $sort: { count: -1 } },
      ]),

      // Schedules by branch (if not filtering by specific branch)
      branchId
        ? []
        : ServiceScheduleModel.aggregate([
            { $match: { ...baseQuery, isActive: true } },
            {
              $group: {
                _id: '$branchId',
                count: { $sum: 1 },
                totalAttendance: { $sum: { $ifNull: ['$attendance', 0] } },
              },
            },
            {
              $lookup: {
                from: 'branches',
                localField: '_id',
                foreignField: '_id',
                as: 'branch',
              },
            },
            {
              $project: {
                count: 1,
                totalAttendance: 1,
                branchName: { $arrayElemAt: ['$branch.branchName', 0] },
              },
            },
            { $sort: { count: -1 } },
          ]),
      // Average attendance
      ServiceScheduleModel.aggregate([
        {
          $match: {
            ...baseQuery,
            isActive: true,
            attendance: { $exists: true, $gt: 0 },
          },
        },
        {
          $group: {
            _id: null,
            averageAttendance: { $avg: '$attendance' },
          },
        },
      ]),
      // Total attendance
      ServiceScheduleModel.aggregate([
        {
          $match: {
            ...baseQuery,
            isActive: true,
            attendance: { $exists: true, $gt: 0 },
          },
        },
        {
          $group: {
            _id: null,
            totalAttendance: { $sum: '$attendance' },
          },
        },
      ]),
      // Upcoming services (next 7 days) - This is a simplified version
      ServiceScheduleModel.find({
        ...baseQuery,
        isActive: true,
        recurring: true,
      })
        .populate('branchId', 'branchName location')
        .sort({ day: 1, time: 1 })
        .limit(10),
    ]);
    // Process day order for better display
    const dayOrder = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
    const orderedSchedulesByDay = dayOrder.map((day) => {
      const dayData = schedulesByDay.find((item) => item._id === day);
      return {
        day,
        count: dayData?.count || 0,
        totalAttendance: dayData?.totalAttendance || 0,
      };
    });
    const stats = {
      summary: {
        total: totalSchedules,
        active: activeSchedules,
        inactive: inactiveSchedules,
        averageAttendance: averageAttendance[0]?.averageAttendance || 0,
        totalAttendance: totalAttendance[0]?.totalAttendance || 0,
      },
      breakdown: {
        byDay: orderedSchedulesByDay,
        byType: schedulesByType,
        byBranch: schedulesByBranch,
      },
      upcomingServices: upcomingServices.slice(0, 5), // Limit to 5 for the stats
    };
    contextLogger.info('Service schedule statistics retrieved', {
      totalSchedules,
      activeSchedules,
      branchFilter: branchId || 'all',
    });
    return NextResponse.json(stats);
  } catch (error) {
    contextLogger.error(
      'Unexpected error in getServiceScheduleStatsHandler',
      error
    );
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Export the handler wrapped with logging middleware
export const GET = withApiLogger(getServiceScheduleStatsHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});
