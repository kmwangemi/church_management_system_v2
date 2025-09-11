import { requireAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { withApiLogger } from '@/lib/middleware/api-logger';
import dbConnect from '@/lib/mongodb';
import { BranchModel, UserModel } from '@/models';
import { type NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  params: {
    id: string;
  };
}

async function getBranchMembersHandler(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { id } = await params;
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    { requestId, endpoint: `/api/church/branches/${id}/members` },
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
    // Extract branchId from route parameters
    const branchId = id;
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
    const status = searchParams.get('status'); // 'active', 'inactive', 'suspended', 'pending', or undefined for all
    // Build base query for members
    const query: any = {
      branchId,
      churchId: user.user.churchId, // Extra security check
    };
    // Add status filter if provided
    if (status) {
      const validStatuses = ['active', 'inactive', 'suspended', 'pending'];
      if (validStatuses.includes(status)) {
        query.status = status;
      } else {
        return NextResponse.json(
          {
            error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
          },
          { status: 400 }
        );
      }
    }
    // Handle search - search across member fields
    if (search && search.length > 0) {
      // Option 1: Use text search (recommended if you have text index)
      query.$text = { $search: search };
      // Option 2: Alternative regex-based search for specific fields
      // Uncomment this if you prefer regex search or don't have text index
      /*
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phoneNumber: { $regex: search, $options: 'i' } },
        { 'address.street': { $regex: search, $options: 'i' } },
        { 'address.city': { $regex: search, $options: 'i' } },
        { 'address.state': { $regex: search, $options: 'i' } },
        { membershipId: { $regex: search, $options: 'i' } }
      ];
      */
    }
    const skip = (page - 1) * limit;
    // Build the find query
    let findQuery = UserModel.find(query);
    // If using text search, sort by text score for relevance
    if (search && query.$text) {
      findQuery = findQuery.sort({
        score: { $meta: 'textScore' },
        createdAt: -1,
      });
    } else {
      findQuery = findQuery.sort({ createdAt: -1 });
    }
    const [users, total] = await Promise.all([
      findQuery
        .populate('branchId', 'branchName') // Populate branch info
        .skip(skip)
        .limit(limit),
      UserModel.countDocuments(query),
    ]);
    // Build response
    const response: any = {
      users,
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
      `Retrieved ${users.length} members for branch ${branchId}${status ? ` with status: ${status}` : ''}`
    );
    return NextResponse.json(response);
  } catch (error) {
    contextLogger.error('Unexpected error in getBranchMembersHandler', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Export the handler wrapped with logging middleware
export const GET = withApiLogger(getBranchMembersHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});
