// api/church/groups/[id]/members/[userId]/attendance/route.ts
import { connectDB } from '@/lib/mongodb';
import Group, { AttendanceStatus } from '@/models/Group';
import { type NextRequest, NextResponse } from 'next/server';

// GET /api/church/groups/[id]/members/[userId]/attendance - Get member attendance history
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; userId: string } }
) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const group = await Group.findById(params.id)
      .populate('members.userId', 'firstName lastName')
      .populate('activities.organizedBy', 'firstName lastName');

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    // Check if user is a member
    const member = group.members.find(
      (m) => m.userId.toString() === params.userId
    );

    if (!member) {
      return NextResponse.json(
        { error: 'User is not a member of this group' },
        { status: 404 }
      );
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

    // Get attendance records for this user
    const attendanceHistory = activities
      .map((activity) => {
        const attendanceRecord = activity.attendance.find(
          (a) => a.userId.toString() === params.userId
        );

        return {
          activityId: activity._id,
          title: activity.title,
          type: activity.type,
          date: activity.date,
          wasInvited: activity.plannedParticipants.some(
            (p) => p.toString() === params.userId
          ),
          attendance: attendanceRecord || null,
        };
      })
      .filter((record) => record.wasInvited) // Only show activities they were invited to
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Calculate statistics
    const totalInvited = attendanceHistory.length;
    const totalPresent = attendanceHistory.filter(
      (h) => h.attendance?.status === AttendanceStatus.PRESENT
    ).length;
    const totalLate = attendanceHistory.filter(
      (h) => h.attendance?.status === AttendanceStatus.LATE
    ).length;
    const totalAbsent = attendanceHistory.filter(
      (h) => h.attendance?.status === AttendanceStatus.ABSENT || !h.attendance
    ).length;

    const attendanceRate =
      totalInvited > 0
        ? Math.round(((totalPresent + totalLate) / totalInvited) * 100)
        : 0;

    // Recent attendance trend (last 5 activities)
    const recentActivities = attendanceHistory.slice(0, 5);
    const recentAttendanceRate =
      recentActivities.length > 0
        ? Math.round(
            (recentActivities.filter(
              (h) =>
                h.attendance?.status === AttendanceStatus.PRESENT ||
                h.attendance?.status === AttendanceStatus.LATE
            ).length /
              recentActivities.length) *
              100
          )
        : 0;

    return NextResponse.json({
      member: {
        userId: member.userId,
        role: member.role,
        joinedDate: member.joinedDate,
        isActive: member.isActive,
      },
      stats: {
        totalInvited,
        totalPresent,
        totalLate,
        totalAbsent,
        attendanceRate,
        recentAttendanceRate,
      },
      attendanceHistory,
      dateRange: { startDate, endDate },
    });
  } catch (error) {
    console.error('Error fetching member attendance:', error);
    return NextResponse.json(
      { error: 'Failed to fetch member attendance' },
      { status: 500 }
    );
  }
}
