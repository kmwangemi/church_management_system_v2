/** biome-ignore-all lint/style/useCollapsedElseIf: ignore collapsed else if */
import { requireAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { withApiLogger } from '@/lib/middleware/api-logger';
import dbConnect from '@/lib/mongodb';
import { AnnouncementModel } from '@/models';
import mongoose from 'mongoose';
import { type NextRequest, NextResponse } from 'next/server';

async function getAnnouncementHandler(
  request: NextRequest
): Promise<NextResponse> {
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    { requestId, endpoint: '/api/church/announcements' },
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
      20,
      Math.max(1, Number.parseInt(searchParams.get('limit') || '10', 10))
    ); // Cap at 20 for announcements
    const search = searchParams.get('search')?.trim() || '';
    const category = searchParams.get('category') || '';
    const priority = searchParams.get('priority') || '';
    const status = searchParams.get('status') || '';
    const includeExpired = searchParams.get('includeExpired') === 'true';
    // Build query object
    const query: any = {
      churchId: new mongoose.Types.ObjectId(user.user?.churchId),
    };
    // Add branch filter if user has specific branch access
    if (user.user?.branchId) {
      query.branchId = new mongoose.Types.ObjectId(user.user.branchId);
    }
    if (search) {
      // Add text search conditions
      query.$text = { $search: search };
    }
    if (
      category &&
      [
        'general',
        'service',
        'event',
        'prayer',
        'ministry',
        'youth',
        'children',
        'finance',
        'volunteer',
        'emergency',
      ].includes(category)
    ) {
      query.category = category;
    }
    if (priority && ['low', 'medium', 'high', 'urgent'].includes(priority)) {
      query.priority = priority;
    }
    if (
      status &&
      ['draft', 'published', 'archived', 'expired'].includes(status)
    ) {
      query.status = status;
    } else {
      // Default: only show published announcements for regular members
      if (user.user?.role === 'member') {
        query.status = 'published';
        query.publishDate = { $lte: new Date() };
        // Exclude expired announcements unless specifically requested
        if (!includeExpired) {
          query.$or = [
            { expiryDate: { $exists: false } },
            { expiryDate: { $gt: new Date() } },
          ];
        }
      }
    }
    const skip = (page - 1) * limit;
    // Execute queries with better error handling
    const [announcements, total] = await Promise.all([
      AnnouncementModel.find(query)
        .populate('authorId', 'firstName lastName email')
        .populate('branchId', 'name')
        .sort({
          isSticky: -1, // Sticky announcements first
          priority: 1, // Then by priority (urgent=1, high=2, medium=3, low=4)
          publishDate: -1, // Then by publish date (newest first)
          createdAt: -1,
        })
        .skip(skip)
        .limit(limit)
        .lean(),
      AnnouncementModel.countDocuments(query),
    ]);
    // If it's a text search, add score sorting
    let sortedAnnouncements = announcements;
    if (search) {
      sortedAnnouncements = announcements.sort((a: any, b: any) => {
        return (b.score || 0) - (a.score || 0);
      });
    }
    return NextResponse.json({
      success: true,
      data: {
        announcements: sortedAnnouncements,
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
    contextLogger.error('Unexpected error in getAnnouncementHandler', error);
    return NextResponse.json(
      { error: 'Failed to fetch announcements' },
      { status: 500 }
    );
  }
}

// Export the GET handler wrapped with logging middleware
export const GET = withApiLogger(getAnnouncementHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});

async function createAnnouncementHandler(
  request: NextRequest
): Promise<NextResponse> {
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    { requestId, endpoint: '/api/church/announcements' },
    'api'
  );
  try {
    // Check authentication and authorization - only admins can create announcements
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
    const announcementData = await request.json();
    // Validate required fields
    const requiredFields = [
      'title',
      'content',
      'category',
      'priority',
      'publishDate',
      'status',
    ];
    for (const field of requiredFields) {
      if (!announcementData[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }
    // Convert date strings to Date objects
    if (announcementData.publishDate) {
      announcementData.publishDate = new Date(announcementData.publishDate);
    }
    if (announcementData.expiryDate) {
      announcementData.expiryDate = new Date(announcementData.expiryDate);
    }
    // Create and save the announcement
    const announcement = new AnnouncementModel({
      ...announcementData,
      churchId: user.user?.churchId,
      branchId: user.user?.branchId || announcementData.branchId,
      authorId: user.user?.sub,
      viewCount: 0,
      notificationSent: false,
    });
    const savedAnnouncement = await announcement.save();
    // Populate author and branch info for response
    await savedAnnouncement.populate('authorId', 'firstName lastName email');
    await savedAnnouncement.populate('branchId', 'name');
    return NextResponse.json(
      {
        success: true,
        data: savedAnnouncement,
        message: 'Announcement created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    contextLogger.error('Unexpected error in createAnnouncementHandler', error);
    // Handle validation errors
    if (error instanceof mongoose.Error.ValidationError) {
      const validationErrors = Object.values(error.errors).map(
        (err) => err.message
      );
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationErrors,
        },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create announcement' },
      { status: 500 }
    );
  }
}

// Export the POST handler wrapped with logging middleware
export const POST = withApiLogger(createAnnouncementHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});

async function updateAnnouncementHandler(
  request: NextRequest
): Promise<NextResponse> {
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    { requestId, endpoint: '/api/church/announcements' },
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
    const announcementId = searchParams.get('id');
    if (!announcementId) {
      return NextResponse.json(
        { error: 'Announcement ID is required' },
        { status: 400 }
      );
    }
    const updateData = await request.json();
    // Convert date strings to Date objects
    if (updateData.publishDate) {
      updateData.publishDate = new Date(updateData.publishDate);
    }
    if (updateData.expiryDate) {
      updateData.expiryDate = new Date(updateData.expiryDate);
    }
    // Find and update the announcement
    const updatedAnnouncement = await AnnouncementModel.findOneAndUpdate(
      {
        _id: announcementId,
        churchId: user.user?.churchId,
      },
      updateData,
      {
        new: true,
        runValidators: true,
      }
    )
      .populate('authorId', 'firstName lastName email')
      .populate('branchId', 'name');
    if (!updatedAnnouncement) {
      return NextResponse.json(
        { error: 'Announcement not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({
      success: true,
      data: updatedAnnouncement,
      message: 'Announcement updated successfully',
    });
  } catch (error) {
    contextLogger.error('Unexpected error in updateAnnouncementHandler', error);
    if (error instanceof mongoose.Error.ValidationError) {
      const validationErrors = Object.values(error.errors).map(
        (err) => err.message
      );
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationErrors,
        },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to update announcement' },
      { status: 500 }
    );
  }
}

// Export the PUT handler wrapped with logging middleware
export const PUT = withApiLogger(updateAnnouncementHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});

async function deleteAnnouncementHandler(
  request: NextRequest
): Promise<NextResponse> {
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    { requestId, endpoint: '/api/church/announcements' },
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
    const announcementId = searchParams.get('id');
    if (!announcementId) {
      return NextResponse.json(
        { error: 'Announcement ID is required' },
        { status: 400 }
      );
    }
    // Find and delete the announcement
    const deletedAnnouncement = await AnnouncementModel.findOneAndDelete({
      _id: announcementId,
      churchId: user.user?.churchId,
    });
    if (!deletedAnnouncement) {
      return NextResponse.json(
        { error: 'Announcement not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({
      success: true,
      message: 'Announcement deleted successfully',
    });
  } catch (error) {
    contextLogger.error('Unexpected error in deleteAnnouncementHandler', error);
    return NextResponse.json(
      { error: 'Failed to delete announcement' },
      { status: 500 }
    );
  }
}

// Export the DELETE handler wrapped with logging middleware
export const DELETE = withApiLogger(deleteAnnouncementHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});
