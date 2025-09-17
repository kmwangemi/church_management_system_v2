import { requireAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { withApiLogger } from '@/lib/middleware/api-logger';
import dbConnect from '@/lib/mongodb';
import { GroupModel } from '@/models';
import { GroupGoalStatus } from '@/models/group';
import mongoose from 'mongoose';
import { type NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  params: {
    groupId: string;
  };
}

// GET /api/church/groups/[groupId]/reports/goals - Goals progress report
async function getGoalsReportHandler(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { groupId } = await params;
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    { requestId, endpoint: `/api/church/groups/${groupId}/reports/goals` },
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
    const includeCompleted = searchParams.get('includeCompleted') !== 'false';
    const priority = searchParams.get('priority'); // 'low' | 'medium' | 'high'
    const status = searchParams.get('status'); // filter by specific status
    const assignedTo = searchParams.get('assignedTo'); // filter by assignee
    const dueSoon = Number.parseInt(searchParams.get('dueSoon') || '0', 10); // days
    // Validate query parameters
    if (priority && !['low', 'medium', 'high'].includes(priority)) {
      return NextResponse.json(
        { error: 'Invalid priority. Must be one of: low, medium, high' },
        { status: 400 }
      );
    }
    if (
      status &&
      !Object.values(GroupGoalStatus).includes(status as GroupGoalStatus)
    ) {
      return NextResponse.json(
        {
          error: `Invalid status. Must be one of: ${Object.values(GroupGoalStatus).join(', ')}`,
        },
        { status: 400 }
      );
    }
    if (assignedTo && !mongoose.Types.ObjectId.isValid(assignedTo)) {
      return NextResponse.json(
        { error: 'Invalid assignedTo user ID format' },
        { status: 400 }
      );
    }
    if (dueSoon < 0 || dueSoon > 365) {
      return NextResponse.json(
        { error: 'dueSoon must be between 0 and 365 days' },
        { status: 400 }
      );
    }
    // Check if group exists and belongs to the user's church
    const group = await GroupModel.findOne({
      _id: groupId,
      churchId: user.user.churchId,
    })
      .populate('goals.createdBy', 'firstName lastName email')
      .populate('goals.assignedTo', 'firstName lastName email');
    // .populate('goals.milestones.assignedTo', 'firstName lastName');
    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }
    let goals = [...(group.goals || [])];
    // Apply filters
    if (!includeCompleted) {
      goals = goals.filter((goal) => goal.status !== GroupGoalStatus.COMPLETED);
    }
    if (priority) {
      goals = goals.filter((goal) => goal.priority === priority);
    }
    if (status) {
      goals = goals.filter((goal) => goal.status === status);
    }
    if (assignedTo) {
      goals = goals.filter((goal) =>
        goal.assignedTo?.some((user) => user._id?.toString() === assignedTo)
      );
    }
    if (dueSoon > 0) {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + dueSoon);
      goals = goals.filter(
        (goal) =>
          new Date(goal.targetDate) <= dueDate &&
          goal.status !== GroupGoalStatus.COMPLETED &&
          goal.status !== GroupGoalStatus.CANCELLED
      );
    }
    // Calculate goal statistics
    const now = new Date();
    const goalStats = {
      total: goals.length,
      planned: goals.filter((g) => g.status === GroupGoalStatus.PLANNED).length,
      inProgress: goals.filter((g) => g.status === GroupGoalStatus.IN_PROGRESS)
        .length,
      completed: goals.filter((g) => g.status === GroupGoalStatus.COMPLETED)
        .length,
      cancelled: goals.filter((g) => g.status === GroupGoalStatus.CANCELLED)
        .length,
      onHold: goals.filter((g) => g.status === GroupGoalStatus.ON_HOLD).length,
      overdue: goals.filter(
        (g) =>
          g.status !== GroupGoalStatus.COMPLETED &&
          g.status !== GroupGoalStatus.CANCELLED &&
          new Date(g.targetDate) < now
      ).length,
      dueSoon: goals.filter((g) => {
        const daysUntilDue = Math.ceil(
          (new Date(g.targetDate).getTime() - now.getTime()) /
            (1000 * 60 * 60 * 24)
        );
        return (
          daysUntilDue >= 0 &&
          daysUntilDue <= 7 &&
          g.status !== GroupGoalStatus.COMPLETED &&
          g.status !== GroupGoalStatus.CANCELLED
        );
      }).length,
    };
    // Calculate progress statistics
    const activeGoals = goals.filter(
      (g) =>
        g.status === GroupGoalStatus.IN_PROGRESS ||
        g.status === GroupGoalStatus.PLANNED
    );
    const averageProgress =
      activeGoals.length > 0
        ? Math.round(
            activeGoals.reduce((sum, goal) => sum + (goal.progress || 0), 0) /
              activeGoals.length
          )
        : 0;
    // Priority distribution
    const priorityStats = {
      high: goals.filter((g) => g.priority === 'high').length,
      medium: goals.filter((g) => g.priority === 'medium').length,
      low: goals.filter((g) => g.priority === 'low').length,
    };
    // Goal details with enhanced milestone tracking
    const goalDetails = goals.map((goal) => {
      const totalMilestones = goal.milestones?.length || 0;
      const completedMilestones =
        goal.milestones?.filter((m) => m.isCompleted).length || 0;
      const milestoneProgress =
        totalMilestones > 0
          ? Math.round((completedMilestones / totalMilestones) * 100)
          : 0;
      const isOverdue =
        goal.status !== GroupGoalStatus.COMPLETED &&
        goal.status !== GroupGoalStatus.CANCELLED &&
        new Date(goal.targetDate) < now;
      const daysRemaining = Math.ceil(
        (new Date(goal.targetDate).getTime() - now.getTime()) /
          (1000 * 60 * 60 * 24)
      );
      // Calculate milestone statistics
      const overdueMilestones =
        goal.milestones?.filter(
          (m) => !m.isCompleted && new Date(m.dueDate) < now
        ).length || 0;
      const upcomingMilestones =
        goal.milestones?.filter((m) => {
          const daysToDue = Math.ceil(
            (new Date(m.dueDate).getTime() - now.getTime()) /
              (1000 * 60 * 60 * 24)
          );
          return !m.isCompleted && daysToDue >= 0 && daysToDue <= 7;
        }).length || 0;
      return {
        _id: goal._id,
        title: goal.title,
        description: goal.description,
        status: goal.status,
        priority: goal.priority,
        progress: goal.progress || 0,
        targetDate: goal.targetDate,
        createdAt: goal.createdAt,
        updatedAt: goal.updatedAt,
        createdBy: goal.createdBy,
        assignedTo: goal.assignedTo,
        category: goal.category,
        tags: goal.tags,
        milestoneProgress,
        completedMilestones,
        totalMilestones,
        overdueMilestones,
        upcomingMilestones,
        isOverdue,
        daysRemaining,
        healthScore: calculateGoalHealth(goal, isOverdue, milestoneProgress),
      };
    });
    // Progress timeline (configurable period)
    const timelineDays = Number.parseInt(
      searchParams.get('timelineDays') || '30',
      10
    );
    const timelineStart = new Date(
      now.getTime() - timelineDays * 24 * 60 * 60 * 1000
    );
    const recentUpdates = goals
      .filter((goal) => new Date(goal.updatedAt) >= timelineStart)
      .map((goal) => ({
        goalId: goal._id,
        title: goal.title,
        progress: goal.progress || 0,
        status: goal.status,
        priority: goal.priority,
        updatedAt: goal.updatedAt,
        updatedBy: goal.updatedBy,
      }))
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    // Team performance analysis
    const teamPerformance = calculateTeamPerformance(goals);
    contextLogger.info('Goals report generated successfully', {
      groupId,
      totalGoals: goals.length,
      averageProgress,
      overdueGoals: goalStats.overdue,
      filters: { includeCompleted, priority, status, assignedTo, dueSoon },
    });
    return NextResponse.json({
      success: true,
      data: {
        stats: {
          ...goalStats,
          averageProgress,
          completionRate:
            goalStats.total > 0
              ? Math.round((goalStats.completed / goalStats.total) * 100)
              : 0,
          priorityDistribution: priorityStats,
          teamPerformance,
        },
        goals: goalDetails.sort((a, b) => {
          // Sort by priority (high first), then by due date
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          const aPriority = priorityOrder[a.priority] || 0;
          const bPriority = priorityOrder[b.priority] || 0;
          if (aPriority !== bPriority) {
            return bPriority - aPriority;
          }
          return (
            new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime()
          );
        }),
        recentUpdates,
        filters: {
          includeCompleted,
          priority,
          status,
          assignedTo,
          dueSoon,
          timelineDays,
        },
        metadata: {
          generatedAt: now.toISOString(),
          groupName: group.name,
          groupId: group._id,
        },
      },
    });
  } catch (error: any) {
    contextLogger.error('Unexpected error in getGoalsReportHandler', error);
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

// Helper function to calculate goal health score
function calculateGoalHealth(
  goal: any,
  isOverdue: boolean,
  milestoneProgress: number
): number {
  let healthScore = 100;
  // Reduce score for overdue goals
  if (isOverdue) {
    healthScore -= 30;
  }
  // Adjust based on progress vs time elapsed
  const now = new Date();
  const created = new Date(goal.createdAt);
  const target = new Date(goal.targetDate);
  const totalDuration = target.getTime() - created.getTime();
  const elapsed = now.getTime() - created.getTime();
  const expectedProgress =
    totalDuration > 0 ? (elapsed / totalDuration) * 100 : 0;
  const progressDifference = (goal.progress || 0) - expectedProgress;
  if (progressDifference < -20) {
    healthScore -= 25; // Significantly behind
  } else if (progressDifference < -10) {
    healthScore -= 15; // Behind schedule
  } else if (progressDifference > 10) {
    healthScore += 10; // Ahead of schedule
  }
  // Adjust for milestone completion
  if (milestoneProgress < 50 && (goal.progress || 0) > 50) {
    healthScore -= 10; // Progress not reflected in milestones
  }
  return Math.max(0, Math.min(100, healthScore));
}

// Helper function to calculate team performance
function calculateTeamPerformance(goals: any[]): any {
  const assigneePerformance: { [key: string]: any } = {};
  goals.forEach((goal) => {
    goal.assignedTo?.forEach((assignee: any) => {
      const assigneeId = assignee._id.toString();

      if (!assigneePerformance[assigneeId]) {
        assigneePerformance[assigneeId] = {
          assignee,
          totalGoals: 0,
          completedGoals: 0,
          averageProgress: 0,
          overdueGoals: 0,
          onTimeCompletions: 0,
        };
      }
      assigneePerformance[assigneeId].totalGoals++;
      if (goal.status === GroupGoalStatus.COMPLETED) {
        assigneePerformance[assigneeId].completedGoals++;
        // Check if completed on time
        if (new Date(goal.updatedAt) <= new Date(goal.targetDate)) {
          assigneePerformance[assigneeId].onTimeCompletions++;
        }
      }
      if (goal.isOverdue) {
        assigneePerformance[assigneeId].overdueGoals++;
      }
    });
  });
  // Calculate averages
  Object.values(assigneePerformance).forEach((perf: any) => {
    const activeGoals = goals.filter(
      (g) =>
        g.assignedTo?.some(
          (a: any) => a._id.toString() === perf.assignee._id.toString()
        ) &&
        g.status !== GroupGoalStatus.COMPLETED &&
        g.status !== GroupGoalStatus.CANCELLED
    );
    perf.averageProgress =
      activeGoals.length > 0
        ? Math.round(
            activeGoals.reduce((sum, g) => sum + (g.progress || 0), 0) /
              activeGoals.length
          )
        : 0;
    perf.completionRate =
      perf.totalGoals > 0
        ? Math.round((perf.completedGoals / perf.totalGoals) * 100)
        : 0;
    perf.onTimeRate =
      perf.completedGoals > 0
        ? Math.round((perf.onTimeCompletions / perf.completedGoals) * 100)
        : 0;
  });
  return Object.values(assigneePerformance);
}

// Export the handler wrapped with logging middleware
export const GET = withApiLogger(getGoalsReportHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});
