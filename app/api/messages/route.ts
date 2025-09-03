import { requireAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { withApiLogger } from '@/lib/middleware/api-logger';
import dbConnect from '@/lib/mongodb';
import { MessageModel, MessageTemplateModel, UserModel } from '@/models';
import mongoose from 'mongoose';
import { type NextRequest, NextResponse } from 'next/server';

// GET /api/messages - Fetch messages with filtering and pagination
async function getMessagesHandler(request: NextRequest): Promise<NextResponse> {
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    { requestId, endpoint: '/api/messages' },
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
    const page = Math.max(
      1,
      Number.parseInt(searchParams.get('page') || '1', 10)
    );
    const limit = Math.min(
      20,
      Math.max(1, Number.parseInt(searchParams.get('limit') || '10', 10))
    );
    const search = searchParams.get('search')?.trim() || '';
    const type = searchParams.get('type') || '';
    const status = searchParams.get('status') || '';
    const scheduleType = searchParams.get('scheduleType') || '';
    // Build query object
    const query: any = {
      churchId: new mongoose.Types.ObjectId(user.user?.churchId),
    };
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
      ];
    }
    if (type && ['sms', 'email'].includes(type)) {
      query.type = type;
    }
    if (
      status &&
      ['draft', 'scheduled', 'sent', 'failed', 'cancelled'].includes(status)
    ) {
      query.status = status;
    }
    if (scheduleType && ['now', 'scheduled', 'draft'].includes(scheduleType)) {
      query.scheduleType = scheduleType;
    }
    const skip = (page - 1) * limit;
    // Execute queries
    const [messages, total] = await Promise.all([
      MessageModel.find(query)
        .populate('templateId', 'name category')
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      MessageModel.countDocuments(query),
    ]);
    return NextResponse.json({
      success: true,
      data: {
        messages,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    contextLogger.error('Unexpected error in getMessagesHandler', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

// Helper function to calculate recipient counts
async function calculateRecipientCounts(
  recipients: string[],
  churchId: mongoose.Types.ObjectId
) {
  let totalCount = 0;
  const recipientCounts = [];
  for (const recipientId of recipients) {
    let count = 0;
    // Parse recipient ID to determine type and count members
    if (recipientId === 'all') {
      count = await UserModel.countDocuments({ churchId });
    } else if (recipientId === 'active') {
      count = await UserModel.countDocuments({ churchId, status: 'active' });
    } else if (recipientId.startsWith('dept_')) {
      const departmentId = recipientId.replace('dept_', '');
      count = await UserModel.countDocuments({
        churchId,
        departmentId: new mongoose.Types.ObjectId(departmentId),
        status: 'active',
      });
    } else if (recipientId.startsWith('group_')) {
      const groupId = recipientId.replace('group_', '');
      count = await UserModel.countDocuments({
        churchId,
        groupId: new mongoose.Types.ObjectId(groupId),
        status: 'active',
      });
    } else if (recipientId === 'leadership') {
      count = await UserModel.countDocuments({
        churchId,
        role: { $in: ['leader', 'pastor', 'deacon', 'elder'] },
        status: 'active',
      });
    } else if (recipientId === 'volunteers') {
      count = await UserModel.countDocuments({
        churchId,
        role: 'volunteer',
        status: 'active',
      });
    }
    recipientCounts.push({ recipientId, count });
    totalCount += count;
  }
  return { totalCount, recipientCounts };
}

// POST /api/messages - Create a new message
async function createMessageHandler(
  request: NextRequest
): Promise<NextResponse> {
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    { requestId, endpoint: '/api/messages' },
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
    const messageData = await request.json();
    // Validate required fields
    const requiredFields = [
      'type',
      'title',
      'content',
      'recipients',
      'scheduleType',
    ];
    for (const field of requiredFields) {
      if (!messageData[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }
    // Validate message type
    if (!['sms', 'email'].includes(messageData.type)) {
      return NextResponse.json(
        { error: 'Invalid message type' },
        { status: 400 }
      );
    }
    // Validate schedule type
    if (!['now', 'scheduled', 'draft'].includes(messageData.scheduleType)) {
      return NextResponse.json(
        { error: 'Invalid schedule type' },
        { status: 400 }
      );
    }
    // Validate scheduled message requirements
    if (messageData.scheduleType === 'scheduled') {
      if (!messageData.scheduleDate) {
        return NextResponse.json(
          { error: 'Schedule date is required for scheduled messages' },
          { status: 400 }
        );
      }
      const scheduleDate = new Date(messageData.scheduleDate);
      if (scheduleDate <= new Date()) {
        return NextResponse.json(
          { error: 'Schedule date must be in the future' },
          { status: 400 }
        );
      }
    }
    // Validate recipients exist and calculate total recipients
    const recipientCounts = await calculateRecipientCounts(
      messageData.recipients,
      new mongoose.Types.ObjectId(user.user?.churchId)
    );
    if (recipientCounts.totalCount === 0) {
      return NextResponse.json(
        { error: 'No valid recipients found for the selected groups' },
        { status: 400 }
      );
    }
    // Validate template if provided
    let template = null;
    if (messageData.template) {
      template = await MessageTemplateModel.findOne({
        churchId: new mongoose.Types.ObjectId(user.user?.churchId),
        category: messageData.template,
        type: messageData.type,
        isActive: true,
      });
      if (template) {
        // Use template content if found
        messageData.title = template.title;
        messageData.content = template.content;
        messageData.templateId = template._id;
        // Increment template usage
        await template.incrementUsage();
      }
    }
    // Create message object
    const messageObj = {
      ...messageData,
      churchId: user.user?.churchId,
      branchId: user.user?.branchId || null,
      createdBy: user.user?.sub,
      deliveryStats: {
        total: recipientCounts.totalCount,
        sent: 0,
        delivered: 0,
        failed: 0,
      },
    };
    // Set schedule date if provided
    if (messageData.scheduleDate) {
      messageObj.scheduleDate = new Date(messageData.scheduleDate);
      // Combine with schedule time if provided
      if (messageData.scheduleTime) {
        const [hours, minutes] = messageData.scheduleTime.split(':');
        messageObj.scheduleDate.setHours(
          Number.parseInt(hours, 10),
          Number.parseInt(minutes, 10)
        );
      }
    }
    // Create and save message
    const message = new MessageModel(messageObj);
    const savedMessage = await message.save();
    // Populate the saved message for response
    const populatedMessage = await MessageModel.findById(savedMessage._id)
      .populate('templateId', 'name category')
      .populate('createdBy', 'name email');
    contextLogger.info('Message created successfully', {
      messageId: savedMessage._id,
      type: savedMessage.type,
      scheduleType: savedMessage.scheduleType,
      recipientCount: recipientCounts.totalCount,
    });
    return NextResponse.json(
      {
        success: true,
        data: populatedMessage,
        message: 'Message created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    contextLogger.error('Unexpected error in createMessageHandler', error);
    // Handle validation errors
    if (error instanceof mongoose.Error.ValidationError) {
      const validationErrors = Object.values(error.errors).map(
        (err) => err.message
      );
      return NextResponse.json(
        { error: 'Validation failed', details: validationErrors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create message' },
      { status: 500 }
    );
  }
}

// Export handlers with logging middleware
export const GET = withApiLogger(getMessagesHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});

export const POST = withApiLogger(createMessageHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});
