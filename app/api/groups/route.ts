import { requireAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { withApiLogger } from '@/lib/middleware/api-logger';
import dbConnect from '@/lib/mongodb';
import type { AddGroupPayload } from '@/lib/validations/small-group';
import Group from '@/models/group';
import Member from '@/models/member';
import { type NextRequest, NextResponse } from 'next/server';

async function getGroupHandler(request: NextRequest): Promise<NextResponse> {
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    { requestId, endpoint: '/api/groups' },
    'api'
  );
  try {
    // Check authentication and authorization
    const authResult = await requireAuth(['superadmin', 'admin'])(request);
    if (authResult instanceof Response) {
      // If authResult is a Response object, it means authentication/authorization failed
      // Convert Response to NextResponse
      const body = await authResult.text();
      return new NextResponse(body, {
        status: authResult.status,
        statusText: authResult.statusText,
        headers: authResult.headers,
      });
    }
    // authResult is now the authenticated user
    const user = authResult;
    // FIRST: Connect to database
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const page = Number.parseInt(searchParams.get('page') || '1', 10);
    const limit = Number.parseInt(searchParams.get('limit') || '10', 10);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const query: any = { churchId: user.user?.churchId };
    if (search) {
      query.$or = [
        { groupName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    if (category) {
      query.category = category;
    }
    const skip = (page - 1) * limit;
    const [groups, total] = await Promise.all([
      Group.find(query)
        .populate('leaderId', 'firstName lastName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Group.countDocuments(query),
    ]);
    // Get member counts for each group
    const groupsWithCounts = await Promise.all(
      groups.map(async (group) => {
        const memberCount = await Member.countDocuments({
          groupIds: group._id,
          churchId: user.user?.churchId,
        });
        return {
          ...group.toObject(),
          memberCount,
        };
      })
    );
    return NextResponse.json({
      groups: groupsWithCounts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    contextLogger.error('Unexpected error in getGroupHandler', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Export the handler wrapped with logging middleware
export const GET = withApiLogger(getGroupHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});

async function registerGroupHandler(
  request: NextRequest
): Promise<NextResponse> {
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    { requestId, endpoint: '/api/groups' },
    'api'
  );
  try {
    // Check authentication and authorization
    const authResult = await requireAuth(['superadmin', 'admin'])(request);
    if (authResult instanceof Response) {
      // If authResult is a Response object, it means authentication/authorization failed
      // Convert Response to NextResponse
      const body = await authResult.text();
      return new NextResponse(body, {
        status: authResult.status,
        statusText: authResult.statusText,
        headers: authResult.headers,
      });
    }
    // authResult is now the authenticated user
    const user = authResult;
    // FIRST: Connect to database
    await dbConnect();
    const groupData: AddGroupPayload = await request.json();
    const existingGroup = await Group.findOne({
      groupName: groupData.groupName,
      churchId: user.user?.churchId,
    });
    if (existingGroup) {
      contextLogger.warn(
        'Group registration failed - group name already exists',
        {
          groupName: groupData.groupName,
        }
      );
      return NextResponse.json(
        { error: 'Group already exists' },
        { status: 400 }
      );
    }
    const group = new Group({
      ...groupData,
      churchId: user.user?.churchId,
    });
    await group.save();
    return NextResponse.json(group, { status: 201 });
  } catch (error) {
    contextLogger.error('Unexpected error in registerGroupHandler', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Export the handler wrapped with logging middleware
export const POST = withApiLogger(registerGroupHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});
