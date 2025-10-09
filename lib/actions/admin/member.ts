'use server';

import { getServerSession } from '@/lib/get-session';
import { logger } from '@/lib/logger';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';

// ============================================
// LOGGER UTILITY
// ============================================

function createActionLogger(actionName: string, organizationId?: string) {
  return logger.createContextLogger(
    {
      action: actionName,
      organizationId: organizationId || 'unknown',
      timestamp: new Date().toISOString(),
    },
    'server-action'
  );
}

// ============================================
// TYPES & INTERFACES
// ============================================

export interface AdminAddOrganizationMemberParams {
  organizationId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  gender: 'MALE' | 'FEMALE';
  role: 'VISITOR' | 'ADMIN' | 'MEMBER' | 'PASTOR' | 'BISHOP';
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  isMember: boolean;
  isStaff: boolean;
  branchId?: string;
  sendWelcomeEmail?: boolean;
}

export interface AdminServerActionResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ============================================
// ADMIN ADD ORGANIZATION MEMBER
// ============================================

export async function adminAddOrganizationMember(
  params: AdminAddOrganizationMemberParams
): Promise<AdminServerActionResponse> {
  const contextLogger = createActionLogger(
    'addOrganizationMember',
    params.organizationId
  );
  try {
    contextLogger.info('Starting add organization member', {
      organizationId: params.organizationId,
      email: params.email,
      role: params.role,
    });
    const session = await getServerSession();
    if (!session?.user) {
      contextLogger.warn('Unauthorized access attempt');
      return { success: false, error: 'Unauthorized' };
    }
    contextLogger.info('Session validated', { userId: session.user.id });
    const {
      organizationId,
      firstName,
      lastName,
      email,
      phoneNumber,
      password,
      gender,
      role,
      address,
      isMember,
      isStaff,
      branchId,
      sendWelcomeEmail = false,
    } = params;
    // Validate required fields
    if (!(firstName && lastName && email && password)) {
      contextLogger.error('Missing required fields', {
        hasFirstName: !!firstName,
        hasLastName: !!lastName,
        hasEmail: !!email,
        hasPassword: !!password,
      });
      return {
        success: false,
        error:
          'Missing required fields: firstName, lastName, email, or password',
      };
    }
    // Check if user has permission to add members (must be OWNER or ADMIN)
    const hasPermission = await prisma.member.findFirst({
      where: {
        organizationId,
        userId: session.user.id,
        role: {
          in: ['OWNER', 'ADMIN'],
        },
      },
    });
    if (!hasPermission) {
      contextLogger.warn('Permission denied', {
        userId: session.user.id,
        organizationId,
      });
      return {
        success: false,
        error: 'You do not have permission to add members to this organization',
      };
    }
    contextLogger.info('Permission check passed', {
      requesterId: session.user.id,
      requesterRole: hasPermission.role,
    });
    // Check if email already exists in the system
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      contextLogger.info('Existing user found', {
        userId: existingUser.id,
        email,
      });
      // Check if user is already a member of this organization
      const existingMember = await prisma.member.findFirst({
        where: {
          userId: existingUser.id,
          organizationId,
        },
      });
      if (existingMember) {
        contextLogger.warn('User already a member', {
          userId: existingUser.id,
          memberId: existingMember.id,
        });
        return {
          success: false,
          error: 'This user is already a member of this organization',
        };
      }
      // Add existing user to organization
      const member = await prisma.member.create({
        data: {
          userId: existingUser.id,
          organizationId,
          role,
          branchId: branchId || null,
        },
        include: {
          user: {
            include: {
              address: true,
            },
          },
        },
      });
      // Update user's additional fields if needed
      await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          phoneNumber: phoneNumber || existingUser.phoneNumber,
          gender: gender || existingUser.gender,
          isMember: isMember || existingUser.isMember,
          isStaff: isStaff || existingUser.isStaff,
          updatedBy: session.user.id,
        },
      });
      contextLogger.info('Existing user added to organization', {
        memberId: member.id,
        userId: existingUser.id,
        role,
      });
      if (sendWelcomeEmail) {
        // TODO: Send welcome email
        contextLogger.info('Welcome email requested for existing user', {
          email,
        });
      }
      revalidatePath('/dashboard/church/users');
      return {
        success: true,
        data: member,
        message: 'Existing user added to organization successfully',
      };
    }
    contextLogger.info('Creating new user', { email });
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Create new user and member in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          name: `${firstName} ${lastName}`,
          email,
          emailVerified: false,
          phoneNumber,
          gender,
          isMember,
          isStaff,
          role: role as any,
          status: 'ACTIVE',
          createdBy: session.user.id,
        },
      });
      contextLogger.info('User created', { userId: user.id });
      // Create account with password (Better Auth format)
      await tx.account.create({
        data: {
          userId: user.id,
          accountId: user.id,
          providerId: 'credential',
          password: hashedPassword,
        },
      });
      contextLogger.info('Account created', { userId: user.id });
      // Create address if provided
      if (address && (address.street || address.city)) {
        await tx.address.create({
          data: {
            userId: user.id,
            street: address.street || '',
            city: address.city || '',
            state: address.state || '',
            zipCode: address.zipCode || '',
            country: address.country || 'Kenya',
          },
        });
        contextLogger.info('Address created', { userId: user.id });
      }
      // Create member record (organization membership)
      const member = await tx.member.create({
        data: {
          userId: user.id,
          organizationId,
          role,
          branchId: branchId || null,
        },
        include: {
          user: {
            include: {
              address: true,
              emergencyContact: true,
            },
          },
          branch: true,
        },
      });
      contextLogger.info('Member created', {
        memberId: member.id,
        userId: user.id,
        role,
      });
      return { user, member };
    });
    if (sendWelcomeEmail) {
      contextLogger.info('Welcome email requested for new user', { email });
      // TODO: Send welcome email with credentials
    }
    contextLogger.info('Member added successfully', {
      memberId: result.member.id,
      userId: result.user.id,
    });
    revalidatePath('/dashboard/church/users');
    return {
      success: true,
      data: result.member,
      message: 'Member added successfully',
    };
  } catch (error: any) {
    contextLogger.error('Error adding organization member', {
      error: error.message,
      stack: error.stack,
      organizationId: params.organizationId,
    });
    return {
      success: false,
      error: error.message || 'Failed to add member',
    };
  }
}

