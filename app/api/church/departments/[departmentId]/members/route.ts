import { requireAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { withApiLogger } from '@/lib/middleware/api-logger';
import dbConnect from '@/lib/mongodb';
import { DepartmentModel } from '@/models';
import { MemberRole } from '@/models/department';
import mongoose from 'mongoose';
import { type NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  params: {
    departmentId: string;
  };
}

// GET /api/church/departments/[id]/members - Get all department members
async function getDepartmentMembersHandler(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { departmentId } = await params;
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    { requestId, endpoint: `/api/church/departments/${departmentId}/members` },
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
    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(departmentId)) {
      return NextResponse.json(
        { error: 'Invalid department ID format' },
        { status: 400 }
      );
    }
    await dbConnect();
    // Get query parameters for filtering and pagination
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const isActive = searchParams.get('isActive');
    const page = Number.parseInt(searchParams.get('page') || '1', 10);
    const limit = Number.parseInt(searchParams.get('limit') || '20', 10);
    const search = searchParams.get('search');
    // Check if department exists and belongs to the user's church
    const department = (await DepartmentModel.findOne({
      _id: departmentId,
      churchId: user.user.churchId,
    })
      .populate('members.userId', 'firstName lastName email phone profileImage')
      .lean()) as {
      _id: mongoose.Types.ObjectId;
      departmentName: string;
      description?: string;
      members: any[];
    } | null;
    if (!department) {
      return NextResponse.json(
        { error: 'Department not found' },
        { status: 404 }
      );
    }
    let filteredMembers = department.members ? department.members : [];
    // Apply filters
    if (role && Object.values(MemberRole).includes(role as MemberRole)) {
      filteredMembers = filteredMembers.filter(
        (member) => member.role === role
      );
    }
    if (isActive !== null && isActive !== undefined) {
      const activeFilter = isActive === 'true';
      filteredMembers = filteredMembers.filter(
        (member) => member.isActive === activeFilter
      );
    }
    // Apply search filter on member names and emails
    if (search) {
      const searchLower = search.toLowerCase();
      filteredMembers = filteredMembers.filter((member) => {
        const user = member.userId as any;
        if (!user) return false;
        const fullName =
          `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase();
        const email = (user.email || '').toLowerCase();
        return fullName.includes(searchLower) || email.includes(searchLower);
      });
    }
    // Calculate pagination
    const totalMembers = filteredMembers.length;
    const totalPages = Math.ceil(totalMembers / limit);
    const skip = (page - 1) * limit;
    const paginatedMembers = filteredMembers.slice(skip, skip + limit);
    contextLogger.info('Department members retrieved successfully', {
      departmentId,
      totalMembers,
      filteredCount: filteredMembers.length,
      page,
      limit,
    });
    return NextResponse.json({
      success: true,
      data: {
        members: paginatedMembers,
        department: {
          id: department._id,
          departmentName: department.departmentName,
          description: department.description,
        },
        pagination: {
          currentPage: page,
          totalPages,
          totalMembers,
          limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    contextLogger.error(
      'Unexpected error in getDepartmentMembersHandler',
      error
    );
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/church/departments/[departmentId]/members - Add member to department
async function addMemberToDepartmentHandler(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { departmentId } = await params;
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    { requestId, endpoint: `/api/church/departments/${departmentId}/members` },
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
    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(departmentId)) {
      return NextResponse.json(
        { error: 'Invalid department ID format' },
        { status: 400 }
      );
    }
    await dbConnect();
    const body = await request.json();
    const { userId, role, skills, notes } = body;
    // Validate required fields
    if (!(userId && role)) {
      return NextResponse.json(
        { error: 'userId and role are required' },
        { status: 400 }
      );
    }
    // Validate role
    if (!Object.values(MemberRole).includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }
    // Check if department exists and belongs to the user's church
    const department = await DepartmentModel.findOne({
      _id: departmentId,
      churchId: user.user.churchId,
    });
    if (!department) {
      return NextResponse.json(
        { error: 'Department not found' },
        { status: 404 }
      );
    }
    // Check if user is already a member
    interface DepartmentMember {
      userId: mongoose.Types.ObjectId;
      role: MemberRole;
      skills?: string[];
      joinedDate?: Date;
      isActive?: boolean;
      notes?: string;
    }
    const existingMember = (department.members as DepartmentMember[]).find(
      (member: DepartmentMember) => member.userId.toString() === userId
    );
    if (existingMember) {
      return NextResponse.json(
        { error: 'User is already a member of this department' },
        { status: 409 }
      );
    }
    // Add new member
    const newMember = {
      userId,
      role,
      skills: skills || [],
      joinedDate: new Date(),
      isActive: true,
      notes: notes || undefined,
    };
    department.members.push(newMember);
    await department.save();
    // Populate the new member details
    await department.populate('members.userId', 'firstName lastName email');
    contextLogger.info('Member added to department successfully', {
      departmentId,
      userId,
      role,
    });
    return NextResponse.json(
      {
        success: true,
        message: 'Member added successfully',
        data: department.members.at(-1),
      },
      { status: 201 }
    );
  } catch (error: any) {
    contextLogger.error(
      'Unexpected error in addMemberToDepartmentHandler',
      error
    );
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Export the handler wrapped with logging middleware
export const GET = withApiLogger(getDepartmentMembersHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});

// Export the handler wrapped with logging middleware
export const POST = withApiLogger(addMemberToDepartmentHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});
