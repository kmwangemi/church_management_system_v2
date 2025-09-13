// api/church/groups/[id]/activities/[activityId]/attendance/route.ts
import { connectDB } from '@/lib/mongodb';
import Group, { AttendanceStatus } from '@/models/Group';
import { type NextRequest, NextResponse } from 'next/server';

// POST /api/church/groups/[id]/activities/[activityId]/attendance - Record attendance
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; activityId: string } }
) {
  try {
    await connectDB();

    const body = await request.json();
    const { attendanceRecords } = body; // Array of { userId, status, arrivalTime?, notes? }

    if (!Array.isArray(attendanceRecords)) {
      return NextResponse.json(
        { error: 'Attendance records must be an array' },
        { status: 400 }
      );
    }

    const group = await Group.findById(params.id);
    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    const activityIndex = group.activities.findIndex(
      (activity) => activity._id?.toString() === params.activityId
    );

    if (activityIndex === -1) {
      return NextResponse.json(
        { error: 'Activity not found' },
        { status: 404 }
      );
    }

    // Clear existing attendance and add new records
    group.activities[activityIndex].attendance = attendanceRecords.map(
      (record) => ({
        userId: record.userId,
        status: record.status,
        arrivalTime: record.arrivalTime
          ? new Date(record.arrivalTime)
          : undefined,
        notes: record.notes,
      })
    );

    // Update actual participants based on attendance
    group.activities[activityIndex].actualParticipants = attendanceRecords
      .filter(
        (record) =>
          record.status === AttendanceStatus.PRESENT ||
          record.status === AttendanceStatus.LATE
      )
      .map((record) => record.userId);

    await group.save();

    const updatedGroup = await Group.findById(params.id).populate(
      'activities.attendance.userId',
      'firstName lastName'
    );

    return NextResponse.json(updatedGroup.activities[activityIndex].attendance);
  } catch (error) {
    console.error('Error recording attendance:', error);
    return NextResponse.json(
      { error: 'Failed to record attendance' },
      { status: 500 }
    );
  }
}

// GET /api/church/groups/[id]/activities/[activityId]/attendance - Get activity attendance
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; activityId: string } }
) {
  try {
    await connectDB();

    const group = await Group.findById(params.id).populate(
      'activities.attendance.userId',
      'firstName lastName email'
    );

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    const activity = group.activities.find(
      (activity) => activity._id?.toString() === params.activityId
    );

    if (!activity) {
      return NextResponse.json(
        { error: 'Activity not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      attendance: activity.attendance,
      summary: {
        totalExpected: activity.plannedParticipants.length,
        totalPresent: activity.attendance.filter(
          (a) => a.status === AttendanceStatus.PRESENT
        ).length,
        totalAbsent: activity.attendance.filter(
          (a) => a.status === AttendanceStatus.ABSENT
        ).length,
        totalLate: activity.attendance.filter(
          (a) => a.status === AttendanceStatus.LATE
        ).length,
        attendanceRate:
          activity.plannedParticipants.length > 0
            ? Math.round(
                (activity.attendance.filter(
                  (a) =>
                    a.status === AttendanceStatus.PRESENT ||
                    a.status === AttendanceStatus.LATE
                ).length /
                  activity.plannedParticipants.length) *
                  100
              )
            : 0,
      },
    });
  } catch (error) {
    console.error('Error fetching activity attendance:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activity attendance' },
      { status: 500 }
    );
  }
}
