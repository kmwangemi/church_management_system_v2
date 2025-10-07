'use client';

import {
  getOrganizationMembers,
  type GetMembersParams,
} from '@/lib/actions/member';
import { useQuery } from '@tanstack/react-query';

export function useOrganizationMembers(params: GetMembersParams) {
  return useQuery({
    queryKey: ['organization-members', params],
    queryFn: () => getOrganizationMembers(params),
    enabled: !!params.organizationId,
    staleTime: 30_000, // 30 seconds
  });
}