// ============================================
// SERVER ACTIONS - lib/actions/member.ts
// ============================================
'use server';

import type { ORGANIZATIONUserRole, Prisma } from '@/generated/prisma';
import { getServerSession } from '@/lib/get-session';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';

// ============================================
// TYPES & INTERFACES
// ============================================

export interface AdminGetOrganizationMembersParams {
  organizationId: string | undefined;
  page?: number;
  pageSize?: number;
  search?: string;
  role?: string;
  status?: string;
  teamId?: string;
  sortBy?: 'name' | 'createdAt' | 'role';
  sortOrder?: 'asc' | 'desc';
}

export interface AdminGetMembersResponse {
  members: any[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasMore: boolean;
  };
}

// ============================================
// UPDATED INTERFACE FOR adminAddMemberToOrganization
// ============================================

// Update the AdminAddMemberParams interface to match AddUserPayload
export interface AdminAddMemberParams {
  organizationId: string;
  firstName: string;
  lastName: string;
  email?: string; // Optional based on your schema
  phoneNumber: string;
  password: string; // Keep for account creation
  gender: 'MALE' | 'FEMALE';
  role: 'VISITOR' | 'ADMIN' | 'MEMBER' | 'PASTOR' | 'BISHOP';
  organizationRole:
    | 'OWNER'
    | 'MEMBER'
    | 'PASTOR'
    | 'BISHOP'
    | 'ADMIN'
    | 'VISITOR';
  isMember: boolean;
  isStaff?: boolean; // Add this
  teamId?: string; // This maps to branchId
  sendWelcomeEmail?: boolean;
  // Add address
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country: string;
  };
}

// ============================================
// UPDATED INTERFACE FOR adminUpdateOrganizationMember
// ============================================

// Make sure this matches the type used in the hook
export interface AdminUpdateOrganizationMemberParams {
  memberId: string;
  organizationId: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  gender?: 'MALE' | 'FEMALE';
  role?: 'VISITOR' | 'ADMIN' | 'MEMBER' | 'PASTOR' | 'BISHOP';
  organizationRole?: ORGANIZATIONUserRole;
  status?: string;
  isMember?: boolean;
  teamId?: string;
}

export interface AdminServerActionResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ============================================
// 1. ADMIN GET ORGANIZATION MEMBERS
// ============================================

