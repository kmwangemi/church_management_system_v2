// api/church/groups/[id]/stats/route.ts
import { connectDB } from '@/lib/mongodb';
import Group, { AttendanceStatus } from '@/models/Group';
import { type NextRequest, NextResponse } from 'next/server';

// GET /api/church/groups/[id]/stats - Get group statistics
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const group = await Group.findById(params.id);
    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Calculate additional stats
    const recentActivities = group.activities.filter(
      (activity) => activity.date >= thirtyDaysAgo
    );

    const attendanceData = recentActivities.flatMap(
      (activity) => activity.attendance
    );
    const totalAttendanceRecords = attendanceData.length;
    const presentRecords = attendanceData.filter(
      (record) =>
        record.status === AttendanceStatus.PRESENT ||
        record.status === AttendanceStatus.LATE
    ).length;

    const upcomingActivities = group.activities.filter(
      (activity) => activity.date > now && !activity.isCompleted
    );

    const completedActivities = group.activities.filter(
      (activity) => activity.isCompleted
    );

    const activeGoals = group.goals.filter(
      (goal) => goal.status === 'in_progress' || goal.status === 'planned'
    );

    const stats = {
      ...group.stats,
      recentStats: {
        activitiesLast30Days: recentActivities.length,
        attendanceRateLast30Days:
          totalAttendanceRecords > 0
            ? Math.round((presentRecords / totalAttendanceRecords) * 100)
            : 0,
        upcomingActivities: upcomingActivities.length,
        completedActivities: completedActivities.length,
        activeGoals: activeGoals.length,
        membersJoinedLast30Days: group.members.filter(
          (member) => member.joinedDate >= thirtyDaysAgo
        ).length,
      },
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching group stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch group stats' },
      { status: 500 }
    );
  }
}
