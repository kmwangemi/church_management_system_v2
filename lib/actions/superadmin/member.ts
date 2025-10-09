// ============================================
// SERVER ACTIONS - lib/actions/member.ts
// ============================================
'use server';

import type { Prisma } from '@/generated/prisma';
import { getServerSession } from '@/lib/get-session';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';

// ============================================
// TYPES & INTERFACES
// ============================================

export interface GetMembersParams {
  organizationId: string;
  page?: number;
  pageSize?: number;
  search?: string;
  role?: string;
  status?: string;
  branchId?: string;
  sortBy?: 'name' | 'createdAt' | 'role';
  sortOrder?: 'asc' | 'desc';
}

export interface GetMembersResponse {
  members: any[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export interface AddMemberParams {
  organizationId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  gender: 'MALE' | 'FEMALE';
  role: 'VISITOR' | 'ADMIN' | 'MEMBER' | 'PASTOR' | 'BISHOP';
  isMember: boolean;
  branchId?: string;
  sendWelcomeEmail?: boolean;
}

export interface UpdateMemberParams {
  memberId: string;
  organizationId: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  gender?: 'MALE' | 'FEMALE';
  role?: 'VISITOR' | 'OWNER' | 'ADMIN' | 'MEMBER' | 'PASTOR' | 'BISHOP';
  status?: string;
  isMember?: boolean;
  branchId?: string;
}

export interface ServerActionResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ============================================
// 1. GET ORGANIZATION MEMBERS
// ============================================

export async function getOrganizationMembers(
  params: GetMembersParams
): Promise<GetMembersResponse> {
  const session = await getServerSession();
  if (!session?.user) {
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
  const where: Prisma.MemberWhereInput = {
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
  let orderBy: Prisma.MemberOrderByWithRelationInput = {};
  switch (sortBy) {
    case 'name':
      orderBy = { user: { name: sortOrder } };
      break;
    case 'role':
      orderBy = { role: sortOrder };
      break;
    default:
      orderBy = { createdAt: sortOrder };
      break;
  }
  const skip = (page - 1) * pageSize;
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
        branch: true,
      },
      orderBy,
      skip,
      take: pageSize,
    }),
    prisma.member.count({ where }),
  ]);
  const totalPages = Math.ceil(total / pageSize);
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
}

// ============================================
// 2. ADD MEMBER TO ORGANIZATION
// ============================================

export async function addMemberToOrganization(
  params: AddMemberParams
): Promise<ServerActionResponse> {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return { success: false, error: 'Unauthorized' };
    }
    const {
      organizationId,
      firstName,
      lastName,
      email,
      phoneNumber,
      password,
      gender,
      role,
      isMember,
      branchId,
      sendWelcomeEmail = false,
    } = params;
    // Check if user has permission to add members
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
      return {
        success: false,
        error: 'You do not have permission to add members to this organization',
      };
    }
    // Check if email already exists in the system
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      // Check if user is already a member of this organization
      const existingMember = await prisma.member.findFirst({
        where: {
          userId: existingUser.id,
          organizationId,
        },
      });
      if (existingMember) {
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
          user: true,
        },
      });
      // TODO: Send welcome email if requested
      if (sendWelcomeEmail) {
        // await sendWelcomeEmail(member.user.email, organizationId);
      }
      revalidatePath(`/dashboard/organizations/${organizationId}/members`);
      return {
        success: true,
        data: member,
        message: 'Member added successfully',
      };
    }
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
          role, // User role (not organization role)
          status: 'ACTIVE',
          createdBy: session.user.id,
        },
      });
      // Create account with password
      await tx.account.create({
        data: {
          userId: user.id,
          accountId: user.id,
          providerId: 'credential',
          password: hashedPassword,
        },
      });
      // Create member record
      const member = await tx.member.create({
        data: {
          userId: user.id,
          organizationId,
          role,
          branchId: branchId || null,
        },
        include: {
          user: true,
        },
      });
      return { user, member };
    });
    // TODO: Send welcome email if requested
    if (sendWelcomeEmail) {
      // await sendWelcomeEmailWithCredentials(result.user.email, password, organizationId);
    }
    revalidatePath(`/dashboard/organizations/${organizationId}/members`);
    return {
      success: true,
      data: result.member,
      message: 'Member added successfully',
    };
  } catch (error: any) {
    console.error('Error adding member:', error);
    return {
      success: false,
      error: error.message || 'Failed to add member',
    };
  }
}

