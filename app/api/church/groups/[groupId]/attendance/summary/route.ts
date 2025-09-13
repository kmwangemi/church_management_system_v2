// api/church/groups/[id]/attendance/summary/route.ts
import { connectDB } from '@/lib/mongodb';
import Group, { AttendanceStatus } from '@/models/Group';
import { type NextRequest, NextResponse } from 'next/server';

// GET /api/church/groups/[id]/attendance/summary - Get attendance summary
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = Number.parseInt(searchParams.get('limit') || '10');

    const group = await Group.findById(params.id);
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

    // Sort by date and limit
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

      const attendanceRate =
        totalExpected > 0
          ? Math.round(((totalPresent + totalLate) / totalExpected) * 100)
          : 0;

      return {
        date: activity.date,
        activityId: activity._id,
        title: activity.title,
        type: activity.type,
        totalExpected,
        totalPresent,
        totalLate,
        totalAbsent,
        attendanceRate,
        records: attendance,
      };
    });

    // Overall statistics
    const overallStats = {
      totalActivities: summaries.length,
      averageAttendanceRate:
        summaries.length > 0
          ? Math.round(
              summaries.reduce((sum, s) => sum + s.attendanceRate, 0) /
                summaries.length
            )
          : 0,
      totalExpected: summaries.reduce((sum, s) => sum + s.totalExpected, 0),
      totalPresent: summaries.reduce((sum, s) => sum + s.totalPresent, 0),
      totalAbsent: summaries.reduce((sum, s) => sum + s.totalAbsent, 0),
      bestAttendance:
        summaries.length > 0
          ? Math.max(...summaries.map((s) => s.attendanceRate))
          : 0,
      worstAttendance:
        summaries.length > 0
          ? Math.min(...summaries.map((s) => s.attendanceRate))
          : 0,
    };

    return NextResponse.json({
      summaries,
      overallStats,
      dateRange: { startDate, endDate },
    });
  } catch (error) {
    console.error('Error fetching attendance summary:', error);
    return NextResponse.json(
      { error: 'Failed to fetch attendance summary' },
      { status: 500 }
    );
  }
}
