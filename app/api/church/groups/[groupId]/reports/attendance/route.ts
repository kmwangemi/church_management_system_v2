// api/church/groups/[id]/reports/attendance/route.ts
import { connectDB } from '@/lib/mongodb';
import Group, { AttendanceStatus } from '@/models/Group';
import { type NextRequest, NextResponse } from 'next/server';

// GET /api/church/groups/[id]/reports/attendance - Attendance reports
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const format = searchParams.get('format') || 'summary'; // 'summary' | 'detailed'

    const group = await Group.findById(params.id)
      .populate('activities.attendance.userId', 'firstName lastName')
      .populate('members.userId', 'firstName lastName');

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    let activities = [...group.activities];

    // Filter by date range
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      activities = activities.filter(
        (activity) => activity.date >= start && activity.date <= end
      );
    }

    if (format === 'summary') {
      // Summary report
      const summary = activities.map((activity) => {
        const totalExpected = activity.plannedParticipants.length;
        const totalPresent = activity.attendance.filter(
          (a) => a.status === AttendanceStatus.PRESENT
        ).length;
        const totalLate = activity.attendance.filter(
          (a) => a.status === AttendanceStatus.LATE
        ).length;
        const totalAbsent = activity.attendance.filter(
          (a) => a.status === AttendanceStatus.ABSENT
        ).length;

        return {
          activityId: activity._id,
          title: activity.title,
          date: activity.date,
          type: activity.type,
          totalExpected,
          totalPresent,
          totalLate,
          totalAbsent,
          attendanceRate:
            totalExpected > 0
              ? Math.round(((totalPresent + totalLate) / totalExpected) * 100)
              : 0,
        };
      });

      // Overall summary
      const overallStats = {
        totalActivities: activities.length,
        averageAttendanceRate:
          summary.length > 0
            ? Math.round(
                summary.reduce((sum, s) => sum + s.attendanceRate, 0) /
                  summary.length
              )
            : 0,
        totalMeetings: summary.length,
        bestAttendanceRate:
          summary.length > 0
            ? Math.max(...summary.map((s) => s.attendanceRate))
            : 0,
        worstAttendanceRate:
          summary.length > 0
            ? Math.min(...summary.map((s) => s.attendanceRate))
            : 0,
      };

      return NextResponse.json({
        summary,
        overallStats,
        dateRange: { startDate, endDate },
      });
    }
    // Detailed report
    const memberAttendance = group.members.map((member) => {
      const memberRecords = activities.flatMap((activity) =>
        activity.attendance
          .filter((a) => a.userId.toString() === member.userId.toString())
          .map((a) => ({
            ...a,
            activityTitle: activity.title,
            activityDate: activity.date,
            activityType: activity.type,
          }))
      );

      const presentCount = memberRecords.filter(
        (r) => r.status === AttendanceStatus.PRESENT
      ).length;
      const lateCount = memberRecords.filter(
        (r) => r.status === AttendanceStatus.LATE
      ).length;
      const absentCount = memberRecords.filter(
        (r) => r.status === AttendanceStatus.ABSENT
      ).length;

      return {
        member: member.userId,
        role: member.role,
        totalActivities: memberRecords.length,
        present: presentCount,
        late: lateCount,
        absent: absentCount,
        attendanceRate:
          memberRecords.length > 0
            ? Math.round(
                ((presentCount + lateCount) / memberRecords.length) * 100
              )
            : 0,
        records: memberRecords,
      };
    });

    return NextResponse.json({
      memberAttendance,
      dateRange: { startDate, endDate },
    });
  } catch (error) {
    console.error('Error generating attendance report:', error);
    return NextResponse.json(
      { error: 'Failed to generate attendance report' },
      { status: 500 }
    );
  }
}