// ============================================
// 3. UPDATE MEMBER
// ============================================

export async function updateMember(
  params: UpdateMemberParams
): Promise<ServerActionResponse> {
  try {
    const session = await getServerSession();
    if (!session?.user) {
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
      status,
      isMember,
      branchId,
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
      return {
        success: false,
        error:
          'You do not have permission to update members in this organization',
      };
    }
    // Get member with user details
    const existingMember = await prisma.member.findUnique({
      where: { id: memberId },
      include: { user: true },
    });
    if (!existingMember) {
      return { success: false, error: 'Member not found' };
    }
    // Prevent non-owners from updating owner role
    if (existingMember.role === 'OWNER' && hasPermission.role !== 'OWNER') {
      return {
        success: false,
        error: 'Only owners can update owner members',
      };
    }
    // Update user and member in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Prepare user update data
      const userUpdateData: Prisma.UserUpdateInput = {
        updatedBy: session.user.id,
      };
      if (firstName || lastName) {
        userUpdateData.name =
          `${firstName || existingMember.user.name.split(' ')[0]} ${lastName || existingMember.user.name.split(' ')[1] || ''}`.trim();
      }
      if (email) userUpdateData.email = email;
      if (phoneNumber !== undefined) userUpdateData.phoneNumber = phoneNumber;
      if (gender) userUpdateData.gender = gender;
      if (status) userUpdateData.status = status;
      if (isMember !== undefined) userUpdateData.isMember = isMember;
      // Update user
      const user = await tx.user.update({
        where: { id: existingMember.userId },
        data: userUpdateData,
      });
      // Prepare member update data
      const memberUpdateData: Prisma.MemberUpdateInput = {};
      if (role) memberUpdateData.role = role;
      if (branchId !== undefined) memberUpdateData.branchId = branchId;
      // Update member
      const member = await tx.member.update({
        where: { id: memberId },
        data: memberUpdateData,
        include: {
          user: true,
          branch: true,
        },
      });
      return { user, member };
    });
    revalidatePath(`/dashboard/organizations/${organizationId}/members`);
    return {
      success: true,
      data: result.member,
      message: 'Member updated successfully',
    };
  } catch (error: any) {
    console.error('Error updating member:', error);
    return {
      success: false,
      error: error.message || 'Failed to update member',
    };
  }
}

// ============================================
// 4. SUSPEND/ACTIVATE MEMBER
// ============================================

export async function toggleMemberStatus(
  memberId: string,
  organizationId: string
): Promise<ServerActionResponse> {
  try {
    const session = await getServerSession();
    if (!session?.user) {
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
      return {
        success: false,
        error: 'You do not have permission to suspend/activate members',
      };
    }
    // Get member
    const member = await prisma.member.findUnique({
      where: { id: memberId },
      include: { user: true },
    });
    if (!member) {
      return { success: false, error: 'Member not found' };
    }
    // Prevent suspending owner
    if (member.role === 'OWNER') {
      return {
        success: false,
        error: 'Cannot suspend organization owner',
      };
    }
    // Toggle status
    const newStatus = member.user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    const updatedUser = await prisma.user.update({
      where: { id: member.userId },
      data: {
        status: newStatus,
        updatedBy: session.user.id,
      },
    });
    revalidatePath(`/dashboard/organizations/${organizationId}/members`);
    return {
      success: true,
      data: { status: newStatus },
      message: `Member ${newStatus === 'ACTIVE' ? 'activated' : 'suspended'} successfully`,
    };
  } catch (error: any) {
    console.error('Error toggling member status:', error);
    return {
      success: false,
      error: error.message || 'Failed to update member status',
    };
  }
}

// ============================================
// 5. DELETE/REMOVE MEMBER
// ============================================

