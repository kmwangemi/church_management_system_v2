/** biome-ignore-all lint/complexity/noExcessiveCognitiveComplexity: ignore complexity */
import { requireAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { withApiLogger } from '@/lib/middleware/api-logger';
import dbConnect from '@/lib/mongodb';
import UserModel from '@/models/user'; // Only import User model
import { type NextRequest, NextResponse } from 'next/server';

async function getMemberHandler(request: NextRequest): Promise<NextResponse> {
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    { requestId, endpoint: '/api/users' },
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
    const { searchParams } = new URL(request.url);
    const page = Number.parseInt(searchParams.get('page') || '1', 10);
    const limit = Number.parseInt(searchParams.get('limit') || '10', 10);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const role = searchParams.get('role') || '';
    const isStaff = searchParams.get('isStaff');
    const isVolunteer = searchParams.get('isVolunteer');
    const isMember = searchParams.get('isMember');
    // Build query based on your model - FIXED to use isDeleted instead of status: 'deleted'
    const query: any = {
      churchId: user.user?.churchId,
      isDeleted: false, // Use isDeleted field from your model
    };
    // Search across common fields
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phoneNumber: { $regex: search, $options: 'i' } },
      ];
    }
    // Filter by user status - using the actual status field
    if (status) {
      query.status = status;
    }
    // Filter by role (single role system)
    if (role) {
      query.role = role;
    }
    // Filter by staff status
    if (isStaff !== null) {
      query.isStaff = isStaff === 'true';
    }
    // Filter by volunteer status
    if (isVolunteer !== null) {
      query.isVolunteer = isVolunteer === 'true';
    }
    // Filter by member status
    if (isMember !== null) {
      query.isMember = isMember === 'true';
    }
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      UserModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('createdBy', 'firstName lastName')
        .populate('updatedBy', 'firstName lastName')
        .populate('branchId', 'branchName')
        .lean(), // Use lean() for better performance
      UserModel.countDocuments(query),
    ]);
    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    contextLogger.error('Unexpected error in getMemberHandler', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Export handlers with logging middleware
export const GET = withApiLogger(getMemberHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});
