import { requireAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { withApiLogger } from '@/lib/middleware/api-logger';
import dbConnect from '@/lib/mongodb';
import { GroupModel } from '@/models';
import { GroupMemberRole } from '@/models/group';
import mongoose from 'mongoose';
import { type NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  params: {
    groupId: string;
  };
}

// GET /api/church/groups/[groupId]/members - List all group members
async function getGroupMembersHandler(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { groupId } = await params;
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    { requestId, endpoint: `/api/church/groups/${groupId}/members` },
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
    const isActive = searchParams.get('isActive');
    const role = searchParams.get('role') as GroupMemberRole;
    const page = Number.parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(
      Number.parseInt(searchParams.get('limit') || '50', 10),
      200
    ); // Cap at 200
    const sortBy = searchParams.get('sortBy') || 'joinedDate';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const search = searchParams.get('search')?.trim();
    // Validate pagination parameters
    if (page < 1 || limit < 1) {
      return NextResponse.json(
        { error: 'Invalid pagination parameters' },
        { status: 400 }
      );
    }
    // Validate role filter
    if (role && !Object.values(GroupMemberRole).includes(role)) {
      return NextResponse.json(
        { error: `Invalid member role: ${role}` },
        { status: 400 }
      );
    }
    // Validate sort parameters
    const validSortFields = ['joinedDate', 'firstName', 'lastName', 'role'];
    if (!validSortFields.includes(sortBy)) {
      return NextResponse.json(
        { error: `Invalid sort field: ${sortBy}` },
        { status: 400 }
      );
    }
    if (!['asc', 'desc'].includes(sortOrder)) {
      return NextResponse.json(
        { error: `Invalid sort order: ${sortOrder}` },
        { status: 400 }
      );
    }
    // Check if group exists and belongs to the user's church
    const group = await GroupModel.findOne({
      _id: groupId,
      churchId: user.user.churchId,
    }).populate('members.userId', 'firstName lastName email phone avatar');
    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }
    let members = [...group.members];
    // Apply filters
    if (isActive !== null && isActive !== undefined) {
      members = members.filter(
        (member) => member.isActive === (isActive === 'true')
      );
    }
    if (role) {
      members = members.filter((member) => member.role === role);
    }
    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      members = members.filter((member) => {
        const user = member.userId as any;
        return (
          user?.firstName?.toLowerCase().includes(searchLower) ||
          user?.lastName?.toLowerCase().includes(searchLower) ||
          user?.email?.toLowerCase().includes(searchLower) ||
          member.notes?.toLowerCase().includes(searchLower)
        );
      });
    }
    // Apply sorting
    members.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'joinedDate':
          aValue = new Date(a.joinedDate).getTime();
          bValue = new Date(b.joinedDate).getTime();
          break;
        case 'firstName':
          aValue = (a.userId as any)?.firstName?.toLowerCase() || '';
          bValue = (b.userId as any)?.firstName?.toLowerCase() || '';
          break;
        case 'lastName':
          aValue = (a.userId as any)?.lastName?.toLowerCase() || '';
          bValue = (b.userId as any)?.lastName?.toLowerCase() || '';
          break;
        case 'role':
          aValue = a.role;
          bValue = b.role;
          break;
        default:
          aValue = new Date(a.joinedDate).getTime();
          bValue = new Date(b.joinedDate).getTime();
      }
      if (sortOrder === 'desc') {
        return bValue > aValue ? 1 : bValue < aValue ? -1 : 0;
      }
      return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
    });
    // Apply pagination
    const skip = (page - 1) * limit;
    const paginatedMembers = members.slice(skip, skip + limit);
    // Calculate summary statistics
    const summary = {
      total: members.length,
      active: members.filter((m) => m.isActive).length,
      inactive: members.filter((m) => !m.isActive).length,
      leaders: members.filter((m) => m.role === GroupMemberRole.LEADER).length,
      assistantLeaders: members.filter(
        (m) => m.role === GroupMemberRole.ASSISTANT_LEADER
      ).length,
      members: members.filter((m) => m.role === GroupMemberRole.MEMBER).length,
      capacity: group.maxMembers || null,
      capacityUsed: group.maxMembers
        ? Math.round(
            (members.filter((m) => m.isActive).length / group.maxMembers) * 100
          )
        : null,
    };
    contextLogger.info('Group members fetched successfully', {
      groupId,
      totalMembers: members.length,
      returnedMembers: paginatedMembers.length,
      filters: { isActive, role, search, sortBy, sortOrder },
      summary,
    });
    return NextResponse.json({
      success: true,
      data: {
        members: paginatedMembers,
        summary,
        pagination: {
          page,
          limit,
          total: members.length,
          pages: Math.ceil(members.length / limit),
        },
      },
    });
  } catch (error) {
    contextLogger.error('Unexpected error in getGroupMembersHandler', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/church/groups/[groupId]/members - Add member to group
async function addGroupMemberHandler(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { groupId } = await params;
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    { requestId, endpoint: `/api/church/groups/${groupId}/members` },
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
    const body = await request.json();
    const {
      userId,
      role = GroupMemberRole.MEMBER,
      notes,
      contactInfo,
      joinedDate,
    } = body;
    // Validate required fields
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    // Validate user ID format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { error: 'Invalid user ID format' },
        { status: 400 }
      );
    }
    // Validate role
    if (!Object.values(GroupMemberRole).includes(role)) {
      return NextResponse.json(
        { error: `Invalid member role: ${role}` },
        { status: 400 }
      );
    }
    // Validate joined date if provided
    let joinedDateTime = new Date();
    if (joinedDate) {
      joinedDateTime = new Date(joinedDate);
      if (Number.isNaN(joinedDateTime.getTime())) {
        return NextResponse.json(
          { error: 'Invalid joined date format' },
          { status: 400 }
        );
      }
      // Ensure joined date is not in the future
      if (joinedDateTime > new Date()) {
        return NextResponse.json(
          { error: 'Joined date cannot be in the future' },
          { status: 400 }
        );
      }
    }
    // Check if group exists and belongs to the user's church
    const group = await GroupModel.findOne({
      _id: groupId,
      churchId: user.user.churchId,
    });
    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }
    // Check if user is already a member
    const existingMember = group.members.find(
      (member) => member.userId.toString() === userId
    );
    if (existingMember) {
      if (existingMember.isActive) {
        return NextResponse.json(
          { error: 'User is already an active member of this group' },
          { status: 409 }
        );
      }
      // Reactivate existing inactive member
      existingMember.isActive = true;
      existingMember.role = role;
      existingMember.joinedDate = joinedDateTime;
      if (notes) existingMember.notes = notes.trim();
      if (contactInfo) existingMember.contactInfo = contactInfo;
      await group.save();
      const updatedGroup = await GroupModel.findById(groupId).populate(
        'members.userId',
        'firstName lastName email phone avatar'
      );
      const reactivatedMember = updatedGroup.members.find(
        (member) => member.userId.toString() === userId
      );
      contextLogger.info('Group member reactivated successfully', {
        groupId,
        userId,
        role,
        operation: 'reactivate',
      });
      return NextResponse.json(
        {
          success: true,
          message: 'Member reactivated successfully',
          data: reactivatedMember,
        },
        { status: 200 }
      );
    }
    // Check capacity if group has a maximum member limit
    const activeMembers = group.members.filter((m) => m.isActive);
    if (group.maxMembers && activeMembers.length >= group.maxMembers) {
      return NextResponse.json(
        {
          error: 'Group is at full capacity',
          details: {
            current: activeMembers.length,
            maximum: group.maxMembers,
          },
        },
        { status: 400 }
      );
    }
    // Validate role assignment rules (e.g., only one leader allowed)
    if (role === GroupMemberRole.LEADER) {
      const existingLeader = group.members.find(
        (member) => member.role === GroupMemberRole.LEADER && member.isActive
      );
      if (existingLeader) {
        return NextResponse.json(
          {
            error: 'Group already has an active leader',
            suggestion: 'Consider assigning Assistant Leader role instead',
          },
          { status: 400 }
        );
      }
    }
    const newMember = {
      userId,
      role,
      joinedDate: joinedDateTime,
      isActive: true,
      notes: notes?.trim() || '',
      contactInfo: contactInfo || {},
    };
    group.members.push(newMember);
    await group.save();
    const updatedGroup = await GroupModel.findById(groupId).populate(
      'members.userId',
      'firstName lastName email phone avatar'
    );
    const addedMember = updatedGroup.members.at(-1);
    contextLogger.info('Group member added successfully', {
      groupId,
      userId,
      role,
      totalMembers: group.members.length,
      activeMembers: group.members.filter((m) => m.isActive).length,
    });
    return NextResponse.json(
      {
        success: true,
        message: 'Member added successfully',
        data: addedMember,
      },
      { status: 201 }
    );
  } catch (error: any) {
    contextLogger.error('Unexpected error in addGroupMemberHandler', error);
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

// PUT /api/church/groups/[id]/members - Bulk update members
async function bulkUpdateMembersHandler(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { groupId } = await params;
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    { requestId, endpoint: `/api/church/groups/${groupId}/members` },
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
    const body = await request.json();
    const { members, operation } = body;
    // Validate operation type
    const validOperations = ['activate', 'deactivate', 'remove', 'updateRole'];
    if (!(operation && validOperations.includes(operation))) {
      return NextResponse.json(
        {
          error: `Invalid operation. Must be one of: ${validOperations.join(', ')}`,
        },
        { status: 400 }
      );
    }
    // Validate members array
    if (!Array.isArray(members) || members.length === 0) {
      return NextResponse.json(
        { error: 'Members array is required and must not be empty' },
        { status: 400 }
      );
    }
    // Validate member IDs
    for (const memberId of members) {
      if (!mongoose.Types.ObjectId.isValid(memberId)) {
        return NextResponse.json(
          { error: `Invalid member ID format: ${memberId}` },
          { status: 400 }
        );
      }
    }
    // Check if group exists and belongs to the user's church
    const group = await GroupModel.findOne({
      _id: groupId,
      churchId: user.user.churchId,
    });
    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }
    let updatedCount = 0;
    const results = [];
    for (const memberId of members) {
      const memberIndex = group.members.findIndex(
        (member) => member.userId.toString() === memberId
      );
      if (memberIndex === -1) {
        results.push({
          memberId,
          status: 'not_found',
          message: 'Member not found in group',
        });
        continue;
      }
      const member = group.members[memberIndex];
      switch (operation) {
        case 'activate':
          if (member.isActive) {
            results.push({
              memberId,
              status: 'no_change',
              message: 'Member already active',
            });
          } else {
            member.isActive = true;
            updatedCount++;
            results.push({
              memberId,
              status: 'success',
              message: 'Member activated',
            });
          }
          break;
        case 'deactivate':
          if (member.isActive) {
            member.isActive = false;
            updatedCount++;
            results.push({
              memberId,
              status: 'success',
              message: 'Member deactivated',
            });
          } else {
            results.push({
              memberId,
              status: 'no_change',
              message: 'Member already inactive',
            });
          }
          break;
        case 'remove':
          group.members.splice(memberIndex, 1);
          updatedCount++;
          results.push({
            memberId,
            status: 'success',
            message: 'Member removed',
          });
          break;
        case 'updateRole': {
          const newRole = body.newRole;
          if (!(newRole && Object.values(GroupMemberRole).includes(newRole))) {
            results.push({
              memberId,
              status: 'error',
              message: 'Invalid or missing new role',
            });
            continue;
          }
          if (member.role !== newRole) {
            member.role = newRole;
            updatedCount++;
            results.push({
              memberId,
              status: 'success',
              message: `Role updated to ${newRole}`,
            });
          } else {
            results.push({
              memberId,
              status: 'no_change',
              message: 'Role already set',
            });
          }
          break;
        }
        default:
          throw new Error('An error occurred');
      }
    }
    if (updatedCount > 0) {
      await group.save();
    }
    contextLogger.info('Bulk member operation completed', {
      groupId,
      operation,
      totalMembers: members.length,
      updatedCount,
      results: results.map((r) => ({ memberId: r.memberId, status: r.status })),
    });
    return NextResponse.json({
      success: true,
      message: `Bulk ${operation} operation completed`,
      data: {
        totalProcessed: members.length,
        updated: updatedCount,
        results,
      },
    });
  } catch (error: any) {
    contextLogger.error('Unexpected error in bulkUpdateMembersHandler', error);
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

// Export the handlers wrapped with logging middleware
export const GET = withApiLogger(getGroupMembersHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});

export const POST = withApiLogger(addGroupMemberHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});

export const PUT = withApiLogger(bulkUpdateMembersHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});