export async function removeMemberFromOrganization(
  memberId: string,
  organizationId: string,
  deleteUser = false
): Promise<ServerActionResponse> {
  try {
    const session = await getServerSession();
    if (!session?.user) {
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
      return {
        success: false,
        error: 'You do not have permission to remove members',
      };
    }
    // Get member
    const member = await prisma.member.findUnique({
      where: { id: memberId },
      include: { user: true },
    });
    if (!member) {
      return { success: false, error: 'Member not found' };
    }
    // Prevent removing owner
    if (member.role === 'OWNER') {
      return {
        success: false,
        error: 'Cannot remove organization owner',
      };
    }
    // Prevent removing yourself
    if (member.userId === session.user.id) {
      return {
        success: false,
        error: 'Cannot remove yourself. Use leave organization instead.',
      };
    }
    if (deleteUser) {
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
    } else {
      // Just remove from organization
      await prisma.member.delete({
        where: { id: memberId },
      });
    }
    revalidatePath(`/dashboard/organizations/${organizationId}/members`);
    return {
      success: true,
      message: deleteUser
        ? 'Member removed and user account deleted'
        : 'Member removed from organization',
    };
  } catch (error: any) {
    console.error('Error removing member:', error);
    return {
      success: false,
      error: error.message || 'Failed to remove member',
    };
  }
}

// ============================================
// 6. UPDATE MEMBER ROLE (Using Better Auth)
// ============================================

export async function updateMemberRole(
  memberId: string,
  organizationId: string,
  newRole: string
): Promise<ServerActionResponse> {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return { success: false, error: 'Unauthorized' };
    }
    // Check if user has permission (must be owner or admin)
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
      return {
        success: false,
        error: 'You do not have permission to change member roles',
      };
    }
    // Get member
    const member = await prisma.member.findUnique({
      where: { id: memberId },
    });
    if (!member) {
      return { success: false, error: 'Member not found' };
    }
    // Prevent changing owner role unless you're the owner
    if (member.role === 'OWNER' && hasPermission.role !== 'OWNER') {
      return {
        success: false,
        error: 'Only the owner can change owner roles',
      };
    }
    // Update role
    const updatedMember = await prisma.member.update({
      where: { id: memberId },
      data: { role: newRole },
      include: {
        user: true,
      },
    });
    revalidatePath(`/dashboard/organizations/${organizationId}/members`);
    return {
      success: true,
      data: updatedMember,
      message: 'Member role updated successfully',
    };
  } catch (error: any) {
    console.error('Error updating member role:', error);
    return {
      success: false,
      error: error.message || 'Failed to update member role',
    };
  }
}

// ============================================
// 7. BULK ACTIONS
// ============================================

export async function bulkUpdateMemberStatus(
  memberIds: string[],
  organizationId: string,
  status: string
): Promise<ServerActionResponse> {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return { success: false, error: 'Unauthorized' };
    }
    // Check permission
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
      return { success: false, error: 'Unauthorized' };
    }
    // Get members to update
    const members = await prisma.member.findMany({
      where: {
        id: { in: memberIds },
        organizationId,
        role: { not: 'OWNER' }, // Don't update owners
      },
      select: { userId: true },
    });
    const userIds = members.map((m) => m.userId);
    // Update all users
    await prisma.user.updateMany({
      where: { id: { in: userIds } },
      data: {
        status,
        updatedBy: session.user.id,
      },
    });
    revalidatePath(`/dashboard/organizations/${organizationId}/members`);
    return {
      success: true,
      message: `${members.length} members updated successfully`,
    };
  } catch (error: any) {
    console.error('Error bulk updating members:', error);
    return {
      success: false,
      error: error.message || 'Failed to update members',
    };
  }
}

export async function bulkRemoveMembers(
  memberIds: string[],
  organizationId: string
): Promise<ServerActionResponse> {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return { success: false, error: 'Unauthorized' };
    }
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
      return { success: false, error: 'Unauthorized' };
    }
    // Delete members (excluding owner and current user)
    const result = await prisma.member.deleteMany({
      where: {
        id: { in: memberIds },
        organizationId,
        role: { not: 'OWNER' },
        userId: { not: session.user.id },
      },
    });
    revalidatePath(`/dashboard/organizations/${organizationId}/members`);
    return {
      success: true,
      message: `${result.count} members removed successfully`,
    };
  } catch (error: any) {
    console.error('Error bulk removing members:', error);
    return {
      success: false,
      error: error.message || 'Failed to remove members',
    };
  }
}
