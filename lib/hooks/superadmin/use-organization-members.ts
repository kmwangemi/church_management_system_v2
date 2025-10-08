'use client';

// ============================================
// REACT QUERY HOOKS - lib/hooks/use-member-mutations.ts
// ============================================

import {
  addMemberToOrganization,
  bulkRemoveMembers,
  bulkUpdateMemberStatus,
  getOrganizationMembers,
  removeMemberFromOrganization,
  toggleMemberStatus,
  updateMember,
  updateMemberRole,
  type AddMemberParams,
  type GetMembersParams,
  type UpdateMemberParams,
} from '@/lib/actions/member';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

// ============================================
// 0. FETCH MEMBERS HOOK
// ============================================
export function useOrganizationMembers(params: GetMembersParams) {
  return useQuery({
    queryKey: ['organization-members', params],
    queryFn: () => getOrganizationMembers(params),
    enabled: !!params.organizationId,
    staleTime: 30_000, // 30 seconds
  });
}
// ============================================
// 1. ADD MEMBER HOOK
// ============================================

export function useAddMember(organizationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: AddMemberParams) => addMemberToOrganization(params),
    onSuccess: (response) => {
      if (response.success) {
        toast.success(response.message || 'Member added successfully');
        // Invalidate queries to refetch data
        queryClient.invalidateQueries({
          queryKey: ['organization-members', { organizationId }],
        });
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
// 2. UPDATE MEMBER HOOK
// ============================================
export function useUpdateMember(organizationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: UpdateMemberParams) => updateMember(params),
    onSuccess: (response) => {
      if (response.success) {
        toast.success(response.message || 'Member updated successfully');
        queryClient.invalidateQueries({
          queryKey: ['organization-members', { organizationId }],
        });
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
// 3. TOGGLE MEMBER STATUS HOOK
// ============================================
export function useToggleMemberStatus(organizationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ memberId }: { memberId: string }) =>
      toggleMemberStatus(memberId, organizationId),
    onSuccess: (response) => {
      if (response.success) {
        toast.success(response.message || 'Member status updated');
        queryClient.invalidateQueries({
          queryKey: ['organization-members', { organizationId }],
        });
      } else {
        toast.error(response.error || 'Failed to update status');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update status');
    },
  });
}
// ============================================
// 4. REMOVE MEMBER HOOK
// ============================================
export function useRemoveMember(organizationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      memberId,
      deleteUser = false,
    }: {
      memberId: string;
      deleteUser?: boolean;
    }) => removeMemberFromOrganization(memberId, organizationId, deleteUser),
    onSuccess: (response) => {
      if (response.success) {
        toast.success(response.message || 'Member removed successfully');
        queryClient.invalidateQueries({
          queryKey: ['organization-members', { organizationId }],
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
// 5. UPDATE MEMBER ROLE HOOK
// ============================================
export function useUpdateMemberRole(organizationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      memberId,
      newRole,
    }: {
      memberId: string;
      newRole: string;
    }) => updateMemberRole(memberId, organizationId, newRole),
    onSuccess: (response) => {
      if (response.success) {
        toast.success(response.message || 'Role updated successfully');
        queryClient.invalidateQueries({
          queryKey: ['organization-members', { organizationId }],
        });
      } else {
        toast.error(response.error || 'Failed to update role');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update role');
    },
  });
}
// ============================================
// 6. BULK UPDATE STATUS HOOK
// ============================================
export function useBulkUpdateMemberStatus(organizationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      memberIds,
      status,
    }: {
      memberIds: string[];
      status: string;
    }) => bulkUpdateMemberStatus(memberIds, organizationId, status),
    onSuccess: (response) => {
      if (response.success) {
        toast.success(response.message || 'Members updated successfully');
        queryClient.invalidateQueries({
          queryKey: ['organization-members', { organizationId }],
        });
      } else {
        toast.error(response.error || 'Failed to update members');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update members');
    },
  });
}
// ============================================
// 7. BULK REMOVE MEMBERS HOOK
// ============================================
export function useBulkRemoveMembers(organizationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ memberIds }: { memberIds: string[] }) =>
      bulkRemoveMembers(memberIds, organizationId),
    onSuccess: (response) => {
      if (response.success) {
        toast.success(response.message || 'Members removed successfully');
        queryClient.invalidateQueries({
          queryKey: ['organization-members', { organizationId }],
        });
      } else {
        toast.error(response.error || 'Failed to remove members');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to remove members');
    },
  });
}
