import { requireAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { withApiLogger } from '@/lib/middleware/api-logger';
import dbConnect from '@/lib/mongodb';
import { DiscipleModel, UserModel } from '@/models';
import mongoose from 'mongoose';
import { type NextRequest, NextResponse } from 'next/server';

async function getDisciplesHandler(
  request: NextRequest
): Promise<NextResponse> {
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    { requestId, endpoint: '/api/church/disciples' },
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
    const status = searchParams.get('status') || '';
    const level = searchParams.get('level') || '';
    const mentorId = searchParams.get('mentorId') || '';
    // Build query object
    const query: any = {
      churchId: new mongoose.Types.ObjectId(user.user?.churchId),
    };
    if (search) {
      // Add search conditions
      query.$or = [
        { goals: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } },
      ];
    }
    if (
      status &&
      ['active', 'completed', 'paused', 'discontinued'].includes(status)
    ) {
      // Add status filter with validation
      query.status = status;
    }
    if (
      level &&
      ['new-convert', 'growing', 'mature', 'leader'].includes(level)
    ) {
      // Add level filter with validation
      query.currentLevel = level;
    }
    if (mentorId && mongoose.Types.ObjectId.isValid(mentorId)) {
      // Add mentor filter
      query.mentorId = new mongoose.Types.ObjectId(mentorId);
    }
    const skip = (page - 1) * limit;
    // Execute queries with better error handling
    const [disciples, total] = await Promise.all([
      DiscipleModel.find(query)
        .populate('memberId', 'firstName lastName email phoneNumber')
        .populate('mentorId', 'firstName lastName email phoneNumber')
        .populate('milestonesCompleted', 'name points category')
        .sort({ startDate: -1, createdAt: -1 }) // Secondary sort by creation date
        .skip(skip)
        .limit(limit)
        .lean(), // Use lean() for better performance if you don't need mongoose documents
      DiscipleModel.countDocuments(query),
    ]);
    return NextResponse.json({
      success: true,
      data: {
        disciples,
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
    contextLogger.error('Unexpected error in getDisciplesHandler', error);
    return NextResponse.json(
      { error: 'Failed to fetch disciples' },
      { status: 500 }
    );
  }
}

// Export the handler wrapped with logging middleware
export const GET = withApiLogger(getDisciplesHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});

async function registerDiscipleHandler(
  request: NextRequest
): Promise<NextResponse> {
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    { requestId, endpoint: '/api/church/disciples' },
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
    const discipleData = await request.json();
    // Validate required fields
    const { memberId, mentorId, startDate, currentLevel, goals } = discipleData;
    if (!(memberId && mentorId && startDate && currentLevel && goals)) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    // Validate ObjectIds
    if (
      !(
        mongoose.Types.ObjectId.isValid(memberId) &&
        mongoose.Types.ObjectId.isValid(mentorId)
      )
    ) {
      return NextResponse.json(
        { error: 'Invalid member or mentor ID' },
        { status: 400 }
      );
    }
    // check if member exists
    const existingMember = await UserModel.findById(memberId);
    if (!existingMember) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }
    // check if mentor exists
    const existingMentor = await UserModel.findById(mentorId);
    if (!existingMentor) {
      return NextResponse.json({ error: 'Mentor not found' }, { status: 404 });
    }
    // Check if member is already in discipleship program
    const existingDisciple = await DiscipleModel.findOne({
      churchId: user.user?.churchId,
      memberId: new mongoose.Types.ObjectId(memberId),
      status: 'active',
    });
    if (existingDisciple) {
      return NextResponse.json(
        { error: 'Member is already in an active discipleship program' },
        { status: 400 }
      );
    }
    // Create and save the disciple
    const disciple = new DiscipleModel({
      ...discipleData,
      churchId: user.user?.churchId,
      branchId: existingMember?.branchId || null, // Assuming user has branchId
      startDate: new Date(startDate),
    });
    const savedDisciple = await disciple.save();
    return NextResponse.json(
      {
        success: true,
        data: savedDisciple,
        message: 'Disciple added successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    contextLogger.error('Unexpected error in registerDiscipleHandler', error);
    return NextResponse.json(
      { error: 'Failed to create disciple' },
      { status: 500 }
    );
  }
}

// Export the handler wrapped with logging middleware
export const POST = withApiLogger(registerDiscipleHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});