export async function adminGetOrganizationMembers(
  params: AdminGetOrganizationMembersParams
): Promise<AdminGetMembersResponse> {
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
    teamId,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = params;
  const where: Prisma.MemberWhereInput = {
    organizationId,
  };
  // Filter by organization role
  if (role && role !== 'all') {
    where.role = role as ORGANIZATIONUserRole;
  }
  // Filter by team membership
  if (teamId && teamId !== 'all') {
    where.user = {
      teammembers: {
        some: {
          teamId,
        },
      },
    };
  }
  // Search by user details
  if (search) {
    where.user = {
      ...where.user,
    };
    where.OR = [
      {
        user: {
          name: { contains: search, mode: 'insensitive' },
        },
      },
      {
        user: {
          email: { contains: search, mode: 'insensitive' },
        },
      },
      {
        user: {
          phoneNumber: { contains: search, mode: 'insensitive' },
        },
      },
    ];
  }
  // Filter by user status
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
            teammembers: {
              include: {
                team: true,
              },
            },
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
// 2. ADMIN ADD MEMBER TO ORGANIZATION
// ============================================

export async function adminAddMemberToOrganization(
  params: AdminAddMemberParams
): Promise<AdminServerActionResponse> {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return { success: false, error: 'Unauthorized' };
    }
    console.log('session user:', session.user);
    const {
      organizationId,
      firstName,
      lastName,
      email,
      phoneNumber,
      password,
      gender,
      role,
      organizationRole,
      isMember,
      isStaff = false,
      teamId,
      address,
      sendWelcomeEmail = false,
    } = params;
    console.log('session user:', session.user);
    console.log('organizationId:', organizationId);
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
    // Check if email already exists in the system (only if email provided)
    if (email) {
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
        const result = await prisma.$transaction(async (tx) => {
          // Update user details if needed
          await tx.user.update({
            where: { id: existingUser.id },
            data: {
              role,
              isMember,
              isStaff,
            },
          });
          // Create member record
          const member = await tx.member.create({
            data: {
              userId: existingUser.id,
              organizationId,
              role: organizationRole,
            },
            include: {
              user: true,
            },
          });
          // Add to team if teamId provided
          if (teamId) {
            await tx.teamMember.create({
              data: {
                userId: existingUser.id,
                teamId,
              },
            });
          }
          return member;
        });
        if (sendWelcomeEmail) {
          // await sendWelcomeEmail(result.user.email, organizationId);
        }
        revalidatePath('/church/users');
        return {
          success: true,
          data: result,
          message: 'Member added successfully',
        };
      }
    }
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Create new user and member in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user with address
      const user = await tx.user.create({
        data: {
          name: `${firstName} ${lastName}`,
          email: email || undefined,
          emailVerified: false,
          phoneNumber,
          gender,
          isMember,
          isStaff,
          role,
          status: 'ACTIVE',
          createdBy: session.user.id,
          // Create address if provided
          address: address
            ? {
                create: {
                  street: address.street,
                  city: address.city,
                  state: address.state,
                  zipCode: address.zipCode,
                  country: address.country,
                },
              }
            : undefined,
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
          role: organizationRole,
        },
        include: {
          user: {
            include: {
              address: true,
            },
          },
        },
      });
      // Add to team if teamId provided
      if (teamId) {
        await tx.teamMember.create({
          data: {
            userId: user.id,
            teamId,
          },
        });
      }
      return { user, member };
    });
    if (sendWelcomeEmail && email) {
      // await sendWelcomeEmailWithCredentials(email, password, organizationId);
    }
    revalidatePath('/church/users');
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

// export async function adminAddMemberToOrganization(
//   params: AdminAddMemberParams
// ): Promise<AdminServerActionResponse> {
//   try {
//     const session = await getServerSession();
//     if (!session?.user) {
//       return { success: false, error: 'Unauthorized' };
//     }
//     const {
//       organizationId,
//       firstName,
//       lastName,
//       email,
//       phoneNumber,
//       password,
//       gender,
//       role,
//       organizationRole,
//       isMember,
//       isStaff = false,
//       teamId,
//       address,
//       sendWelcomeEmail = false,
//     } = params;
//     // Check if user has permission to add members
//     const hasPermission = await prisma.member.findFirst({
//       where: {
//         organizationId,
//         userId: session.user.id,
//         role: {
//           in: ['OWNER', 'ADMIN'],
//         },
//       },
//     });
//     if (!hasPermission) {
//       return {
//         success: false,
//         error: 'You do not have permission to add members to this organization',
//       };
//     }
//     // Check if email already exists in the system (only if email provided)
//     if (email) {
//       const existingUser = await prisma.user.findUnique({
//         where: { email },
//       });
//       if (existingUser) {
//         // Check if user is already a member of this organization
//         const existingMember = await prisma.member.findFirst({
//           where: {
//             userId: existingUser.id,
//             organizationId,
//           },
//         });
//         if (existingMember) {
//           return {
//             success: false,
//             error: 'This user is already a member of this organization',
//           };
//         }
//         // Add existing user to organization
//         const result = await prisma.$transaction(async (tx) => {
//           // Update user details if needed
//           await tx.user.update({
//             where: { id: existingUser.id },
//             data: {
//               role,
//               isMember,
//               isStaff,
//             },
//           });
//           // Create member record
//           const member = await tx.member.create({
//             data: {
//               userId: existingUser.id,
//               organizationId,
//               role: organizationRole,
//             },
//             include: {
//               user: true,
//             },
//           });
//           // Add to team if teamId provided
//           if (teamId) {
//             await tx.teamMember.create({
//               data: {
//                 userId: existingUser.id,
//                 teamId,
//               },
//             });
//           }
//           return member;
//         });
//         if (sendWelcomeEmail) {
//           // await sendWelcomeEmail(result.user.email, organizationId);
//         }
//         revalidatePath('/church/users');
//         return {
//           success: true,
//           data: result,
//           message: 'Member added successfully',
//         };
//       }
//     }
//     // Hash password
//     const hashedPassword = await bcrypt.hash(password, 10);
//     // Create new user and member in a transaction
//     const result = await prisma.$transaction(async (tx) => {
//       // Create user with address
//       const user = await tx.user.create({
//         data: {
//           name: `${firstName} ${lastName}`,
//           email: email || undefined,
//           emailVerified: false,
//           phoneNumber,
//           gender,
//           isMember,
//           isStaff,
//           role,
//           status: 'ACTIVE',
//           createdBy: session.user.id,
//           // Create address if provided
//           address: address
//             ? {
//                 create: {
//                   street: address.street,
//                   city: address.city,
//                   state: address.state,
//                   zipCode: address.zipCode,
//                   country: address.country,
//                 },
//               }
//             : undefined,
//         },
//       });
//       // Create account with password
//       await tx.account.create({
//         data: {
//           userId: user.id,
//           accountId: user.id,
//           providerId: 'credential',
//           password: hashedPassword,
//         },
//       });
//       // Create member record
//       const member = await tx.member.create({
//         data: {
//           userId: user.id,
//           organizationId,
//           role: organizationRole,
//         },
//         include: {
//           user: {
//             include: {
//               address: true,
//             },
//           },
//         },
//       });
//       // Add to team if teamId provided
//       if (teamId) {
//         await tx.teamMember.create({
//           data: {
//             userId: user.id,
//             teamId,
//           },
//         });
//       }
//       return { user, member };
//     });
//     if (sendWelcomeEmail && email) {
//       // await sendWelcomeEmailWithCredentials(email, password, organizationId);
//     }
//     revalidatePath('/church/users');
//     return {
//       success: true,
//       data: result.member,
//       message: 'Member added successfully',
//     };
//   } catch (error: any) {
//     console.error('Error adding member:', error);
//     return {
//       success: false,
//       error: error.message || 'Failed to add member',
//     };
//   }
// }