// ============================================
// ADMIN UPDATE ORGANIZATION MEMBER
// ============================================

export interface AdminUpdateOrganizationMemberParams {
  memberId: string;
  organizationId: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  gender?: 'MALE' | 'FEMALE';
  role?: 'VISITOR' | 'OWNER' | 'ADMIN' | 'MEMBER' | 'PASTOR' | 'BISHOP';
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  isMember?: boolean;
  isStaff?: boolean;
  branchId?: string;
  status?: string;
}

export async function adminUpdateOrganizationMember(
  params: AdminUpdateOrganizationMemberParams
): Promise<AdminServerActionResponse> {
  const contextLogger = createActionLogger(
    'updateOrganizationMember',
    params.organizationId
  );
  try {
    contextLogger.info('Starting update organization member', {
      memberId: params.memberId,
      organizationId: params.organizationId,
      updates: Object.keys(params).filter(
        (k) => k !== 'memberId' && k !== 'organizationId'
      ),
    });
    const session = await getServerSession();
    if (!session?.user) {
      contextLogger.warn('Unauthorized access attempt');
      return { success: false, error: 'Unauthorized' };
    }
    const {
      memberId,
      organizationId,
      firstName,
      lastName,
      email,
      phoneNumber,
      gender,
      role,
      address,
      isMember,
      isStaff,
      branchId,
      status,
    } = params;
    // Check if user has permission to update members
    const hasPermission = await prisma.member.findFirst({
      where: {
        organizationId,
        userId: session.user.id,
        role: {
          in: ['OWNER', 'ADMIN'],
        },
      },
    });
    if (!hasPermission) {
      contextLogger.warn('Permission denied', {
        userId: session.user.id,
        organizationId,
      });
      return {
        success: false,
        error:
          'You do not have permission to update members in this organization',
      };
    }
    contextLogger.info('Permission check passed', {
      requesterId: session.user.id,
      requesterRole: hasPermission.role,
    });
    // Get existing member with user details
    const existingMember = await prisma.member.findUnique({
      where: { id: memberId },
      include: {
        user: {
          include: {
            address: true,
          },
        },
      },
    });
    if (!existingMember) {
      contextLogger.warn('Member not found', { memberId });
      return { success: false, error: 'Member not found' };
    }
    contextLogger.info('Existing member found', {
      memberId,
      userId: existingMember.userId,
      currentRole: existingMember.role,
    });
    // Prevent non-owners from updating owner role
    if (existingMember.role === 'OWNER' && hasPermission.role !== 'OWNER') {
      contextLogger.warn('Attempt to update owner by non-owner', {
        requesterId: session.user.id,
        targetMemberId: memberId,
      });
      return {
        success: false,
        error: 'Only owners can update owner members',
      };
    }
    // Update user and member in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Prepare user update data
      const userUpdateData: any = {
        updatedBy: session.user.id,
      };
      if (firstName || lastName) {
        const currentFirstName = existingMember.user.name.split(' ')[0];
        const currentLastName = existingMember.user.name
          .split(' ')
          .slice(1)
          .join(' ');
        userUpdateData.name =
          `${firstName || currentFirstName} ${lastName || currentLastName}`.trim();
        contextLogger.info('Updating name', {
          from: existingMember.user.name,
          to: userUpdateData.name,
        });
      }
      if (email) {
        contextLogger.info('Updating email', {
          from: existingMember.user.email,
          to: email,
        });
        userUpdateData.email = email;
      }
      if (phoneNumber !== undefined) userUpdateData.phoneNumber = phoneNumber;
      if (gender) userUpdateData.gender = gender;
      if (status) {
        contextLogger.info('Updating status', {
          from: existingMember.user.status,
          to: status,
        });
        userUpdateData.status = status;
      }
      if (isMember !== undefined) userUpdateData.isMember = isMember;
      if (isStaff !== undefined) userUpdateData.isStaff = isStaff;
      // Update user
      const user = await tx.user.update({
        where: { id: existingMember.userId },
        data: userUpdateData,
      });
      contextLogger.info('User updated', { userId: user.id });
      // Update or create address
      if (address) {
        const addressData = {
          street: address.street || existingMember.user.address?.street || '',
          city: address.city || existingMember.user.address?.city || '',
          state: address.state || existingMember.user.address?.state || '',
          zipCode:
            address.zipCode || existingMember.user.address?.zipCode || '',
          country:
            address.country || existingMember.user.address?.country || 'Kenya',
        };
        if (existingMember.user.address) {
          await tx.address.update({
            where: { userId: existingMember.userId },
            data: addressData,
          });
          contextLogger.info('Address updated', {
            userId: existingMember.userId,
          });
        } else {
          await tx.address.create({
            data: {
              ...addressData,
              userId: existingMember.userId,
            },
          });
          contextLogger.info('Address created', {
            userId: existingMember.userId,
          });
        }
      }
      // Prepare member update data
      const memberUpdateData: any = {};
      if (role) {
        contextLogger.info('Updating role', {
          from: existingMember.role,
          to: role,
        });
        memberUpdateData.role = role;
      }
      if (branchId !== undefined) {
        contextLogger.info('Updating branch', {
          from: existingMember.branchId,
          to: branchId,
        });
        memberUpdateData.branchId = branchId;
      }
      // Update member
      const member = await tx.member.update({
        where: { id: memberId },
        data: memberUpdateData,
        include: {
          user: {
            include: {
              address: true,
              emergencyContact: true,
            },
          },
          branch: true,
        },
      });
      contextLogger.info('Member updated', { memberId: member.id });
      return { user, member };
    });
    contextLogger.info('Member updated successfully', {
      memberId,
      userId: result.user.id,
    });
    revalidatePath(`/church/users/${memberId}`);
    return {
      success: true,
      data: result.member,
      message: 'Member updated successfully',
    };
  } catch (error: any) {
    contextLogger.error('Error updating organization member', {
      error: error.message,
      stack: error.stack,
      memberId: params.memberId,
      organizationId: params.organizationId,
    });
    return {
      success: false,
      error: error.message || 'Failed to update member',
    };
  }
}

