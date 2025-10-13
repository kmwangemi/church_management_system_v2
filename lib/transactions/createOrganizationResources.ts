import type { OrganizationPlan } from '@/generated/prisma';
import type { IOrganization } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function createOrganizationDefaults({
  organization,
}: {
  organization: IOrganization;
}): Promise<{ success: boolean }> {
  return await prisma.$transaction(async (tx) => {
    // --- 1. Calculate trial period ---
    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + 30);
    // --- 2. Create Address ---
    await tx.address.create({
      data: {
        organizationId: organization.id,
        street: organization?.address?.street || '',
        city: organization?.address?.city || '',
        state: organization?.address?.state || '',
        zipCode: organization?.address?.zipCode || '',
        country: organization?.address?.country || '',
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
