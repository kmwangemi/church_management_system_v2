/** biome-ignore-all lint/complexity/noExcessiveCognitiveComplexity: ignore */
import { requireAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { withApiLogger } from '@/lib/middleware/api-logger';
import dbConnect from '@/lib/mongodb';
import Milestone from '@/models/milestone';
import mongoose from 'mongoose';
import { type NextRequest, NextResponse } from 'next/server';

async function getMilestonesHandler(
  request: NextRequest
): Promise<NextResponse> {
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    { requestId, endpoint: '/api/milestones' },
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
    // Parse query parameters with better validation
    const { searchParams } = new URL(request.url);
    const page = Math.max(
      1,
      Number.parseInt(searchParams.get('page') || '1', 10)
    );
    const limit = Math.min(
      20,
      Math.max(1, Number.parseInt(searchParams.get('limit') || '10', 10))
    ); // Cap at 20 for milestones
    const search = searchParams.get('search')?.trim() || '';
    const category = searchParams.get('category') || '';
    const level = searchParams.get('level') || '';
    const isActive = searchParams.get('isActive');
    // Build query object
    const query: any = {
      churchId: new mongoose.Types.ObjectId(user.user?.churchId),
    };
    if (search) {
      // Add search conditions using text search
      query.$text = { $search: search };
    }
    if (
      category &&
      [
        'spiritual_growth',
        'bible_study',
        'prayer',
        'service',
        'leadership',
        'evangelism',
        'fellowship',
        'worship',
        'discipleship',
      ].includes(category)
    ) {
      // Add category filter with validation
      query.category = category;
    }
    if (
      level &&
      ['new-convert', 'growing', 'mature', 'leader'].includes(level)
    ) {
      // Add level filter with validation
      query.level = level;
    }
    if (isActive !== null && isActive !== undefined) {
      // Add active status filter
      query.isActive = isActive === 'true';
    }
    const skip = (page - 1) * limit;
    // Determine sort order
    let sortOrder: any = { order: 1, createdAt: -1 }; // Default sort by order then creation date
    if (search) {
      // If searching, sort by text score
      sortOrder = { score: { $meta: 'textScore' }, order: 1 };
    }
    // Execute queries with better error handling
    const [milestones, total] = await Promise.all([
      Milestone.find(query)
        .populate('prerequisiteMilestones', 'name points category level')
        .sort(sortOrder)
        .skip(skip)
        .limit(limit)
        .lean(), // Use lean() for better performance
      Milestone.countDocuments(query),
    ]);
    return NextResponse.json({
      success: true,
      data: {
        milestones,
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
    contextLogger.error('Unexpected error in getMilestonesHandler', error);
    return NextResponse.json(
      { error: 'Failed to fetch milestones' },
      { status: 500 }
    );
  }
}

// Export the handler wrapped with logging middleware
export const GET = withApiLogger(getMilestonesHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});

async function createMilestoneHandler(
  request: NextRequest
): Promise<NextResponse> {
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    { requestId, endpoint: '/api/milestones' },
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
    const milestoneData = await request.json();
    // Validate required fields
    const { name, description, category, points } = milestoneData;
    if (!(name && description && category && points)) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    // Convert points to number if it's a string
    const pointsValue =
      typeof points === 'string' ? Number.parseFloat(points) : points;
    if (Number.isNaN(pointsValue) || pointsValue <= 0) {
      return NextResponse.json(
        { error: 'Points must be a valid positive number' },
        { status: 400 }
      );
    }
    // Check if milestone name already exists for this church
    const existingMilestone = await Milestone.findOne({
      churchId: user.user?.churchId,
      name: { $regex: new RegExp(`^${name}$`, 'i') }, // Case-insensitive exact match
    });
    if (existingMilestone) {
      return NextResponse.json(
        { error: 'A milestone with this name already exists' },
        { status: 400 }
      );
    }
    // Get the next order number for this category
    const lastMilestone = await Milestone.findOne({
      churchId: user.user?.churchId,
      category,
    }).sort({ order: -1 });
    const nextOrder = lastMilestone ? lastMilestone.order + 1 : 1;
    // Set default level if not provided
    const level = milestoneData.level || 'new-convert';
    // Create and save the milestone
    const milestone = new Milestone({
      ...milestoneData,
      churchId: user.user?.churchId,
      branchId: user.user?.branchId, // Assuming user has branchId
      points: pointsValue,
      level,
      order: nextOrder,
    });
    const savedMilestone = await milestone.save();
    return NextResponse.json(
      {
        success: true,
        data: savedMilestone,
        message: 'Milestone created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    contextLogger.error('Unexpected error in createMilestoneHandler', error);
    // Handle validation errors
    return NextResponse.json(
      { error: 'Failed to create milestone' },
      { status: 500 }
    );
  }
}

// Export the handler wrapped with logging middleware
export const POST = withApiLogger(createMilestoneHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});
