/** biome-ignore-all lint/complexity/noExcessiveCognitiveComplexity: ignore complexity */
import { requireAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { withApiLogger } from '@/lib/middleware/api-logger';
import dbConnect from '@/lib/mongodb';
import type { AddUserPayload } from '@/lib/validations/users';
import { UserModel } from '@/models';
import mongoose from 'mongoose';
import { type NextRequest, NextResponse } from 'next/server';

// Helper function to prepare role-specific data - FIXED to match your model
const prepareRoleSpecificData = (role: string, userData: any) => {
  const result: any = {};
  switch (role) {
    case 'member':
      result.memberDetails = {
        memberId: '',
        membershipDate: userData.membershipDate || new Date(),
        membershipStatus: 'active',
        departmentIds: userData.departmentIds || [],
        groupIds: userData.groupIds || [],
        occupation: userData.occupation,
        baptismDate: userData.baptismDate,
        joinedDate: userData.joinedDate || new Date(),
      };
      break;
    case 'visitor':
      result.visitorDetails = {
        visitorId: '',
        visitDate: userData.visitDate || new Date(),
        invitedBy: userData.invitedBy,
        howDidYouHear: userData.howDidYouHear || 'other',
        followUpStatus: 'pending',
        interestedInMembership: userData.interestedInMembership,
        servicesAttended: userData.servicesAttended || [],
        occupation: userData.occupation,
      };
      break;
    case 'pastor':
      result.pastorDetails = {
        pastorId: '',
        ordinationDate: userData.ordinationDate,
        qualifications: userData.qualifications || [],
        specializations: userData.specializations || [],
        assignments: userData.assignments || [],
        sermonCount: 0,
        counselingSessions: 0,
        biography: userData.biography,
      };
      break;
    case 'bishop':
      result.bishopDetails = {
        bishopId: '',
        appointmentDate: userData.appointmentDate,
        jurisdictionArea: userData.jurisdictionArea,
        oversight: userData.oversight || { branchIds: [], pastorIds: [] },
        qualifications: userData.qualifications || [],
        achievements: userData.achievements || [],
        biography: userData.biography,
      };
      break;
    case 'admin':
      result.adminDetails = {
        adminId: '',
        accessLevel: userData.accessLevel || 'national', // Default per your model
        assignedBranches: userData.assignedBranches || [],
      };
      break;
    case 'superadmin':
      result.superAdminDetails = {
        superAdminId: '',
        accessLevel: 'global',
        systemSettings: {
          canCreateChurches: userData.systemSettings?.canCreateChurches ?? true,
          canDeleteChurches: userData.systemSettings?.canDeleteChurches ?? true,
          canManageUsers: userData.systemSettings?.canManageUsers ?? true,
          canAccessAnalytics:
            userData.systemSettings?.canAccessAnalytics ?? true,
          canManageSubscriptions:
            userData.systemSettings?.canManageSubscriptions ?? true,
          canAccessSystemLogs:
            userData.systemSettings?.canAccessSystemLogs ?? true,
        },
        companyInfo: userData.companyInfo || {},
      };
      break;
    default:
      throw new Error(`Unsupported role: ${role}`);
  }
  // Handle member details if isMember is true
  if (userData.isMember) {
    result.memberDetails = {
      memberId: '',
      membershipDate: userData.membershipDate || new Date(),
      membershipStatus: 'active',
      departmentIds: userData.departmentIds || [],
      groupIds: userData.groupIds || [],
      occupation: userData.occupation,
      baptismDate: userData.baptismDate,
      joinedDate: userData.joinedDate || new Date(),
    };
  }
  // Handle staff details if isStaff is true
  if (userData.isStaff) {
    result.staffDetails = {
      staffId: '',
      jobTitle: userData.jobTitle,
      department: userData.department,
      startDate: userData.startDate || new Date(),
      employmentType: userData.employmentType || 'casual',
      isActive: true,
      salary: userData.salary,
    };
  }
  // Handle volunteer details if isVolunteer is true
  if (userData.isVolunteer) {
    result.volunteerDetails = {
      volunteerId: '',
      volunteerStatus: 'active',
      availabilitySchedule: userData.availabilitySchedule || {
        days: [],
        timeSlots: [],
        preferredTimes: '',
      },
      skills: userData.skills || [],
      departments: userData.departments || [],
      ministries: userData.ministries || [],
      volunteerRoles: userData.volunteerRoles || [],
      backgroundCheck: userData.backgroundCheck || { completed: false },
      hoursContributed: 0,
    };
  }
  return result;
};

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
    const userData: AddUserPayload = await request.json();
    // Start the transaction
    await session.startTransaction();
    // Validate required fields according to your model
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
    if (!userData.phoneNumber) {
      await session.abortTransaction();
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }
    if (!userData.gender) {
      await session.abortTransaction();
      return NextResponse.json(
        { error: 'Gender is required' },
        { status: 400 }
      );
    }
    // Check for duplicate email (if provided) - FIXED query
    if (userData.email) {
      const existingUserEmail = await UserModel.findOne({
        email: userData.email,
        isDeleted: false, // Use isDeleted instead of status
      }).session(session);
      if (existingUserEmail) {
        await session.abortTransaction();
        return NextResponse.json(
          { error: 'User with this email already exists' },
          { status: 400 }
        );
      }
    }
    // Check for duplicate phone number - FIXED query
    if (userData.phoneNumber) {
      const existingUserPhone = await UserModel.findOne({
        phoneNumber: userData.phoneNumber,
        isDeleted: false, // Use isDeleted instead of status
      }).session(session);
      if (existingUserPhone) {
        await session.abortTransaction();
        return NextResponse.json(
          { error: 'User with this phone number already exists' },
          { status: 400 }
        );
      }
    }
    // Prepare role-specific data
    const roleSpecificData = prepareRoleSpecificData(userData.role, userData);
    // Determine branchId requirement based on your model logic
    const branchId = userData.branchId;
    if (!(['admin', 'superadmin'].includes(userData.role) || branchId)) {
      await session.abortTransaction();
      return NextResponse.json(
        { error: 'Branch ID is required for this role' },
        { status: 400 }
      );
    }
    // Create user with embedded role data - ALIGNED with your model
    const createdUser = new UserModel({
      // Common fields
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      phoneNumber: userData.phoneNumber,
      gender: userData.gender,
      address: userData.address,
      // Church and branch info
      churchId:
        userData.role === 'superadmin' ? undefined : user.user?.churchId,
      // branchId: ['admin', 'superadmin'].includes(userData.role)
      //   ? undefined
      //   : branchId,
      branchId: ['superadmin'].includes(userData.role) ? undefined : branchId,
      // Role system
      role: userData.role,
      isMember: userData.isMember,
      // Secondary role flags
      isStaff: userData.isStaff,
      // Role-specific embedded data
      memberDetails: roleSpecificData.memberDetails,
      pastorDetails: roleSpecificData.pastorDetails,
      bishopDetails: roleSpecificData.bishopDetails,
      adminDetails: roleSpecificData.adminDetails,
      superAdminDetails: roleSpecificData.superAdminDetails,
      visitorDetails: roleSpecificData.visitorDetails,
      staffDetails: roleSpecificData.staffDetails,
      volunteerDetails: roleSpecificData.volunteerDetails,
      // Account info
      status: 'active',
      isEmailVerified: false,
      agreeToTerms: true, // Default as per model
      // Audit fields - conditional based on role
      createdBy:
        userData.role === 'superadmin'
          ? undefined
          : new mongoose.Types.ObjectId(user.user?.sub),
      updatedBy:
        userData.role === 'superadmin'
          ? undefined
          : new mongoose.Types.ObjectId(user.user?.sub),
    });
    // Save the user (pre-save middleware will handle ID generation)
    await createdUser.save({ session });
    // Commit the transaction
    await session.commitTransaction();
    transactionCommitted = true;
    // Prepare response with all role-specific IDs
    const responseData: any = {
      message: `${userData.role.charAt(0).toUpperCase() + userData.role.slice(1)} created successfully`,
      userId: createdUser._id?.toString(),
      role: createdUser.role,
      isMember: createdUser.isMember,
      isStaff: createdUser.isStaff,
      isVolunteer: createdUser.isVolunteer,
    };
    // Add role-specific IDs to response
    if (createdUser.memberDetails?.memberId) {
      responseData.memberId = createdUser.memberDetails.memberId;
    }
    if (createdUser.pastorDetails?.pastorId) {
      responseData.pastorId = createdUser.pastorDetails.pastorId;
    }
    if (createdUser.bishopDetails?.bishopId) {
      responseData.bishopId = createdUser.bishopDetails.bishopId;
    }
    if (createdUser.staffDetails?.staffId) {
      responseData.staffId = createdUser.staffDetails.staffId;
    }
    if (createdUser.volunteerDetails?.volunteerId) {
      responseData.volunteerId = createdUser.volunteerDetails.volunteerId;
    }
    if (createdUser.adminDetails?.adminId) {
      responseData.adminId = createdUser.adminDetails.adminId;
    }
    if (createdUser.superAdminDetails?.superAdminId) {
      responseData.superAdminId = createdUser.superAdminDetails.superAdminId;
    }
    if (createdUser.visitorDetails?.visitorId) {
      responseData.visitorId = createdUser.visitorDetails.visitorId;
    }
    contextLogger.info(`${userData.role} created successfully`, {
      userId: createdUser._id?.toString(),
      role: createdUser.role,
      isMember: createdUser.isMember,
      isStaff: createdUser.isStaff,
      isVolunteer: createdUser.isVolunteer,
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
