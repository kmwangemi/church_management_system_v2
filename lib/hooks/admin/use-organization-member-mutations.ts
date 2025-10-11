'use client';

// ============================================
// REACT QUERY HOOKS - lib/hooks/use-organization-member-mutations.ts
// ============================================

import {
  adminAddMemberToOrganization,
  adminGetOrganizationMemberById,
  adminGetOrganizationMemberByUserId,
  adminGetOrganizationMembers,
  adminRemoveMemberFromOrganization,
  adminUpdateOrganizationMember,
  type AdminGetOrganizationMembersParams,
  type AdminUpdateOrganizationMemberParams,
} from '@/lib/actions/admin/member';
import type { AddUserPayload } from '@/lib/validations/users';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React from 'react';
import { toast } from 'sonner';

// ============================================
// QUERY KEYS
// ============================================

export const organizationMemberKeys = {
  all: ['organization-members'] as const,
  lists: () => [...organizationMemberKeys.all, 'list'] as const,
  list: (params: AdminGetOrganizationMembersParams) =>
    [...organizationMemberKeys.lists(), params] as const,
  details: () => [...organizationMemberKeys.all, 'detail'] as const,
  detail: (memberId: string, organizationId: string) =>
    [...organizationMemberKeys.details(), memberId, organizationId] as const,
  byUser: (userId: string, organizationId: string) =>
    [...organizationMemberKeys.all, 'user', userId, organizationId] as const,
};

// ============================================
// 1. ADMIN FETCH ORGANIZATION MEMBERS (Paginated List)
// ============================================

export function useAdminOrganizationMembers(
  params: AdminGetOrganizationMembersParams
) {
  return useQuery({
    queryKey: organizationMemberKeys.list(params),
    queryFn: () => adminGetOrganizationMembers(params),
    enabled: !!params.organizationId,
    staleTime: 30_000, // 30 seconds
    retry: 2,
  });
}

// ============================================
// 2. ADMIN FETCH ORGANIZATION MEMBER BY ID
// ============================================

export function useAdminOrganizationMember(
  memberId: string,
  organizationId: string,
  enabled = true
) {
  return useQuery({
    queryKey: organizationMemberKeys.detail(memberId, organizationId),
    queryFn: async () => {
      const result = await adminGetOrganizationMemberById(
        memberId,
        organizationId
      );
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch member');
      }
      return result.data;
    },
    enabled: enabled && !!memberId && !!organizationId,
    staleTime: 60_000, // 1 minute
    retry: 2,
  });
}

// ============================================
// 3. ADMIN FETCH ORGANIZATION MEMBER BY USER ID
// ============================================

export function useAdminOrganizationMemberByUserId(
  userId: string,
  organizationId: string,
  enabled = true
) {
  return useQuery({
    queryKey: organizationMemberKeys.byUser(userId, organizationId),
    queryFn: async () => {
      const result = await adminGetOrganizationMemberByUserId(
        userId,
        organizationId
      );
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch member');
      }
      return result.data;
    },
    enabled: enabled && !!userId && !!organizationId,
    staleTime: 60_000, // 1 minute
    retry: 2,
  });
}

// ============================================
// 4. ADMIN ADD ORGANIZATION MEMBER
// ============================================

export function useAdminAddMemberToOrganization(organizationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: AddUserPayload) => adminAddMemberToOrganization(params),
    onSuccess: (response) => {
      if (response.success) {
        toast.success(response.message || 'Member added successfully');
        // Invalidate all member lists for this organization
        queryClient.invalidateQueries({
          queryKey: organizationMemberKeys.lists(),
          predicate: (query) => {
            const params = query
              .queryKey[2] as AdminGetOrganizationMembersParams;
            return params?.organizationId === organizationId;
          },
        });
        // If we have member data, we can optimistically update the cache
        if (response.data) {
          queryClient.setQueryData(
            organizationMemberKeys.detail(response.data.id, organizationId),
            response.data
          );
        }
      } else {
        toast.error(response.error || 'Failed to add member');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add member');
    },
  });
}

// ============================================
// 5. ADMIN UPDATE ORGANIZATION MEMBER
// ============================================

export function useAdminUpdateOrganizationMember(organizationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: AdminUpdateOrganizationMemberParams) =>
      adminUpdateOrganizationMember(params),
    onSuccess: (response, variables) => {
      if (response.success) {
        toast.success(response.message || 'Member updated successfully');
        // Invalidate member lists
        queryClient.invalidateQueries({
          queryKey: organizationMemberKeys.lists(),
          predicate: (query) => {
            const params = query
              .queryKey[2] as AdminGetOrganizationMembersParams;
            return params?.organizationId === organizationId;
          },
        });
        // Invalidate specific member detail
        queryClient.invalidateQueries({
          queryKey: organizationMemberKeys.detail(
            variables.memberId,
            organizationId
          ),
        });
        // Optimistically update the cache if we have the data
        if (response.data) {
          queryClient.setQueryData(
            organizationMemberKeys.detail(variables.memberId, organizationId),
            response.data
          );
        }
      } else {
        toast.error(response.error || 'Failed to update member');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update member');
    },
  });
}

