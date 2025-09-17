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

// GET /api/church/groups/[groupId]/reports/attendance - Attendance reports
async function getAttendanceReportHandler(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { groupId } = await params;
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    { requestId, endpoint: `/api/church/groups/${groupId}/reports/attendance` },
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
    const format = searchParams.get('format') || 'summary'; // 'summary' | 'detailed' | 'trends'
    const includeInactive = searchParams.get('includeInactive') === 'true';
    const minActivities = Number.parseInt(
      searchParams.get('minActivities') || '1',
      10
    );
    // Validate query parameters
    if (startDate && Number.isNaN(Date.parse(startDate))) {
      return NextResponse.json(
        { error: 'Invalid startDate format' },
        { status: 400 }
      );
    }
    if (endDate && Number.isNaN(Date.parse(endDate))) {
      return NextResponse.json(
        { error: 'Invalid endDate format' },
        { status: 400 }
      );
    }
    const validFormats = ['summary', 'detailed', 'trends'];
    if (!validFormats.includes(format)) {
      return NextResponse.json(
        {
          error: `Invalid format parameter. Must be one of: ${validFormats.join(', ')}`,
        },
        { status: 400 }
      );
    }
    if (minActivities < 1 || minActivities > 100) {
      return NextResponse.json(
        { error: 'minActivities must be between 1 and 100' },
        { status: 400 }
      );
    }
    // Check if group exists and belongs to the user's church
    const group = await GroupModel.findOne({
      _id: groupId,
      churchId: user.user.churchId,
    })
      .populate('activities.attendance.userId', 'firstName lastName email')
      // .populate('activities.organizedBy', 'firstName lastName')
      .populate('members.userId', 'firstName lastName email');
    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }
    let activities = [...group.activities];
    // Filter by active status if not including inactive
    if (!includeInactive) {
      activities = activities.filter((activity) => activity.isActive !== false);
    }
    // Filter by date range
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // Include the entire end date
      activities = activities.filter(
        (activity) => activity.date >= start && activity.date <= end
      );
    }
    // Filter activities with minimum attendance records
    activities = activities.filter(
      (activity) =>
        activity.attendance && activity.attendance.length >= minActivities
    );
    let reportData: any = {};
    if (format === 'summary') {
      // Summary report
      const summary = activities.map((activity) => {
        const totalExpected = activity.plannedParticipants?.length || 0;
        const attendanceRecords = activity.attendance || [];
        const totalPresent = attendanceRecords.filter(
          (a) => a.status === AttendanceStatus.PRESENT
        ).length;
        const totalLate = attendanceRecords.filter(
          (a) => a.status === AttendanceStatus.LATE
        ).length;
        const totalAbsent = attendanceRecords.filter(
          (a) => a.status === AttendanceStatus.ABSENT
        ).length;
        const totalExcused = attendanceRecords.filter(
          (a) => a.status === AttendanceStatus.EXCUSED
        ).length;
        const actualAttendees = totalPresent + totalLate;
        const attendanceRate =
          totalExpected > 0
            ? Math.round((actualAttendees / totalExpected) * 100)
            : 0;
        return {
          activityId: activity._id,
          title: activity.title,
          date: activity.date,
          type: activity.type,
          location: activity.location,
          organizer: activity.organizedBy,
          totalExpected,
          totalPresent,
          totalLate,
          totalAbsent,
          totalExcused,
          actualAttendees,
          attendanceRate,
          isCompleted: activity.isCompleted,
          isCancelled: activity.isCancelled,
        };
      });
      // Overall summary statistics
      const completedActivities = summary.filter((s) => s.isCompleted);
      const attendanceRates = summary
        .map((s) => s.attendanceRate)
        .filter((rate) => rate > 0);
      const overallStats = {
        totalActivities: activities.length,
        completedActivities: completedActivities.length,
        averageAttendanceRate:
          attendanceRates.length > 0
            ? Math.round(
                attendanceRates.reduce((sum, rate) => sum + rate, 0) /
                  attendanceRates.length
              )
            : 0,
        totalMeetings: summary.length,
        bestAttendanceRate:
          attendanceRates.length > 0 ? Math.max(...attendanceRates) : 0,
        worstAttendanceRate:
          attendanceRates.length > 0 ? Math.min(...attendanceRates) : 0,
        totalExpectedAttendees: summary.reduce(
          (sum, s) => sum + s.totalExpected,
          0
        ),
        totalActualAttendees: summary.reduce(
          (sum, s) => sum + s.actualAttendees,
          0
        ),
        perfectAttendanceActivities: summary.filter(
          (s) => s.attendanceRate === 100
        ).length,
      };
      reportData = {
        format: 'summary',
        summary: summary.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        ),
        overallStats,
      };
    } else if (format === 'detailed') {
      // Detailed member-by-member report
      const activeMembers = includeInactive
        ? group.members
        : group.members.filter((m) => m.isActive !== false);

      const memberAttendance = activeMembers.map((member) => {
        // Get all activities this member was invited to
        const invitedActivities = activities.filter((activity) =>
          activity.plannedParticipants?.some(
            (p) => p.toString() === member.userId._id.toString()
          )
        );
        const memberRecords = invitedActivities.map((activity) => {
          const attendanceRecord = activity.attendance?.find(
            (a) => a.userId._id?.toString() === member.userId._id?.toString()
          );
          return {
            activityId: activity._id,
            activityTitle: activity.title,
            activityDate: activity.date,
            activityType: activity.type,
            activityLocation: activity.location,
            wasInvited: true,
            attendance: attendanceRecord
              ? {
                  status: attendanceRecord.status,
                  markedAt: attendanceRecord.markedAt,
                  markedBy: attendanceRecord.markedBy,
                  notes: attendanceRecord.notes,
                }
              : null,
          };
        });
        const presentCount = memberRecords.filter(
          (r) => r.attendance?.status === AttendanceStatus.PRESENT
        ).length;
        const lateCount = memberRecords.filter(
          (r) => r.attendance?.status === AttendanceStatus.LATE
        ).length;
        const absentCount = memberRecords.filter(
          (r) =>
            r.attendance?.status === AttendanceStatus.ABSENT || !r.attendance
        ).length;
        const excusedCount = memberRecords.filter(
          (r) => r.attendance?.status === AttendanceStatus.EXCUSED
        ).length;
        const totalInvited = memberRecords.length;
        const actualAttendance = presentCount + lateCount;
        const attendanceRate =
          totalInvited > 0
            ? Math.round((actualAttendance / totalInvited) * 100)
            : 0;
        // Calculate attendance streak
        let currentStreak = 0;
        let longestStreak = 0;
        let tempStreak = 0;
        const sortedRecords = memberRecords.sort(
          (a, b) =>
            new Date(a.activityDate).getTime() -
            new Date(b.activityDate).getTime()
        );
        for (const record of sortedRecords) {
          const wasPresent =
            record.attendance?.status === AttendanceStatus.PRESENT ||
            record.attendance?.status === AttendanceStatus.LATE;
          if (wasPresent) {
            tempStreak++;
            longestStreak = Math.max(longestStreak, tempStreak);
          } else {
            tempStreak = 0;
          }
        }
        // Calculate current streak from most recent activities
        for (let i = sortedRecords.length - 1; i >= 0; i--) {
          const record = sortedRecords[i];
          const wasPresent =
            record.attendance?.status === AttendanceStatus.PRESENT ||
            record.attendance?.status === AttendanceStatus.LATE;
          if (wasPresent) {
            currentStreak++;
          } else {
            break;
          }
        }
        return {
          member: {
            userId: member.userId._id,
            firstName: member.userId.firstName,
            lastName: member.userId.lastName,
            email: member.userId.email,
            role: member.role,
            joinedDate: member.joinedDate,
            isActive: member.isActive,
          },
          statistics: {
            totalInvited,
            present: presentCount,
            late: lateCount,
            absent: absentCount,
            excused: excusedCount,
            actualAttendance,
            attendanceRate,
            currentStreak,
            longestStreak,
          },
          records: memberRecords.sort(
            (a, b) =>
              new Date(b.activityDate).getTime() -
              new Date(a.activityDate).getTime()
          ),
        };
      });
      reportData = {
        format: 'detailed',
        memberAttendance: memberAttendance.sort(
          (a, b) => b.statistics.attendanceRate - a.statistics.attendanceRate
        ),
        memberStats: {
          totalMembers: memberAttendance.length,
          averageAttendanceRate:
            memberAttendance.length > 0
              ? Math.round(
                  memberAttendance.reduce(
                    (sum, m) => sum + m.statistics.attendanceRate,
                    0
                  ) / memberAttendance.length
                )
              : 0,
          perfectAttendanceMembers: memberAttendance.filter(
            (m) => m.statistics.attendanceRate === 100
          ).length,
          lowAttendanceMembers: memberAttendance.filter(
            (m) => m.statistics.attendanceRate < 50
          ).length,
        },
      };
    } else if (format === 'trends') {
      // Trends and analytics report
      const monthlyTrends: { [key: string]: any } = {};
      activities.forEach((activity) => {
        const monthKey = activity.date.toISOString().substring(0, 7); // YYYY-MM
        const monthName = activity.date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
        });
        if (!monthlyTrends[monthKey]) {
          monthlyTrends[monthKey] = {
            month: monthKey,
            monthName,
            totalActivities: 0,
            totalExpected: 0,
            totalActual: 0,
            averageAttendanceRate: 0,
            activities: [],
          };
        }
        const expected = activity.plannedParticipants?.length || 0;
        const actual = (activity.attendance || []).filter(
          (a) =>
            a.status === AttendanceStatus.PRESENT ||
            a.status === AttendanceStatus.LATE
        ).length;
        monthlyTrends[monthKey].totalActivities++;
        monthlyTrends[monthKey].totalExpected += expected;
        monthlyTrends[monthKey].totalActual += actual;
        monthlyTrends[monthKey].activities.push({
          title: activity.title,
          date: activity.date,
          expected,
          actual,
          rate: expected > 0 ? Math.round((actual / expected) * 100) : 0,
        });
      });
      // Calculate monthly averages
      Object.values(monthlyTrends).forEach((trend: any) => {
        trend.averageAttendanceRate =
          trend.totalExpected > 0
            ? Math.round((trend.totalActual / trend.totalExpected) * 100)
            : 0;
      });
      reportData = {
        format: 'trends',
        monthlyTrends: Object.values(monthlyTrends).sort((a: any, b: any) =>
          a.month.localeCompare(b.month)
        ),
        trendAnalysis: {
          totalMonths: Object.keys(monthlyTrends).length,
          bestMonth: Object.values(monthlyTrends).reduce(
            (best: any, current: any) =>
              current.averageAttendanceRate > best.averageAttendanceRate
                ? current
                : best,
            { averageAttendanceRate: 0 }
          ),
          averageMonthlyRate:
            Object.values(monthlyTrends).length > 0
              ? Math.round(
                  Object.values(monthlyTrends).reduce(
                    (sum: number, trend: any) =>
                      sum + trend.averageAttendanceRate,
                    0
                  ) / Object.values(monthlyTrends).length
                )
              : 0,
        },
      };
    }
    contextLogger.info('Attendance report generated successfully', {
      groupId,
      format,
      totalActivities: activities.length,
      dateRange: { startDate, endDate },
      includeInactive,
      minActivities,
    });
    return NextResponse.json({
      success: true,
      data: {
        ...reportData,
        filters: {
          dateRange: { startDate, endDate },
          format,
          includeInactive,
          minActivities,
        },
        metadata: {
          generatedAt: new Date().toISOString(),
          totalActivities: activities.length,
          groupName: group.name,
          groupId: group._id,
        },
      },
    });
  } catch (error: any) {
    contextLogger.error(
      'Unexpected error in getAttendanceReportHandler',
      error
    );
    if (error.name === 'CastError') {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }
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

// Export the handler wrapped with logging middleware
export const GET = withApiLogger(getAttendanceReportHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});
