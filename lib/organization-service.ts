// lib/organization-service.ts
import type { OrganizationPlan } from '@/generated/prisma';
import { auth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import prisma from '@/lib/prisma';

interface IOrganizationMetadata {
  subscriptionPlan?: string;
  address?: string;
  phone?: string;
  [key: string]: any;
}

interface CreateOrganizationParams {
  name: string;
  slug: string;
  logo?: string;
  metadata?: IOrganizationMetadata;
  userId: string;
  headers: Headers;
}

/**
 * Create organization with subscription and default team in a transaction
 * This ensures atomicity - either everything is created or nothing is
 */
export async function createOrganizationWithDefaults(
  params: CreateOrganizationParams
) {
  const { name, slug, logo, metadata, userId, headers } = params;
  try {
    // Use Prisma transaction to ensure atomicity
    const result = await prisma.$transaction(
      async (tx) => {
        // 1. Create organization via Better Auth API
        const orgResponse = await auth.api.createOrganization({
          headers,
          body: {
            name,
            slug,
            logo,
            metadata: metadata || {},
          },
        });
        if (!orgResponse) {
          throw new Error('Failed to create organization');
        }
        const organization = orgResponse;
        // 2. Extract subscription plan from metadata
        const plan = (
          metadata?.subscriptionPlan || 'BASIC'
        ).toUpperCase() as OrganizationPlan;
        // 3. Calculate trial end date
        const trialEnd = new Date();
        trialEnd.setDate(trialEnd.getDate() + 30);
        // 4. Create subscription
        const subscription = await tx.organizationSubscription.create({
          data: {
            organizationId: organization.id,
            plan,
            status: 'TRIAL',
            startDate: new Date(),
            endDate: trialEnd,
            isActive: true,
            nextBillingDate: trialEnd,
            isPaid: false,
            isAutoRenew: true,
            invoiceAmount: 0,
            paidAmount: 0,
            balAmount: 0,
            currentUsers: 1,
            currentSmallGroups: 0,
            features: getFeaturesByPlan(plan),
          },
        });
        // 5. Create default "Main Branch" team
        const mainBranch = await tx.team.create({
          data: {
            id: crypto.randomUUID(),
            name: 'Main Branch',
            organizationId: organization.id,
            establishedDate: new Date(),
            capacity: 300,
            isActive: true,
            memberCount: 0,
            description: 'Default main branch',
            metadata: {
              isDefault: true,
              createdAutomatically: true,
            },
          },
        });
        // 6. Update the member record to assign them to the main branch
        await tx.member.updateMany({
          where: {
            organizationId: organization.id,
            userId,
          },
          data: {
            teamId: mainBranch.id,
          },
        });
        // 7. Log successful creation
        await logger.info('Organization created with defaults', {
          organizationId: organization.id,
          userId,
          plan,
          branchId: mainBranch.id,
        });
        return {
          organization,
          subscription,
          mainBranch,
        };
      },
      {
        maxWait: 5000, // Maximum time to wait for transaction to start
        timeout: 10_000, // Maximum time for transaction to complete
      }
    );
    return result;
  } catch (error) {
    // Log the error
    await logger.error(
      'Failed to create organization with defaults',
      error as Error,
      {
        userId,
        organizationName: name,
        slug,
      }
    );
    // Re-throw to let the caller handle it
    throw new Error(
      `Failed to create organization: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Get features based on subscription plan
 */
function getFeaturesByPlan(plan: OrganizationPlan): string[] {
  const featureMap: Record<OrganizationPlan, string[]> = {
    BASIC: [
      'member_management',
      'event_scheduling',
      'basic_reporting',
      'email_notifications',
    ],
    MINISTRY: [
      'member_management',
      'event_scheduling',
      'advanced_reporting',
      'email_notifications',
      'sms_notifications',
      'department_management',
      'small_groups',
      'giving_tracking',
    ],
    CATHEDRAL: [
      'member_management',
      'event_scheduling',
      'advanced_reporting',
      'email_notifications',
      'sms_notifications',
      'department_management',
      'small_groups',
      'giving_tracking',
      'multiple_branches',
      'custom_branding',
      'api_access',
      'dedicated_support',
    ],
    CUSTOM: ['all_features', 'custom_integrations', 'priority_support'],
  };
  return featureMap[plan] || featureMap.BASIC;
}

// ============================================
// USAGE IN API ROUTE
// ============================================

// // app/api/organizations/create/route.ts
// import { type NextRequest, NextResponse } from 'next/server';
// import { createOrganizationWithDefaults } from '@/lib/organization-service';
// import { auth } from '@/lib/auth';

// export async function POST(request: NextRequest) {
//   try {
//     // 1. Get session to verify user is authenticated
//     const session = await auth.api.getSession({
//       headers: request.headers,
//     });
//     if (!session?.user) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }
//     // 2. Parse request body
//     const body = await request.json();
//     const { name, slug, logo, metadata } = body;
//     // 3. Validate required fields
//     if (!name || !slug) {
//       return NextResponse.json(
//         { error: 'Name and slug are required' },
//         { status: 400 }
//       );
//     }
//     // 4. Create organization with all defaults in a transaction
//     const result = await createOrganizationWithDefaults({
//       name,
//       slug,
//       logo,
//       metadata,
//       userId: session.user.id,
//       headers: request.headers,
//     });
//     // 5. Return success response
//     return NextResponse.json({
//       success: true,
//       data: {
//         organization: result.organization,
//         subscription: result.subscription,
//         mainBranch: result.mainBranch,
//       },
//     });
//   } catch (error) {
//     console.error('Organization creation error:', error);
//     return NextResponse.json(
//       {
//         error: 'Failed to create organization',
//         message: error instanceof Error ? error.message : 'Unknown error',
//       },
//       { status: 500 }
//     );
//   }
// }