// ============================================
// Admin GET ORGANIZATION MEMBERS
// ============================================

export interface AdminGetOrganizationMembersParams {
  organizationId: string;
  page?: number;
  pageSize?: number;
  search?: string;
  role?: string;
  status?: string;
  branchId?: string;
  sortBy?: 'name' | 'createdAt' | 'role' | 'email';
  sortOrder?: 'asc' | 'desc';
}

export interface AdminGetOrganizationMembersResponse {
  members: any[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export async function adminGetOrganizationMembers(
  params: AdminGetOrganizationMembersParams
): Promise<AdminGetOrganizationMembersResponse> {
  const contextLogger = createActionLogger(
    'getOrganizationMembers',
    params.organizationId
  );
  try {
    contextLogger.info('Fetching organization members', {
      organizationId: params.organizationId,
      page: params.page,
      pageSize: params.pageSize,
      filters: {
        search: params.search,
        role: params.role,
        status: params.status,
        branchId: params.branchId,
      },
    });
    const session = await getServerSession();
    if (!session?.user) {
      contextLogger.warn('Unauthorized access attempt');
      throw new Error('Unauthorized');
    }
    const {
      organizationId,
      page = 1,
      pageSize = 10,
      search = '',
      role,
      status,
      branchId,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = params;
    // Check if user is a member of this organization
    const isMember = await prisma.member.findFirst({
      where: {
        organizationId,
        userId: session.user.id,
      },
    });
    if (!isMember) {
      contextLogger.warn('Access denied - user not a member', {
        userId: session.user.id,
        organizationId,
      });
      throw new Error('You do not have access to this organization');
    }
    contextLogger.info('Access granted', {
      userId: session.user.id,
      role: isMember.role,
    });
    // Build where clause
    const where: any = {
      organizationId,
    };
    if (role && role !== 'all') {
      where.role = role;
    }
    if (branchId && branchId !== 'all') {
      where.branchId = branchId;
    }
    if (search) {
      where.user = {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { phoneNumber: { contains: search, mode: 'insensitive' } },
        ],
      };
    }
    if (status && status !== 'all') {
      where.user = {
        ...where.user,
        status,
      };
    }
    // Build order by clause
    let orderBy: any = {};
    switch (sortBy) {
      case 'name':
        orderBy = { user: { name: sortOrder } };
        break;
      case 'email':
        orderBy = { user: { email: sortOrder } };
        break;
      case 'role':
        orderBy = { role: sortOrder };
        break;
      default:
        orderBy = { createdAt: sortOrder };
        break;
    }
    const skip = (page - 1) * pageSize;
    // Fetch members and total count
    const [members, total] = await Promise.all([
      prisma.member.findMany({
        where,
        include: {
          user: {
            include: {
              address: true,
              emergencyContact: true,
              memberDetails: true,
              pastorDetails: true,
              bishopDetails: true,
              staffDetails: true,
              volunteerDetails: true,
              adminDetails: true,
              visitorDetails: true,
            },
          },
          branch: {
            select: {
              id: true,
              branchName: true,
              email: true,
              phoneNumber: true,
            },
          },
        },
        orderBy,
        skip,
        take: pageSize,
      }),
      prisma.member.count({ where }),
    ]);
    const totalPages = Math.ceil(total / pageSize);
    contextLogger.info('Members fetched successfully', {
      total,
      page,
      pageSize,
      totalPages,
      membersReturned: members.length,
    });
    return {
      members,
      pagination: {
        total,
        page,
        pageSize,
        totalPages,
        hasMore: page < totalPages,
      },
    };
  } catch (error: any) {
    contextLogger.error('Error fetching organization members', {
      error: error.message,
      stack: error.stack,
      organizationId: params.organizationId,
    });
    throw new Error(error.message || 'Failed to fetch members');
  }
}

// ============================================
// ADMIN GET ORGANIZATION MEMBER BY ID
// ============================================

export async function adminGetOrganizationMemberById(
  memberId: string,
  organizationId: string
): Promise<AdminServerActionResponse> {
  const contextLogger = createActionLogger(
    'getOrganizationMemberById',
    organizationId
  );
  try {
    contextLogger.info('Fetching member by ID', { memberId, organizationId });
    const session = await getServerSession();
    if (!session?.user) {
      contextLogger.warn('Unauthorized access attempt');
      return { success: false, error: 'Unauthorized' };
    }
    // Check if user is a member of this organization
    const isMember = await prisma.member.findFirst({
      where: {
        organizationId,
        userId: session.user.id,
      },
    });
    if (!isMember) {
      contextLogger.warn('Access denied - user not a member', {
        userId: session.user.id,
        organizationId,
      });
      return {
        success: false,
        error: 'You do not have access to this organization',
      };
    }
    contextLogger.info('Access granted', {
      userId: session.user.id,
      role: isMember.role,
    });
    // Fetch member details
    const member = await prisma.member.findUnique({
      where: { id: memberId },
      include: {
        user: {
          include: {
            address: true,
            emergencyContact: true,
            memberDetails: true,
            pastorDetails: {
              include: {
                assignments: true,
              },
            },
            bishopDetails: true,
            staffDetails: true,
            volunteerDetails: {
              include: {
                availabilitySchedule: true,
                volunteerRoles: true,
                backgroundCheck: true,
              },
            },
            adminDetails: true,
            visitorDetails: true,
          },
        },
        branch: {
          select: {
            id: true,
            branchName: true,
            email: true,
            phoneNumber: true,
            address: true,
          },
        },
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
          },
        },
      },
    });
    if (!member) {
      contextLogger.warn('Member not found', { memberId });
      return { success: false, error: 'Member not found' };
    }
    // Verify member belongs to the specified organization
    if (member.organizationId !== organizationId) {
      contextLogger.warn('Member organization mismatch', {
        memberId,
        requestedOrg: organizationId,
        actualOrg: member.organizationId,
      });
      return {
        success: false,
        error: 'Member does not belong to this organization',
      };
    }
    contextLogger.info('Member fetched successfully', {
      memberId,
      userId: member.userId,
      role: member.role,
    });
    return {
      success: true,
      data: member,
    };
  } catch (error: any) {
    contextLogger.error('Error fetching organization member', {
      error: error.message,
      stack: error.stack,
      memberId,
      organizationId,
    });
    return {
      success: false,
      error: error.message || 'Failed to fetch member',
    };
  }
}

