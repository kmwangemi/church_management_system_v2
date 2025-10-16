import type { OrganizationPlan } from '@/generated/prisma';
import type { IOrganization } from '@/lib/auth';
import prisma from '@/lib/prisma';

// Define the address structure
interface OrganizationAddress {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

export async function createOrganizationResources({
  organization,
}: {
  organization: IOrganization;
}): Promise<{ success: boolean }> {
  return await prisma.$transaction(async (tx) => {
    // --- 1. Calculate trial period ---
    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + 30);
    // --- 2. Type the address properly ---
    const address = (organization?.address as unknown as OrganizationAddress) || {};
    // --- 2. Create Address ---
    await tx.address.create({
      data: {
        organizationId: organization.id,
        street: address?.street || '',
        city: address?.city || '',
        state: address?.state || '',
        zipCode: address?.zipCode || '',
        country: address?.country || '',
      },
    });
    // --- 3. Create Subscription ---
    await tx.organizationSubscription.create({
      data: {
        organizationId: organization.id,
        plan: (organization?.subscriptionPlan?.toUpperCase() ||
          'BASIC') as OrganizationPlan,
        status: 'TRIAL',
        startDate: new Date(),
        endDate: trialEnd,
        isActive: true,
        nextBillingDate: trialEnd,
      },
    });
    return { success: true };
  });
}