// export async function adminAddMemberToOrganization(
//   params: AdminAddMemberParams
// ): Promise<AdminServerActionResponse> {
//   try {
//     const session = await getServerSession();
//     if (!session?.user) {
//       return { success: false, error: 'Unauthorized' };
//     }
//     const {
//       organizationId,
//       firstName,
//       lastName,
//       email,
//       phoneNumber,
//       password,
//       gender,
//       role,
//       organizationRole,
//       isMember,
//       isStaff = false,
//       teamId,
//       address,
//       sendWelcomeEmail = false,
//     } = params;
//     // Check if user has permission to add members
//     const hasPermission = await prisma.member.findFirst({
//       where: {
//         organizationId,
//         userId: session.user.id,
//         role: {
//           in: ['OWNER', 'ADMIN'],
//         },
//       },
//     });
//     if (!hasPermission) {
//       return {
//         success: false,
//         error: 'You do not have permission to add members to this organization',
//       };
//     }
//     // Check if email already exists in the system (only if email provided)
//     if (email) {
//       const existingUser = await prisma.user.findUnique({
//         where: { email },
//       });
//       if (existingUser) {
//         // Check if user is already a member of this organization
//         const existingMember = await prisma.member.findFirst({
//           where: {
//             userId: existingUser.id,
//             organizationId,
//           },
//         });
//         if (existingMember) {
//           return {
//             success: false,
//             error: 'This user is already a member of this organization',
//           };
//         }
//         // Add existing user to organization
//         const result = await prisma.$transaction(async (tx) => {
//           // Update user details if needed
//           await tx.user.update({
//             where: { id: existingUser.id },
//             data: {
//               role,
//               isMember,
//               isStaff,
//             },
//           });
//           // Create member record
//           const member = await tx.member.create({
//             data: {
//               userId: existingUser.id,
//               organizationId,
//               role: organizationRole,
//             },
//             include: {
//               user: true,
//             },
//           });
//           // Add to team if teamId provided
//           if (teamId) {
//             await tx.teamMember.create({
//               data: {
//                 userId: existingUser.id,
//                 teamId,
//               },
//             });
//           }
//           return member;
//         });
//         if (sendWelcomeEmail) {
//           // await sendWelcomeEmail(result.user.email, organizationId);
//         }
//         revalidatePath('/church/users');
//         return {
//           success: true,
//           data: result,
//           message: 'Member added successfully',
//         };
//       }
//     }
//     // Hash password
//     const hashedPassword = await bcrypt.hash(password, 10);
//     // Create new user and member in a transaction
//     const result = await prisma.$transaction(async (tx) => {
//       // Create user with address
//       const user = await tx.user.create({
//         data: {
//           name: `${firstName} ${lastName}`,
//           email: email || undefined,
//           emailVerified: false,
//           phoneNumber,
//           gender,
//           isMember,
//           isStaff,
//           role,
//           status: 'ACTIVE',
//           createdBy: session.user.id,
//           // Create address if provided
//           address: address
//             ? {
//                 create: {
//                   street: address.street,
//                   city: address.city,
//                   state: address.state,
//                   zipCode: address.zipCode,
//                   country: address.country,
//                 },
//               }
//             : undefined,
//         },
//       });
//       // Create account with password
//       await tx.account.create({
//         data: {
//           userId: user.id,
//           accountId: user.id,
//           providerId: 'credential',
//           password: hashedPassword,
//         },
//       });
//       // Create member record
//       const member = await tx.member.create({
//         data: {
//           userId: user.id,
//           organizationId,
//           role: organizationRole,
//         },
//         include: {
//           user: {
//             include: {
//               address: true,
//             },
//           },
//         },
//       });
//       // Add to team if teamId provided
//       if (teamId) {
//         await tx.teamMember.create({
//           data: {
//             userId: user.id,
//             teamId,
//           },
//         });
//       }
//       return { user, member };
//     });
//     // Send welcome email with credentials if email provided
//     if (email) {
//       try {
//         await sendWelcomeEmailWithCredentials({
//           email,
//           password, // Plain text password before hashing
//           name: `${firstName} ${lastName}`,
//           organizationId,
//         });
//       } catch (emailError) {
//         console.error('Failed to send welcome email:', emailError);
//         // Don't fail the entire operation if email fails
//       }
//     }
//     revalidatePath('/church/users');
//     return {
//       success: true,
//       data: result.member,
//       message: 'Member added successfully',
//     };
//   } catch (error: any) {
//     console.error('Error adding member:', error);
//     return {
//       success: false,
//       error: error.message || 'Failed to add member',
//     };
//   }
// }

