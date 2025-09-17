import { requireAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { withApiLogger } from '@/lib/middleware/api-logger';
import dbConnect from '@/lib/mongodb';
import type { AddDepartmentPayload } from '@/lib/validations/department';
import { DepartmentModel } from '@/models';
import { type NextRequest, NextResponse } from 'next/server';

async function getDepartmentHandler(
  request: NextRequest
): Promise<NextResponse> {
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    { requestId, endpoint: '/api/church/departments' },
    'api'
  );
  try {
    // Check authentication and authorization
    const authResult = await requireAuth(['superadmin', 'admin'])(request);
    if (authResult instanceof Response) {
      // If authResult is a Response object, it means authentication/authorization failed
      // Convert Response to NextResponse
      const body = await authResult.text();
      return new NextResponse(body, {
        status: authResult.status,
        statusText: authResult.statusText,
        headers: authResult.headers,
      });
    }
    // authResult is now the authenticated user
    const user = authResult;
    if (!user.user?.churchId) {
      // Validate user has churchId
      return NextResponse.json(
        { error: 'Church ID not found' },
        { status: 400 }
      );
    }
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const page = Number.parseInt(searchParams.get('page') || '1', 10);
    const limit = Number.parseInt(searchParams.get('limit') || '10', 10);
    const search = searchParams.get('search') || '';
    const query: any = { churchId: user.user?.churchId };
    if (search) {
      query.$or = [
        { departmentName: { $regex: search, $options: 'i' } },
        // { address: { $regex: search, $options: 'i' } },
      ];
    }
    const skip = (page - 1) * limit;
    const [departments, total] = await Promise.all([
      DepartmentModel.find(query)
        .populate('branchId', 'branchName address')
        .select('-members -budgetCategories -expenses -activities -goals')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      DepartmentModel.countDocuments(query),
    ]);
    return NextResponse.json({
      departments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    contextLogger.error('Unexpected error in getDepartmentHandler', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Export the handler wrapped with logging middleware
export const GET = withApiLogger(getDepartmentHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});

async function registerDepartmentHandler(
  request: NextRequest
): Promise<NextResponse> {
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    { requestId, endpoint: '/api/church/departments' },
    'api'
  );
  try {
    // Check authentication and authorization
    const authResult = await requireAuth(['superadmin', 'admin'])(request);
    if (authResult instanceof Response) {
      // If authResult is a Response object, it means authentication/authorization failed
      // Convert Response to NextResponse
      const body = await authResult.text();
      return new NextResponse(body, {
        status: authResult.status,
        statusText: authResult.statusText,
        headers: authResult.headers,
      });
    }
    // authResult is now the authenticated user
    const user = authResult;
    if (!user.user?.churchId) {
      // Validate user has churchId
      return NextResponse.json(
        { error: 'Church ID not found' },
        { status: 400 }
      );
    }
    await dbConnect();
    const departmentData: AddDepartmentPayload = await request.json();
    const existingDepartment = await DepartmentModel.findOne({
      departmentName: departmentData.departmentName,
      churchId: user.user?.churchId,
    });
    if (existingDepartment) {
      return NextResponse.json(
        { error: 'Department already exists' },
        { status: 400 }
      );
    }
    const department = new DepartmentModel({
      ...departmentData,
      churchId: user.user?.churchId,
    });
    await department.save();
    return NextResponse.json(department, { status: 201 });
  } catch (error) {
    contextLogger.error('Unexpected error in registerDepartmentHandler', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Export the handler wrapped with logging middleware
export const POST = withApiLogger(registerDepartmentHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});
