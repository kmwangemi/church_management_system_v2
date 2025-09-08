import { requireAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { withApiLogger } from '@/lib/middleware/api-logger';
import dbConnect from '@/lib/mongodb';
import type { AddBranchPayload } from '@/lib/validations/branch';
import { BranchModel } from '@/models';
import mongoose from 'mongoose';
import { type NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/branches/[id] - Get single branch by ID
async function getBranchByIdHandler(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { id } = await params;
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    { requestId, endpoint: `/api/branches/${id}` },
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
    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid branch ID format' },
        { status: 400 }
      );
    }
    await dbConnect();
    const branch = await BranchModel.findOne({
      _id: id,
      churchId: user.user.churchId,
    }).populate('pastorId', 'firstName lastName email');
    if (!branch) {
      return NextResponse.json({ error: 'Branch not found' }, { status: 404 });
    }
    return NextResponse.json({ branch });
  } catch (error) {
    contextLogger.error('Unexpected error in getBranchByIdHandler', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/branches/[id] - Update branch by ID
async function updateBranchHandler(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { id } = await params;
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    { requestId, endpoint: `/api/branches/${id}` },
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
    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid branch ID format' },
        { status: 400 }
      );
    }
    await dbConnect();
    const updateData: Partial<AddBranchPayload> = await request.json();
    // Check if branch exists and belongs to the user's church
    const existingBranch = await BranchModel.findOne({
      _id: id,
      churchId: user.user.churchId,
    });
    if (!existingBranch) {
      return NextResponse.json({ error: 'Branch not found' }, { status: 404 });
    }
    // Check for duplicate branch name if branchName is being updated
    if (
      updateData.branchName &&
      updateData.branchName !== existingBranch.branchName
    ) {
      const duplicateBranch = await BranchModel.findOne({
        branchName: updateData.branchName,
        churchId: user.user.churchId,
        _id: { $ne: id }, // Exclude current branch from search
      });
      if (duplicateBranch) {
        return NextResponse.json(
          { error: 'Branch name already exists in this church' },
          { status: 400 }
        );
      }
    }
    // Update the branch
    const updatedBranch = await BranchModel.findByIdAndUpdate(
      id,
      {
        ...updateData,
        updatedAt: new Date(),
      },
      {
        new: true,
        runValidators: true,
      }
    ).populate('pastorId', 'firstName lastName email');
    contextLogger.info('Branch updated successfully', {
      branchId: id,
      updatedFields: Object.keys(updateData),
    });
    return NextResponse.json({
      branch: updatedBranch,
      message: 'Branch updated successfully',
    });
  } catch (error) {
    contextLogger.error('Unexpected error in updateBranchHandler', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/branches/[id] - Delete branch by ID
async function deleteBranchHandler(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { id } = await params;
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    { requestId, endpoint: `/api/branches/${id}` },
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
    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid branch ID format' },
        { status: 400 }
      );
    }
    await dbConnect();
    // Check if branch exists and belongs to the user's church
    const existingBranch = await BranchModel.findOne({
      _id: id,
      churchId: user.user.churchId,
    });
    if (!existingBranch) {
      return NextResponse.json({ error: 'Branch not found' }, { status: 404 });
    }
    // Get query parameter to determine if it's a soft delete or hard delete
    const { searchParams } = new URL(request.url);
    const forceDelete = searchParams.get('force') === 'true';
    if (forceDelete) {
      // Hard delete - permanently remove the branch
      await BranchModel.findByIdAndDelete(id);
      contextLogger.info('Branch permanently deleted', { branchId: id });
      return NextResponse.json({
        message: 'Branch permanently deleted successfully',
      });
    }
    // Soft delete - mark as inactive
    const deactivatedBranch = await existingBranch.softDelete();
    contextLogger.info('Branch deactivated (soft delete)', {
      branchId: id,
    });
    return NextResponse.json({
      branch: deactivatedBranch,
      message: 'Branch deactivated successfully',
    });
  } catch (error) {
    contextLogger.error('Unexpected error in deleteBranchHandler', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Export the handlers wrapped with logging middleware
export const GET = withApiLogger(getBranchByIdHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});

export const PUT = withApiLogger(updateBranchHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});

export const DELETE = withApiLogger(deleteBranchHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});
