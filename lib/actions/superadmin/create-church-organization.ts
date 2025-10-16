/** biome-ignore-all lint/suspicious/noConsole: ignore console */
'use server';

import type { OrganizationPlan } from '@/generated/prisma';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import type { ChurchPayload } from '@/lib/validations/church';
import { headers } from 'next/headers';

interface CreateChurchResult {
  success: boolean;
  organizationId?: string;
  error?: string;
}

/**
 * Creates a church organization using Better Auth + additional resources
 * Better Auth handles: Organization, Member (as OWNER), and hooks
 * We handle: Address and Subscription in a transaction
 */
export async function createChurchOrganization(
  payload: ChurchPayload
): Promise<CreateChurchResult> {
  let organizationId: string | null = null;
  try {
    // Step 1: Verify user session
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      return {
        success: false,
        error: 'Unauthorized: Please sign in to create an organization',
      };
    }
    if (session.user.globalRole !== 'SUPER_ADMIN') {
      return {
        success: false,
        error: 'Unauthorized: Superadmin access required',
      };
    }
    // Step 2: Generate slug from church name
    const slug = payload.churchName
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
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
    // This automatically:
    // - Creates the organization
    // - Creates Member with role OWNER
    // - Triggers afterCreateOrganization hook
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
        // 5a. Create Address (if not already created by afterCreateOrganization hook)
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
        // 5b. Calculate trial period (30 days)
        const trialEnd = new Date();
        trialEnd.setDate(trialEnd.getDate() + 30);
        // 5c. Create Subscription (if not already created by afterCreateOrganization hook)
        const existingSubscription =
          await tx.organizationSubscription.findUnique({
            where: { organizationId: organizationId! },
          });
        if (!existingSubscription) {
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
      // Rollback: Delete the organization if resource creation fails
      console.error('Failed to create organization resources:', resourceError);
      try {
        await prisma.organization.delete({
          where: { id: organizationId },
        });
        console.log('Successfully rolled back organization creation');
      } catch (rollbackError) {
        console.error('Failed to rollback organization:', rollbackError);
        // Log this critical error for manual cleanup
        throw new Error(
          'Organization created but resources failed. Please contact support with ID: ' +
            organizationId
        );
      }
      throw resourceError;
    }
    return {
      success: true,
      organizationId,
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