// ============================================
// 3. ADMIN UPDATE MEMBER
// ============================================

export async function adminUpdateOrganizationMember(
  params: AdminUpdateOrganizationMemberParams
): Promise<AdminServerActionResponse> {
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
      organizationRole,
      status,
      isMember,
      teamId,
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
      include: {
        user: {
          include: {
            teammembers: true,
          },
        },
      },
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
        const currentFirstName = existingMember.user.name.split(' ')[0];
        const currentLastName = existingMember.user.name
          .split(' ')
          .slice(1)
          .join(' ');
        userUpdateData.name =
          `${firstName || currentFirstName} ${lastName || currentLastName}`.trim();
      }
      if (email) userUpdateData.email = email;
      if (phoneNumber !== undefined) userUpdateData.phoneNumber = phoneNumber;
      if (gender) userUpdateData.gender = gender;
      if (status) userUpdateData.status = status;
      if (isMember !== undefined) userUpdateData.isMember = isMember;
      if (role) userUpdateData.role = role;
      // Update user
      const user = await tx.user.update({
        where: { id: existingMember.userId },
        data: userUpdateData,
      });
      // Update organization role if provided
      const memberUpdateData: Prisma.MemberUpdateInput = {};
      if (organizationRole) {
        memberUpdateData.role = organizationRole;
      }
      // Update member
      const member = await tx.member.update({
        where: { id: memberId },
        data: memberUpdateData,
        include: {
          user: {
            include: {
              teammembers: {
                include: {
                  team: true,
                },
              },
            },
          },
        },
      });
      // Handle team assignment
      if (teamId !== undefined) {
        // Remove existing team memberships for this organization's teams
        const organizationTeams = await tx.team.findMany({
          where: { organizationId },
          select: { id: true },
        });
        const organizationTeamIds = organizationTeams.map((t) => t.id);
        await tx.teamMember.deleteMany({
          where: {
            userId: existingMember.userId,
            teamId: { in: organizationTeamIds },
          },
        });
        // Add new team membership if teamId provided
        if (teamId) {
          await tx.teamMember.create({
            data: {
              userId: existingMember.userId,
              teamId,
            },
          });
        }
      }
      return { user, member };
    });
    revalidatePath('/church/users');
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
// 4. ADMIN SUSPEND/ACTIVATE MEMBER
// ============================================

