/** biome-ignore-all lint/complexity/noExcessiveCognitiveComplexity: ignore complexity */
import { requireAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { withApiLogger } from '@/lib/middleware/api-logger';
import dbConnect from '@/lib/mongodb';
import { UserModel } from '@/models';
import mongoose from 'mongoose';
import { type NextRequest, NextResponse } from 'next/server';

// Helper function to prepare role-specific data for updates
const prepareRoleSpecificUpdateData = (
  role: string,
  userData: any,
  existingData?: any
) => {
  const result: any = {};
  switch (role) {
    case 'member':
      if (userData.memberDetails || existingData?.memberDetails) {
        result.memberDetails = {
          ...existingData?.memberDetails,
          ...userData.memberDetails,
          memberId: existingData?.memberDetails?.memberId || '', // Preserve existing ID
        };
      }
      break;
    case 'visitor':
      if (userData.visitorDetails || existingData?.visitorDetails) {
        result.visitorDetails = {
          ...existingData?.visitorDetails,
          ...userData.visitorDetails,
          visitorId: existingData?.visitorDetails?.visitorId || '', // Preserve existing ID
        };
      }
      break;
    case 'pastor':
      if (userData.pastorDetails || existingData?.pastorDetails) {
        result.pastorDetails = {
          ...existingData?.pastorDetails,
          ...userData.pastorDetails,
          pastorId: existingData?.pastorDetails?.pastorId || '', // Preserve existing ID
        };
      }
      break;
    case 'bishop':
      if (userData.bishopDetails || existingData?.bishopDetails) {
        result.bishopDetails = {
          ...existingData?.bishopDetails,
          ...userData.bishopDetails,
          bishopId: existingData?.bishopDetails?.bishopId || '', // Preserve existing ID
        };
      }
      break;
    case 'admin':
      if (userData.adminDetails || existingData?.adminDetails) {
        result.adminDetails = {
          ...existingData?.adminDetails,
          ...userData.adminDetails,
          adminId: existingData?.adminDetails?.adminId || '', // Preserve existing ID
        };
      }
      break;
    case 'superadmin':
      if (userData.superAdminDetails || existingData?.superAdminDetails) {
        result.superAdminDetails = {
          ...existingData?.superAdminDetails,
          ...userData.superAdminDetails,
          superAdminId: existingData?.superAdminDetails?.superAdminId || '', // Preserve existing ID
          accessLevel: 'global', // Always global for superadmin
        };
      }
      break;
    default:
      throw new Error(`Unsupported role: ${role}`);
  }
  return result;
};

// GET - Get user by ID
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
      isDeleted: false, // Use isDeleted field from your model
    };
    // Authorization logic - superadmin can see all, others limited to their church
    if (currentUser.user?.role !== 'superadmin') {
      if (!currentUser.user?.churchId) {
        return NextResponse.json(
          { error: 'Church ID not found' },
          { status: 400 }
        );
      }
      query.churchId = currentUser.user.churchId;
    }
    // Find user with comprehensive population
    const foundUser = await UserModel.findOne(query)
      .populate('branchId', 'branchName address')
      .populate('churchId', 'churchName')
      .populate('createdBy', 'firstName lastName')
      .populate('updatedBy', 'firstName lastName')
      .populate('memberDetails.departmentIds', 'name description')
      .populate('memberDetails.groupIds', 'name category leaderId')
      .populate('volunteerDetails.departments', 'name description')
      .lean();
    if (!foundUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    contextLogger.info('User retrieved successfully', {
      userId: foundUser._id?.toString(),
      role: foundUser.role,
    });
    return NextResponse.json({
      user: foundUser,
    });
  } catch (error) {
    contextLogger.error('Get user by ID error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update user by ID
async function updateUserByIdHandler(
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
    if (!(id && mongoose.Types.ObjectId.isValid(id))) {
      return NextResponse.json(
        { error: 'Valid user ID is required' },
        { status: 400 }
      );
    }
    await dbConnect();
    session = await mongoose.startSession();
    const updateData = await request.json();
    await session.startTransaction();
    // Find existing user
    const existingUser = await UserModel.findOne({
      _id: id,
      isDeleted: false,
    }).session(session);
    if (!existingUser) {
      await session.abortTransaction();
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    // Authorization check - admins can only update users in their church
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
    // Check for duplicate email (if updating email)
    if (updateData.email && updateData.email !== existingUser.email) {
      const duplicateEmail = await UserModel.findOne({
        email: updateData.email,
        _id: { $ne: params.id },
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
        _id: { $ne: params.id },
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
    // Prepare update object
    const updateObject: any = {
      updatedBy: new mongoose.Types.ObjectId(currentUser.user?.sub),
    };
    // Update common fields
    if (updateData.firstName) updateObject.firstName = updateData.firstName;
    if (updateData.lastName) updateObject.lastName = updateData.lastName;
    if (updateData.email !== undefined) updateObject.email = updateData.email;
    if (updateData.phoneNumber)
      updateObject.phoneNumber = updateData.phoneNumber;
    if (updateData.gender) updateObject.gender = updateData.gender;
    if (updateData.dateOfBirth !== undefined)
      updateObject.dateOfBirth = updateData.dateOfBirth;
    if (updateData.occupation !== undefined)
      updateObject.occupation = updateData.occupation;
    if (updateData.address) updateObject.address = updateData.address;
    if (updateData.profilePictureUrl !== undefined)
      updateObject.profilePictureUrl = updateData.profilePictureUrl;
    if (updateData.status) updateObject.status = updateData.status;
    if (updateData.maritalStatus)
      updateObject.maritalStatus = updateData.maritalStatus;
    if (updateData.emergencyDetails)
      updateObject.emergencyDetails = updateData.emergencyDetails;
    if (updateData.notes !== undefined) updateObject.notes = updateData.notes;
    // Handle role changes (only superadmin can change roles)
    if (updateData.role && updateData.role !== existingUser.role) {
      if (currentUser.user?.role !== 'superadmin') {
        await session.abortTransaction();
        return NextResponse.json(
          { error: 'Only superadmin can change user roles' },
          { status: 403 }
        );
      }
      updateObject.role = updateData.role;
      // Prepare new role-specific data
      const roleSpecificData = prepareRoleSpecificUpdateData(
        updateData.role,
        updateData,
        existingUser.toObject()
      );
      Object.assign(updateObject, roleSpecificData);
      // Clear incompatible role details
      const allRoleFields = [
        'memberDetails',
        'pastorDetails',
        'bishopDetails',
        'adminDetails',
        'superAdminDetails',
        'visitorDetails',
      ];
      allRoleFields.forEach((field) => {
        if (!roleSpecificData[field]) {
          updateObject[field] = undefined;
        }
      });
    } else {
      // Update existing role details without changing role
      const roleSpecificData = prepareRoleSpecificUpdateData(
        existingUser.role,
        updateData,
        existingUser.toObject()
      );
      Object.assign(updateObject, roleSpecificData);
    }
    // Handle secondary role flags
    if (updateData.isStaff !== undefined) {
      updateObject.isStaff = updateData.isStaff;
      if (updateData.isStaff && updateData.staffDetails) {
        updateObject.staffDetails = {
          ...existingUser.staffDetails,
          ...updateData.staffDetails,
          staffId: existingUser.staffDetails?.staffId || '', // Preserve existing ID
        };
      } else if (!updateData.isStaff) {
        updateObject.staffDetails = undefined;
      }
    }
    if (updateData.isVolunteer !== undefined) {
      updateObject.isVolunteer = updateData.isVolunteer;
      if (updateData.isVolunteer && updateData.volunteerDetails) {
        updateObject.volunteerDetails = {
          ...existingUser.volunteerDetails,
          ...updateData.volunteerDetails,
          volunteerId: existingUser.volunteerDetails?.volunteerId || '', // Preserve existing ID
        };
      } else if (!updateData.isVolunteer) {
        updateObject.volunteerDetails = undefined;
      }
    }
    if (updateData.isMember !== undefined) {
      updateObject.isMember = updateData.isMember;
    }
    // Perform the update
    const updatedUser = await UserModel.findByIdAndUpdate(
      params.id,
      updateObject,
      {
        new: true,
        runValidators: true,
        session,
      }
    )
      .populate('branchId', 'branchName address')
      .populate('churchId', 'churchName')
      .populate('createdBy', 'firstName lastName')
      .populate('updatedBy', 'firstName lastName')
      .populate('memberDetails.departmentIds', 'name description')
      .populate('memberDetails.groupIds', 'name category leaderId')
      .populate('volunteerDetails.departments', 'name description')
      .populate('volunteerDetails.ministries', 'name description');
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
