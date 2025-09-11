import { requireAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { withApiLogger } from '@/lib/middleware/api-logger';
import dbConnect from '@/lib/mongodb';
import type { AddBranchPayload } from '@/lib/validations/branch';
import { BranchModel } from '@/models';
import { type NextRequest, NextResponse } from 'next/server';

async function getBranchHandler(request: NextRequest): Promise<NextResponse> {
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    { requestId, endpoint: '/api/church/branches' },
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
    const status = searchParams.get('status'); // 'active', 'inactive', or undefined for all
    // Build base query
    const query: any = { churchId: user.user.churchId };
    // Add status filter if provided
    if (status === 'active') {
      query.isActive = true;
    } else if (status === 'inactive') {
      query.isActive = false;
    }
    // Handle search - improved to search nested address fields correctly
    if (search && search.length > 0) {
      // Option 1: Use text search (recommended if you have text index)
      // Use MongoDB text search for better performance
      query.$text = { $search: search };
      // Option 2: Alternative regex-based search for specific fields
      // Uncomment this if you prefer regex search or don't have text index
      /*
      query.$or = [
        { branchName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'address.street': { $regex: search, $options: 'i' } },
        { 'address.city': { $regex: search, $options: 'i' } },
        { 'address.state': { $regex: search, $options: 'i' } },
        { 'address.country': { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phoneNumber: { $regex: search, $options: 'i' } }
      ];
      */
    }
    const skip = (page - 1) * limit;
    // Build the find query
    let findQuery = BranchModel.find(query);
    // If using text search, sort by text score for relevance
    if (search && query.$text) {
      findQuery = findQuery.sort({
        score: { $meta: 'textScore' },
        createdAt: -1,
      });
    } else {
      findQuery = findQuery.sort({ createdAt: -1 });
    }
    const [branches, total] = await Promise.all([
      findQuery
        .populate('pastorId', 'firstName lastName email') // Updated to match your user fields
        .skip(skip)
        .limit(limit),
      BranchModel.countDocuments(query),
    ]);
    // Optional: Add metadata about the search
    const response: any = {
      branches,
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
    return NextResponse.json(response);
  } catch (error) {
    contextLogger.error('Unexpected error in getBranchHandler', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Export the handler wrapped with logging middleware
export const GET = withApiLogger(getBranchHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});

async function registerBranchHandler(
  request: NextRequest
): Promise<NextResponse> {
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    { requestId, endpoint: '/api/church/branches' },
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
    const branchData: AddBranchPayload = await request.json();
    const existingChurchBranch = await BranchModel.findOne({
      branchName: branchData.branchName,
      churchId: user.user?.churchId,
      country: branchData.address.country,
    });
    if (existingChurchBranch) {
      return NextResponse.json(
        { error: 'Church branch already exists' },
        { status: 400 }
      );
    }
    const branch = new BranchModel({
      ...branchData,
      churchId: user.user?.churchId,
    });
    await branch.save();
    return NextResponse.json(branch, { status: 201 });
  } catch (error) {
    contextLogger.error('Unexpected error in registerBranchHandler', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Export the handler wrapped with logging middleware
export const POST = withApiLogger(registerBranchHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});