export async function adminToggleMemberStatus(
  memberId: string,
  organizationId: string
): Promise<AdminServerActionResponse> {
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
    revalidatePath('/church/users');
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
// 5. ADMIN DELETE/REMOVE MEMBER
// ============================================

export async function adminRemoveMemberFromOrganization(
  memberId: string,
  organizationId: string,
  deleteUser = false
): Promise<AdminServerActionResponse> {
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
    await prisma.$transaction(async (tx) => {
      // Get organization teams
      const organizationTeams = await tx.team.findMany({
        where: { organizationId },
        select: { id: true },
      });
      const organizationTeamIds = organizationTeams.map((t) => t.id);
      // Remove team memberships for this organization's teams
      await tx.teamMember.deleteMany({
        where: {
          userId: member.userId,
          teamId: { in: organizationTeamIds },
        },
      });
      // Delete member record
      await tx.member.delete({
        where: { id: memberId },
      });
      // If deleteUser flag is set, soft delete the user
      if (deleteUser) {
        await tx.user.update({
          where: { id: member.userId },
          data: {
            isDeleted: true,
            updatedBy: session.user.id,
          },
        });
      }
    });
    revalidatePath('/church/users');
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
// 6. ADMIN UPDATE MEMBER ROLE (Organization Role)
// ============================================

export async function adminUpdateMemberRole(
  memberId: string,
  organizationId: string,
  newRole: ORGANIZATIONUserRole
): Promise<AdminServerActionResponse> {
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
        user: {
          include: {
            teammembers: {
              include: {
                team: true,
              },
            },
          },
        },
      },
    });
    revalidatePath(`/church/users/${memberId}`);
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
// 7. ADMIN BULK ACTIONS
// ============================================

export async function adminBulkUpdateMemberStatus(
  memberIds: string[],
  organizationId: string,
  status: string
): Promise<AdminServerActionResponse> {
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
    revalidatePath('/church/users');
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

export async function adminBulkRemoveMembers(
  memberIds: string[],
  organizationId: string
): Promise<AdminServerActionResponse> {
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
    await prisma.$transaction(async (tx) => {
      // Get members to remove
      const membersToRemove = await tx.member.findMany({
        where: {
          id: { in: memberIds },
          organizationId,
          role: { not: 'OWNER' },
          userId: { not: session.user.id },
        },
        select: { userId: true },
      });
      const userIds = membersToRemove.map((m) => m.userId);
      // Get organization teams
      const organizationTeams = await tx.team.findMany({
        where: { organizationId },
        select: { id: true },
      });
      const organizationTeamIds = organizationTeams.map((t) => t.id);
      // Remove team memberships
      await tx.teamMember.deleteMany({
        where: {
          userId: { in: userIds },
          teamId: { in: organizationTeamIds },
        },
      });
      // Delete members
      await tx.member.deleteMany({
        where: {
          id: { in: memberIds },
          organizationId,
          role: { not: 'OWNER' },
          userId: { not: session.user.id },
        },
      });
    });
    revalidatePath('/church/users');
    return {
      success: true,
      message: 'Members removed successfully',
    };
  } catch (error: any) {
    console.error('Error bulk removing members:', error);
    return {
      success: false,
      error: error.message || 'Failed to remove members',
    };
  }
}

