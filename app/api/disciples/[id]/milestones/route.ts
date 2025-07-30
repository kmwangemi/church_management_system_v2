import { requireAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { withApiLogger } from '@/lib/middleware/api-logger';
import dbConnect from '@/lib/mongodb';
import Disciple from '@/models/disciple';
import DiscipleProgress from '@/models/disciple-progress';
import Milestone from '@/models/milestone';
import mongoose from 'mongoose';
import { type NextRequest, NextResponse } from 'next/server';

// POST /api/disciples/[id]/milestones - Add milestone completion
async function addMilestoneCompletionHandler(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    { requestId, endpoint: `/api/disciples/${params.id}/milestones` },
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
        { error: 'Invalid disciple ID' },
        { status: 400 }
      );
    }
    const { milestoneId, notes, evidence } = await request.json();
    if (!(milestoneId && mongoose.Types.ObjectId.isValid(milestoneId))) {
      return NextResponse.json(
        { error: 'Valid milestone ID is required' },
        { status: 400 }
      );
    }
    // Check if disciple exists
    const disciple = await Disciple.findOne({
      _id: params.id,
      churchId: user.user?.churchId,
    });
    if (!disciple) {
      return NextResponse.json(
        { error: 'Disciple not found' },
        { status: 404 }
      );
    }
    // Check if milestone exists
    const milestone = await Milestone.findOne({
      _id: milestoneId,
      churchId: user.user?.churchId,
    });
    if (!milestone) {
      return NextResponse.json(
        { error: 'Milestone not found' },
        { status: 404 }
      );
    }
    // Check if milestone already completed
    const existingProgress = await DiscipleProgress.findOne({
      discipleId: params.id,
      milestoneId,
    });
    if (existingProgress) {
      return NextResponse.json(
        { error: 'Milestone already completed' },
        { status: 400 }
      );
    }
    // Create progress record
    const progressRecord = new DiscipleProgress({
      churchId: user.user?.churchId,
      branchId: user.user?.branchId,
      discipleId: params.id,
      milestoneId,
      pointsEarned: milestone.points,
      verifiedBy: user.user?.sub,
      notes,
      evidence,
      status: 'approved', // Auto-approve for now
    });
    await progressRecord.save();
    // Update disciple's milestones completed array
    await Disciple.findByIdAndUpdate(params.id, {
      $addToSet: { milestonesCompleted: milestoneId },
    });
    // Update milestone completion count
    await Milestone.findByIdAndUpdate(milestoneId, {
      $inc: { completionCount: 1 },
    });
    const populatedProgress = await DiscipleProgress.findById(
      progressRecord._id
    )
      .populate('milestoneId', 'name points category')
      .populate('verifiedBy', 'firstName lastName')
      .lean();
    return NextResponse.json(
      {
        success: true,
        data: populatedProgress,
        message: 'Milestone completion recorded successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    contextLogger.error(
      'Unexpected error in addMilestoneCompletionHandler',
      error
    );
    return NextResponse.json(
      { error: 'Failed to record milestone completion' },
      { status: 500 }
    );
  }
}

export const POST = withApiLogger(addMilestoneCompletionHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});
