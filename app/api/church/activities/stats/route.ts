import { requireAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { withApiLogger } from '@/lib/middleware/api-logger';
import dbConnect from '@/lib/mongodb';
import { ActivityModel } from '@/models';
import { type NextRequest, NextResponse } from 'next/server';

// GET /api/activities/stats - Get activity statistics
async function getActivityStatsHandler(
  request: NextRequest
): Promise<NextResponse> {
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    { requestId, endpoint: '/api/church/activities/stats' },
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
    const year = searchParams.get('year'); // Filter by specific year
    const month = searchParams.get('month'); // Filter by specific month (1-12)
    // Build base query
    const baseQuery: any = { churchId: user.user.churchId };
    if (branchId) {
      baseQuery.branchId = branchId;
    }
    // Add date filters
    if (year || month) {
      const currentYear = year
        ? Number.parseInt(year, 10)
        : new Date().getFullYear();
      const startDate = new Date(
        currentYear,
        month ? Number.parseInt(month, 10) - 1 : 0,
        1
      );
      const endDate = month
        ? new Date(currentYear, Number.parseInt(month, 10), 0, 23, 59, 59, 999)
        : new Date(currentYear + 1, 0, 0, 23, 59, 59, 999);
      baseQuery.date = {
        $gte: startDate,
        $lte: endDate,
      };
    }
    // Run aggregation queries in parallel
    const [
      totalActivities,
      activitiesByStatus,
      activitiesByType,
      activitiesByBranch,
      activitiesByMonth,
      participantsStats,
      budgetStats,
      recentActivities,
      upcomingActivities,
    ] = await Promise.all([
      // Total activities
      ActivityModel.countDocuments(baseQuery),
      // Activities by status
      ActivityModel.aggregate([
        { $match: baseQuery },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalParticipants: { $sum: '$participants' },
            totalBudget: { $sum: { $ifNull: ['$budget', 0] } },
          },
        },
        { $sort: { count: -1 } },
      ]),
      // Activities by type
      ActivityModel.aggregate([
        { $match: baseQuery },
        {
          $group: {
            _id: '$type',
            count: { $sum: 1 },
            totalParticipants: { $sum: '$participants' },
            averageParticipants: { $avg: '$participants' },
            totalBudget: { $sum: { $ifNull: ['$budget', 0] } },
          },
        },
        { $sort: { count: -1 } },
      ]),
      // Activities by branch (if not filtering by specific branch)
      branchId
        ? []
        : ActivityModel.aggregate([
            { $match: baseQuery },
            {
              $group: {
                _id: '$branchId',
                count: { $sum: 1 },
                totalParticipants: { $sum: '$participants' },
                totalBudget: { $sum: { $ifNull: ['$budget', 0] } },
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
                totalParticipants: 1,
                totalBudget: 1,
                branchName: { $arrayElemAt: ['$branch.branchName', 0] },
              },
            },
            { $sort: { count: -1 } },
          ]),
      // Activities by month (for the current or specified year)
      ActivityModel.aggregate([
        { $match: baseQuery },
        {
          $group: {
            _id: {
              year: { $year: '$date' },
              month: { $month: '$date' },
            },
            count: { $sum: 1 },
            totalParticipants: { $sum: '$participants' },
            totalBudget: { $sum: { $ifNull: ['$budget', 0] } },
          },
        },
        { $sort: { '_id.year': -1, '_id.month': 1 } },
      ]),
      // Participants statistics
      ActivityModel.aggregate([
        { $match: baseQuery },
        {
          $group: {
            _id: null,
            totalParticipants: { $sum: '$participants' },
            averageParticipants: { $avg: '$participants' },
            maxParticipants: { $max: '$participants' },
            minParticipants: { $min: '$participants' },
          },
        },
      ]),
      // Budget statistics
      ActivityModel.aggregate([
        {
          $match: {
            ...baseQuery,
            budget: { $exists: true, $gt: 0 },
          },
        },
        {
          $group: {
            _id: null,
            totalBudget: { $sum: '$budget' },
            averageBudget: { $avg: '$budget' },
            maxBudget: { $max: '$budget' },
            minBudget: { $min: '$budget' },
            activitiesWithBudget: { $sum: 1 },
          },
        },
      ]),
      // Recent activities (last 30 days)
      ActivityModel.find({
        ...baseQuery,
        date: {
          $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          $lte: new Date(),
        },
      })
        .populate('branchId', 'branchName location')
        .sort({ date: -1 })
        .limit(5),
      // Upcoming activities (next 30 days)
      ActivityModel.find({
        ...baseQuery,
        date: {
          $gte: new Date(),
          $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Next 30 days
        },
        status: { $in: ['planned', 'ongoing'] },
      })
        .populate('branchId', 'branchName location')
        .sort({ date: 1 })
        .limit(5),
    ]);
    // Process month data for better display
    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    const processedMonthlyData = activitiesByMonth.map((item) => ({
      year: item._id.year,
      month: item._id.month,
      monthName: monthNames[item._id.month - 1],
      count: item.count,
      totalParticipants: item.totalParticipants,
      totalBudget: item.totalBudget,
    }));
    const stats = {
      summary: {
        total: totalActivities,
        totalParticipants: participantsStats[0]?.totalParticipants || 0,
        averageParticipants: Math.round(
          participantsStats[0]?.averageParticipants || 0
        ),
        totalBudget: budgetStats[0]?.totalBudget || 0,
        averageBudget: Math.round(budgetStats[0]?.averageBudget || 0),
        activitiesWithBudget: budgetStats[0]?.activitiesWithBudget || 0,
      },
      breakdown: {
        byStatus: activitiesByStatus,
        byType: activitiesByType,
        byBranch: activitiesByBranch,
        byMonth: processedMonthlyData,
      },
      participants: {
        total: participantsStats[0]?.totalParticipants || 0,
        average: Math.round(participantsStats[0]?.averageParticipants || 0),
        max: participantsStats[0]?.maxParticipants || 0,
        min: participantsStats[0]?.minParticipants || 0,
      },
      budget: budgetStats[0] || {
        totalBudget: 0,
        averageBudget: 0,
        maxBudget: 0,
        minBudget: 0,
        activitiesWithBudget: 0,
      },
      timeline: {
        recent: recentActivities,
        upcoming: upcomingActivities,
      },
    };
    contextLogger.info('Activity statistics retrieved', {
      totalActivities,
      branchFilter: branchId || 'all',
      yearFilter: year || 'all',
      monthFilter: month || 'all',
    });
    return NextResponse.json(stats);
  } catch (error) {
    contextLogger.error('Unexpected error in getActivityStatsHandler', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Export the handler wrapped with logging middleware
export const GET = withApiLogger(getActivityStatsHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});
