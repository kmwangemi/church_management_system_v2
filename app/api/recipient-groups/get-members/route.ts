import { requireAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { withApiLogger } from '@/lib/middleware/api-logger';
import dbConnect from '@/lib/mongodb';
import User from '@/models/user';
import mongoose from 'mongoose';
import { type NextRequest, NextResponse } from 'next/server';

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

// Export handler with logging middleware
export const POST = withApiLogger(getMembersHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});
