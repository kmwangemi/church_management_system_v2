import { requireAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { withApiLogger } from '@/lib/middleware/api-logger';
import dbConnect from '@/lib/mongodb';
import { DepartmentModel, GroupModel, UserModel } from '@/models';
import mongoose from 'mongoose';
import { type NextRequest, NextResponse } from 'next/server';

// GET /api/recipient-groups - Fetch recipient groups dynamically from existing models
async function getRecipientGroupsHandler(
  request: NextRequest
): Promise<NextResponse> {
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    { requestId, endpoint: '/api/recipient-groups' },
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
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const withCounts = searchParams.get('withCounts') !== 'false'; // Default to true
    const churchId = new mongoose.Types.ObjectId(user.user?.churchId);
    // Get counts for different user groups
    const [allUsersCount, activeUsersCount, departments, groups] =
      await Promise.all([
        withCounts
          ? UserModel.countDocuments({ churchId })
          : Promise.resolve(0),
        withCounts
          ? UserModel.countDocuments({ churchId, status: 'active' })
          : Promise.resolve(0),
        DepartmentModel.find({ churchId, isActive: true })
          .select('_id departmentName description')
          .lean(),
        GroupModel.find({ churchId, isActive: true })
          .select('_id groupName category description')
          .lean(),
      ]);
    // Build recipient groups array
    const recipientGroups = [
      {
        id: 'all',
        name: 'All Members',
        count: allUsersCount,
        type: 'system',
        description: 'All registered members',
        targetModel: 'User',
        criteria: {},
      },
      {
        id: 'active',
        name: 'Active Members',
        count: activeUsersCount,
        type: 'system',
        description: 'Only active members',
        targetModel: 'User',
        criteria: { userStatus: ['active'] },
      },
    ];
    // Add departments as recipient groups
    for (const dept of departments) {
      let memberCount = 0;
      if (withCounts) {
        // Assuming User model has departmentId field
        memberCount = await UserModel.countDocuments({
          churchId,
          departmentId: dept._id,
          status: 'active',
        });
      }
      recipientGroups.push({
        id: `dept_${dept._id}`,
        name: `${dept.departmentName} Department`,
        count: memberCount,
        type: 'department',
        description:
          dept.description || `Members of ${dept.departmentName} department`,
        targetModel: 'Department',
        targetId: dept._id,
        criteria: { departmentIds: [dept._id] },
      });
    }
    // Add groups as recipient groups
    for (const group of groups) {
      let memberCount = 0;
      if (withCounts) {
        // Assuming User model has groupId field or groups array
        memberCount = await UserModel.countDocuments({
          churchId,
          groupId: group._id,
          status: 'active',
        });
      }
      recipientGroups.push({
        id: `group_${group._id}`,
        name: `${group.groupName} Group`,
        count: memberCount,
        type: 'group',
        description:
          group.description ||
          `Members of ${group.groupName} ${group.category} group`,
        targetModel: 'Group',
        targetId: group._id,
        criteria: { groupIds: [group._id] },
      });
    }
    // Add some common role-based groups
    if (withCounts) {
      const [leaderCount, volunteerCount] = await Promise.all([
        UserModel.countDocuments({
          churchId,
          role: { $in: ['leader', 'pastor', 'deacon', 'elder'] },
          status: 'active',
        }),
        UserModel.countDocuments({
          churchId,
          role: 'volunteer',
          status: 'active',
        }),
      ]);
      recipientGroups.push(
        {
          id: 'leadership',
          name: 'Leadership Team',
          count: leaderCount,
          type: 'system',
          description: 'Church leaders including pastors, deacons, and elders',
          targetModel: 'User',
          criteria: { roles: ['leader', 'pastor', 'deacon', 'elder'] },
        },
        {
          id: 'volunteers',
          name: 'Volunteers',
          count: volunteerCount,
          type: 'system',
          description: 'Church volunteers',
          targetModel: 'User',
          criteria: { roles: ['volunteer'] },
        }
      );
    } else {
      recipientGroups.push(
        {
          id: 'leadership',
          name: 'Leadership Team',
          count: 0,
          type: 'system',
          description: 'Church leaders including pastors, deacons, and elders',
          targetModel: 'User',
          criteria: { roles: ['leader', 'pastor', 'deacon', 'elder'] },
        },
        {
          id: 'volunteers',
          name: 'Volunteers',
          count: 0,
          type: 'system',
          description: 'Church volunteers',
          targetModel: 'User',
          criteria: { roles: ['volunteer'] },
        }
      );
    }
    contextLogger.info('Recipient groups fetched successfully', {
      totalGroups: recipientGroups.length,
      departmentCount: departments.length,
      groupCount: groups.length,
    });
    return NextResponse.json({
      success: true,
      data: {
        groups: recipientGroups,
        total: recipientGroups.length,
      },
    });
  } catch (error) {
    contextLogger.error('Unexpected error in getRecipientGroupsHandler', error);
    return NextResponse.json(
      { error: 'Failed to fetch recipient groups' },
      { status: 500 }
    );
  }
}

// Export handlers with logging middleware
export const GET = withApiLogger(getRecipientGroupsHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});
