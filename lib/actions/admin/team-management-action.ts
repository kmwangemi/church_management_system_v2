// ============================================
// SERVER ACTIONS - lib/actions/team.ts
// ============================================
'use server';

import type { Prisma } from '@/generated/prisma';
import { getServerSession } from '@/lib/get-session';
import { logger } from '@/lib/logger';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// ============================================
// TYPES & INTERFACES
// ============================================

export interface AdminGetTeamsParams {
  organizationId: string;
  page?: number;
  pageSize?: number;
  search?: string;
  isActive?: boolean;
  sortBy?: 'name' | 'createdAt' | 'memberCount' | 'establishedDate';
  sortOrder?: 'asc' | 'desc';
}

export interface AdminGetTeamsResponse {
  teams: any[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export interface AdminCreateTeamParams {
  organizationId: string;
  name: string;
  email?: string;
  phoneNumber?: string;
  description?: string;
  capacity?: number;
  establishedDate?: Date | string;
  // Address fields
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

export interface AdminUpdateTeamParams {
  teamId: string;
  organizationId: string;
  name?: string;
  email?: string;
  phoneNumber?: string;
  description?: string;
  capacity?: number;
  establishedDate?: Date | string;
  isActive?: boolean;
  // Address fields
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

export interface AdminServerActionResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ============================================
// 1. ADMIN GET ALL TEAMS (WITH PAGINATION & FILTERS)
// ============================================

export async function adminGetOrganizationTeams(
  params: AdminGetTeamsParams
): Promise<AdminGetTeamsResponse> {
  const session = await getServerSession();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }
  const {
    organizationId,
    page = 1,
    pageSize = 10,
    search = '',
    isActive,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = params;
  // Check if user has access to this organization
  const hasAccess = await prisma.member.findFirst({
    where: {
      organizationId,
      userId: session.user.id,
    },
  });
  if (!hasAccess) {
    throw new Error('You do not have access to this organization');
  }
  const where: Prisma.TeamWhereInput = {
    organizationId,
    isDeleted: false,
  };
  // Filter by active status
  if (isActive !== undefined) {
    where.isActive = isActive;
  }
  // Search by name, email, or phone
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { phoneNumber: { contains: search, mode: 'insensitive' } },
    ];
  }
  // Sorting
  let orderBy: Prisma.TeamOrderByWithRelationInput = {};
  switch (sortBy) {
    case 'name':
      orderBy = { name: sortOrder };
      break;
    case 'memberCount':
      orderBy = { memberCount: sortOrder };
      break;
    case 'establishedDate':
      orderBy = { establishedDate: sortOrder };
      break;
    default:
      orderBy = { createdAt: sortOrder };
      break;
  }
  const skip = (page - 1) * pageSize;
  const [teams, total] = await Promise.all([
    prisma.team.findMany({
      where,
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        address: true,
        teammembers: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
                phoneNumber: true,
              },
            },
          },
          take: 5, // Limit team members in list view
        },
        _count: {
          select: {
            teammembers: true,
          },
        },
      },
      orderBy,
      skip,
      take: pageSize,
    }),
    prisma.team.count({ where }),
  ]);
  const totalPages = Math.ceil(total / pageSize);
  return {
    teams,
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
// 2. ADMIN GET TEAM BY ID
// ============================================

export async function adminGetTeamById(
  teamId: string,
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
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
          },
        },
        address: true,
        teammembers: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
                phoneNumber: true,
                gender: true,
                role: true,
                status: true,
              },
            },
          },
        },
        _count: {
          select: {
            teammembers: true,
          },
        },
      },
    });
    if (!team) {
      return { success: false, error: 'Team not found' };
    }
    // Verify team belongs to the specified organization
    if (team.organizationId !== organizationId) {
      return {
        success: false,
        error: 'Team does not belong to this organization',
      };
    }
    return {
      success: true,
      data: team,
    };
  } catch (error: any) {
    console.error('Error fetching team:', error);
    await logger.error(
      'Error fetching team',
      error,
      { teamId, organizationId },
      'SERVER',
      session?.user?.id,
      organizationId
    );
    return {
      success: false,
      error: error.message || 'Failed to fetch team',
    };
  }
}

// ============================================
// 3. ADMIN CREATE TEAM
// ============================================

