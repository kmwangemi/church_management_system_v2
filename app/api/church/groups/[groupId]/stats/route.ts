import { requireAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { withApiLogger } from '@/lib/middleware/api-logger';
import dbConnect from '@/lib/mongodb';
import { GroupModel } from '@/models';
import { AttendanceStatus, GroupGoalStatus } from '@/models/group';
import mongoose from 'mongoose';
import { type NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  params: {
    groupId: string;
  };
}

// GET /api/church/groups/[groupId]/stats - Get group statistics
async function getGroupStatsHandler(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { groupId } = await params;
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    { requestId, endpoint: `/api/church/groups/${groupId}/stats` },
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
    const period = searchParams.get('period') || '30'; // days for recent stats
    const includeInactive = searchParams.get('includeInactive') === 'true';
    const detailed = searchParams.get('detailed') === 'true';
    // Validate query parameters
    const periodDays = Number.parseInt(period, 10);
    if (Number.isNaN(periodDays) || periodDays < 1 || periodDays > 365) {
      return NextResponse.json(
        { error: 'Period must be between 1 and 365 days' },
        { status: 400 }
      );
    }
    // Check if group exists and belongs to the user's church
    const group = await GroupModel.findOne({
      _id: groupId,
      churchId: user.user.churchId,
    })
      .populate('members.userId', 'firstName lastName email joinedDate')
      .populate('goals.createdBy', 'firstName lastName')
      .populate('goals.assignee', 'firstName lastName');
    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }
    const now = new Date();
    const periodStart = new Date(
      now.getTime() - periodDays * 24 * 60 * 60 * 1000
    );
    // Filter members based on includeInactive
    const members = includeInactive
      ? group.members
      : group.members.filter((m) => m.isActive !== false);
    // Filter activities based on includeInactive
    const activities = includeInactive
      ? group.activities
      : group.activities.filter((a) => a.isActive !== false);
    // Recent activities (within the specified period)
    const recentActivities = activities.filter(
      (activity) => activity.date >= periodStart
    );
    // Calculate attendance statistics for recent activities
    const attendanceData = recentActivities.flatMap(
      (activity) => activity.attendance || []
    );
    const totalAttendanceRecords = attendanceData.length;
    const presentRecords = attendanceData.filter(
      (record) =>
        record.status === AttendanceStatus.PRESENT ||
        record.status === AttendanceStatus.LATE
    ).length;
    const lateRecords = attendanceData.filter(
      (record) => record.status === AttendanceStatus.LATE
    ).length;
    const absentRecords = attendanceData.filter(
      (record) => record.status === AttendanceStatus.ABSENT
    ).length;
    const excusedRecords = attendanceData.filter(
      (record) => record.status === AttendanceStatus.EXCUSED
    ).length;
    // Activity statistics
    const upcomingActivities = activities.filter(
      (activity) =>
        activity.date > now && !activity.isCompleted && !activity.isCancelled
    );
    const completedActivities = activities.filter(
      (activity) => activity.isCompleted
    );
    const cancelledActivities = activities.filter(
      (activity) => activity.isCancelled
    );
    // Goals statistics
    const goals = group.goals || [];
    const activeGoals = goals.filter(
      (goal) =>
        goal.status === GroupGoalStatus.IN_PROGRESS ||
        goal.status === GroupGoalStatus.PLANNED
    );
    const completedGoals = goals.filter(
      (goal) => goal.status === GroupGoalStatus.COMPLETED
    );
    const overdueGoals = goals.filter(
      (goal) =>
        goal.status !== GroupGoalStatus.COMPLETED &&
        goal.status !== GroupGoalStatus.CANCELLED &&
        new Date(goal.targetDate) < now
    );
    // Member statistics
    const membersJoinedRecently = members.filter(
      (member) => new Date(member.joinedDate) >= periodStart
    ).length;
    const activeMembers = members.filter((m) => m.isActive !== false);
    const inactiveMembers = members.filter((m) => m.isActive === false);
    // Calculate member role distribution
    const roleDistribution = members.reduce(
      (acc, member) => {
        acc[member.role] = (acc[member.role] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );
    // Base statistics
    const baseStats = {
      // Member statistics
      totalMembers: members.length,
      activeMembers: activeMembers.length,
      inactiveMembers: inactiveMembers.length,
      membersJoinedRecently,
      roleDistribution,
      // Activity statistics
      totalActivities: activities.length,
      completedActivities: completedActivities.length,
      upcomingActivities: upcomingActivities.length,
      cancelledActivities: cancelledActivities.length,
      activitiesInPeriod: recentActivities.length,
      // Attendance statistics
      recentAttendanceRate:
        totalAttendanceRecords > 0
          ? Math.round((presentRecords / totalAttendanceRecords) * 100)
          : 0,
      totalAttendanceRecords,
      presentRecords,
      lateRecords,
      absentRecords,
      excusedRecords,
      // Goals statistics
      totalGoals: goals.length,
      activeGoals: activeGoals.length,
      completedGoals: completedGoals.length,
      overdueGoals: overdueGoals.length,
      goalCompletionRate:
        goals.length > 0
          ? Math.round((completedGoals.length / goals.length) * 100)
          : 0,

      // General group info
      groupCreated: group.createdAt,
      lastActivity:
        activities.length > 0
          ? activities.sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            )[0].date
          : null,
    };
    // Detailed analytics (only if requested)
    let detailedAnalytics = {};
    if (detailed) {
      // Monthly trends for the past 6 months
      const monthlyTrends = calculateMonthlyTrends(activities, 6);
      // Member engagement analysis
      const memberEngagement = calculateMemberEngagement(
        members,
        activities,
        periodStart
      );
      // Activity type distribution
      const activityTypeStats = activities.reduce(
        (acc, activity) => {
          acc[activity.type] = (acc[activity.type] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );
      // Goals by priority
      const goalsByPriority = goals.reduce(
        (acc, goal) => {
          acc[goal.priority || 'medium'] =
            (acc[goal.priority || 'medium'] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );
      // Performance indicators
      const performanceIndicators = {
        memberRetentionRate: calculateRetentionRate(members, periodDays),
        averageActivityAttendance:
          recentActivities.length > 0
            ? Math.round(
                recentActivities.reduce(
                  (sum, activity) =>
                    sum + (activity.actualParticipants?.length || 0),
                  0
                ) / recentActivities.length
              )
            : 0,
        goalAchievementRate:
          goals.length > 0
            ? Math.round((completedGoals.length / goals.length) * 100)
            : 0,
        memberEngagementScore: calculateEngagementScore(memberEngagement),
      };
      detailedAnalytics = {
        monthlyTrends,
        memberEngagement: memberEngagement.slice(0, 10), // Top 10 most engaged
        activityTypeDistribution: activityTypeStats,
        goalsByPriority,
        performanceIndicators,
        topPerformers: {
          mostActiveMembers: memberEngagement
            .sort((a, b) => b.engagementScore - a.engagementScore)
            .slice(0, 5),
          bestAttendanceMembers: memberEngagement
            .sort((a, b) => b.attendanceRate - a.attendanceRate)
            .slice(0, 5),
        },
      };
    }
    // Health score calculation
    const healthScore = calculateGroupHealthScore({
      memberGrowthRate:
        (membersJoinedRecently /
          Math.max(1, members.length - membersJoinedRecently)) *
        100,
      attendanceRate: baseStats.recentAttendanceRate,
      activityFrequency: recentActivities.length / (periodDays / 7), // activities per week
      goalCompletionRate: baseStats.goalCompletionRate,
      memberEngagementRate: detailed
        ? detailedAnalytics.performanceIndicators.memberEngagementScore
        : 0,
    });
    contextLogger.info('Group statistics generated successfully', {
      groupId,
      totalMembers: baseStats.totalMembers,
      recentAttendanceRate: baseStats.recentAttendanceRate,
      period: periodDays,
      detailed,
      healthScore,
    });
    return NextResponse.json({
      success: true,
      data: {
        groupId: group._id,
        groupName: group.name,
        ...baseStats,
        healthScore,
        ...(detailed && { analytics: detailedAnalytics }),
        metadata: {
          period: periodDays,
          includeInactive,
          detailed,
          generatedAt: now.toISOString(),
          calculationPeriod: {
            start: periodStart.toISOString(),
            end: now.toISOString(),
          },
        },
      },
    });
  } catch (error: any) {
    contextLogger.error('Unexpected error in getGroupStatsHandler', error);
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

// Helper functions
function calculateMonthlyTrends(activities: any[], months: number): any[] {
  const trends = [];
  const now = new Date();
  for (let i = 0; i < months; i++) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
    const monthActivities = activities.filter(
      (activity) => activity.date >= monthStart && activity.date <= monthEnd
    );
    const monthAttendance = monthActivities.flatMap((a) => a.attendance || []);
    const presentCount = monthAttendance.filter(
      (a) =>
        a.status === AttendanceStatus.PRESENT ||
        a.status === AttendanceStatus.LATE
    ).length;
    trends.unshift({
      month: monthStart.toISOString().substring(0, 7),
      monthName: monthStart.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
      }),
      activities: monthActivities.length,
      attendanceRate:
        monthAttendance.length > 0
          ? Math.round((presentCount / monthAttendance.length) * 100)
          : 0,
    });
  }
  return trends;
}

function calculateMemberEngagement(
  members: any[],
  activities: any[],
  periodStart: Date
): any[] {
  return members.map((member) => {
    const memberActivities = activities.filter(
      (activity) =>
        activity.actualParticipants?.some(
          (p: any) => p.toString() === member.userId._id.toString()
        ) ||
        activity.plannedParticipants?.some(
          (p: any) => p.toString() === member.userId._id.toString()
        )
    );
    const recentActivities = memberActivities.filter(
      (activity) => activity.date >= periodStart
    );
    const attendanceRecords = activities.flatMap((activity) =>
      (activity.attendance || []).filter(
        (a: any) => a.userId.toString() === member.userId._id.toString()
      )
    );
    const presentCount = attendanceRecords.filter(
      (a: any) =>
        a.status === AttendanceStatus.PRESENT ||
        a.status === AttendanceStatus.LATE
    ).length;
    const attendanceRate =
      attendanceRecords.length > 0
        ? Math.round((presentCount / attendanceRecords.length) * 100)
        : 0;
    const engagementScore = calculateIndividualEngagementScore({
      attendanceRate,
      recentActivityCount: recentActivities.length,
      totalInvitations: memberActivities.length,
      memberSince: new Date(member.joinedDate),
    });
    return {
      member: {
        userId: member.userId._id,
        firstName: member.userId.firstName,
        lastName: member.userId.lastName,
        email: member.userId.email,
        role: member.role,
      },
      totalActivities: memberActivities.length,
      recentActivities: recentActivities.length,
      attendanceRate,
      engagementScore,
      lastActivity:
        recentActivities.length > 0
          ? recentActivities.sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            )[0].date
          : null,
    };
  });
}

function calculateIndividualEngagementScore(data: {
  attendanceRate: number;
  recentActivityCount: number;
  totalInvitations: number;
  memberSince: Date;
}): number {
  const { attendanceRate, recentActivityCount, totalInvitations, memberSince } =
    data;
  // Base score from attendance rate (0-40 points)
  let score = (attendanceRate / 100) * 40;
  // Recent activity participation (0-30 points)
  const recentParticipationRate =
    totalInvitations > 0
      ? (recentActivityCount / Math.min(totalInvitations, 10)) * 30
      : 0;
  score += recentParticipationRate;
  // Consistency bonus (0-20 points) - higher for longer-term consistent members
  const membershipMonths = Math.max(
    1,
    (Date.now() - memberSince.getTime()) / (1000 * 60 * 60 * 24 * 30)
  );
  const consistencyBonus = Math.min(
    20,
    (attendanceRate / 100) * (membershipMonths / 12) * 20
  );
  score += consistencyBonus;
  // Activity diversity bonus (0-10 points)
  const diversityBonus = Math.min(10, recentActivityCount * 2);
  score += diversityBonus;
  return Math.round(Math.min(100, score));
}

function calculateRetentionRate(members: any[], periodDays: number): number {
  const periodStart = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000);
  const membersAtStart = members.filter(
    (m) => new Date(m.joinedDate) < periodStart
  );
  const stillActiveMembers = membersAtStart.filter((m) => m.isActive !== false);
  return membersAtStart.length > 0
    ? Math.round((stillActiveMembers.length / membersAtStart.length) * 100)
    : 100;
}

function calculateEngagementScore(memberEngagement: any[]): number {
  if (memberEngagement.length === 0) return 0;
  const averageEngagement =
    memberEngagement.reduce((sum, member) => sum + member.engagementScore, 0) /
    memberEngagement.length;
  return Math.round(averageEngagement);
}

function calculateGroupHealthScore(metrics: {
  memberGrowthRate: number;
  attendanceRate: number;
  activityFrequency: number;
  goalCompletionRate: number;
  memberEngagementRate: number;
}): number {
  const {
    memberGrowthRate,
    attendanceRate,
    activityFrequency,
    goalCompletionRate,
    memberEngagementRate,
  } = metrics;
  // Weighted scoring system (total 100 points)
  let score = 0;
  // Attendance rate (25 points)
  score += (attendanceRate / 100) * 25;
  // Member engagement (25 points)
  score += (memberEngagementRate / 100) * 25;
  // Goal completion (20 points)
  score += (goalCompletionRate / 100) * 20;
  // Activity frequency (15 points) - aim for 1-2 activities per week
  const optimalFrequency = 1.5;
  const frequencyScore = Math.min(1, activityFrequency / optimalFrequency);
  score += frequencyScore * 15;
  // Member growth (15 points) - healthy growth is 5-20% per period
  const growthScore =
    memberGrowthRate > 0 ? Math.min(1, Math.min(memberGrowthRate, 20) / 20) : 0;
  score += growthScore * 15;
  return Math.round(Math.min(100, Math.max(0, score)));
}

// Export the handler wrapped with logging middleware
export const GET = withApiLogger(getGroupStatsHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});