// ============================================
// 8. ADMIN TEAM MANAGEMENT HELPERS
// ============================================

export async function adminAddMemberToTeam(
  userId: string,
  teamId: string,
  organizationId: string
): Promise<AdminServerActionResponse> {
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
        role: { in: ['OWNER', 'ADMIN'] },
      },
    });
    if (!hasPermission) {
      return { success: false, error: 'Unauthorized' };
    }
    // Verify team belongs to organization
    const team = await prisma.team.findFirst({
      where: {
        id: teamId,
        organizationId,
      },
    });
    if (!team) {
      return { success: false, error: 'Team not found' };
    }
    // Check if already a team member
    const existing = await prisma.teamMember.findFirst({
      where: {
        userId,
        teamId,
      },
    });
    if (existing) {
      return { success: false, error: 'User is already a member of this team' };
    }
    const teamMember = await prisma.teamMember.create({
      data: {
        userId,
        teamId,
      },
      include: {
        user: true,
        team: true,
      },
    });
    revalidatePath(`/church/users/${organizationId}/teams/${teamId}`);
    return {
      success: true,
      data: teamMember,
      message: 'Member added to team successfully',
    };
  } catch (error: any) {
    console.error('Error adding member to team:', error);
    return {
      success: false,
      error: error.message || 'Failed to add member to team',
    };
  }
}

export async function adminRemoveMemberFromTeam(
  userId: string,
  teamId: string,
  organizationId: string
): Promise<AdminServerActionResponse> {
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
        role: { in: ['OWNER', 'ADMIN'] },
      },
    });
    if (!hasPermission) {
      return { success: false, error: 'Unauthorized' };
    }
    await prisma.teamMember.deleteMany({
      where: {
        userId,
        teamId,
      },
    });
    revalidatePath(`/church/users/${organizationId}/teams/${teamId}`);
    return {
      success: true,
      message: 'Member removed from team successfully',
    };
  } catch (error: any) {
    console.error('Error removing member from team:', error);
    return {
      success: false,
      error: error.message || 'Failed to remove member from team',
    };
  }
}

// Add these functions to your lib/actions/member.ts file

// ============================================
// 9. ADMIN GET ORGANIZATION MEMBER BY ID
// ============================================

export async function adminGetOrganizationMemberById(
  memberId: string,
  organizationId: string
): Promise<AdminServerActionResponse> {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return { success: false, error: 'Unauthorized' };
    }

    // Check if user has access to this organization
    const hasAccess = await prisma.member.findFirst({
      where: {
        organizationId,
        userId: session.user.id,
      },
    });

    if (!hasAccess) {
      return {
        success: false,
        error: 'You do not have access to this organization',
      };
    }

    // Get member with full details
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
            teammembers: {
              include: {
                team: true,
              },
            },
          },
        },
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!member) {
      return { success: false, error: 'Member not found' };
    }

    // Verify member belongs to the specified organization
    if (member.organizationId !== organizationId) {
      return {
        success: false,
        error: 'Member does not belong to this organization',
      };
    }

    return {
      success: true,
      data: member,
    };
  } catch (error: any) {
    console.error('Error fetching member:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch member',
    };
  }
}

// ============================================
// 10. ADMIN GET ORGANIZATION MEMBER BY USER ID
// ============================================

export async function adminGetOrganizationMemberByUserId(
  userId: string,
  organizationId: string
): Promise<AdminServerActionResponse> {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return { success: false, error: 'Unauthorized' };
    }
    // Check if user has access to this organization
    const hasAccess = await prisma.member.findFirst({
      where: {
        organizationId,
        userId: session.user.id,
      },
    });
    if (!hasAccess) {
      return {
        success: false,
        error: 'You do not have access to this organization',
      };
    }
    // Get member by userId
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
            teammembers: {
              include: {
                team: true,
              },
            },
          },
        },
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });
    if (!member) {
      return {
        success: false,
        error: 'Member not found in this organization',
      };
    }
    return {
      success: true,
      data: member,
    };
  } catch (error: any) {
    console.error('Error fetching member by user ID:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch member',
    };
  }
}
