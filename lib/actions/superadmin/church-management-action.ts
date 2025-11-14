/** biome-ignore-all lint/suspicious/noConsole: ignore console.log */
'use server';

import type { OrganizationPlan } from '@/generated/prisma';
import { auth } from '@/lib/auth';
import { getServerSession } from '@/lib/get-session';
import prisma from '@/lib/prisma';
import type { CreateChurchPayload } from '@/lib/validations/church';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';

// ============================================
// TYPES
// ============================================

interface UpdateChurchPayload {
  organizationId: string;
  name?: string;
  slug?: string;
  logo?: string;
  denomination?: string;
  description?: string;
  establishedDate?: string;
  email?: string;
  phoneNumber?: string;
  website?: string;
  churchSize?: string;
  numberOfBranches?: number;
  status?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
}

interface ActionResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// ============================================
// CREATE CHURCH ORGANIZATION
// ============================================

export async function createChurchOrganization(
  payload: CreateChurchPayload
): Promise<ActionResult<{ organizationId: string }>> {
  let organizationId: string | null = null;
  try {
    // Step 1: Verify user session and permissions
    const session = await getServerSession();
    if (!session?.user) {
      return {
        success: false,
        error: 'Unauthorized: Please sign in to create an organization',
      };
    }
    // Check if user is super admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { globalRole: true },
    });
    if (user?.globalRole !== 'SUPER_ADMIN') {
      return {
        success: false,
        error: 'Only super admins can create organizations',
      };
    }
    // Step 2: Generate slug from church name
    const slug = generateSlug(payload.churchName);
    // Step 3: Check if slug already exists
    const existingOrg = await prisma.organization.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (existingOrg) {
      return {
        success: false,
        error: 'This church name is already taken. Please choose another name.',
      };
    }
    // Step 4: Create organization using Better Auth
    const data = await auth.api.createOrganization({
      body: {
        name: payload.churchName,
        slug,
        userId: session.user.id,
        logo: payload.churchLogoUrl,
        denomination: payload.denomination,
        description: payload.description,
        establishedDate: new Date(payload.establishedDate),
        email: payload.email,
        phoneNumber: payload.phoneNumber,
        website: payload.website,
        churchSize: payload.churchSize,
        numberOfBranches: Number(payload.numberOfBranches) || 0,
      },
      // This endpoint requires session cookies.
      headers: await headers(),
    });
    if (!data) {
      throw new Error('Failed to create organization');
    }
    organizationId = data.id;
    // Step 5: Create additional resources in a transaction
    // If this fails, we need to rollback the organization
    try {
      await prisma.$transaction(async (tx) => {
        // Check and create Address if missing
        const existingAddress = await tx.address.findUnique({
          where: { organizationId: organizationId! },
        });
        if (!existingAddress) {
          await tx.address.create({
            data: {
              organizationId,
              street: payload.address.street || '',
              city: payload.address.city || '',
              state: payload.address.state || '',
              zipCode: payload.address.zipCode || '',
              country: payload.address.country || 'Kenya',
            },
          });
        }
        // Check and create Subscription if missing
        const existingSubscription =
          await tx.organizationSubscription.findUnique({
            where: { organizationId: organizationId! },
          });
        if (!existingSubscription) {
          const trialEnd = new Date();
          trialEnd.setDate(trialEnd.getDate() + 30);
          await tx.organizationSubscription.create({
            data: {
              organizationId: organizationId!,
              plan: (payload.subscriptionPlan?.toUpperCase() ||
                'BASIC') as OrganizationPlan,
              status: 'TRIAL',
              startDate: new Date(),
              endDate: trialEnd,
              isActive: true,
              isPaid: false,
              invoiceAmount: 0,
              paidAmount: 0,
              balAmount: 0,
              maxTeams: 1,
              currentTeams: 0,
              currentUsers: 1,
              features: [],
              nextBillingDate: trialEnd,
              isAutoRenew: true,
            },
          });
        }
      });
    } catch (resourceError) {
      console.error('Failed to create organization resources:', resourceError);
      // Rollback: Delete the organization
      try {
        await prisma.organization.delete({
          where: { id: organizationId },
        });
        console.log('Successfully rolled back organization creation');
      } catch (rollbackError) {
        console.error('Failed to rollback organization:', rollbackError);
        throw new Error(
          `Organization created but resources failed. Please contact support with ID: ${organizationId}`
        );
      }
      throw resourceError;
    }
    // Step 6: Set as active organization
    // try {
    //   await auth.api.setActiveOrganization({
    //     body: {
    //       organizationId: organization.id,
    //     },
    //     headers: await headers(),
    //   });
    // } catch (setActiveError) {
    //   console.error('Failed to set active organization:', setActiveError);
    // }
    revalidatePath('/superadmin/churches');
    return {
      success: true,
      data: { organizationId },
    };
  } catch (err) {
    console.error('Error creating church organization:', err);
    return {
      success: false,
      error:
        err instanceof Error
          ? err.message
          : 'Failed to create church organization. Please try again.',
    };
  }
}

