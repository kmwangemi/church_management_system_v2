import { requireAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { withApiLogger } from '@/lib/middleware/api-logger';
import dbConnect from '@/lib/mongodb';
import { MilestoneModel } from '@/models';
import mongoose from 'mongoose';
import { type NextRequest, NextResponse } from 'next/server';

// POST /api/milestones/[id]/toggle-status - Toggle milestone active status
async function toggleMilestoneStatusHandler(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    {
      requestId,
      endpoint: `/api/church/milestones/${params.id}/toggle-status`,
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
    await dbConnect();
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: 'Invalid milestone ID' },
        { status: 400 }
      );
    }
    // Find the milestone and toggle its active status
    const milestone = await MilestoneModel.findOne({
      _id: params.id,
      churchId: user.user?.churchId,
    });
    if (!milestone) {
      return NextResponse.json(
        { error: 'Milestone not found' },
        { status: 404 }
      );
    }
    // Toggle the active status
    milestone.isActive = !milestone.isActive;
    await milestone.save();
    const updatedMilestone = await MilestoneModel.findById(milestone._id)
      .populate('prerequisiteMilestones', 'name points category level')
      .lean();
    return NextResponse.json({
      success: true,
      data: updatedMilestone,
      message: `Milestone ${milestone.isActive ? 'activated' : 'deactivated'} successfully`,
    });
  } catch (error) {
    contextLogger.error(
      'Unexpected error in toggleMilestoneStatusHandler',
      error
    );
    return NextResponse.json(
      { error: 'Failed to toggle milestone status' },
      { status: 500 }
    );
  }
}

// Export the handlers wrapped with logging middleware
export const POST = withApiLogger(toggleMilestoneStatusHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});
