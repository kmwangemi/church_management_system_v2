import { requireAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { withApiLogger } from '@/lib/middleware/api-logger';
import dbConnect from '@/lib/mongodb';
import { ContentModel } from '@/models';
import mongoose from 'mongoose';
import { type NextRequest, NextResponse } from 'next/server';

async function getContentHandler(request: NextRequest): Promise<NextResponse> {
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    { requestId, endpoint: '/api/content' },
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
    ); // Cap at 20
    const search = searchParams.get('search')?.trim() || '';
    const type = searchParams.get('type') || '';
    const category = searchParams.get('category') || '';
    const status = searchParams.get('status') || '';
    const tags =
      searchParams
        .get('tags')
        ?.split(',')
        .map((tag) => tag.trim())
        .filter(Boolean) || [];
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    // Build query object
    const query: any = {
      churchId: new mongoose.Types.ObjectId(user.user?.churchId),
    };
    // Add search conditions
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }
    // Add type filter
    if (
      type &&
      [
        'sermon',
        'bible_study',
        'prayer',
        'worship',
        'announcement',
        'event',
        'devotional',
        'testimony',
        'music',
        'video',
        'document',
        'image',
        'audio',
      ].includes(type)
    ) {
      query.type = type;
    }
    // Add category filter
    if (
      category &&
      [
        'spiritual',
        'educational',
        'administrative',
        'worship',
        'youth',
        'children',
        'missions',
        'fellowship',
        'outreach',
        'discipleship',
      ].includes(category)
    ) {
      query.category = category;
    }
    // Add status filter with validation
    if (
      status &&
      ['draft', 'published', 'archived', 'private'].includes(status)
    ) {
      query.status = status;
    }
    // Add tags filter
    if (tags.length > 0) {
      query.tags = { $in: tags };
    }
    // Only show published content for non-admin users
    if (!['superadmin', 'admin'].includes(user.user?.role || '')) {
      query.status = 'published';
      query.isPublic = true;
    }
    const skip = (page - 1) * limit;
    // Build sort object
    const sortObject: any = {};
    const validSortFields = [
      'createdAt',
      'updatedAt',
      'publishedAt',
      'title',
      'viewCount',
      'downloadCount',
    ];
    if (validSortFields.includes(sortBy)) {
      sortObject[sortBy] = sortOrder === 'asc' ? 1 : -1;
    } else {
      sortObject.createdAt = -1; // Default sort
    }
    // Add secondary sort by creation date if not already sorting by it
    if (sortBy !== 'createdAt') {
      sortObject.createdAt = -1;
    }
    // Execute queries with better error handling
    const [content, total] = await Promise.all([
      ContentModel.find(query)
        .sort(sortObject)
        .skip(skip)
        .limit(limit)
        .lean(), // Use lean() for better performance if you don't need mongoose documents
      ContentModel.countDocuments(query),
    ]);
    return NextResponse.json({
      success: true,
      data: {
        content,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
        },
        filters: {
          search,
          type,
          category,
          status,
          tags,
          sortBy,
          sortOrder,
        },
      },
    });
  } catch (error) {
    contextLogger.error('Unexpected error in getContentHandler', error);
    return NextResponse.json(
      { error: 'Failed to fetch content' },
      { status: 500 }
    );
  }
}

// Export the handler wrapped with logging middleware
export const GET = withApiLogger(getContentHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});

async function createContentHandler(
  request: NextRequest
): Promise<NextResponse> {
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    { requestId, endpoint: '/api/content' },
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
    const contentData = await request.json();
    // Parse tags if they come as a comma-separated string
    if (typeof contentData.tags === 'string') {
      contentData.tags = contentData.tags
        .split(',')
        .map((tag: string) => tag.trim())
        .filter((tag: string) => tag.length > 0);
    }
    // Create and save the content
    const content = new ContentModel({
      ...contentData,
      churchId: user.user?.churchId,
      // author: user.user?.name || user.user?.email || 'Unknown',
    });
    const savedContent = await content.save();
    return NextResponse.json(
      {
        success: true,
        data: savedContent,
        message: 'Content created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    contextLogger.error('Unexpected error in createContentHandler', error);
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
      { error: 'Failed to create content' },
      { status: 500 }
    );
  }
}

// Export the handler wrapped with logging middleware
export const POST = withApiLogger(createContentHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});

// Update content handler
async function updateContentHandler(
  request: NextRequest
): Promise<NextResponse> {
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    { requestId, endpoint: '/api/content' },
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
    const contentId = searchParams.get('id');
    if (!contentId) {
      return NextResponse.json(
        { error: 'Content ID is required' },
        { status: 400 }
      );
    }
    const contentData = await request.json();
    // Parse tags if they come as a comma-separated string
    if (typeof contentData.tags === 'string') {
      contentData.tags = contentData.tags
        .split(',')
        .map((tag: string) => tag.trim())
        .filter((tag: string) => tag.length > 0);
    }
    const updatedContent = await ContentModel.findOneAndUpdate(
      {
        _id: contentId,
        churchId: user.user?.churchId,
      },
      contentData,
      {
        new: true,
        runValidators: true,
      }
    );
    if (!updatedContent) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    }
    return NextResponse.json({
      success: true,
      data: updatedContent,
      message: 'Content updated successfully',
    });
  } catch (error) {
    contextLogger.error('Unexpected error in updateContentHandler', error);
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
      { error: 'Failed to update content' },
      { status: 500 }
    );
  }
}

// Export the handler wrapped with logging middleware
export const PUT = withApiLogger(updateContentHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});
