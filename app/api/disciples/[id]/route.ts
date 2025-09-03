import { requireAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { withApiLogger } from '@/lib/middleware/api-logger';
import dbConnect from '@/lib/mongodb';
import { DiscipleModel, DiscipleProgressModel } from '@/models';
import mongoose from 'mongoose';
import { type NextRequest, NextResponse } from 'next/server';

// GET /api/disciples/[id] - Get a specific disciple
async function getDiscipleHandler(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    { requestId, endpoint: `/api/disciples/${params.id}` },
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
    // Find the disciple
    const disciple = await DiscipleModel.findOne({
      _id: params.id,
      churchId: user.user?.churchId,
    })
      .populate('memberId', 'firstName lastName email phone')
      .populate('mentorId', 'firstName lastName email phone')
      .populate('milestonesCompleted', 'name points category')
      .lean();
    if (!disciple) {
      return NextResponse.json(
        { error: 'Disciple not found' },
        { status: 404 }
      );
    }
    // Get progress records for this disciple
    const progressRecords = await DiscipleProgressModel.find({
      discipleId: params.id,
      churchId: user.user?.churchId,
    })
      .populate('milestoneId', 'name points category')
      .populate('verifiedBy', 'firstName lastName')
      .sort({ completedDate: -1 })
      .lean();
    // Calculate total points
    const totalPoints = await DiscipleProgressModel.calculateTotalPoints(
      new mongoose.Types.ObjectId(params.id)
    );
    return NextResponse.json({
      success: true,
      data: {
        disciple,
        progressRecords,
        totalPoints,
        stats: {
          milestonesCompleted: progressRecords.filter(
            (p) => p.status === 'approved'
          ).length,
          pendingApproval: progressRecords.filter((p) => p.status === 'pending')
            .length,
          totalPoints,
        },
      },
    });
  } catch (error) {
    contextLogger.error('Unexpected error in getDiscipleHandler', error);
    return NextResponse.json(
      { error: 'Failed to fetch disciple' },
      { status: 500 }
    );
  }
}

// PUT /api/disciples/[id] - Update a specific disciple
async function updateDiscipleHandler(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    { requestId, endpoint: `/api/disciples/${params.id}` },
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
    const updateData = await request.json();
    // Remove fields that shouldn't be updated directly
    const {
      churchId,
      branchId,
      memberId,
      createdAt,
      updatedAt,
      ...allowedUpdates
    } = updateData;
    // Find and update the disciple
    const updatedDisciple = await DiscipleModel.findOneAndUpdate(
      {
        _id: params.id,
        churchId: user.user?.churchId,
      },
      allowedUpdates,
      { new: true, runValidators: true }
    )
      .populate('memberId', 'firstName lastName email phoneNumber')
      .populate('mentorId', 'firstName lastName email phoneNumber')
      .populate('milestonesCompleted', 'name points category')
      .lean();
    if (!updatedDisciple) {
      return NextResponse.json(
        { error: 'Disciple not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({
      success: true,
      data: updatedDisciple,
      message: 'Disciple updated successfully',
    });
  } catch (error) {
    contextLogger.error('Unexpected error in updateDiscipleHandler', error);
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
      { error: 'Failed to update disciple' },
      { status: 500 }
    );
  }
}

// DELETE /api/disciples/[id] - Delete a specific disciple
async function deleteDiscipleHandler(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    { requestId, endpoint: `/api/disciples/${params.id}` },
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
    // Find and delete the disciple
    const deletedDisciple = await DiscipleModel.findOneAndDelete({
      _id: params.id,
      churchId: user.user?.churchId,
    });
    if (!deletedDisciple) {
      return NextResponse.json(
        { error: 'Disciple not found' },
        { status: 404 }
      );
    }
    // Also delete associated progress records
    await DiscipleProgressModel.deleteMany({
      discipleId: params.id,
      churchId: user.user?.churchId,
    });
    return NextResponse.json({
      success: true,
      message: 'Disciple deleted successfully',
    });
  } catch (error) {
    contextLogger.error('Unexpected error in deleteDiscipleHandler', error);
    return NextResponse.json(
      { error: 'Failed to delete disciple' },
      { status: 500 }
    );
  }
}

// Export the handlers wrapped with logging middleware
export const GET = withApiLogger(getDiscipleHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});

export const PUT = withApiLogger(updateDiscipleHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});

export const DELETE = withApiLogger(deleteDiscipleHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});