// ============================================
// ADMIN GET ORGANIZATION MEMBER BY USER ID
// ============================================

export async function adminGetOrganizationMemberByUserId(
  userId: string,
  organizationId: string
): Promise<AdminServerActionResponse> {
  const contextLogger = createActionLogger(
    'getOrganizationMemberByUserId',
    organizationId
  );
  try {
    contextLogger.info('Fetching member by user ID', {
      userId,
      organizationId,
    });
    const session = await getServerSession();
    if (!session?.user) {
      contextLogger.warn('Unauthorized access attempt');
      return { success: false, error: 'Unauthorized' };
    }
    // Check if requester is a member of this organization
    const isMember = await prisma.member.findFirst({
      where: {
        organizationId,
        userId: session.user.id,
      },
    });
    if (!isMember) {
      contextLogger.warn('Access denied - user not a member', {
        requesterId: session.user.id,
        organizationId,
      });
      return {
        success: false,
        error: 'You do not have access to this organization',
      };
    }
    contextLogger.info('Access granted', {
      requesterId: session.user.id,
      role: isMember.role,
    });
    // Fetch member by user ID
    const member = await prisma.member.findFirst({
      where: {
        userId,
        organizationId,
      },
      include: {
        user: {
          include: {
            address: true,
            emergencyContact: true,
            memberDetails: true,
            pastorDetails: {
              include: {
                assignments: true,
              },
            },
            bishopDetails: true,
            staffDetails: true,
            volunteerDetails: {
              include: {
                availabilitySchedule: true,
                volunteerRoles: true,
                backgroundCheck: true,
              },
            },
            adminDetails: true,
            visitorDetails: true,
          },
        },
        branch: {
          select: {
            id: true,
            branchName: true,
            email: true,
            phoneNumber: true,
          },
        },
      },
    });
    if (!member) {
      contextLogger.warn('Member not found', { userId, organizationId });
      return { success: false, error: 'Member not found' };
    }
    contextLogger.info('Member fetched successfully', {
      memberId: member.id,
      userId,
      role: member.role,
    });
    return {
      success: true,
      data: member,
    };
  } catch (error: any) {
    contextLogger.error('Error fetching organization member by user ID', {
      error: error.message,
      stack: error.stack,
      userId,
      organizationId,
    });
    return {
      success: false,
      error: error.message || 'Failed to fetch member',
    };
  }
}

