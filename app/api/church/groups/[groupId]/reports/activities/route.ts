// api/church/groups/[id]/reports/activities/route.ts
import { connectDB } from '@/lib/mongodb';
import Group from '@/models/Group';
import { type NextRequest, NextResponse } from 'next/server';

// GET /api/church/groups/[id]/reports/activities - Activity reports
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const groupBy = searchParams.get('groupBy') || 'month'; // 'month' | 'type' | 'organizer'

    const group = await Group.findById(params.id).populate(
      'activities.organizedBy',
      'firstName lastName'
    );

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

    let report: any = {};

    if (groupBy === 'month') {
      // Group by month
      const monthlyData: { [key: string]: any } = {};

      activities.forEach((activity) => {
        const monthKey = activity.date.toISOString().substring(0, 7); // YYYY-MM

        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = {
            month: monthKey,
            totalActivities: 0,
            completedActivities: 0,
            totalParticipants: 0,
            types: {},
          };
        }

        monthlyData[monthKey].totalActivities++;
        if (activity.isCompleted) {
          monthlyData[monthKey].completedActivities++;
        }
        monthlyData[monthKey].totalParticipants +=
          activity.actualParticipants.length;

        // Group by type within month
        if (!monthlyData[monthKey].types[activity.type]) {
          monthlyData[monthKey].types[activity.type] = 0;
        }
        monthlyData[monthKey].types[activity.type]++;
      });

      report = {
        groupBy: 'month',
        data: Object.values(monthlyData),
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
            totalParticipants: 0,
            averageParticipants: 0,
          };
        }

        typeData[activity.type].totalActivities++;
        if (activity.isCompleted) {
          typeData[activity.type].completedActivities++;
        }
        typeData[activity.type].totalParticipants +=
          activity.actualParticipants.length;
      });

      // Calculate averages
      Object.values(typeData).forEach((data: any) => {
        data.averageParticipants =
          data.totalActivities > 0
            ? Math.round(data.totalParticipants / data.totalActivities)
            : 0;
      });

      report = {
        groupBy: 'type',
        data: Object.values(typeData),
      };
    } else if (groupBy === 'organizer') {
      // Group by organizer
      const organizerData: { [key: string]: any } = {};

      activities.forEach((activity) => {
        const organizerKey = activity.organizedBy.toString();

        if (!organizerData[organizerKey]) {
          organizerData[organizerKey] = {
            organizer: activity.organizedBy,
            totalActivities: 0,
            completedActivities: 0,
            totalParticipants: 0,
            types: {},
          };
        }

        organizerData[organizerKey].totalActivities++;
        if (activity.isCompleted) {
          organizerData[organizerKey].completedActivities++;
        }
        organizerData[organizerKey].totalParticipants +=
          activity.actualParticipants.length;

        // Track activity types
        if (!organizerData[organizerKey].types[activity.type]) {
          organizerData[organizerKey].types[activity.type] = 0;
        }
        organizerData[organizerKey].types[activity.type]++;
      });

      report = {
        groupBy: 'organizer',
        data: Object.values(organizerData),
      };
    }

    // Overall summary
    const summary = {
      totalActivities: activities.length,
      completedActivities: activities.filter((a) => a.isCompleted).length,
      upcomingActivities: activities.filter(
        (a) => a.date > new Date() && !a.isCompleted
      ).length,
      totalParticipants: activities.reduce(
        (sum, activity) => sum + activity.actualParticipants.length,
        0
      ),
      averageParticipants:
        activities.length > 0
          ? Math.round(
              activities.reduce(
                (sum, activity) => sum + activity.actualParticipants.length,
                0
              ) / activities.length
            )
          : 0,
    };

    return NextResponse.json({
      ...report,
      summary,
      dateRange: { startDate, endDate },
    });
  } catch (error) {
    console.error('Error generating activities report:', error);
    return NextResponse.json(
      { error: 'Failed to generate activities report' },
      { status: 500 }
    );
  }
}
