import { requireAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { withApiLogger } from '@/lib/middleware/api-logger';
import dbConnect from '@/lib/mongodb';
import { DepartmentModel } from '@/models';
import mongoose from 'mongoose';
import { type NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  params: {
    departmentId: string;
  };
}

// GET /api/church/departments/[id] - Get single department
async function getDepartmentByIdHandler(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { departmentId } = await params;
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    { requestId, endpoint: `/api/church/departments/${departmentId}` },
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
    if (!mongoose.Types.ObjectId.isValid(departmentId)) {
      return NextResponse.json(
        { error: 'Invalid department ID format' },
        { status: 400 }
      );
    }
    await dbConnect();
    const department = await DepartmentModel.findOne({
      _id: departmentId,
      churchId: user.user.churchId,
    })
      .populate('churchId', 'name')
      .populate('leaderId', 'firstName lastName email')
      .populate('branchId', 'name')
      .populate('members.userId', 'firstName lastName email')
      .populate('activities.organizedBy', 'firstName lastName')
      .populate('activities.participants', 'firstName lastName')
      .populate('goals.createdBy', 'firstName lastName')
      .populate('goals.assignedTo', 'firstName lastName')
      .populate('expenses.approvedBy', 'firstName lastName');
    if (!department) {
      return NextResponse.json(
        { error: 'Department not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, department });
  } catch (error) {
    contextLogger.error('Unexpected error in getDepartmentByIdHandler', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/church/departments/[id] - Update department
async function updateDepartmentHandler(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { departmentId } = await params;
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    { requestId, endpoint: `/api/church/departments/${departmentId}` },
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
    if (!mongoose.Types.ObjectId.isValid(departmentId)) {
      return NextResponse.json(
        { error: 'Invalid department ID format' },
        { status: 400 }
      );
    }
    await dbConnect();
    const body = await request.json();
    // Check if department exists and belongs to the user's church
    const existingDepartment = await DepartmentModel.findOne({
      _id: departmentId,
      churchId: user.user.churchId,
    });
    if (!existingDepartment) {
      return NextResponse.json(
        { error: 'Department not found' },
        { status: 404 }
      );
    }
    // Extract allowed update fields
    const {
      departmentName,
      description,
      meetingDay,
      meetingTime,
      leaderId,
      branchId,
      isActive,
      totalBudget,
    } = body;
    const updateData: any = {};
    if (departmentName !== undefined)
      updateData.departmentName = departmentName;
    if (description !== undefined) updateData.description = description;
    if (meetingDay !== undefined) updateData.meetingDay = meetingDay;
    if (meetingTime !== undefined) updateData.meetingTime = meetingTime;
    if (leaderId !== undefined) updateData.leaderId = leaderId;
    if (branchId !== undefined) updateData.branchId = branchId;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (totalBudget !== undefined) updateData.totalBudget = totalBudget;
    // Check for duplicate department name if departmentName is being updated
    if (
      updateData.departmentName &&
      updateData.departmentName !== existingDepartment.departmentName
    ) {
      const duplicateDepartment = await DepartmentModel.findOne({
        departmentName: updateData.departmentName,
        churchId: user.user.churchId,
        _id: { $ne: departmentId }, // Exclude current department from search
      });
      if (duplicateDepartment) {
        return NextResponse.json(
          { error: 'Department name already exists in this church' },
          { status: 400 }
        );
      }
    }
    const updatedDepartment = await DepartmentModel.findByIdAndUpdate(
      departmentId,
      {
        ...updateData,
        updatedAt: new Date(),
      },
      { new: true, runValidators: true }
    )
      .populate('churchId', 'name')
      .populate('leaderId', 'firstName lastName email')
      .populate('branchId', 'name');
    contextLogger.info('Department updated successfully', {
      departmentId,
      updatedFields: Object.keys(updateData),
    });
    return NextResponse.json({
      success: true,
      message: 'Department updated successfully',
      data: updatedDepartment,
    });
  } catch (error: any) {
    contextLogger.error('Unexpected error in updateDepartmentHandler', error);
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/church/departments/[id] - Delete department
async function deleteDepartmentHandler(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { departmentId } = await params;
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    { requestId, endpoint: `/api/church/departments/${departmentId}` },
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
    if (!mongoose.Types.ObjectId.isValid(departmentId)) {
      return NextResponse.json(
        { error: 'Invalid department ID format' },
        { status: 400 }
      );
    }
    await dbConnect();
    // Check if department exists and belongs to the user's church
    const existingDepartment = await DepartmentModel.findOne({
      _id: departmentId,
      churchId: user.user.churchId,
    });
    if (!existingDepartment) {
      return NextResponse.json(
        { error: 'Department not found' },
        { status: 404 }
      );
    }
    // Get query parameter to determine if it's a soft delete or hard delete
    const { searchParams } = new URL(request.url);
    const forceDelete = searchParams.get('force') === 'true';
    if (forceDelete) {
      // Hard delete - permanently remove the department
      await DepartmentModel.findByIdAndDelete(departmentId);
      contextLogger.info('Department permanently deleted', { departmentId });
      return NextResponse.json({
        message: 'Department permanently deleted successfully',
      });
    }
    // Check if the department model has a softDelete method
    if (typeof existingDepartment.softDelete === 'function') {
      // Soft delete - mark as inactive
      const deactivatedDepartment = await existingDepartment.softDelete();
      contextLogger.info('Department deactivated (soft delete)', {
        departmentId,
      });
      return NextResponse.json({
        success: true,
        message: 'Department deactivated successfully',
        data: { id: deactivatedDepartment._id },
      });
    }
    // Fallback to hard delete if soft delete is not available
    const deletedDepartment =
      await DepartmentModel.findByIdAndDelete(departmentId);
    contextLogger.info('Department deleted', { departmentId });
    return NextResponse.json({
      success: true,
      message: 'Department deleted successfully',
      data: { id: deletedDepartment._id },
    });
  } catch (error) {
    contextLogger.error('Unexpected error in deleteDepartmentHandler', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Export the handlers wrapped with logging middleware
export const GET = withApiLogger(getDepartmentByIdHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});

export const PUT = withApiLogger(updateDepartmentHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});

export const DELETE = withApiLogger(deleteDepartmentHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});
