import { requireAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { withApiLogger } from '@/lib/middleware/api-logger';
import dbConnect from '@/lib/mongodb';
import Disciple from '@/models/disciple';
import DiscipleProgress from '@/models/disciple-progress';
import Milestone from '@/models/milestone';
import mongoose from 'mongoose';
import { type NextRequest, NextResponse } from 'next/server';

// GET /api/milestones/[id] - Get a specific milestone
async function getMilestoneHandler(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    { requestId, endpoint: `/api/milestones/${params.id}` },
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
    // Find the milestone
    const milestone = await Milestone.findOne({
      _id: params.id,
      churchId: user.user?.churchId,
    })
      .populate('prerequisiteMilestones', 'name points category level')
      .lean();
    if (!milestone) {
      return NextResponse.json(
        { error: 'Milestone not found' },
        { status: 404 }
      );
    }
    // Get completion statistics
    const completionStats = await DiscipleProgress.aggregate([
      {
        $match: {
          milestoneId: new mongoose.Types.ObjectId(params.id),
          churchId: new mongoose.Types.ObjectId(user.user?.churchId),
        },
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);
    // Get recent completions
    const recentCompletions = await DiscipleProgress.find({
      milestoneId: params.id,
      churchId: user.user?.churchId,
      status: 'approved',
    })
      .populate({
        path: 'discipleId',
        populate: {
          path: 'memberId',
          select: 'firstName lastName',
        },
      })
      .populate('verifiedBy', 'firstName lastName')
      .sort({ completedDate: -1 })
      .limit(10)
      .lean();
    // Format completion stats
    const stats = {
      approved: completionStats.find((s) => s._id === 'approved')?.count || 0,
      pending: completionStats.find((s) => s._id === 'pending')?.count || 0,
      rejected: completionStats.find((s) => s._id === 'rejected')?.count || 0,
      total: completionStats.reduce((sum, s) => sum + s.count, 0),
    };
    return NextResponse.json({
      success: true,
      data: {
        milestone,
        stats,
        recentCompletions,
      },
    });
  } catch (error) {
    contextLogger.error('Unexpected error in getMilestoneHandler', error);
    return NextResponse.json(
      { error: 'Failed to fetch milestone' },
      { status: 500 }
    );
  }
}

// PUT /api/milestones/[id] - Update a specific milestone
async function updateMilestoneHandler(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    { requestId, endpoint: `/api/milestones/${params.id}` },
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
    const updateData = await request.json();
    // Remove fields that shouldn't be updated directly
    const {
      churchId,
      branchId,
      completionCount,
      createdAt,
      updatedAt,
      ...allowedUpdates
    } = updateData;
    // Convert points to number if it's a string
    if (allowedUpdates.points) {
      const pointsValue =
        typeof allowedUpdates.points === 'string'
          ? Number.parseFloat(allowedUpdates.points)
          : allowedUpdates.points;
      if (Number.isNaN(pointsValue) || pointsValue <= 0) {
        return NextResponse.json(
          { error: 'Points must be a valid positive number' },
          { status: 400 }
        );
      }
      allowedUpdates.points = pointsValue;
    }
    // Check if name is being updated and ensure uniqueness
    if (allowedUpdates.name) {
      const existingMilestone = await Milestone.findOne({
        churchId: user.user?.churchId,
        name: { $regex: new RegExp(`^${allowedUpdates.name}$`, 'i') },
        _id: { $ne: params.id }, // Exclude current milestone
      });
      if (existingMilestone) {
        return NextResponse.json(
          { error: 'A milestone with this name already exists' },
          { status: 400 }
        );
      }
    }
    // Find and update the milestone
    const updatedMilestone = await Milestone.findOneAndUpdate(
      {
        _id: params.id,
        churchId: user.user?.churchId,
      },
      allowedUpdates,
      { new: true, runValidators: true }
    )
      .populate('prerequisiteMilestones', 'name points category level')
      .lean();
    if (!updatedMilestone) {
      return NextResponse.json(
        { error: 'Milestone not found' },
        { status: 404 }
      );
    }
    // If points were updated, update all existing progress records
    if (allowedUpdates.points) {
      await DiscipleProgress.updateMany(
        { milestoneId: params.id },
        { pointsEarned: allowedUpdates.points }
      );
    }
    return NextResponse.json({
      success: true,
      data: updatedMilestone,
      message: 'Milestone updated successfully',
    });
  } catch (error) {
    contextLogger.error('Unexpected error in updateMilestoneHandler', error);
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(
        (err: any) => err.message
      );
      return NextResponse.json(
        { error: 'Validation failed', details: validationErrors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to update milestone' },
      { status: 500 }
    );
  }
}

// DELETE /api/milestones/[id] - Delete a specific milestone
async function deleteMilestoneHandler(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    { requestId, endpoint: `/api/milestones/${params.id}` },
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
    // Check if milestone has any progress records
    const progressCount = await DiscipleProgress.countDocuments({
      milestoneId: params.id,
    });
    if (progressCount > 0) {
      return NextResponse.json(
        {
          error:
            'Cannot delete milestone with existing progress records. Consider deactivating it instead.',
        },
        { status: 400 }
      );
    }
    // Check if milestone is a prerequisite for other milestones
    const dependentMilestones = await Milestone.countDocuments({
      prerequisiteMilestones: params.id,
    });
    if (dependentMilestones > 0) {
      return NextResponse.json(
        {
          error:
            'Cannot delete milestone that is a prerequisite for other milestones',
        },
        { status: 400 }
      );
    }
    // Find and delete the milestone
    const deletedMilestone = await Milestone.findOneAndDelete({
      _id: params.id,
      churchId: user.user?.churchId,
    });
    if (!deletedMilestone) {
      return NextResponse.json(
        { error: 'Milestone not found' },
        { status: 404 }
      );
    }
    // Remove milestone from any disciple's completed milestones array
    await Disciple.updateMany(
      { milestonesCompleted: params.id },
      { $pull: { milestonesCompleted: params.id } }
    );

    return NextResponse.json({
      success: true,
      message: 'Milestone deleted successfully',
    });
  } catch (error) {
    contextLogger.error('Unexpected error in deleteMilestoneHandler', error);
    return NextResponse.json(
      { error: 'Failed to delete milestone' },
      { status: 500 }
    );
  }
}

// Export the handlers wrapped with logging middleware
export const GET = withApiLogger(getMilestoneHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});

export const PUT = withApiLogger(updateMilestoneHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});

export const DELETE = withApiLogger(deleteMilestoneHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});