// ============================================
// 6. ADMIN REMOVE ORGANIZATION MEMBER
// ============================================

export function useAdminRemoveMemberFromOrganization(organizationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      memberId,
      deleteUser = false,
    }: {
      memberId: string;
      deleteUser?: boolean;
    }) => adminRemoveMemberFromOrganization(memberId, organizationId, deleteUser),
    onSuccess: (response, variables) => {
      if (response.success) {
        toast.success(response.message || 'Member removed successfully');
        // Invalidate member lists
        queryClient.invalidateQueries({
          queryKey: organizationMemberKeys.lists(),
          predicate: (query) => {
            const params = query
              .queryKey[2] as AdminGetOrganizationMembersParams;
            return params?.organizationId === organizationId;
          },
        });
        // Remove member from cache
        queryClient.removeQueries({
          queryKey: organizationMemberKeys.detail(
            variables.memberId,
            organizationId
          ),
        });
      } else {
        toast.error(response.error || 'Failed to remove member');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to remove member');
    },
  });
}

// ============================================
// 7. ADMIN PREFETCH ORGANIZATION MEMBER
// ============================================

export function useAdminPrefetchOrganizationMember() {
  const queryClient = useQueryClient();
  return {
    prefetch: (memberId: string, organizationId: string) => {
      return queryClient.prefetchQuery({
        queryKey: organizationMemberKeys.detail(memberId, organizationId),
        queryFn: async () => {
          const result = await adminGetOrganizationMemberById(
            memberId,
            organizationId
          );
          if (!result.success) {
            throw new Error(result.error || 'Failed to fetch member');
          }
          return result.data;
        },
        staleTime: 60_000,
      });
    },
  };
}

// ============================================
// 8. ADMIN INVALIDATE ORGANIZATION MEMBERS
// ============================================

export function useAdminInvalidateOrganizationMembers() {
  const queryClient = useQueryClient();
  return {
    invalidateAll: () => {
      return queryClient.invalidateQueries({
        queryKey: organizationMemberKeys.all,
      });
    },
    invalidateLists: (organizationId?: string) => {
      if (organizationId) {
        return queryClient.invalidateQueries({
          queryKey: organizationMemberKeys.lists(),
          predicate: (query) => {
            const params = query
              .queryKey[2] as AdminGetOrganizationMembersParams;
            return params?.organizationId === organizationId;
          },
        });
      }
      return queryClient.invalidateQueries({
        queryKey: organizationMemberKeys.lists(),
      });
    },
    invalidateMember: (memberId: string, organizationId: string) => {
      return queryClient.invalidateQueries({
        queryKey: organizationMemberKeys.detail(memberId, organizationId),
      });
    },
  };
}

// ============================================
// 9. ADMIN OPTIMISTIC UPDATES HELPER
// ============================================

export function useAdminOptimisticMemberUpdate(organizationId: string) {
  const queryClient = useQueryClient();
  return {
    updateMemberOptimistically: (
      memberId: string,
      updateFn: (old: any) => any
    ) => {
      const queryKey = organizationMemberKeys.detail(memberId, organizationId);
      // Cancel outgoing refetches
      queryClient.cancelQueries({ queryKey });
      // Snapshot previous value
      const previousMember = queryClient.getQueryData(queryKey);
      // Optimistically update
      queryClient.setQueryData(queryKey, updateFn);
      // Return context with rollback function
      return {
        previousMember,
        rollback: () => {
          queryClient.setQueryData(queryKey, previousMember);
        },
      };
    },
  };
}

// ============================================
// 10. ADMIN MEMBER LIST FILTERS HOOK
// ============================================

export function useMemberFilters(
  initialParams: Partial<AdminGetOrganizationMembersParams> = {}
) {
  const [filters, setFilters] =
    React.useState<Partial<AdminGetOrganizationMembersParams>>(initialParams);
  const updateFilter = <K extends keyof AdminGetOrganizationMembersParams>(
    key: K,
    value: AdminGetOrganizationMembersParams[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };
  const resetFilters = () => {
    setFilters(initialParams);
  };
  return {
    filters,
    updateFilter,
    resetFilters,
    setFilters,
  };
}

// ============================================
// HELPER TYPES
// ============================================

export type AdminMemberListFilters = Partial<AdminGetOrganizationMembersParams>;

export interface UseAdminMemberFiltersReturn {
  filters: AdminMemberListFilters;
  updateFilter: <K extends keyof AdminGetOrganizationMembersParams>(
    key: K,
    value: AdminGetOrganizationMembersParams[K]
  ) => void;
  resetFilters: () => void;
  setFilters: React.Dispatch<React.SetStateAction<AdminMemberListFilters>>;
}
