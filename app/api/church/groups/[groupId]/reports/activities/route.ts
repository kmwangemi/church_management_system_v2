import { requireAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { withApiLogger } from '@/lib/middleware/api-logger';
import dbConnect from '@/lib/mongodb';
import { GroupModel } from '@/models';
import mongoose from 'mongoose';
import { type NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  params: {
    groupId: string;
  };
}

// GET /api/church/groups/[groupId]/reports/activities - Activity reports
async function getActivitiesReportHandler(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { groupId } = await params;
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    { requestId, endpoint: `/api/church/groups/${groupId}/reports/activities` },
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
    const groupBy = searchParams.get('groupBy') || 'month'; // 'month' | 'type' | 'organizer'
    const includeInactive = searchParams.get('includeInactive') === 'true';
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
    const validGroupByValues = ['month', 'type', 'organizer'];
    if (!validGroupByValues.includes(groupBy)) {
      return NextResponse.json(
        {
          error: `Invalid groupBy parameter. Must be one of: ${validGroupByValues.join(', ')}`,
        },
        { status: 400 }
      );
    }
    // Check if group exists and belongs to the user's church
    const group = await GroupModel.findOne({
      _id: groupId,
      churchId: user.user.churchId,
    }).populate('activities.organizedBy', 'firstName lastName email');
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
    let report: any = {};
    if (groupBy === 'month') {
      // Group by month
      const monthlyData: { [key: string]: any } = {};
      activities.forEach((activity) => {
        const monthKey = activity.date.toISOString().substring(0, 7); // YYYY-MM
        const monthName = activity.date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
        });

        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = {
            month: monthKey,
            monthName,
            totalActivities: 0,
            completedActivities: 0,
            cancelledActivities: 0,
            totalParticipants: 0,
            averageParticipants: 0,
            types: {},
          };
        }
        monthlyData[monthKey].totalActivities++;
        if (activity.isCompleted) {
          monthlyData[monthKey].completedActivities++;
        }
        if (activity.isCancelled) {
          monthlyData[monthKey].cancelledActivities++;
        }
        monthlyData[monthKey].totalParticipants +=
          activity.actualParticipants?.length || 0;
        // Group by type within month
        if (!monthlyData[monthKey].types[activity.type]) {
          monthlyData[monthKey].types[activity.type] = {
            count: 0,
            participants: 0,
          };
        }
        monthlyData[monthKey].types[activity.type].count++;
        monthlyData[monthKey].types[activity.type].participants +=
          activity.actualParticipants?.length || 0;
      });
      // Calculate averages for monthly data
      Object.values(monthlyData).forEach((data: any) => {
        data.averageParticipants =
          data.totalActivities > 0
            ? Math.round(data.totalParticipants / data.totalActivities)
            : 0;
      });
      report = {
        groupBy: 'month',
        data: Object.values(monthlyData).sort((a: any, b: any) =>
          a.month.localeCompare(b.month)
        ),
      };
    } else if (groupBy === 'type') {
      // Group by activity type
      const typeData: { [key: string]: any } = {};
      activities.forEach((activity) => {
        if (!typeData[activity.type]) {
          typeData[activity.type] = {
            type: activity.type,
            totalActivities: 0,
            completedActivities: 0,
            cancelledActivities: 0,
            totalParticipants: 0,
            averageParticipants: 0,
            completionRate: 0,
            organizers: new Set(),
          };
        }
        typeData[activity.type].totalActivities++;
        if (activity.isCompleted) {
          typeData[activity.type].completedActivities++;
        }
        if (activity.isCancelled) {
          typeData[activity.type].cancelledActivities++;
        }
        typeData[activity.type].totalParticipants +=
          activity.actualParticipants?.length || 0;
        if (activity.organizedBy) {
          typeData[activity.type].organizers.add(
            activity.organizedBy._id.toString()
          );
        }
      });
      // Calculate averages and rates
      Object.values(typeData).forEach((data: any) => {
        data.averageParticipants =
          data.totalActivities > 0
            ? Math.round(data.totalParticipants / data.totalActivities)
            : 0;
        data.completionRate =
          data.totalActivities > 0
            ? Math.round(
                (data.completedActivities / data.totalActivities) * 100
              )
            : 0;
        data.uniqueOrganizers = data.organizers.size;
        data.organizers = undefined; // Remove Set from response
      });
      report = {
        groupBy: 'type',
        data: Object.values(typeData).sort(
          (a: any, b: any) => b.totalActivities - a.totalActivities
        ),
      };
    } else if (groupBy === 'organizer') {
      // Group by organizer
      const organizerData: { [key: string]: any } = {};
      activities.forEach((activity) => {
        const organizerKey =
          activity.organizedBy?._id?.toString() || 'unassigned';
        const organizerName = activity.organizedBy
          ? `${activity.organizedBy.firstName} ${activity.organizedBy.lastName}`.trim()
          : 'Unassigned';
        if (!organizerData[organizerKey]) {
          organizerData[organizerKey] = {
            organizerId: organizerKey,
            organizer: activity.organizedBy || null,
            organizerName,
            totalActivities: 0,
            completedActivities: 0,
            cancelledActivities: 0,
            totalParticipants: 0,
            averageParticipants: 0,
            completionRate: 0,
            types: {},
          };
        }
        organizerData[organizerKey].totalActivities++;
        if (activity.isCompleted) {
          organizerData[organizerKey].completedActivities++;
        }
        if (activity.isCancelled) {
          organizerData[organizerKey].cancelledActivities++;
        }
        organizerData[organizerKey].totalParticipants +=
          activity.actualParticipants?.length || 0;
        // Track activity types
        if (!organizerData[organizerKey].types[activity.type]) {
          organizerData[organizerKey].types[activity.type] = {
            count: 0,
            participants: 0,
          };
        }
        organizerData[organizerKey].types[activity.type].count++;
        organizerData[organizerKey].types[activity.type].participants +=
          activity.actualParticipants?.length || 0;
      });
      // Calculate averages and rates
      Object.values(organizerData).forEach((data: any) => {
        data.averageParticipants =
          data.totalActivities > 0
            ? Math.round(data.totalParticipants / data.totalActivities)
            : 0;
        data.completionRate =
          data.totalActivities > 0
            ? Math.round(
                (data.completedActivities / data.totalActivities) * 100
              )
            : 0;
      });
      report = {
        groupBy: 'organizer',
        data: Object.values(organizerData).sort(
          (a: any, b: any) => b.totalActivities - a.totalActivities
        ),
      };
    }
    // Overall summary
    const now = new Date();
    const summary = {
      totalActivities: activities.length,
      completedActivities: activities.filter((a) => a.isCompleted).length,
      cancelledActivities: activities.filter((a) => a.isCancelled).length,
      upcomingActivities: activities.filter(
        (a) => a.date > now && !a.isCompleted && !a.isCancelled
      ).length,
      pastActivities: activities.filter((a) => a.date < now).length,
      totalParticipants: activities.reduce(
        (sum, activity) => sum + (activity.actualParticipants?.length || 0),
        0
      ),
      averageParticipants:
        activities.length > 0
          ? Math.round(
              activities.reduce(
                (sum, activity) =>
                  sum + (activity.actualParticipants?.length || 0),
                0
              ) / activities.length
            )
          : 0,
      completionRate:
        activities.length > 0
          ? Math.round(
              (activities.filter((a) => a.isCompleted).length /
                activities.length) *
                100
            )
          : 0,
      uniqueTypes: [...new Set(activities.map((a) => a.type))].length,
      uniqueOrganizers: [
        ...new Set(
          activities.map((a) => a.organizedBy?._id?.toString()).filter(Boolean)
        ),
      ].length,
    };
    contextLogger.info('Activities report generated successfully', {
      groupId,
      groupBy,
      totalActivities: activities.length,
      dateRange: { startDate, endDate },
      includeInactive,
      completionRate: summary.completionRate,
    });
    return NextResponse.json({
      success: true,
      data: {
        ...report,
        summary,
        filters: {
          dateRange: { startDate, endDate },
          groupBy,
          includeInactive,
        },
        metadata: {
          generatedAt: new Date().toISOString(),
          totalRecords: activities.length,
        },
      },
    });
  } catch (error: any) {
    contextLogger.error(
      'Unexpected error in getActivitiesReportHandler',
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
export const GET = withApiLogger(getActivitiesReportHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});