export async function adminCreateTeam(
  params: AdminCreateTeamParams
): Promise<AdminServerActionResponse> {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return { success: false, error: 'Unauthorized' };
    }
    const {
      organizationId,
      name,
      email,
      phoneNumber,
      description,
      capacity,
      establishedDate,
      street,
      city,
      state,
      zipCode,
      country,
    } = params;
    // Check if user has permission to create teams (must be owner or admin)
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
        error: 'You do not have permission to create teams',
      };
    }
    // Check subscription limits
    const subscription = await prisma.organizationSubscription.findUnique({
      where: { organizationId },
    });
    if (
      subscription?.maxTeams &&
      subscription.currentTeams >= subscription.maxTeams
    ) {
      return {
        success: false,
        error: 'Team limit reached for your subscription plan',
      };
    }
    // Check if team name already exists in this organization
    const existingTeam = await prisma.team.findFirst({
      where: {
        organizationId,
        name: {
          equals: name,
          mode: 'insensitive',
        },
        isDeleted: false,
      },
    });
    if (existingTeam) {
      return {
        success: false,
        error: 'A team with this name already exists in your organization',
      };
    }
    // Create team with address in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const team = await tx.team.create({
        data: {
          name,
          organizationId,
          email,
          phoneNumber,
          description,
          capacity,
          establishedDate: establishedDate
            ? new Date(establishedDate)
            : undefined,
          isActive: true,
          memberCount: 0,
        },
        include: {
          organization: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
      // Create address if any address fields are provided
      if (street || city || state || zipCode || country) {
        await tx.address.create({
          data: {
            teamId: team.id,
            street,
            city,
            state,
            zipCode,
            country: country || 'Kenya',
          },
        });
      }
      // Update subscription team count
      if (subscription) {
        await tx.organizationSubscription.update({
          where: { organizationId },
          data: {
            currentTeams: { increment: 1 },
          },
        });
      }
      return team;
    });
    // Log the creation
    await logger.info(
      'Team created successfully',
      {
        teamId: result.id,
        teamName: result.name,
        organizationId,
      },
      'SERVER',
      session.user.id,
      organizationId
    );
    revalidatePath(`/church/${organizationId}/teams`);
    return {
      success: true,
      data: result,
      message: 'Team created successfully',
    };
  } catch (error: any) {
    console.error('Error creating team:', error);
    await logger.error(
      'Error creating team',
      error,
      params,
      'SERVER',
      session?.user?.id,
      params.organizationId
    );
    return {
      success: false,
      error: error.message || 'Failed to create team',
    };
  }
}

// ============================================
// 4. ADMIN UPDATE TEAM
// ============================================

export async function adminUpdateTeam(
  params: AdminUpdateTeamParams
): Promise<AdminServerActionResponse> {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return { success: false, error: 'Unauthorized' };
    }
    const {
      teamId,
      organizationId,
      name,
      email,
      phoneNumber,
      description,
      capacity,
      establishedDate,
      isActive,
      street,
      city,
      state,
      zipCode,
      country,
    } = params;
    // Check if user has permission to update teams
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
        error: 'You do not have permission to update teams',
      };
    }
    // Get existing team
    const existingTeam = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        address: true,
      },
    });
    if (!existingTeam) {
      return { success: false, error: 'Team not found' };
    }
    // Verify team belongs to the specified organization
    if (existingTeam.organizationId !== organizationId) {
      return {
        success: false,
        error: 'Team does not belong to this organization',
      };
    }
    // If changing name, check if new name already exists
    if (name && name !== existingTeam.name) {
      const duplicateTeam = await prisma.team.findFirst({
        where: {
          organizationId,
          name: {
            equals: name,
            mode: 'insensitive',
          },
          isDeleted: false,
          id: { not: teamId },
        },
      });
      if (duplicateTeam) {
        return {
          success: false,
          error: 'A team with this name already exists',
        };
      }
    }
    // Update team and address in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Prepare team update data
      const teamUpdateData: Prisma.TeamUpdateInput = {};
      if (name !== undefined) teamUpdateData.name = name;
      if (email !== undefined) teamUpdateData.email = email;
      if (phoneNumber !== undefined) teamUpdateData.phoneNumber = phoneNumber;
      if (description !== undefined) teamUpdateData.description = description;
      if (capacity !== undefined) teamUpdateData.capacity = capacity;
      if (establishedDate !== undefined)
        teamUpdateData.establishedDate = new Date(establishedDate);
      if (isActive !== undefined) teamUpdateData.isActive = isActive;
      // Update team
      const team = await tx.team.update({
        where: { id: teamId },
        data: teamUpdateData,
        include: {
          organization: {
            select: {
              id: true,
              name: true,
            },
          },
          address: true,
        },
      });
      // Update or create address if any address fields are provided
      if (street || city || state || zipCode || country) {
        const addressData = {
          street,
          city,
          state,
          zipCode,
          country: country || existingTeam.address?.[0]?.country || 'Kenya',
        };
        if (existingTeam.address && existingTeam.address.length > 0) {
          // Update existing address
          await tx.address.update({
            where: { id: existingTeam.address[0].id },
            data: addressData,
          });
        } else {
          // Create new address
          await tx.address.create({
            data: {
              ...addressData,
              teamId: team.id,
            },
          });
        }
      }
      return team;
    });
    // Log the update
    await logger.info(
      'Team updated successfully',
      {
        teamId,
        teamName: result.name,
        organizationId,
      },
      'SERVER',
      session.user.id,
      organizationId
    );
    revalidatePath(`/church/${organizationId}/teams`);
    revalidatePath(`/church/${organizationId}/teams/${teamId}`);

    return {
      success: true,
      data: result,
      message: 'Team updated successfully',
    };
  } catch (error: any) {
    console.error('Error updating team:', error);
    await logger.error(
      'Error updating team',
      error,
      params,
      'SERVER',
      session?.user?.id,
      params.organizationId
    );
    return {
      success: false,
      error: error.message || 'Failed to update team',
    };
  }
}

