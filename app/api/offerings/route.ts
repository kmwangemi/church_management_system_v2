import { requireAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { withApiLogger } from '@/lib/middleware/api-logger';
import dbConnect from '@/lib/mongodb';
import Offering from '@/models/offering';
import mongoose from 'mongoose';
import { type NextRequest, NextResponse } from 'next/server';

async function getOfferingHandler(request: NextRequest): Promise<NextResponse> {
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    { requestId, endpoint: '/api/offerings' },
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
      10,
      Math.max(1, Number.parseInt(searchParams.get('limit') || '10', 10))
    ); // Cap at 10
    const search = searchParams.get('search')?.trim() || '';
    const type = searchParams.get('type') || '';
    const status = searchParams.get('status') || '';
    // Build query object
    const query: any = {
      churchId: new mongoose.Types.ObjectId(user.user?.churchId),
    };
    if (search) {
      // Add search conditions
      query.$or = [
        { amount: { $regex: search, $options: 'i' } },
        // { description: { $regex: search, $options: 'i' } },
      ];
    }
    if (type) {
      // Add type filter (matches your form's offering type)
      query.type = type;
    }
    if (status && ['active', 'completed', 'cancelled'].includes(status)) {
      // Add status filter with validation
      query.status = status;
    }
    const skip = (page - 1) * limit;
    // Execute queries with better error handling
    const [offerings, total] = await Promise.all([
      Offering.find(query)
        .sort({ startDate: -1, createdAt: -1 }) // Secondary sort by creation date
        .skip(skip)
        .limit(limit)
        .lean(), // Use lean() for better performance if you don't need mongoose documents
      Offering.countDocuments(query),
    ]);
    return NextResponse.json({
      success: true,
      data: {
        offerings,
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
    contextLogger.error('Unexpected error in getOfferingHandler', error);
    return NextResponse.json(
      { error: 'Failed to fetch offerings' },
      { status: 500 }
    );
  }
}

// Export the handler wrapped with logging middleware
export const GET = withApiLogger(getOfferingHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});

async function registerOfferingHandler(
  request: NextRequest
): Promise<NextResponse> {
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    { requestId, endpoint: '/api/offerings' },
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
    const offeringData = await request.json();
    // Create and save the offering
    const offering = new Offering({
      ...offeringData,
      churchId: user.user?.churchId,
    });
    const savedOffering = await offering.save();
    return NextResponse.json(
      {
        success: true,
        data: savedOffering,
        message: 'Offering created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    contextLogger.error('Unexpected error in registerOfferingHandler', error);
    return NextResponse.json(
      { error: 'Failed to create offering' },
      { status: 500 }
    );
  }
}

// Export the handler wrapped with logging middleware
export const POST = withApiLogger(registerOfferingHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});
