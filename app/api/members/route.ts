/** biome-ignore-all lint/complexity/noExcessiveCognitiveComplexity: ignore complexity */
import { requireAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { withApiLogger } from '@/lib/middleware/api-logger';
import dbConnect from '@/lib/mongodb';
import type { AddMemberPayload } from '@/lib/validations/members';
import User from '@/models/user'; // Only import User model
import bcrypt from 'bcryptjs'; // For password hashing
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
  // Count existing users with this role in the church
  const roleQuery: any = {
    churchId,
    roles: role,
    status: { $ne: 'deleted' }, // Don't count deleted users
  };
  switch (role) {
    case 'member':
      count = await User.countDocuments(roleQuery).session(session);
      prefix = 'MEM';
      break;
    case 'visitor':
      count = await User.countDocuments(roleQuery).session(session);
      prefix = 'VIS';
      break;
    case 'pastor':
      count = await User.countDocuments(roleQuery).session(session);
      prefix = 'PAS';
      break;
    case 'bishop':
      count = await User.countDocuments(roleQuery).session(session);
      prefix = 'BIS';
      break;
    case 'staff':
      count = await User.countDocuments(roleQuery).session(session);
      prefix = 'STA';
      break;
    case 'volunteer':
      count = await User.countDocuments(roleQuery).session(session);
      prefix = 'VOL';
      break;
    case 'admin':
      count = await User.countDocuments(roleQuery).session(session);
      prefix = 'ADM';
      break;
    default:
      prefix = 'USR';
  }
  return `${prefix}${String(count + 1).padStart(4, '0')}`;
};

// Helper function to prepare role-specific data
const prepareRoleSpecificData = async (
  role: string,
  userData: any,
  churchId: mongoose.Types.ObjectId,
  session: mongoose.ClientSession
) => {
  const roleId = await generateRoleId(role, churchId, session);
  switch (role) {
    case 'member':
      return {
        memberDetails: {
          memberId: roleId,
          membershipDate: userData.membershipDate || new Date(),
          membershipStatus: 'active',
          departmentIds: userData.departmentIds || [],
          groupIds: userData.groupIds || [],
          occupation: userData.occupation,
          baptismDate: userData.baptismDate,
          joinedDate: userData.joinedDate || new Date(),
        },
      };
    case 'visitor':
      return {
        visitorDetails: {
          visitorId: roleId,
          visitDate: userData.visitDate || new Date(),
          invitedBy: userData.invitedBy,
          howDidYouHear: userData.howDidYouHear || 'other',
          followUpStatus: 'pending',
          interestedInMembership: userData.interestedInMembership,
          occupation: userData.occupation,
        },
      };
    case 'pastor':
      return {
        // If pastor, they're also members
        memberDetails: {
          memberId: await generateRoleId('member', churchId, session),
          membershipDate: userData.membershipDate || new Date(),
          membershipStatus: 'active',
          joinedDate: userData.joinedDate || new Date(),
        },
        pastorDetails: {
          pastorId: roleId,
          ordinationDate: userData.ordinationDate,
          qualifications: userData.qualifications || [],
          specializations: userData.specializations || [],
          assignments: userData.assignments || [],
          sermonCount: 0,
          counselingSessions: 0,
          biography: userData.biography,
        },
      };
    case 'bishop':
      return {
        // If bishop, they're also members
        memberDetails: {
          memberId: await generateRoleId('member', churchId, session),
          membershipDate: userData.membershipDate || new Date(),
          membershipStatus: 'active',
          joinedDate: userData.joinedDate || new Date(),
        },
        bishopDetails: {
          bishopId: roleId,
          appointmentDate: userData.appointmentDate,
          jurisdictionArea: userData.jurisdictionArea,
          oversight: userData.oversight || {},
          qualifications: userData.qualifications || [],
          achievements: userData.achievements || [],
          biography: userData.biography,
        },
      };
    case 'staff': {
      const staffData: any = {
        staffDetails: {
          staffId: roleId,
          jobTitle: userData.jobTitle,
          department: userData.department,
          startDate: userData.startDate || new Date(),
          employmentType: userData.employmentType || 'casual',
          isActive: true,
          salary: userData.salary,
        },
      };
      // If staff is also a member
      if (userData.isMember) {
        staffData.memberDetails = {
          memberId: await generateRoleId('member', churchId, session),
          membershipDate: userData.membershipDate || new Date(),
          membershipStatus: 'active',
          joinedDate: userData.joinedDate || new Date(),
        };
      }
      return staffData;
    }
    case 'volunteer': {
      const volunteerData: any = {
        volunteerDetails: {
          volunteerId: roleId,
          volunteerStatus: 'active',
          availabilitySchedule: userData.availabilitySchedule || {},
          skills: userData.skills || [],
          departments: userData.departments || [],
          ministries: userData.ministries || [],
          volunteerRoles: userData.volunteerRoles || [],
          backgroundCheck: userData.backgroundCheck || { completed: false },
          emergencyContact: userData.emergencyContact,
          hoursContributed: 0,
        },
      };
      // Most volunteers are also members
      if (userData.isMember !== false) {
        // Default to true
        volunteerData.memberDetails = {
          memberId: await generateRoleId('member', churchId, session),
          membershipDate: userData.membershipDate || new Date(),
          membershipStatus: 'active',
          joinedDate: userData.joinedDate || new Date(),
        };
      }
      return volunteerData;
    }
    case 'admin': {
      const adminData: any = {
        adminDetails: {
          adminId: roleId,
          accessLevel: userData.accessLevel || 'branch',
          permissions: userData.permissions || [],
          assignedBranches: userData.assignedBranches || [],
        },
      };
      // If admin is also a member
      if (userData.isMember) {
        adminData.memberDetails = {
          memberId: await generateRoleId('member', churchId, session),
          membershipDate: userData.membershipDate || new Date(),
          membershipStatus: 'active',
          joinedDate: userData.joinedDate || new Date(),
        };
      }
      return adminData;
    }
    default:
      throw new Error(`Unsupported role: ${role}`);
  }
};

