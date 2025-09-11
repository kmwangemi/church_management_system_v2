import { requireAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { withApiLogger } from '@/lib/middleware/api-logger';
import dbConnect from '@/lib/mongodb';
import { DepartmentModel, GroupModel, UserModel } from '@/models';
import mongoose from 'mongoose';
import { type NextRequest, NextResponse } from 'next/server';

// POST /api/messages/members - Get members for message delivery
async function getMessageMembersHandler(
  request: NextRequest
): Promise<NextResponse> {
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    { requestId, endpoint: '/api/church/messages/members' },
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
    const {
      recipients,
      messageType,
      includeInactive = false,
    } = await request.json();
    if (!(recipients && Array.isArray(recipients))) {
      return NextResponse.json(
        { error: 'Recipients array is required' },
        { status: 400 }
      );
    }
    if (!(messageType && ['sms', 'email'].includes(messageType))) {
      return NextResponse.json(
        { error: 'Valid message type (sms or email) is required' },
        { status: 400 }
      );
    }
    const churchId = new mongoose.Types.ObjectId(user.user?.churchId);
    const allMembers = new Map(); // Use Map to avoid duplicates by user ID
    // Select fields based on message type
    const selectFields =
      messageType === 'email'
        ? '_id name email firstName lastName status role departmentId groupId'
        : '_id name phone firstName lastName status role departmentId groupId';
    // Base query for user status
    const statusQuery = includeInactive ? {} : { status: 'active' };
    for (const recipientId of recipients) {
      let members = [];
      try {
        // Parse recipient ID to determine type and get members
        if (recipientId === 'all') {
          members = await UserModel.find({
            churchId,
            ...(messageType === 'email'
              ? { email: { $exists: true, $ne: '' } }
              : { phone: { $exists: true, $ne: '' } }),
          })
            .select(selectFields)
            .lean();
        } else if (recipientId === 'active') {
          members = await UserModel.find({
            churchId,
            status: 'active',
            ...(messageType === 'email'
              ? { email: { $exists: true, $ne: '' } }
              : { phone: { $exists: true, $ne: '' } }),
          })
            .select(selectFields)
            .lean();
        } else if (recipientId.startsWith('dept_')) {
          const departmentId = recipientId.replace('dept_', '');
          // Validate department exists
          const department = await DepartmentModel.findOne({
            _id: new mongoose.Types.ObjectId(departmentId),
            churchId,
            isActive: true,
          });
          if (!department) {
            contextLogger.warn(`Department not found: ${departmentId}`);
            continue;
          }
          members = await UserModel.find({
            churchId,
            departmentId: new mongoose.Types.ObjectId(departmentId),
            ...statusQuery,
            ...(messageType === 'email'
              ? { email: { $exists: true, $ne: '' } }
              : { phone: { $exists: true, $ne: '' } }),
          })
            .select(selectFields)
            .lean();
        } else if (recipientId.startsWith('group_')) {
          const groupId = recipientId.replace('group_', '');
          // Validate group exists
          const group = await GroupModel.findOne({
            _id: new mongoose.Types.ObjectId(groupId),
            churchId,
            isActive: true,
          });
          if (!group) {
            contextLogger.warn(`Group not found: ${groupId}`);
            continue;
          }
          members = await UserModel.find({
            churchId,
            groupId: new mongoose.Types.ObjectId(groupId),
            ...statusQuery,
            ...(messageType === 'email'
              ? { email: { $exists: true, $ne: '' } }
              : { phone: { $exists: true, $ne: '' } }),
          })
            .select(selectFields)
            .lean();
        } else if (recipientId === 'leadership') {
          members = await UserModel.find({
            churchId,
            role: { $in: ['leader', 'pastor', 'deacon', 'elder'] },
            ...statusQuery,
            ...(messageType === 'email'
              ? { email: { $exists: true, $ne: '' } }
              : { phone: { $exists: true, $ne: '' } }),
          })
            .select(selectFields)
            .lean();
        } else if (recipientId === 'volunteers') {
          members = await UserModel.find({
            churchId,
            role: 'volunteer',
            ...statusQuery,
            ...(messageType === 'email'
              ? { email: { $exists: true, $ne: '' } }
              : { phone: { $exists: true, $ne: '' } }),
          })
            .select(selectFields)
            .lean();
        } else {
          contextLogger.warn(`Unknown recipient ID: ${recipientId}`);
          continue;
        }
        // Add members to map to avoid duplicates (using user ID as key)
        members.forEach((member) => {
          // Validate contact method exists and is valid
          const contactMethod =
            messageType === 'email' ? member.email : member.phone;
          if (contactMethod && contactMethod.trim() !== '') {
            allMembers.set(member._id.toString(), {
              ...member,
              contactMethod: contactMethod.trim(),
              source: recipientId, // Track which group this member came from
            });
          }
        });
        contextLogger.info(`Processed recipient group: ${recipientId}`, {
          membersFound: members.length,
          validContacts: members.filter((m) => {
            const contact = messageType === 'email' ? m.email : m.phone;
            return contact && contact.trim() !== '';
          }).length,
        });
      } catch (error) {
        contextLogger.error(
          `Error processing recipient ${recipientId}:`,
          error
        );
      }
    }
    // Convert map to array
    const uniqueMembers = Array.from(allMembers.values());
    // Group members by their source for analytics
    const membersBySource = {};
    uniqueMembers.forEach((member) => {
      if (!membersBySource[member.source]) {
        membersBySource[member.source] = [];
      }
      membersBySource[member.source].push(member._id);
    });
    contextLogger.info('Message members retrieved successfully', {
      recipientGroups: recipients.length,
      uniqueMembers: uniqueMembers.length,
      messageType,
      membersBySource: Object.keys(membersBySource).reduce((acc, key) => {
        acc[key] = membersBySource[key].length;
        return acc;
      }, {}),
    });
    return NextResponse.json({
      success: true,
      data: {
        members: uniqueMembers,
        totalCount: uniqueMembers.length,
        membersBySource,
        messageType,
      },
      message: 'Message members retrieved successfully',
    });
  } catch (error) {
    contextLogger.error('Unexpected error in getMessageMembersHandler', error);
    return NextResponse.json(
      { error: 'Failed to get message members' },
      { status: 500 }
    );
  }
}

// Export handlers with logging middleware
export const POST = withApiLogger(getMessageMembersHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});