// ============================================
// 5. ADMIN SOFT DELETE TEAM
// ============================================

export async function adminDeleteTeam(
  teamId: string,
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
        error: 'You do not have permission to delete teams',
      };
    }
    // Get team with member count
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        _count: {
          select: {
            teammembers: true,
          },
        },
      },
    });
    if (!team) {
      return { success: false, error: 'Team not found' };
    }
    // Verify team belongs to organization
    if (team.organizationId !== organizationId) {
      return {
        success: false,
        error: 'Team does not belong to this organization',
      };
    }
    // Prevent deletion if team has members
    if (team._count.teammembers > 0) {
      return {
        success: false,
        error:
          'Cannot delete team with active members. Please remove all members first.',
      };
    }
    // Soft delete the team
    await prisma.$transaction(async (tx) => {
      await tx.team.update({
        where: { id: teamId },
        data: {
          isDeleted: true,
          isActive: false,
        },
      });
      // Update subscription team count
      const subscription = await tx.organizationSubscription.findUnique({
        where: { organizationId },
      });
      if (subscription && subscription.currentTeams > 0) {
        await tx.organizationSubscription.update({
          where: { organizationId },
          data: {
            currentTeams: { decrement: 1 },
          },
        });
      }
    });
    // Log the deletion
    await logger.info(
      'Team deleted successfully',
      {
        teamId,
        teamName: team.name,
        organizationId,
      },
      'SERVER',
      session.user.id,
      organizationId
    );
    revalidatePath(`/church/${organizationId}/teams`);
    return {
      success: true,
      message: 'Team deleted successfully',
    };
  } catch (error: any) {
    console.error('Error deleting team:', error);
    await logger.error(
      'Error deleting team',
      error,
      { teamId, organizationId },
      'SERVER',
      session?.user?.id,
      organizationId
    );
    return {
      success: false,
      error: error.message || 'Failed to delete team',
    };
  }
}

// ============================================
// 6. ADMIN TOGGLE TEAM ACTIVE STATUS
// ============================================

export async function adminToggleTeamStatus(
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
        role: {
          in: ['OWNER', 'ADMIN'],
        },
      },
    });
    if (!hasPermission) {
      return {
        success: false,
        error: 'You do not have permission to manage teams',
      };
    }
    // Get team
    const team = await prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      return { success: false, error: 'Team not found' };
    }
    if (team.organizationId !== organizationId) {
      return {
        success: false,
        error: 'Team does not belong to this organization',
      };
    }
    // Toggle status
    const newStatus = !team.isActive;
    const updatedTeam = await prisma.team.update({
      where: { id: teamId },
      data: { isActive: newStatus },
    });
    // Log the status change
    await logger.info(
      `Team ${newStatus ? 'activated' : 'deactivated'}`,
      {
        teamId,
        teamName: team.name,
        newStatus,
        organizationId,
      },
      'SERVER',
      session.user.id,
      organizationId
    );
    revalidatePath(`/church/${organizationId}/teams`);
    revalidatePath(`/church/${organizationId}/teams/${teamId}`);
    return {
      success: true,
      data: { isActive: newStatus },
      message: `Team ${newStatus ? 'activated' : 'deactivated'} successfully`,
    };
  } catch (error: any) {
    console.error('Error toggling team status:', error);
    await logger.error(
      'Error toggling team status',
      error,
      { teamId, organizationId },
      'SERVER',
      session?.user?.id,
      organizationId
    );
    return {
      success: false,
      error: error.message || 'Failed to update team status',
    };
  }
}

// ============================================
// 7. GET TEAM STATISTICS
// ============================================

export async function adminGetTeamStatistics(
  organizationId: string
): Promise<AdminServerActionResponse> {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return { success: false, error: 'Unauthorized' };
    }
    // Check access
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
    const [totalTeams, activeTeams, totalMembers, subscription] =
      await Promise.all([
        prisma.team.count({
          where: {
            organizationId,
            isDeleted: false,
          },
        }),
        prisma.team.count({
          where: {
            organizationId,
            isDeleted: false,
            isActive: true,
          },
        }),
        prisma.teamMember.count({
          where: {
            team: {
              organizationId,
              isDeleted: false,
            },
          },
        }),
        prisma.organizationSubscription.findUnique({
          where: { organizationId },
          select: {
            maxTeams: true,
            currentTeams: true,
          },
        }),
      ]);
    const statistics = {
      totalTeams,
      activeTeams,
      inactiveTeams: totalTeams - activeTeams,
      totalMembers,
      averageMembersPerTeam:
        activeTeams > 0 ? Math.round(totalMembers / activeTeams) : 0,
      subscription: {
        maxTeams: subscription?.maxTeams || null,
        currentTeams: subscription?.currentTeams || 0,
        remainingSlots: subscription?.maxTeams
          ? subscription.maxTeams - (subscription.currentTeams || 0)
          : null,
      },
    };
    return {
      success: true,
      data: statistics,
    };
  } catch (error: any) {
    console.error('Error fetching team statistics:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch team statistics',
    };
  }
}
