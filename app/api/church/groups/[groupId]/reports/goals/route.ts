// api/church/groups/[id]/reports/goals/route.ts
import { connectDB } from '@/lib/mongodb';
import Group, { GroupGoalStatus } from '@/models/Group';
import { type NextRequest, NextResponse } from 'next/server';

// GET /api/church/groups/[id]/reports/goals - Goals progress report
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const includeCompleted = searchParams.get('includeCompleted') !== 'false';

    const group = await Group.findById(params.id)
      .populate('goals.createdBy', 'firstName lastName')
      .populate('goals.assignedTo', 'firstName lastName');

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    let goals = [...group.goals];

    if (!includeCompleted) {
      goals = goals.filter((goal) => goal.status !== GroupGoalStatus.COMPLETED);
    }

    // Calculate goal statistics
    const goalStats = {
      total: goals.length,
      planned: goals.filter((g) => g.status === GroupGoalStatus.PLANNED).length,
      inProgress: goals.filter((g) => g.status === GroupGoalStatus.IN_PROGRESS)
        .length,
      completed: goals.filter((g) => g.status === GroupGoalStatus.COMPLETED)
        .length,
      cancelled: goals.filter((g) => g.status === GroupGoalStatus.CANCELLED)
        .length,
      overdue: goals.filter(
        (g) =>
          g.status !== GroupGoalStatus.COMPLETED &&
          g.status !== GroupGoalStatus.CANCELLED &&
          new Date(g.targetDate) < new Date()
      ).length,
    };

    // Average progress
    const activeGoals = goals.filter(
      (g) =>
        g.status === GroupGoalStatus.IN_PROGRESS ||
        g.status === GroupGoalStatus.PLANNED
    );

    const averageProgress =
      activeGoals.length > 0
        ? Math.round(
            activeGoals.reduce((sum, goal) => sum + goal.progress, 0) /
              activeGoals.length
          )
        : 0;

    // Goal details with milestone progress
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
        new Date(goal.targetDate) < new Date();

      return {
        ...goal.toObject(),
        milestoneProgress,
        completedMilestones,
        totalMilestones,
        isOverdue,
        daysRemaining: Math.ceil(
          (new Date(goal.targetDate).getTime() - new Date().getTime()) /
            (1000 * 60 * 60 * 24)
        ),
      };
    });

    // Progress timeline (last 30 days of updates)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentUpdates = goals
      .filter((goal) => new Date(goal.updatedAt) >= thirtyDaysAgo)
      .map((goal) => ({
        goalId: goal._id,
        title: goal.title,
        progress: goal.progress,
        status: goal.status,
        updatedAt: goal.updatedAt,
      }));

    return NextResponse.json({
      stats: {
        ...goalStats,
        averageProgress,
        completionRate:
          goalStats.total > 0
            ? Math.round((goalStats.completed / goalStats.total) * 100)
            : 0,
      },
      goals: goalDetails,
      recentUpdates,
    });
  } catch (error) {
    console.error('Error generating goals report:', error);
    return NextResponse.json(
      { error: 'Failed to generate goals report' },
      { status: 500 }
    );
  }
}