// ============================================
// UPDATE CHURCH ORGANIZATION
// ============================================

export async function updateChurchOrganization(
  payload: UpdateChurchPayload
): Promise<ActionResult<{ organizationId: string }>> {
  try {
    // Step 1: Verify user session
    const session = await getServerSession();
    if (!session?.user) {
      return {
        success: false,
        error: 'Unauthorized: Please sign in to update organization',
      };
    }
    // Check if user has permission to update this organization
    const hasPermission = await prisma.member.findFirst({
      where: {
        organizationId: payload.organizationId,
        userId: session.user.id,
        role: {
          hasSome: ['OWNER', 'ADMIN'],
        },
      },
    });
    if (!hasPermission) {
      return {
        success: false,
        error: 'You do not have permission to update this organization',
      };
    }
    // Step 3: Update organization using Better Auth
    const data = await auth.api.updateOrganization({
      body: {
        data: {
          name: payload.name,
          slug: payload.slug,
          logo: payload.logo,
          denomination: payload.denomination,
          description: payload.description,
          establishedDate: payload.establishedDate
            ? new Date(payload.establishedDate)
            : undefined,
          email: payload.email,
          phoneNumber: payload.phoneNumber,
          website: payload.website,
          churchSize: payload.churchSize,
          numberOfBranches: payload.numberOfBranches,
          // status: payload.status,
        },
        organizationId: payload.organizationId,
      },
      // This endpoint requires session cookies.
      headers: await headers(),
    });
    if (!data) {
      throw new Error('Failed to update organization');
    }
    // Step 4: Update address if provided
    if (payload.address) {
      await prisma.address.upsert({
        where: { organizationId: payload.organizationId },
        update: {
          street: payload.address.street || '',
          city: payload.address.city || '',
          state: payload.address.state || '',
          zipCode: payload.address.zipCode || '',
          country: payload.address.country || 'Kenya',
        },
        create: {
          organizationId: payload.organizationId,
          street: payload.address.street || '',
          city: payload.address.city || '',
          state: payload.address.state || '',
          zipCode: payload.address.zipCode || '',
          country: payload.address.country || 'Kenya',
        },
      });
    }
    revalidatePath('/dashboard/churches');
    return {
      success: true,
      data: { organizationId: payload.organizationId },
    };
  } catch (err) {
    console.error('Error updating church organization:', err);
    return {
      success: false,
      error:
        err instanceof Error
          ? err.message
          : 'Failed to update church organization. Please try again.',
    };
  }
}

// ============================================
// SUSPEND CHURCH ORGANIZATION
// ============================================

export async function suspendChurchOrganization(
  organizationId: string
): Promise<ActionResult> {
  try {
    // Step 1: Verify user session and permissions
    const session = await getServerSession();
    if (!session?.user) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }
    // Check if user is super admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { globalRole: true },
    });
    if (user?.globalRole !== 'SUPER_ADMIN') {
      return {
        success: false,
        error: 'Only super admins can suspend organizations',
      };
    }
    // Step 2: Update organization status
    await prisma.organization.update({
      where: { id: organizationId },
      data: {
        status: 'SUSPENDED',
        isActive: false,
        isSuspended: true,
      },
    });
    // Step 3: Deactivate subscription
    await prisma.organizationSubscription.updateMany({
      where: { organizationId },
      data: {
        status: 'CANCELED',
        isActive: false,
        canceledAt: new Date(),
        cancelReason: 'Organization suspended by admin',
      },
    });
    revalidatePath('/superadmin/churches');
    return {
      success: true,
    };
  } catch (err) {
    console.error('Error suspending church organization:', err);
    return {
      success: false,
      error:
        err instanceof Error
          ? err.message
          : 'Failed to suspend organization. Please try again.',
    };
  }
}

