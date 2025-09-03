import { requireAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { withApiLogger } from '@/lib/middleware/api-logger';
import dbConnect from '@/lib/mongodb';
import { PrayerRequestModel } from '@/models';
import mongoose from 'mongoose';
import { type NextRequest, NextResponse } from 'next/server';

async function getPrayerRequestsHandler(
  request: NextRequest
): Promise<NextResponse> {
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    { requestId, endpoint: '/api/prayer-requests' },
    'api'
  );
  try {
    // Check authentication and authorization
    const authResult = await requireAuth(['superadmin', 'admin', 'member'])(
      request
    );
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
    // Parse query parameters with better validation
    const { searchParams } = new URL(request.url);
    const page = Math.max(
      1,
      Number.parseInt(searchParams.get('page') || '1', 10)
    );
    const limit = Math.min(
      50,
      Math.max(1, Number.parseInt(searchParams.get('limit') || '10', 10))
    ); // Cap at 50
    const search = searchParams.get('search')?.trim() || '';
    const category = searchParams.get('category') || '';
    const priority = searchParams.get('priority') || '';
    const status = searchParams.get('status') || '';
    const isPublic = searchParams.get('isPublic');
    const memberId = searchParams.get('memberId');
    // Build query object
    const query: any = {
      churchId: new mongoose.Types.ObjectId(user.user?.churchId),
    };
    // For non-admin users, only show public prayer requests or their own
    if (!['superadmin', 'admin'].includes(user.user?.role || '')) {
      query.$or = [
        { isPublic: true },
        { submittedBy: new mongoose.Types.ObjectId(user.user?.sub) },
      ];
    }
    if (search) {
      // Add search conditions using text search
      query.$text = { $search: search };
    }
    if (
      category &&
      [
        'health',
        'family',
        'career',
        'financial',
        'spiritual',
        'thanksgiving',
        'guidance',
        'other',
      ].includes(category)
    ) {
      query.category = category;
    }
    if (priority && ['low', 'medium', 'high', 'urgent'].includes(priority)) {
      query.priority = priority;
    }
    if (
      status &&
      ['active', 'answered', 'closed', 'archived'].includes(status)
    ) {
      query.status = status;
    }
    if (isPublic !== null && (isPublic === 'true' || isPublic === 'false')) {
      query.isPublic = isPublic === 'true';
    }
    if (memberId && mongoose.Types.ObjectId.isValid(memberId)) {
      query.memberId = new mongoose.Types.ObjectId(memberId);
    }
    const skip = (page - 1) * limit;
    // Execute queries with better error handling
    const [prayerRequests, total] = await Promise.all([
      PrayerRequestModel.find(query)
        .populate('memberId', 'firstName lastName') // Populate member info
        .populate('submittedBy', 'firstName lastName') // Populate submitter info
        .sort({ priority: -1, createdAt: -1 }) // Sort by priority then creation date
        .skip(skip)
        .limit(limit)
        .lean(), // Use lean() for better performance
      PrayerRequestModel.countDocuments(query),
    ]);
    return NextResponse.json({
      success: true,
      data: {
        prayerRequests,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    contextLogger.error('Unexpected error in getPrayerRequestsHandler', error);
    return NextResponse.json(
      { error: 'Failed to fetch prayer requests' },
      { status: 500 }
    );
  }
}

// Export the handler wrapped with logging middleware
export const GET = withApiLogger(getPrayerRequestsHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});

async function createPrayerRequestHandler(
  request: NextRequest
): Promise<NextResponse> {
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    { requestId, endpoint: '/api/prayer-requests' },
    'api'
  );
  try {
    // Check authentication and authorization
    const authResult = await requireAuth(['superadmin', 'admin', 'member'])(
      request
    );
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
    const prayerRequestData = await request.json();
    // Validate required fields
    const requiredFields = ['title', 'description', 'category', 'priority'];
    for (const field of requiredFields) {
      if (!prayerRequestData[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }
    // Validate category and priority values
    const validCategories = [
      'health',
      'family',
      'career',
      'financial',
      'spiritual',
      'thanksgiving',
      'guidance',
      'other',
    ];
    const validPriorities = ['low', 'medium', 'high', 'urgent'];
    if (!validCategories.includes(prayerRequestData.category)) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
    }
    if (!validPriorities.includes(prayerRequestData.priority)) {
      return NextResponse.json({ error: 'Invalid priority' }, { status: 400 });
    }
    // For non-anonymous requests, validate memberId
    if (!(prayerRequestData.isAnonymous || prayerRequestData.memberId)) {
      return NextResponse.json(
        { error: 'Member ID is required for non-anonymous prayer requests' },
        { status: 400 }
      );
    }
    // Create and save the prayer request
    const prayerRequest = new PrayerRequestModel({
      ...prayerRequestData,
      churchId: user.user?.churchId,
      branchId: user.user?.branchId, // Assuming user has branchId
      submittedBy: user.user?.sub,
      // Clear memberId if anonymous
      ...(prayerRequestData.isAnonymous && { memberId: undefined }),
    });
    const savedPrayerRequest = await prayerRequest.save();
    // Populate the saved prayer request for response
    const populatedPrayerRequest = await PrayerRequestModel.findById(
      savedPrayerRequest._id
    )
      .populate('memberId', 'firstName lastName')
      .populate('submittedBy', 'firstName lastName');
    return NextResponse.json(
      {
        success: true,
        data: populatedPrayerRequest,
        message: 'Prayer request created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    contextLogger.error(
      'Unexpected error in createPrayerRequestHandler',
      error
    );
    return NextResponse.json(
      { error: 'Failed to create prayer request' },
      { status: 500 }
    );
  }
}

// Export the handler wrapped with logging middleware
export const POST = withApiLogger(createPrayerRequestHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});
