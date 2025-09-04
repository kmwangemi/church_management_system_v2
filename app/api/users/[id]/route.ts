import { requireAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { withApiLogger } from '@/lib/middleware/api-logger';
import dbConnect from '@/lib/mongodb';
import { UserModel } from '@/models';
import mongoose from 'mongoose';
import { type NextRequest, NextResponse } from 'next/server';

// GET - Get user by ID (Improved Version)
async function getUserByIdHandler(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    { requestId, endpoint: `/api/users/${id}` },
    'api'
  );
  try {
    // Enhanced authentication check
    const authResult = await requireAuth([
      'superadmin',
      'admin',
      'pastor',
      'bishop',
    ])(request);
    if (authResult instanceof Response) {
      const body = await authResult.text();
      return new NextResponse(body, {
        status: authResult.status,
        statusText: authResult.statusText,
        headers: authResult.headers,
      });
    }
    const currentUser = authResult;
    // Validate user ID
    if (!(id && mongoose.Types.ObjectId.isValid(id))) {
      return NextResponse.json(
        { error: 'Valid user ID is required' },
        { status: 400 }
      );
    }
    await dbConnect();
    // Build query based on user permissions
    const query: any = {
      _id: id,
      isDeleted: false,
    };
    // Authorization logic - different levels of access
    if (currentUser.user?.role !== 'superadmin') {
      if (!currentUser.user?.churchId) {
        return NextResponse.json(
          { error: 'Church ID not found' },
          { status: 400 }
        );
      }
      query.churchId = currentUser.user.churchId;
      // Additional restrictions for non-admin roles
      if (!['admin', 'superadmin'].includes(currentUser.user?.role)) {
        // Pastors and bishops might have additional restrictions
        // For example, they might only see users in their branch or department
        if (currentUser.user?.branchId) {
          query.branchId = currentUser.user.branchId;
        }
      }
    }
    // Check if user is trying to view their own profile (always allowed)
    const isOwnProfile = id === currentUser.user?.sub;
    // Find user with comprehensive population
    const foundUser = await UserModel.findOne(query)
      // Basic relationships
      .populate('branchId', 'branchName address phoneNumber email')
      .populate('churchId', 'churchName address phoneNumber email')
      .populate('createdBy', 'firstName lastName')
      .populate('updatedBy', 'firstName lastName')
      // Member details populations
      .populate('memberDetails')
      .populate('memberDetails.departmentIds')
      .populate('memberDetails.groupIds')
      // Pastor details populations
      .populate('pastorDetails')
      // Staff details populations (if applicable)
      .populate('staffDetails')
      // Volunteer details populations
      .populate('volunteerDetails')
      .populate('volunteerDetails.departments', 'name description')
      // Admin details populations
      .populate('adminDetails')
      .lean();
    if (!foundUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    // Filter sensitive data based on user role and whether it's their own profile
    const sanitizedUser = sanitizeUserData(
      foundUser,
      currentUser.user?.role,
      isOwnProfile
    );
    contextLogger.info('User retrieved successfully', {
      userId: foundUser._id?.toString(),
      role: foundUser.role,
      requestedBy: currentUser.user?.sub,
      isOwnProfile,
    });
    return NextResponse.json({
      user: sanitizedUser,
    });
  } catch (error) {
    contextLogger.error('Get user by ID error:', error);
    // More specific error handling
    if (error instanceof mongoose.Error.CastError) {
      return NextResponse.json(
        { error: 'Invalid user ID format' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to sanitize user data based on permissions
function sanitizeUserData(
  user: any,
  currentUserRole: string,
  isOwnProfile: boolean
) {
  // Always exclude sensitive fields
  const { password, resetPasswordToken, ...sanitizedUser } = user;
  // Sensitive fields that might need to be filtered
  const sensitiveFields = [
    'emergencyDetails',
    'staffDetails.salary',
    'lastLogin',
    'createdAt',
    'updatedAt',
  ];
  // Role-based access control
  switch (currentUserRole) {
    case 'superadmin':
      // Superadmin can see everything (except password)
      return sanitizedUser;
    case 'admin':
      // Admin can see most fields
      return sanitizedUser;
    case 'pastor':
    case 'bishop':
      // Pastors/bishops have limited access to sensitive info
      if (!isOwnProfile) {
        // Remove salary information for staff
        if (sanitizedUser.staffDetails?.salary) {
          sanitizedUser.staffDetails.salary = undefined;
        }
        // Limit emergency contact details
        if (sanitizedUser.emergencyDetails) {
          const {
            emergencyContactFullName,
            emergencyContactPhoneNumber,
            ...rest
          } = sanitizedUser.emergencyDetails;
          sanitizedUser.emergencyDetails = {
            emergencyContactFullName,
            emergencyContactPhoneNumber,
          };
        }
      }
      return sanitizedUser;
    default:
      // Most restricted access
      if (!isOwnProfile) {
        sensitiveFields.forEach((field) => {
          const fieldParts = field.split('.');
          if (fieldParts.length === 1) {
            delete sanitizedUser[field];
          } else {
            // Handle nested field removal
            let obj = sanitizedUser;
            for (let i = 0; i < fieldParts.length - 1; i++) {
              if (obj[fieldParts[i]]) {
                obj = obj[fieldParts[i]];
              }
            }
            if (obj) {
              delete obj[fieldParts.at(-1)];
            }
          }
        });
      }
      return sanitizedUser;
  }
}

// PUT - Update user by ID (Improved Version)
export async function updateUserByIdHandler(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    { requestId, endpoint: `/api/users/${id}` },
    'api'
  );
  let session: mongoose.ClientSession | null = null;
  let transactionCommitted = false;
  try {
    // Authentication
    const authResult = await requireAuth(['superadmin', 'admin'])(request);
    if (authResult instanceof Response) {
      const body = await authResult.text();
      return new NextResponse(body, {
        status: authResult.status,
        statusText: authResult.statusText,
        headers: authResult.headers,
      });
    }
    const currentUser = authResult;
    // Validate user ID
    if (!(id && mongoose.Types.ObjectId.isValid(id))) {
      return NextResponse.json(
        { error: 'Valid user ID is required' },
        { status: 400 }
      );
    }
    await dbConnect();
    session = await mongoose.startSession();
    await session.startTransaction();
    const updateData = await request.json();
    // Find existing user
    const existingUser = await UserModel.findOne({
      _id: id,
      isDeleted: false,
    }).session(session);
    if (!existingUser) {
      await session.abortTransaction();
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    // Admins can only update users in their own church
    if (
      currentUser.user?.role === 'admin' &&
      existingUser.churchId?.toString() !== currentUser.user?.churchId
    ) {
      await session.abortTransaction();
      return NextResponse.json(
        { error: 'Unauthorized to update this user' },
        { status: 403 }
      );
    }
    // Check for duplicate email
    if (updateData.email && updateData.email !== existingUser.email) {
      const duplicateEmail = await UserModel.findOne({
        email: updateData.email,
        _id: { $ne: id },
        isDeleted: false,
      }).session(session);

      if (duplicateEmail) {
        await session.abortTransaction();
        return NextResponse.json(
          { error: 'Email already exists' },
          { status: 400 }
        );
      }
    }
    // Check for duplicate phone number
    if (
      updateData.phoneNumber &&
      updateData.phoneNumber !== existingUser.phoneNumber
    ) {
      const duplicatePhone = await UserModel.findOne({
        phoneNumber: updateData.phoneNumber,
        _id: { $ne: id },
        isDeleted: false,
      }).session(session);

      if (duplicatePhone) {
        await session.abortTransaction();
        return NextResponse.json(
          { error: 'Phone number already exists' },
          { status: 400 }
        );
      }
    }
    // Build update object field by field
    const updateObject: any = {
      updatedBy: new mongoose.Types.ObjectId(currentUser.user?.sub),
    };
    // --- Basic fields ---
    if (updateData.firstName !== undefined)
      updateObject.firstName = updateData.firstName;
    if (updateData.lastName !== undefined)
      updateObject.lastName = updateData.lastName;
    if (updateData.email !== undefined) updateObject.email = updateData.email;
    if (updateData.phoneNumber !== undefined)
      updateObject.phoneNumber = updateData.phoneNumber;
    if (updateData.gender !== undefined)
      updateObject.gender = updateData.gender;
    if (updateData.dateOfBirth !== undefined)
      updateObject.dateOfBirth = updateData.dateOfBirth;
    if (updateData.occupation !== undefined)
      updateObject.occupation = updateData.occupation;
    if (updateData.profilePictureUrl !== undefined)
      updateObject.profilePictureUrl = updateData.profilePictureUrl;
    if (updateData.status !== undefined)
      updateObject.status = updateData.status;
    if (updateData.maritalStatus !== undefined)
      updateObject.maritalStatus = updateData.maritalStatus;
    if (updateData.notes !== undefined) updateObject.notes = updateData.notes;
    if (updateData.skills !== undefined)
      updateObject.skills = updateData.skills;
    if (updateData.isMember !== undefined)
      updateObject.isMember = updateData.isMember;
    if (updateData.isStaff !== undefined)
      updateObject.isStaff = updateData.isStaff;
    if (updateData.isVolunteer !== undefined)
      updateObject.isVolunteer = updateData.isVolunteer;
    // --- Address ---
    if (updateData.address) {
      updateObject.address = { ...existingUser.address, ...updateData.address };
    }
    // --- Emergency details ---
    if (updateData.emergencyDetails) {
      updateObject.emergencyDetails = {
        ...existingUser.emergencyDetails,
        ...updateData.emergencyDetails,
      };
    }
    // --- Branch ID ---
    if (updateData.branchId) {
      if (mongoose.Types.ObjectId.isValid(updateData.branchId)) {
        updateObject.branchId = updateData.branchId;
      } else {
        contextLogger.warn('Invalid branchId format, skipping update');
      }
    }
    // --- Role handling ---
    if (updateData.role && updateData.role !== existingUser.role) {
      if (currentUser.user?.role !== 'admin') {
        await session.abortTransaction();
        return NextResponse.json(
          { error: 'Only admin can change roles' },
          { status: 403 }
        );
      }
      updateObject.role = updateData.role;
      // Clear old role details
      updateObject.memberDetails = undefined;
      updateObject.visitorDetails = undefined;
      updateObject.pastorDetails = undefined;
      updateObject.bishopDetails = undefined;
      updateObject.adminDetails = undefined;
      updateObject.superAdminDetails = undefined;
    }
    console.log('updateData.memberDetails--->', updateData.memberDetails);
    // --- Member details ---
    if (updateData.memberDetails) {
      updateObject.memberDetails = {
        ...existingUser.memberDetails,
        ...updateData.memberDetails,
        memberId: existingUser.memberDetails?.memberId || '',
      };
    }
     // --- Visitor details ---
    if (updateData.visitorDetails) {
      updateObject.visitorDetails = {
        ...existingUser.visitorDetails,
        ...updateData.visitorDetails,
        visitorId: existingUser.visitorDetails?.visitorId || '',
      };
    }
    // --- Pastor details ---
    if (updateData.pastorDetails) {
      updateObject.pastorDetails = {
        ...existingUser.pastorDetails,
        ...updateData.pastorDetails,
        pastorId: existingUser.pastorDetails?.pastorId || '',
      };
    }
    // --- Bishop details ---
    if (updateData.bishopDetails) {
      updateObject.bishopDetails = {
        ...existingUser.bishopDetails,
        ...updateData.bishopDetails,
        bishopId: existingUser.bishopDetails?.bishopId || '',
      };
    }
    // --- Admin details ---
    if (updateData.adminDetails) {
      updateObject.adminDetails = {
        ...existingUser.adminDetails,
        ...updateData.adminDetails,
        adminId: existingUser.adminDetails?.adminId || '',
      };
    }
    // --- SuperAdmin details ---
    if (updateData.superAdminDetails) {
      updateObject.superAdminDetails = {
        ...existingUser.superAdminDetails,
        ...updateData.superAdminDetails,
        superAdminId: existingUser.superAdminDetails?.superAdminId || '',
      };
    }
    // --- Staff details ---
    if (updateData.isStaff && updateData.staffDetails) {
      updateObject.staffDetails = {
        ...existingUser.staffDetails,
        ...updateData.staffDetails,
        staffId: existingUser.staffDetails?.staffId || '',
      };
    } else if (updateData.isStaff === false) {
      updateObject.staffDetails = undefined;
    }
    // --- Volunteer details ---
    if (updateData.isVolunteer && updateData.volunteerDetails) {
      updateObject.volunteerDetails = {
        ...existingUser.volunteerDetails,
        ...updateData.volunteerDetails,
        volunteerId: existingUser.volunteerDetails?.volunteerId || '',
      };
    } else if (updateData.isVolunteer === false) {
      updateObject.volunteerDetails = undefined;
    }
    // --- Save update ---
    const updatedUser = await UserModel.findByIdAndUpdate(id, updateObject, {
      new: true,
      runValidators: true,
      session,
    })
      .populate('branchId', 'branchName address')
      .populate('churchId', 'churchName')
      .populate('createdBy', 'firstName lastName')
      .populate('updatedBy', 'firstName lastName')
      .populate('memberDetails.departmentIds', 'name description')
      .populate('memberDetails.groupIds', 'name category leaderId')
      .populate('volunteerDetails.departments', 'name description');
    if (!updatedUser) {
      await session.abortTransaction();
      return NextResponse.json(
        { error: 'Failed to update user' },
        { status: 500 }
      );
    }
    await session.commitTransaction();
    transactionCommitted = true;
    contextLogger.info('User updated successfully', {
      userId: updatedUser._id?.toString(),
      role: updatedUser.role,
      updatedBy: currentUser.user?.sub,
    });
    return NextResponse.json({
      message: 'User updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    if (session && !transactionCommitted) {
      try {
        await session.abortTransaction();
      } catch (abortError) {
        contextLogger.error('Error aborting transaction:', abortError);
      }
    }
    contextLogger.error('User update error:', error);
    if (error instanceof mongoose.Error.ValidationError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.message },
        { status: 400 }
      );
    }
    if (error instanceof mongoose.Error.CastError) {
      return NextResponse.json(
        { error: 'Invalid data format' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    if (session) {
      try {
        await session.endSession();
      } catch (endError) {
        contextLogger.error('Error ending session:', endError);
      }
    }
  }
}

// DELETE - Soft delete user by ID
async function deleteUserByIdHandler(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    { requestId, endpoint: `/api/users/${params.id}` },
    'api'
  );
  let session: mongoose.ClientSession | null = null;
  let transactionCommitted = false;
  try {
    // Enhanced authentication check
    const authResult = await requireAuth(['superadmin', 'admin'])(request);
    if (authResult instanceof Response) {
      const body = await authResult.text();
      return new NextResponse(body, {
        status: authResult.status,
        statusText: authResult.statusText,
        headers: authResult.headers,
      });
    }
    const currentUser = authResult;
    // Validate user ID
    if (!(params.id && mongoose.Types.ObjectId.isValid(params.id))) {
      return NextResponse.json(
        { error: 'Valid user ID is required' },
        { status: 400 }
      );
    }
    await dbConnect();
    session = await mongoose.startSession();
    await session.startTransaction();
    // Check for hard delete permission (query parameter)
    const { searchParams } = new URL(request.url);
    const hardDelete = searchParams.get('hardDelete') === 'true';
    // Only superadmin can perform hard deletes
    if (hardDelete && currentUser.user?.role !== 'superadmin') {
      await session.abortTransaction();
      return NextResponse.json(
        { error: 'Only superadmin can perform hard deletes' },
        { status: 403 }
      );
    }
    // Find the user to delete
    const userToDelete = await UserModel.findOne({
      _id: params.id,
      isDeleted: false,
    }).session(session);
    if (!userToDelete) {
      await session.abortTransaction();
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    // Authorization check - admins can only delete users in their church
    if (
      currentUser.user?.role === 'admin' &&
      userToDelete.churchId?.toString() !== currentUser.user?.churchId
    ) {
      await session.abortTransaction();
      return NextResponse.json(
        { error: 'Unauthorized to delete this user' },
        { status: 403 }
      );
    }
    // Prevent self-deletion
    if (userToDelete._id?.toString() === currentUser.user?.sub) {
      await session.abortTransaction();
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }
    // Prevent deletion of other superadmins by admins
    if (
      userToDelete.role === 'superadmin' &&
      currentUser.user?.role !== 'superadmin'
    ) {
      await session.abortTransaction();
      return NextResponse.json(
        { error: 'Cannot delete superadmin accounts' },
        { status: 403 }
      );
    }
    let result: mongoose.Document | null;
    if (hardDelete) {
      // Hard delete - permanently remove from database
      result = await UserModel.findByIdAndDelete(params.id).session(session);
    } else {
      // Soft delete - set isDeleted flag and deactivate
      result = await UserModel.findByIdAndUpdate(
        params.id,
        {
          isDeleted: true,
          status: 'inactive',
          updatedBy: new mongoose.Types.ObjectId(currentUser.user?.sub),
        },
        { new: true, session }
      );
    }
    if (!result) {
      await session.abortTransaction();
      return NextResponse.json(
        { error: 'Failed to delete user' },
        { status: 500 }
      );
    }
    await session.commitTransaction();
    transactionCommitted = true;
    contextLogger.info(
      `User ${hardDelete ? 'hard' : 'soft'} deleted successfully`,
      {
        userId: userToDelete._id?.toString(),
        role: userToDelete.role,
        deletedBy: currentUser.user?.sub,
      }
    );
    return NextResponse.json({
      message: `User ${hardDelete ? 'permanently deleted' : 'deactivated'} successfully`,
      userId: userToDelete._id?.toString(),
      deletionType: hardDelete ? 'hard' : 'soft',
    });
  } catch (error) {
    if (session && !transactionCommitted) {
      try {
        await session.abortTransaction();
      } catch (abortError) {
        contextLogger.error('Error aborting transaction:', abortError);
      }
    }
    contextLogger.error('User deletion error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
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
export const GET = withApiLogger(getUserByIdHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});

export const PUT = withApiLogger(updateUserByIdHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});

export const DELETE = withApiLogger(deleteUserByIdHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});

/*
Usage Examples:

// GET user by ID
GET /api/users/[id]
Response: { user: {...} }

// UPDATE user by ID
PUT /api/users/[id]
Body: {
  firstName: "John",
  lastName: "Updated",
  occupation: "Software Engineer",
  memberDetails: {
    occupation: "Teacher",
    departmentIds: [...]
  },
  isStaff: true,
  staffDetails: {
    jobTitle: "IT Manager",
    department: "Technology"
  }
}

// SOFT DELETE user by ID
DELETE /api/users/[id]
Response: { message: "User deactivated successfully", deletionType: "soft" }

// HARD DELETE user by ID (superadmin only)
DELETE /api/users/[id]?hardDelete=true
Response: { message: "User permanently deleted successfully", deletionType: "hard" }

Key Features:
✅ Proper authorization based on user roles
✅ Soft delete with isDeleted flag
✅ Hard delete option for superadmin
✅ Occupation field integration
✅ Role-specific data handling
✅ Comprehensive error handling
✅ Transaction support for data consistency
✅ Detailed logging for audit trails
✅ Duplicate email/phone validation
✅ Self-deletion prevention
✅ Cross-church access control
*/
