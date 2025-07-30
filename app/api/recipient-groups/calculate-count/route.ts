import { requireAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { withApiLogger } from '@/lib/middleware/api-logger';
import dbConnect from '@/lib/mongodb';
import User from '@/models/user';
import mongoose from 'mongoose';
import { type NextRequest, NextResponse } from 'next/server';

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
      const query: any = { churchId, status: 'active' };
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

export const POST = withApiLogger(calculateMemberCountHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});