// ============================================
// ACTIVATE CHURCH ORGANIZATION
// ============================================

export async function activateChurchOrganization(
  organizationId: string
): Promise<ActionResult> {
  try {
    // Step 1: Verify user session and permissions
    const session = await getServerSession();
    if (!session?.user) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }
    // Check if user is super admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { globalRole: true },
    });
    if (user?.globalRole !== 'SUPER_ADMIN') {
      return {
        success: false,
        error: 'Only super admins can activate organizations',
      };
    }
    // Step 2: Update organization status
    await prisma.organization.update({
      where: { id: organizationId },
      data: {
        status: 'ACTIVE',
        isActive: true,
      },
    });
    // Step 3: Reactivate subscription if it exists
    const subscription = await prisma.organizationSubscription.findUnique({
      where: { organizationId },
    });
    if (subscription) {
      const now = new Date();
      const endDate = new Date(subscription.endDate);
      // If subscription was expired, extend it by 30 days
      if (endDate < now) {
        const newEndDate = new Date();
        newEndDate.setDate(newEndDate.getDate() + 30);
        await prisma.organizationSubscription.update({
          where: { organizationId },
          data: {
            status: 'TRIAL',
            isActive: true,
            endDate: newEndDate,
            nextBillingDate: newEndDate,
            canceledAt: null,
            cancelReason: null,
          },
        });
      } else {
        await prisma.organizationSubscription.update({
          where: { organizationId },
          data: {
            status: 'ACTIVE',
            isActive: true,
            canceledAt: null,
            cancelReason: null,
          },
        });
      }
    }
    revalidatePath('/superadmin/churches');
    return {
      success: true,
    };
  } catch (err) {
    console.error('Error activating church organization:', err);
    return {
      success: false,
      error:
        err instanceof Error
          ? err.message
          : 'Failed to activate organization. Please try again.',
    };
  }
}

// ============================================
// DELETE CHURCH ORGANIZATION
// ============================================

export async function deleteChurchOrganization(
  organizationId: string
): Promise<ActionResult> {
  try {
    // Step 1: Verify user session and permissions
    const session = await getServerSession();
    if (!session?.user) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }
    // Check if user is super admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { globalRole: true },
    });
    if (user?.globalRole !== 'SUPER_ADMIN') {
      return {
        success: false,
        error: 'Only super admins can delete organizations',
      };
    }
    // Step 2: Soft delete (mark as deleted)
    await prisma.organization.update({
      where: { id: organizationId },
      data: {
        isDeleted: true,
        isActive: false,
        status: 'INACTIVE',
      },
    });
    revalidatePath('/superadmin/churches');
    return {
      success: true,
    };
  } catch (err) {
    console.error('Error deleting church organization:', err);
    return {
      success: false,
      error:
        err instanceof Error
          ? err.message
          : 'Failed to delete organization. Please try again.',
    };
  }
}

// ============================================
// GET CHURCH STATISTICS
// ============================================

export async function getChurchStatistics(): Promise<
  ActionResult<{
    totalChurches: number;
    totalMembers: number;
    totalBranches: number;
    totalRevenue: number;
  }>
> {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }
    const [organizations, members, subscriptions] = await Promise.all([
      prisma.organization.count({
        where: { isDeleted: false },
      }),
      prisma.member.count({
        where: {
          NOT: {
            role: {
              has: 'OWNER',
            },
          },
        },
      }),
      prisma.organizationSubscription.findMany({
        where: {
          isActive: true,
        },
        select: {
          paidAmount: true,
        },
      }),
    ]);
    const totalBranches = await prisma.organization.aggregate({
      where: { isDeleted: false },
      _sum: {
        numberOfBranches: true,
      },
    });
    const totalRevenue = subscriptions.reduce(
      (sum, sub) => sum + (sub.paidAmount || 0),
      0
    );
    return {
      success: true,
      data: {
        totalChurches: organizations,
        totalMembers: members,
        totalBranches: totalBranches._sum.numberOfBranches || 0,
        totalRevenue,
      },
    };
  } catch (err) {
    console.error('Error getting church statistics:', err);
    return {
      success: false,
      error: 'Failed to get statistics',
    };
  }
}

// ============================================
// GET CHURCH DETAILS WITH RELATIONS
// ============================================

export async function getChurchDetails(organizationId: string): Promise<
  ActionResult<{
    organization: any;
    address: any;
    subscription: any;
    members: any[];
    teams: any[];
    stats: {
      totalMembers: number;
      totalTeams: number;
      activeMembersCount: number;
      subscriptionDaysLeft: number;
    };
  }>
