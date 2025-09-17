import { requireAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { withApiLogger } from '@/lib/middleware/api-logger';
import dbConnect from '@/lib/mongodb';
import { GroupModel } from '@/models';
import { AttendanceStatus } from '@/models/group';
import mongoose from 'mongoose';
import { type NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  params: {
    groupId: string;
    userId: string;
  };
}

// GET /api/church/groups/[groupId]/members/[userId]/attendance - Get member attendance history
async function getMemberAttendanceHandler(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { groupId, userId } = await params;
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    {
      requestId,
      endpoint: `/api/church/groups/${groupId}/members/${userId}/attendance`,
    },
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
    // Validate MongoDB ObjectId formats
    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return NextResponse.json(
        { error: 'Invalid group ID format' },
        { status: 400 }
      );
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { error: 'Invalid user ID format' },
        { status: 400 }
      );
    }
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = Number.parseInt(searchParams.get('limit') || '50', 10);
    const offset = Number.parseInt(searchParams.get('offset') || '0', 10);
    // Validate date parameters if provided
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
    // Validate pagination parameters
    if (limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: 'Limit must be between 1 and 100' },
        { status: 400 }
      );
    }
    if (offset < 0) {
      return NextResponse.json(
        { error: 'Offset must be non-negative' },
        { status: 400 }
      );
    }
    // Check if group exists and belongs to the user's church
    const group = await GroupModel.findOne({
      _id: groupId,
      churchId: user.user.churchId,
    })
      .populate('members.userId', 'firstName lastName email');
      // .populate('activities.organizedBy', 'firstName lastName');
    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }
    // Check if user is a member of the group
    const member = group.members.find(
      (m) => m.userId._id?.toString() === userId
    );
    if (!member) {
      return NextResponse.json(
        { error: 'User is not a member of this group' },
        { status: 404 }
      );
    }
    let activities = [...group.activities];
    // Filter by date range if provided
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // Include the entire end date
      activities = activities.filter(
        (activity) => activity.date >= start && activity.date <= end
      );
    }
    // Get attendance records for this user
    const attendanceHistory = activities
      .map((activity) => {
        const attendanceRecord = activity.attendance?.find(
          (a) => a.userId.toString() === userId
        );
        const wasInvited = activity.plannedParticipants?.some(
          (p) => p.toString() === userId
        );
        return {
          activityId: activity._id,
          title: activity.title,
          type: activity.type,
          date: activity.date,
          location: activity.location,
          wasInvited,
          attendance: attendanceRecord
            ? {
                status: attendanceRecord.status,
                markedAt: attendanceRecord.markedAt,
                markedBy: attendanceRecord.markedBy,
                notes: attendanceRecord.notes,
              }
            : null,
        };
      })
      .filter((record) => record.wasInvited) // Only show activities they were invited to
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    // Apply pagination
    const totalRecords = attendanceHistory.length;
    const paginatedHistory = attendanceHistory.slice(offset, offset + limit);
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
    const totalExcused = attendanceHistory.filter(
      (h) => h.attendance?.status === AttendanceStatus.EXCUSED
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
    // Calculate attendance streak
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    for (const record of attendanceHistory) {
      const wasPresent =
        record.attendance?.status === AttendanceStatus.PRESENT ||
        record.attendance?.status === AttendanceStatus.LATE;
      if (wasPresent) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
        if (currentStreak === 0 && record === attendanceHistory[0]) {
          currentStreak = 1;
        }
      } else {
        tempStreak = 0;
        if (currentStreak === 0) {
          currentStreak = 0;
        }
      }
    }
    contextLogger.info('Member attendance history fetched successfully', {
      groupId,
      userId,
      totalRecords,
      attendanceRate,
      recentAttendanceRate,
      dateRange: { startDate, endDate },
      pagination: { limit, offset },
    });
    return NextResponse.json({
      success: true,
      data: {
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
          totalExcused,
          attendanceRate,
          recentAttendanceRate,
          currentStreak,
          longestStreak,
        },
        attendanceHistory: paginatedHistory,
        pagination: {
          total: totalRecords,
          limit,
          offset,
          hasMore: offset + limit < totalRecords,
        },
        filters: {
          startDate,
          endDate,
        },
      },
    });
  } catch (error: any) {
    contextLogger.error(
      'Unexpected error in getMemberAttendanceHandler',
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
export const GET = withApiLogger(getMemberAttendanceHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});
