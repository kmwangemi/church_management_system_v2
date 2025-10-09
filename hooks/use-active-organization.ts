import { authClient } from '@/lib/auth-client';

export function useActiveOrganization() {
  const {
    data: activeOrganization,
    error,
    isPending,
  } = authClient.useActiveOrganization();
  return {
    activeOrganization,
    isPending,
    error,
    organizationId: activeOrganization?.id ?? '',
    organizationName: activeOrganization?.name ?? 'Unknown',
  };
}