// ============================================
// ADMIN REMOVE ORGANIZATION MEMBER
// ============================================

export async function adminRemoveOrganizationMember(
  memberId: string,
  organizationId: string,
  deleteUser = false
): Promise<AdminServerActionResponse> {
  const contextLogger = createActionLogger(
    'removeOrganizationMember',
    organizationId
  );
  try {
    contextLogger.info('Starting remove organization member', {
      memberId,
      organizationId,
      deleteUser,
    });
    const session = await getServerSession();
    if (!session?.user) {
      contextLogger.warn('Unauthorized access attempt');
      return { success: false, error: 'Unauthorized' };
    }
    // Check if user has permission
    const hasPermission = await prisma.member.findFirst({
      where: {
        organizationId,
        userId: session.user.id,
        role: {
          in: ['OWNER', 'ADMIN'],
        },
      },
    });
    if (!hasPermission) {
      contextLogger.warn('Permission denied', {
        userId: session.user.id,
        organizationId,
      });
      return {
        success: false,
        error: 'You do not have permission to remove members',
      };
    }
    contextLogger.info('Permission check passed', {
      requesterId: session.user.id,
      requesterRole: hasPermission.role,
    });
    // Get member
    const member = await prisma.member.findUnique({
      where: { id: memberId },
      include: { user: true },
    });
    if (!member) {
      contextLogger.warn('Member not found', { memberId });
      return { success: false, error: 'Member not found' };
    }
    contextLogger.info('Member found', {
      memberId,
      userId: member.userId,
      role: member.role,
    });
    // Prevent removing owner
    if (member.role === 'OWNER') {
      contextLogger.warn('Attempt to remove owner', {
        memberId,
        requesterId: session.user.id,
      });
      return {
        success: false,
        error: 'Cannot remove organization owner',
      };
    }
    // Prevent removing yourself
    if (member.userId === session.user.id) {
      contextLogger.warn('Attempt to remove self', {
        memberId,
        userId: session.user.id,
      });
      return {
        success: false,
        error: 'Cannot remove yourself. Use leave organization instead.',
      };
    }
    if (deleteUser) {
      contextLogger.info('Soft deleting user and removing member', {
        memberId,
        userId: member.userId,
      });
      // Soft delete user (mark as deleted)
      await prisma.$transaction([
        prisma.member.delete({
          where: { id: memberId },
        }),
        prisma.user.update({
          where: { id: member.userId },
          data: {
            isDeleted: true,
            updatedBy: session.user.id,
          },
        }),
      ]);
      contextLogger.info('User soft deleted and member removed', {
        memberId,
        userId: member.userId,
      });
    } else {
      contextLogger.info('Removing member from organization', { memberId });
      // Just remove from organization
      await prisma.member.delete({
        where: { id: memberId },
      });
      contextLogger.info('Member removed from organization', { memberId });
    }
    revalidatePath('/church/users');
    const message = deleteUser
      ? 'Member removed and user account deleted'
      : 'Member removed from organization';
    contextLogger.info('Member removal successful', {
      memberId,
      deleteUser,
      message,
    });
    return {
      success: true,
      message,
    };
  } catch (error: any) {
    contextLogger.error('Error removing organization member', {
      error: error.message,
      stack: error.stack,
      memberId,
      organizationId,
      deleteUser,
    });
    return {
      success: false,
      error: error.message || 'Failed to remove member',
    };
  }
}