> {
  try {
    // Step 1: Verify user session
    const session = await getServerSession();
    if (!session?.user) {
      return {
        success: false,
        error: 'Unauthorized: Please sign in',
      };
    }
    // Step 2: Check if user has access to this organization
    const member = await prisma.member.findUnique({
      where: {
        organizationId_userId: {
          organizationId,
          userId: session.user.id,
        },
      },
    });
    // Allow super admins to view any organization
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { globalRole: true },
    });
    if (!member && user?.globalRole !== 'SUPER_ADMIN') {
      return {
        success: false,
        error: 'You do not have access to this organization',
      };
    }
    // Step 3: Fetch organization with all related data
    const [organization, address, subscription, members, teams] =
      await Promise.all([
        // Organization details
        prisma.organization.findUnique({
          where: { id: organizationId },
        }),
        // Address
        prisma.address.findUnique({
          where: { organizationId },
        }),
        // Subscription
        prisma.organizationSubscription.findUnique({
          where: { organizationId },
        }),
        // Members with user details
        prisma.member.findMany({
          where: {
            organizationId,
            NOT: {
              role: {
                has: 'OWNER',
              },
            },
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
                phoneNumber: true,
                status: true,
                globalRole: true,
                createdAt: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        }),
        // Teams/Branches
        prisma.team.findMany({
          where: { organizationId },
          include: {
            address: true,
            _count: {
              select: {
                teammembers: true,
              },
            },
          },
        }),
      ]);
    if (!organization) {
      return {
        success: false,
        error: 'Organization not found',
      };
    }
    // Step 4: Calculate statistics
    const activeMembersCount = members.filter(
      (m) => m.user.status === 'ACTIVE'
    ).length;
    let subscriptionDaysLeft = 0;
    if (subscription?.endDate) {
      const now = new Date();
      const endDate = new Date(subscription.endDate);
      const diffTime = endDate.getTime() - now.getTime();
      subscriptionDaysLeft = Math.max(
        0,
        Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      );
    }
    const stats = {
      totalMembers: members.length,
      totalTeams: teams.length,
      activeMembersCount,
      subscriptionDaysLeft,
    };
    return {
      success: true,
      data: {
        organization,
        address,
        subscription,
        members,
        teams,
        stats,
      },
    };
  } catch (err) {
    console.error('Error fetching church details:', err);
    return {
      success: false,
      error:
        err instanceof Error
          ? err.message
          : 'Failed to fetch church details. Please try again.',
    };
  }
}

// ============================================
// GET ALL CHURCHES WITH SUMMARY DATA
// ============================================

export async function getAllChurchesSummary(): Promise<
  ActionResult<{
    churches: any[];
    stats: {
      totalChurches: number;
      totalMembers: number;
      totalBranches: number;
      activeSubscriptions: number;
    };
  }>
> {
  try {
    // Step 1: Verify user session
    const session = await getServerSession();
    if (!session?.user) {
      return {
        success: false,
        error: 'Unauthorized: Please sign in',
      };
    }
    // Step 2: Check if user is super admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { globalRole: true },
    });
    if (user?.globalRole !== 'SUPER_ADMIN') {
      return {
        success: false,
        error: 'Only super admins can view all churches',
      };
    }
    // Step 3: Fetch all organizations with related data
    const organizations = await prisma.organization.findMany({
      where: { isDeleted: false },
      include: {
        address: true,
        subscription: true,
        _count: {
          select: {
            members: true,
            teams: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    // Step 4: Calculate global statistics
    const totalMembers = await prisma.member.count({
      where: {
        NOT: {
          role: {
            has: 'OWNER',
          },
        },
      },
    });
    const activeSubscriptions = await prisma.organizationSubscription.count({
      where: { isActive: true },
    });
    const totalBranches = organizations.reduce(
      (sum, org) => sum + (org.numberOfBranches || 0),
      0
    );
    const stats = {
      totalChurches: organizations.length,
      totalMembers,
      totalBranches,
      activeSubscriptions,
    };
    return {
      success: true,
      data: {
        churches: organizations,
        stats,
      },
    };
  } catch (err) {
    console.error('Error fetching churches summary:', err);
    return {
      success: false,
      error:
        err instanceof Error
          ? err.message
          : 'Failed to fetch churches. Please try again.',
    };
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
