import { requireAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { withApiLogger } from '@/lib/middleware/api-logger';
import dbConnect from '@/lib/mongodb';
import { BranchModel, DepartmentModel } from '@/models';
import { type NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  params: {
    branchId: string;
  };
}

async function getBranchDepartmentsHandler(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { branchId } = await params;
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    { requestId, endpoint: `/api/church/branches/${branchId}/departments` },
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
    if (!branchId) {
      return NextResponse.json(
        { error: 'Branch ID is required' },
        { status: 400 }
      );
    }
    // Verify the branch exists and belongs to the user's church
    const branch = await BranchModel.findOne({
      _id: branchId,
      churchId: user.user.churchId,
    });
    if (!branch) {
      return NextResponse.json(
        { error: 'Branch not found or access denied' },
        { status: 404 }
      );
    }
    // Get pagination and search parameters from query string
    const { searchParams } = new URL(request.url);
    const page = Number.parseInt(searchParams.get('page') || '1', 10);
    const limit = Number.parseInt(searchParams.get('limit') || '10', 10);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status'); // 'active' or 'inactive'
    // Build base query for departments
    const query: any = {
      branchId,
      churchId: user.user.churchId, // Extra security check
    };
    // Add status filter if provided
    if (status) {
      if (status === 'active') {
        query.isActive = true;
      } else if (status === 'inactive') {
        query.isActive = false;
      } else {
        return NextResponse.json(
          { error: 'Invalid status. Must be "active" or "inactive"' },
          { status: 400 }
        );
      }
    }
    // Handle search - search across department fields
    if (search && search.length > 0) {
      // regex-based search for specific fields
      query.$or = [
        { departmentName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    const skip = (page - 1) * limit;
    // Build the find query
    let findQuery = DepartmentModel.find(query);
    // If using text search, sort by text score for relevance
    if (search && query.$text) {
      findQuery = findQuery.sort({
        score: { $meta: 'textScore' },
        createdAt: -1,
      });
    } else {
      findQuery = findQuery.sort({ createdAt: -1 });
    }
    const [departments, total] = await Promise.all([
      findQuery
        .populate('branchId', 'branchName') // Populate branch info
        .skip(skip)
        .limit(limit),
      DepartmentModel.countDocuments(query),
    ]);
    // Build response
    const response: any = {
      departments,
      branch: {
        id: branch._id,
        name: branch.branchName,
        description: branch.description,
      },
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
    // Add search metadata if search was performed
    if (search) {
      response.searchTerm = search;
      response.searchResults = total;
    }
    if (status) {
      response.statusFilter = status;
    }
    contextLogger.info(
      `Retrieved ${departments.length} departments for branch ${branchId}${status ? ` with status: ${status}` : ''}`
    );
    return NextResponse.json(response);
  } catch (error) {
    contextLogger.error(
      'Unexpected error in getBranchDepartmentsHandler',
      error
    );
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Export the handler wrapped with logging middleware
export const GET = withApiLogger(getBranchDepartmentsHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});