async function getMemberHandler(request: NextRequest): Promise<NextResponse> {
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    { requestId, endpoint: '/api/members' },
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
    const branchId = searchParams.get('branchId') || '';
    const role = searchParams.get('role') || '';
    const query: any = {
      churchId: user.user?.churchId,
      status: { $ne: 'deleted' }, // Don't show deleted users
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
    // Filter by user status
    if (status) {
      query.status = status;
    }
    // Filter by branch
    if (branchId) {
      query.branchId = branchId;
    }
    // Filter by role
    if (role) {
      query.roles = role;
    }
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      User.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('createdBy', 'firstName lastName')
        .populate('updatedBy', 'firstName lastName'),
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
  } catch (error) {
    contextLogger.error('Unexpected error in getMemberHandler', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function registerHandler(request: NextRequest): Promise<NextResponse> {
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    { requestId, endpoint: '/api/members' },
    'api'
  );
  let session: mongoose.ClientSession | null = null;
  let transactionCommitted = false;
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
    // Connect to database
    await dbConnect();
    // Start a session for the transaction
    session = await mongoose.startSession();
    const userData: AddMemberPayload = await request.json();
    // Start the transaction
    await session.startTransaction();
    // Validate required fields
    if (!userData.role) {
      await session.abortTransaction();
      return NextResponse.json({ error: 'Role is required' }, { status: 400 });
    }
    if (!(userData.firstName && userData.lastName)) {
      await session.abortTransaction();
      return NextResponse.json(
        { error: 'First name and last name are required' },
        { status: 400 }
      );
    }
    // Check for duplicate email (if provided)
    if (userData.email) {
      const existingUserEmail = await User.findOne({
        email: userData.email,
        status: { $ne: 'deleted' },
      }).session(session);

      if (existingUserEmail) {
        await session.abortTransaction();
        return NextResponse.json(
          { error: 'User with this email already exists' },
          { status: 400 }
        );
      }
    }
    // Check for duplicate phone number
    if (userData.phoneNumber) {
      const existingUserPhone = await User.findOne({
        phoneNumber: userData.phoneNumber,
        status: { $ne: 'deleted' },
      }).session(session);
      if (existingUserPhone) {
        await session.abortTransaction();
        return NextResponse.json(
          { error: 'User with this phone number already exists' },
          { status: 400 }
        );
      }
    }
    // Hash password if provided
    let hashedPassword: string | undefined;
    if (userData.password) {
      hashedPassword = await bcrypt.hash(userData.password, 12);
    } else {
      // Generate default password for certain roles
      if (['admin', 'pastor', 'bishop', 'staff'].includes(userData.role)) {
        hashedPassword = await bcrypt.hash('User123!', 12);
      }
    }
    // Prepare role-specific data
    const roleSpecificData = await prepareRoleSpecificData(
      userData.role,
      userData,
      user.user?.churchId,
      session
    );
    // Determine roles array (some roles include member)
    let roles = [userData.role];
    if (['pastor', 'bishop'].includes(userData.role)) {
      roles = ['member', userData.role];
    } else if (
      userData.isMember &&
      ['staff', 'volunteer', 'admin'].includes(userData.role)
    ) {
      roles = ['member', userData.role];
    }
    // Create user with embedded role data
    const createdUser = new User({
      // Common fields
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      phoneNumber: userData.phoneNumber,
      dateOfBirth: userData.dateOfBirth,
      gender: userData.gender,
      address: userData.address,
      profileImage: userData.profileImage,
      // Church and role info
      churchId: user.user?.churchId,
      roles,
      primaryRole: userData.role,
      // Role-specific embedded data
      ...roleSpecificData,
      // Account info
      status: 'active',
      passwordHash: hashedPassword,
      isEmailVerified: false,
      // Audit fields
      createdBy: user.user?.sub,
    });
    await createdUser.save({ session });
    // Commit the transaction
    await session.commitTransaction();
    transactionCommitted = true;
    // Prepare response
    const responseData: any = {
      message: `${userData.role.charAt(0).toUpperCase() + userData.role.slice(1)} created successfully`,
      userId: createdUser._id,
      roles: createdUser.roles,
      primaryRole: createdUser.primaryRole,
    };
    // Add role-specific IDs to response
    if (createdUser.memberDetails) {
      responseData.memberId = createdUser.memberDetails.memberId;
    }
    if (createdUser.pastorDetails) {
      responseData.pastorId = createdUser.pastorDetails.pastorId;
    }
    if (createdUser.bishopDetails) {
      responseData.bishopId = createdUser.bishopDetails.bishopId;
    }
    if (createdUser.staffDetails) {
      responseData.staffId = createdUser.staffDetails.staffId;
    }
    if (createdUser.volunteerDetails) {
      responseData.volunteerId = createdUser.volunteerDetails.volunteerId;
    }
    if (createdUser.adminDetails) {
      responseData.adminId = createdUser.adminDetails.adminId;
    }
    if (createdUser.visitorDetails) {
      responseData.visitorId = createdUser.visitorDetails.visitorId;
    }
    contextLogger.info(`${userData.role} created successfully`, {
      userId: createdUser._id,
      roles: createdUser.roles,
    });
    return NextResponse.json(responseData, { status: 201 });
  } catch (error) {
    // Abort transaction if still active
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
    // Always end the session
    if (session) {
      try {
        await session.endSession();
      } catch (endError) {
        contextLogger.error('Error ending session:', endError);
      }
    }
  }
}

// Export handlers with logging middleware
export const GET = withApiLogger(getMemberHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});

export const POST = withApiLogger(registerHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});
