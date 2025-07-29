import { requireAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { withApiLogger } from '@/lib/middleware/api-logger';
import dbConnect from '@/lib/mongodb';
import MessageRecipient from '@/models/message-recipient';
import User from '@/models/user';
import Department from '@/models/department';
import Group from '@/models/group';
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
        withCounts ? User.countDocuments({ churchId }) : Promise.resolve(0),
        withCounts
          ? User.countDocuments({ churchId, status: 'active' })
          : Promise.resolve(0),
        Department.find({ churchId, isActive: true })
          .select('_id departmentName description')
          .lean(),
        Group.find({ churchId, isActive: true })
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
        memberCount = await User.countDocuments({
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
        memberCount = await User.countDocuments({
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
        User.countDocuments({
          churchId,
          role: { $in: ['leader', 'pastor', 'deacon', 'elder'] },
          status: 'active',
        }),
        User.countDocuments({ churchId, role: 'volunteer', status: 'active' }),
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

// POST /api/recipient-groups/calculate-count - Calculate member count for specific criteria
async function calculateMemberCountHandler(
  request: NextRequest
): Promise<NextResponse> {
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    { requestId, endpoint: '/api/recipient-groups/calculate-count' },
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

    const { recipients } = await request.json();

    if (!(recipients && Array.isArray(recipients))) {
      return NextResponse.json(
        { error: 'Recipients array is required' },
        { status: 400 }
      );
    }

    const churchId = new mongoose.Types.ObjectId(user.user?.churchId);
    let totalCount = 0;
    const recipientCounts = [];

    for (const recipientId of recipients) {
      let count = 0;
      let query: any = { churchId, status: 'active' };

      // Parse recipient ID to determine type and target
      if (recipientId === 'all') {
        count = await User.countDocuments({ churchId });
      } else if (recipientId === 'active') {
        count = await User.countDocuments({ churchId, status: 'active' });
      } else if (recipientId.startsWith('dept_')) {
        const departmentId = recipientId.replace('dept_', '');
        count = await User.countDocuments({
          churchId,
          departmentId: new mongoose.Types.ObjectId(departmentId),
          status: 'active',
        });
      } else if (recipientId.startsWith('group_')) {
        const groupId = recipientId.replace('group_', '');
        count = await User.countDocuments({
          churchId,
          groupId: new mongoose.Types.ObjectId(groupId),
          status: 'active',
        });
      } else if (recipientId === 'leadership') {
        count = await User.countDocuments({
          churchId,
          role: { $in: ['leader', 'pastor', 'deacon', 'elder'] },
          status: 'active',
        });
      } else if (recipientId === 'volunteers') {
        count = await User.countDocuments({
          churchId,
          role: 'volunteer',
          status: 'active',
        });
      }

      recipientCounts.push({
        recipientId,
        count,
      });

      totalCount += count;
    }

    contextLogger.info('Member count calculated', {
      recipients: recipients.length,
      totalCount,
    });

    return NextResponse.json({
      success: true,
      data: {
        totalCount,
        recipientCounts,
      },
      message: 'Member count calculated successfully',
    });
  } catch (error) {
    contextLogger.error(
      'Unexpected error in calculateMemberCountHandler',
      error
    );
    return NextResponse.json(
      { error: 'Failed to calculate member count' },
      { status: 500 }
    );
  }
}

// POST /api/recipient-groups/get-members - Get actual members for specific recipients
async function getMembersHandler(request: NextRequest): Promise<NextResponse> {
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    { requestId, endpoint: '/api/recipient-groups/get-members' },
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

    const { recipients, messageType } = await request.json();

    if (!(recipients && Array.isArray(recipients))) {
      return NextResponse.json(
        { error: 'Recipients array is required' },
        { status: 400 }
      );
    }

    const churchId = new mongoose.Types.ObjectId(user.user?.churchId);
    const allMembers = new Set();
    const selectFields =
      messageType === 'email'
        ? '_id name email firstName lastName'
        : '_id name phone firstName lastName';

    for (const recipientId of recipients) {
      let members = [];

      // Parse recipient ID to determine type and get members
      if (recipientId === 'all') {
        members = await User.find({ churchId }).select(selectFields).lean();
      } else if (recipientId === 'active') {
        members = await User.find({ churchId, status: 'active' })
          .select(selectFields)
          .lean();
      } else if (recipientId.startsWith('dept_')) {
        const departmentId = recipientId.replace('dept_', '');
        members = await User.find({
          churchId,
          departmentId: new mongoose.Types.ObjectId(departmentId),
          status: 'active',
        })
          .select(selectFields)
          .lean();
      } else if (recipientId.startsWith('group_')) {
        const groupId = recipientId.replace('group_', '');
        members = await User.find({
          churchId,
          groupId: new mongoose.Types.ObjectId(groupId),
          status: 'active',
        })
          .select(selectFields)
          .lean();
      } else if (recipientId === 'leadership') {
        members = await User.find({
          churchId,
          role: { $in: ['leader', 'pastor', 'deacon', 'elder'] },
          status: 'active',
        })
          .select(selectFields)
          .lean();
      } else if (recipientId === 'volunteers') {
        members = await User.find({
          churchId,
          role: 'volunteer',
          status: 'active',
        })
          .select(selectFields)
          .lean();
      }

      // Add members to set to avoid duplicates
      members.forEach((member) => {
        allMembers.add(JSON.stringify(member));
      });
    }

    // Convert set back to array of objects
    const uniqueMembers = Array.from(allMembers).map((memberStr) =>
      JSON.parse(memberStr)
    );

    contextLogger.info('Members retrieved', {
      recipients: recipients.length,
      uniqueMembers: uniqueMembers.length,
    });

    return NextResponse.json({
      success: true,
      data: {
        members: uniqueMembers,
        totalCount: uniqueMembers.length,
      },
      message: 'Members retrieved successfully',
    });
  } catch (error) {
    contextLogger.error('Unexpected error in getMembersHandler', error);
    return NextResponse.json(
      { error: 'Failed to get members' },
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

export const POST = withApiLogger(calculateMemberCountHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});