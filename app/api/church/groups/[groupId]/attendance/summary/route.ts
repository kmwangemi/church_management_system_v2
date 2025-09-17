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
  };
}

// GET /api/church/groups/[groupId]/attendance/summary - Get attendance summary
async function getAttendanceSummaryHandler(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { groupId } = await params;
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    { requestId, endpoint: `/api/church/groups/${groupId}/attendance/summary` },
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
    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return NextResponse.json(
        { error: 'Invalid group ID format' },
        { status: 400 }
      );
    }
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = Math.min(
      Number.parseInt(searchParams.get('limit') || '10', 10),
      100
    ); // Cap at 100
    const includeRecords = searchParams.get('includeRecords') === 'true';
    // Validate pagination parameters
    if (limit < 1) {
      return NextResponse.json(
        { error: 'Limit must be greater than 0' },
        { status: 400 }
      );
    }
    // Validate date parameters
    let startDateTime: Date | null = null;
    let endDateTime: Date | null = null;
    if (startDate) {
      startDateTime = new Date(startDate);
      if (Number.isNaN(startDateTime.getTime())) {
        return NextResponse.json(
          { error: 'Invalid start date format' },
          { status: 400 }
        );
      }
    }
    if (endDate) {
      endDateTime = new Date(endDate);
      if (Number.isNaN(endDateTime.getTime())) {
        return NextResponse.json(
          { error: 'Invalid end date format' },
          { status: 400 }
        );
      }
    }
    // Validate date range
    if (startDateTime && endDateTime && startDateTime > endDateTime) {
      return NextResponse.json(
        { error: 'Start date cannot be after end date' },
        { status: 400 }
      );
    }
    // Check if group exists and belongs to the user's church
    const group = await GroupModel.findOne({
      _id: groupId,
      churchId: user.user.churchId,
    }).populate('activities.attendance.userId', 'firstName lastName');
    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }
    let activities = [...group.activities];
    // Filter by date range
    if (startDateTime && endDateTime) {
      activities = activities.filter(
        (activity) =>
          activity.date >= startDateTime && activity.date <= endDateTime
      );
    } else if (startDateTime) {
      activities = activities.filter(
        (activity) => activity.date >= startDateTime
      );
    } else if (endDateTime) {
      activities = activities.filter(
        (activity) => activity.date <= endDateTime
      );
    }
    // Sort by date (most recent first) and limit
    activities = activities
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
    // Generate summary for each activity
    const summaries = activities.map((activity) => {
      const totalExpected = activity.plannedParticipants.length;
      const attendance = activity.attendance || [];
      const totalPresent = attendance.filter(
        (a) => a.status === AttendanceStatus.PRESENT
      ).length;
      const totalLate = attendance.filter(
        (a) => a.status === AttendanceStatus.LATE
      ).length;
      const totalAbsent = attendance.filter(
        (a) => a.status === AttendanceStatus.ABSENT
      ).length;
      const totalExcused = attendance.filter(
        (a) => a.status === AttendanceStatus.EXCUSED
      ).length;
      const attendanceRate =
        totalExpected > 0
          ? Math.round(((totalPresent + totalLate) / totalExpected) * 100)
          : 0;
      const summary: any = {
        date: activity.date,
        activityId: activity._id,
        title: activity.title,
        type: activity.type,
        isCompleted: activity.isCompleted,
        totalExpected,
        totalPresent,
        totalLate,
        totalAbsent,
        totalExcused,
        attendanceRate,
      };
      // Include detailed records if requested
      if (includeRecords) {
        summary.records = attendance;
      }
      return summary;
    });
    // Calculate overall statistics
    const totalActivities = summaries.length;
    const activitiesWithAttendance = summaries.filter(
      (s) => s.totalExpected > 0
    );
    const overallStats = {
      totalActivities,
      activitiesWithAttendance: activitiesWithAttendance.length,
      averageAttendanceRate:
        activitiesWithAttendance.length > 0
          ? Math.round(
              activitiesWithAttendance.reduce(
                (sum, s) => sum + s.attendanceRate,
                0
              ) / activitiesWithAttendance.length
            )
          : 0,
      totalExpected: summaries.reduce((sum, s) => sum + s.totalExpected, 0),
      totalPresent: summaries.reduce((sum, s) => sum + s.totalPresent, 0),
      totalLate: summaries.reduce((sum, s) => sum + s.totalLate, 0),
      totalAbsent: summaries.reduce((sum, s) => sum + s.totalAbsent, 0),
      totalExcused: summaries.reduce((sum, s) => sum + s.totalExcused, 0),
      bestAttendanceRate:
        activitiesWithAttendance.length > 0
          ? Math.max(...activitiesWithAttendance.map((s) => s.attendanceRate))
          : 0,
      worstAttendanceRate:
        activitiesWithAttendance.length > 0
          ? Math.min(...activitiesWithAttendance.map((s) => s.attendanceRate))
          : 0,
    };
    // Find activities with best and worst attendance for additional insights
    const bestAttendanceActivity = activitiesWithAttendance.find(
      (s) => s.attendanceRate === overallStats.bestAttendanceRate
    );
    const worstAttendanceActivity = activitiesWithAttendance.find(
      (s) => s.attendanceRate === overallStats.worstAttendanceRate
    );
    const insights = {
      bestAttendanceActivity: bestAttendanceActivity
        ? {
            title: bestAttendanceActivity.title,
            date: bestAttendanceActivity.date,
            rate: bestAttendanceActivity.attendanceRate,
          }
        : null,
      worstAttendanceActivity: worstAttendanceActivity
        ? {
            title: worstAttendanceActivity.title,
            date: worstAttendanceActivity.date,
            rate: worstAttendanceActivity.attendanceRate,
          }
        : null,
    };
    contextLogger.info('Attendance summary generated successfully', {
      groupId,
      totalActivities,
      dateRange: { startDate, endDate },
      averageAttendanceRate: overallStats.averageAttendanceRate,
      includeRecords,
    });
    return NextResponse.json({
      success: true,
      data: {
        summaries,
        overallStats,
        insights,
        filters: {
          dateRange: { startDate, endDate },
          limit,
          includeRecords,
        },
      },
    });
  } catch (error) {
    contextLogger.error(
      'Unexpected error in getAttendanceSummaryHandler',
      error
    );
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/church/groups/[groupId]/attendance/summary - Generate custom attendance report
async function generateAttendanceReportHandler(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { groupId } = await params;
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    { requestId, endpoint: `/api/church/groups/${groupId}/attendance/summary` },
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
    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return NextResponse.json(
        { error: 'Invalid group ID format' },
        { status: 400 }
      );
    }
    await dbConnect();
    const body = await request.json();
    const {
      startDate,
      endDate,
      activityTypes = [],
      includeCompleted = true,
      includeIncomplete = true,
      groupByMonth = false,
      includeIndividualStats = false,
    } = body;
    // Validate dates
    if (!(startDate && endDate)) {
      return NextResponse.json(
        { error: 'Start date and end date are required' },
        { status: 400 }
      );
    }
    const startDateTime = new Date(startDate);
    const endDateTime = new Date(endDate);
    if (
      Number.isNaN(startDateTime.getTime()) ||
      Number.isNaN(endDateTime.getTime())
    ) {
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400 }
      );
    }
    if (startDateTime > endDateTime) {
      return NextResponse.json(
        { error: 'Start date cannot be after end date' },
        { status: 400 }
      );
    }
    // Check if group exists and belongs to the user's church
    const group = await GroupModel.findOne({
      _id: groupId,
      churchId: user.user.churchId,
    }).populate('activities.attendance.userId', 'firstName lastName');
    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }
    let activities = group.activities.filter(
      (activity) =>
        activity.date >= startDateTime && activity.date <= endDateTime
    );
    // Filter by activity types
    if (activityTypes.length > 0) {
      activities = activities.filter((activity) =>
        activityTypes.includes(activity.type)
      );
    }
    // Filter by completion status
    if (!includeCompleted) {
      activities = activities.filter((activity) => !activity.isCompleted);
    }
    if (!includeIncomplete) {
      activities = activities.filter((activity) => activity.isCompleted);
    }
    const report = {
      groupInfo: {
        id: group._id,
        name: group.groupName,
        totalMembers: group.members.length,
      },
      reportPeriod: { startDate, endDate },
      filters: { activityTypes, includeCompleted, includeIncomplete },
      summary: {
        totalActivities: activities.length,
        totalExpected: 0,
        totalPresent: 0,
        totalLate: 0,
        totalAbsent: 0,
        totalExcused: 0,
        averageAttendanceRate: 0,
      },
      monthlyBreakdown: [] as any[],
      individualStats: [] as any[],
      activities: activities.map((activity) => {
        const attendance = activity.attendance || [];
        const present = attendance.filter(
          (a) => a.status === AttendanceStatus.PRESENT
        ).length;
        const late = attendance.filter(
          (a) => a.status === AttendanceStatus.LATE
        ).length;
        const absent = attendance.filter(
          (a) => a.status === AttendanceStatus.ABSENT
        ).length;
        const excused = attendance.filter(
          (a) => a.status === AttendanceStatus.EXCUSED
        ).length;
        const expected = activity.plannedParticipants.length;
        const rate =
          expected > 0 ? Math.round(((present + late) / expected) * 100) : 0;
        report.summary.totalExpected += expected;
        report.summary.totalPresent += present;
        report.summary.totalLate += late;
        report.summary.totalAbsent += absent;
        report.summary.totalExcused += excused;
        return {
          id: activity._id,
          title: activity.title,
          type: activity.type,
          date: activity.date,
          isCompleted: activity.isCompleted,
          expected,
          present,
          late,
          absent,
          excused,
          attendanceRate: rate,
        };
      }),
    };
    // Calculate average attendance rate
    const activitiesWithExpected = report.activities.filter(
      (a) => a.expected > 0
    );
    report.summary.averageAttendanceRate =
      activitiesWithExpected.length > 0
        ? Math.round(
            activitiesWithExpected.reduce(
              (sum, a) => sum + a.attendanceRate,
              0
            ) / activitiesWithExpected.length
          )
        : 0;
    // Generate monthly breakdown if requested
    if (groupByMonth && report.activities.length > 0) {
      const monthlyData = new Map();
      report.activities.forEach((activity) => {
        const monthKey = new Date(activity.date).toISOString().slice(0, 7); // YYYY-MM
        if (!monthlyData.has(monthKey)) {
          monthlyData.set(monthKey, {
            month: monthKey,
            activities: 0,
            totalExpected: 0,
            totalPresent: 0,
            totalLate: 0,
            totalAbsent: 0,
            totalExcused: 0,
            averageRate: 0,
          });
        }
        const monthData = monthlyData.get(monthKey);
        monthData.activities++;
        monthData.totalExpected += activity.expected;
        monthData.totalPresent += activity.present;
        monthData.totalLate += activity.late;
        monthData.totalAbsent += activity.absent;
        monthData.totalExcused += activity.excused;
      });
      // Calculate average rates for each month
      monthlyData.forEach((data) => {
        data.averageRate =
          data.totalExpected > 0
            ? Math.round(
                ((data.totalPresent + data.totalLate) / data.totalExpected) *
                  100
              )
            : 0;
      });
      report.monthlyBreakdown = Array.from(monthlyData.values()).sort((a, b) =>
        a.month.localeCompare(b.month)
      );
    }
    contextLogger.info('Custom attendance report generated successfully', {
      groupId,
      reportPeriod: { startDate, endDate },
      totalActivities: report.summary.totalActivities,
      averageAttendanceRate: report.summary.averageAttendanceRate,
    });
    return NextResponse.json({
      success: true,
      data: report,
    });
  } catch (error: any) {
    contextLogger.error(
      'Unexpected error in generateAttendanceReportHandler',
      error
    );
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
export const GET = withApiLogger(getAttendanceSummaryHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});

export const POST = withApiLogger(generateAttendanceReportHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});
