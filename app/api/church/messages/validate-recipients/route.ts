import { requireAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { withApiLogger } from '@/lib/middleware/api-logger';
import dbConnect from '@/lib/mongodb';
import { DepartmentModel, GroupModel, UserModel } from '@/models';
import mongoose from 'mongoose';
import { type NextRequest, NextResponse } from 'next/server';

// POST /api/messages/validate-recipients - Validate recipient groups before sending
async function validateRecipientsHandler(
  request: NextRequest
): Promise<NextResponse> {
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    { requestId, endpoint: '/api/church/messages/validate-recipients' },
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
    const validationResults = [];
    let hasErrors = false;
    for (const recipientId of recipients) {
      const result = {
        recipientId,
        isValid: true,
        exists: true,
        isActive: true,
        memberCount: 0,
        error: null,
      };
      try {
        if (recipientId === 'all' || recipientId === 'active') {
          // These are always valid system groups
          result.memberCount = await UserModel.countDocuments({
            churchId,
            ...(recipientId === 'active' ? { status: 'active' } : {}),
          });
        } else if (recipientId.startsWith('dept_')) {
          const departmentId = recipientId.replace('dept_', '');
          const department = await DepartmentModel.findOne({
            _id: new mongoose.Types.ObjectId(departmentId),
            churchId,
          });
          if (!department) {
            result.isValid = false;
            result.exists = false;
            result.error = 'Department not found';
            hasErrors = true;
          } else if (department.isActive) {
            result.memberCount = await UserModel.countDocuments({
              churchId,
              departmentId: new mongoose.Types.ObjectId(departmentId),
              status: 'active',
            });
          } else {
            result.isActive = false;
            result.error = 'Department is inactive';
            hasErrors = true;
          }
        } else if (recipientId.startsWith('group_')) {
          const groupId = recipientId.replace('group_', '');
          const group = await GroupModel.findOne({
            _id: new mongoose.Types.ObjectId(groupId),
            churchId,
          });
          if (!group) {
            result.isValid = false;
            result.exists = false;
            result.error = 'Group not found';
            hasErrors = true;
          } else if (group.isActive) {
            result.memberCount = await UserModel.countDocuments({
              churchId,
              groupId: new mongoose.Types.ObjectId(groupId),
              status: 'active',
            });
          } else {
            result.isActive = false;
            result.error = 'Group is inactive';
            hasErrors = true;
          }
        } else if (recipientId === 'leadership') {
          result.memberCount = await UserModel.countDocuments({
            churchId,
            role: { $in: ['leader', 'pastor', 'deacon', 'elder'] },
            status: 'active',
          });
        } else if (recipientId === 'volunteers') {
          result.memberCount = await UserModel.countDocuments({
            churchId,
            role: 'volunteer',
            status: 'active',
          });
        } else {
          result.isValid = false;
          result.exists = false;
          result.error = 'Unknown recipient group';
          hasErrors = true;
        }
      } catch (error) {
        result.isValid = false;
        result.error = `Validation error: ${error.message}`;
        hasErrors = true;
        contextLogger.error(
          `Error validating recipient ${recipientId}:`,
          error
        );
      }
      validationResults.push(result);
    }
    const totalMemberCount = validationResults
      .filter((r) => r.isValid && r.isActive)
      .reduce((sum, r) => sum + r.memberCount, 0);
    contextLogger.info('Recipients validated', {
      totalRecipients: recipients.length,
      validRecipients: validationResults.filter((r) => r.isValid && r.isActive)
        .length,
      totalMemberCount,
      hasErrors,
    });
    return NextResponse.json({
      success: !hasErrors,
      data: {
        validationResults,
        totalMemberCount,
        hasErrors,
        validRecipients: validationResults.filter(
          (r) => r.isValid && r.isActive
        ).length,
      },
      message: hasErrors
        ? 'Some recipients have validation errors'
        : 'All recipients are valid',
    });
  } catch (error) {
    contextLogger.error('Unexpected error in validateRecipientsHandler', error);
    return NextResponse.json(
      { error: 'Failed to validate recipients' },
      { status: 500 }
    );
  }
}

// Export handlers with logging middleware
export const POST = withApiLogger(validateRecipientsHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});
