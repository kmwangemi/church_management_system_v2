/** biome-ignore-all lint/complexity/noExcessiveCognitiveComplexity: ignore complexity */
import { requireAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { withApiLogger } from '@/lib/middleware/api-logger';
import dbConnect from '@/lib/mongodb';
import type { AddMemberPayload } from '@/lib/validations/members';
import Admin from '@/models/admin';
import Bishop from '@/models/bishop';
import Member from '@/models/member';
import Pastor from '@/models/pastor';
import Staff from '@/models/staff';
import User from '@/models/user';
import Visitor from '@/models/visitor';
import mongoose from 'mongoose';
import { type NextRequest, NextResponse } from 'next/server';

// Helper function to generate role-specific IDs
const generateRoleId = async (
  role: string,
  churchId: mongoose.Types.ObjectId,
  session: mongoose.ClientSession
) => {
  let count = 0;
  let prefix = '';
  switch (role) {
    case 'member':
      count = await Member.countDocuments({
        churchId,
      }).session(session);
      prefix = 'MEM';
      break;
    case 'visitor':
      count = await Visitor.countDocuments({
        churchId,
      }).session(session);
      prefix = 'VIS';
      break;
    case 'pastor':
      count = await Pastor.countDocuments({
        churchId,
      }).session(session);
      prefix = 'PAS';
      break;
    case 'bishop':
      count = await Bishop.countDocuments({
        churchId,
      }).session(session);
      prefix = 'BIS';
      break;
    case 'staff':
      count = await Staff.countDocuments({
        churchId,
      }).session(session);
      prefix = 'STA';
      break;
    case 'admin':
      count = await Admin.countDocuments({
        churchId,
      }).session(session);
      prefix = 'ADM';
      break;
    default:
      prefix = 'USR';
  }
  return `${prefix}${String(count + 1).padStart(4, '0')}`;
};

// Helper function to create role-specific record
const createRoleSpecificRecord = async (
  role: string,
  userId: mongoose.Types.ObjectId,
  userData: any,
  session: mongoose.ClientSession
) => {
  const roleId = await generateRoleId(role, userData.churchId, session);
  switch (role) {
    case 'member': {
      const member = new Member({
        userId,
        memberId: roleId,
      });
      return await member.save({ session });
    }
    case 'visitor': {
      const visitor = new Visitor({
        userId,
        visitorId: roleId,
      });
      return await visitor.save({ session });
    }
    case 'pastor': {
      const pastor = new Pastor({
        userId,
        pastorId: roleId,
      });
      return await pastor.save({ session });
    }
    case 'bishop': {
      const bishop = new Bishop({
        userId,
        bishopId: roleId,
      });
      return await bishop.save({ session });
    }
    case 'staff': {
      const staff = new Staff({
        userId,
        staffId: roleId,
      });
      return await staff.save({ session });
    }
    case 'admin': {
      const admin = new Admin({
        userId,
        adminId: roleId,
      });
      return await admin.save({ session });
    }
    default:
      throw new Error(`Unsupported role: ${role}`);
  }
};

export async function GET(request: NextRequest) {
  try {
    // Check authentication and authorization
    const authResult = await requireAuth(['superadmin', 'admin'])(request);
    // If authResult is a Response object, it means authentication/authorization failed
    if (authResult instanceof Response) {
      return authResult;
    }
    // authResult is now the authenticated user
    const user = authResult;
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const page = Number.parseInt(searchParams.get('page') || '1', 10);
    const limit = Number.parseInt(searchParams.get('limit') || '10', 10);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const branchId = searchParams.get('branchId') || '';
    const role = searchParams.get('role') || '';
    const query: any = { churchId: user.user?.churchId };
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    if (status) {
      query.membershipStatus = status;
    }
    if (branchId) {
      query.branchId = branchId;
    }
    if (role) {
      query.role = role;
    }
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(query),
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
  } catch (_error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function registerHandler(request: NextRequest): Promise<NextResponse> {
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    { requestId, endpoint: '/api/member' },
    'api'
  );
  let session: mongoose.ClientSession | null = null;
  let transactionCommitted = false;
  try {
    // Check authentication and authorization
    const authResult = await requireAuth(['superadmin', 'admin'])(request);
    // If authResult is a Response object, it means authentication/authorization failed
    if (authResult instanceof Response) {
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
    // FIRST: Connect to database
    await dbConnect();
    // THEN: Start a session for the transaction
    session = await mongoose.startSession();
    const userData: AddMemberPayload = await request.json();
    // Start the transaction
    await session.startTransaction();
    // Validate required role-specific fields
    if (!userData.role) {
      await session.abortTransaction();
      return NextResponse.json({ error: 'Role is required' }, { status: 400 });
    }
    if (userData.email) {
      // Check if member email already exists
      const existingUserEmail = await User.findOne({
        email: userData.email,
      }).session(session);
      if (existingUserEmail) {
        await session.abortTransaction();
        return NextResponse.json(
          { error: 'User with this email already exists' },
          { status: 400 }
        );
      }
    }
    // Check if member phone number already exists
    const existingUserPhone = await User.findOne({
      phoneNumber: userData.phoneNumber,
    }).session(session);
    if (existingUserPhone) {
      await session.abortTransaction();
      return NextResponse.json(
        { error: 'User with this phone number already exists' },
        { status: 400 }
      );
    }
    // Create user within the transaction
    const createdUser = new User({
      churchId: user.user?.churchId,
      createdBy: user.user?.sub,
      branchId: userData.branchId,
      email: userData.email,
      password: 'User123!', // Consider hashing this password
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: userData.role,
      phoneNumber: userData.phoneNumber,
      gender: userData.gender,
      maritalStatus: userData.maritalStatus,
      address: userData.address,
      emergencyDetails: userData.emergencyDetails,
    });
    await createdUser.save({ session });
    // Create role-specific record
    const roleRecord = await createRoleSpecificRecord(
      userData.role,
      createdUser._id as mongoose.Types.ObjectId,
      { ...userData, churchId: user.user?.churchId },
      session
    );
    // Commit the transaction
    await session.commitTransaction();
    transactionCommitted = true;
    // Prepare response based on role
    const responseData: any = {
      message: `${userData.role.charAt(0).toUpperCase() + userData.role.slice(1)} created successfully`,
      userId: createdUser._id,
      role: userData.role,
    };
    // Add role-specific ID to response
    if (roleRecord) {
      switch (userData.role) {
        case 'member':
          responseData.memberId = (roleRecord as any).memberId;
          break;
        case 'pastor':
          responseData.pastorId = (roleRecord as any).pastorId;
          break;
        case 'bishop':
          responseData.bishopId = (roleRecord as any).bishopId;
          break;
        case 'admin':
          responseData.adminId = (roleRecord as any).adminId;
          break;
        case 'superadmin':
          responseData.superAdminId = (roleRecord as any).superAdminId;
          break;
        default:
          responseData.recordId = roleRecord._id;
      }
    }
    return NextResponse.json(responseData, { status: 201 });
  } catch (error) {
    // Only abort the transaction if it's still active
    if (session && !transactionCommitted) {
      try {
        await session.abortTransaction();
      } catch (abortError) {
        contextLogger.error('Error aborting transaction:', abortError);
      }
    }
    contextLogger.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    // Always end the session (if it was created)
    if (session) {
      try {
        await session.endSession();
      } catch (endError) {
        contextLogger.error('Error ending session:', endError);
      }
    }
  }
}

// Export the handler wrapped with logging middleware
export const POST = withApiLogger(registerHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});
