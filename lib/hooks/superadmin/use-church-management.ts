// hooks/use-church-management.ts
'use client';

import {
  activateChurchOrganization,
  createChurchOrganization,
  deleteChurchOrganization,
  getAllChurchesSummary,
  getChurchDetails,
  getChurchStatistics,
  suspendChurchOrganization,
  updateChurchOrganization,
} from '@/lib/actions/superadmin/church-management';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

// ============================================
// QUERY HOOKS
// ============================================

/**
 * Hook to fetch all churches with summary data
 */
export function useAllChurches() {
  return useQuery({
    queryKey: ['churches', 'all'],
    queryFn: async () => {
      const result = await getAllChurchesSummary();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch churches');
      }
      return result.data;
    },
    staleTime: 30_000, // 30 seconds
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to fetch church statistics (dashboard stats)
 */
export function useChurchStatistics() {
  return useQuery({
    queryKey: ['churches', 'statistics'],
    queryFn: async () => {
      const result = await getChurchStatistics();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch statistics');
      }
      return result.data;
    },
    staleTime: 60_000, // 1 minute
  });
}

/**
 * Hook to fetch detailed church information
 */
export function useChurchDetails(organizationId: string) {
  return useQuery({
    queryKey: ['church-details', organizationId],
    queryFn: async () => {
      const result = await getChurchDetails(organizationId);
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch church details');
      }
      return result.data;
    },
    enabled: !!organizationId,
    staleTime: 60_000, // 1 minute
  });
}

// ============================================
// MUTATION HOOKS
// ============================================

/**
 * Hook to create a new church organization
 */
export function useCreateChurch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createChurchOrganization,
    onSuccess: (data) => {
      if (data.success) {
        // Invalidate churches list
        queryClient.invalidateQueries({
          queryKey: ['churches'],
        });
        toast.success('Church created successfully! 🎉', {
          description: 'The church has been registered with a 30-day trial.',
        });
      } else {
        toast.error(data.error || 'Failed to create church');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create church');
    },
  });
}

/**
 * Hook to update church organization
 */
export function useUpdateChurch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateChurchOrganization,
    onSuccess: (data, variables) => {
      if (data.success) {
        // Invalidate specific church details
        queryClient.invalidateQueries({
          queryKey: ['church-details', variables.organizationId],
        });
        // Invalidate churches list
        queryClient.invalidateQueries({
          queryKey: ['churches', 'all'],
        });
        toast.success('Church updated successfully');
      } else {
        toast.error(data.error || 'Failed to update church');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update church');
    },
  });
}

/**
 * Hook to suspend a church organization
 */
export function useSuspendChurch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: suspendChurchOrganization,
    onSuccess: (data, organizationId) => {
      if (data.success) {
        // Invalidate specific church details
        queryClient.invalidateQueries({
          queryKey: ['church-details', organizationId],
        });
        // Invalidate churches list
        queryClient.invalidateQueries({
          queryKey: ['churches', 'all'],
        });
        toast.success('Church suspended successfully');
      } else {
        toast.error(data.error || 'Failed to suspend church');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to suspend church');
    },
  });
}

/**
 * Hook to activate a church organization
 */
export function useActivateChurch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: activateChurchOrganization,
    onSuccess: (data, organizationId) => {
      if (data.success) {
        // Invalidate specific church details
        queryClient.invalidateQueries({
          queryKey: ['church-details', organizationId],
        });
        // Invalidate churches list
        queryClient.invalidateQueries({
          queryKey: ['churches', 'all'],
        });
        toast.success('Church activated successfully');
      } else {
        toast.error(data.error || 'Failed to activate church');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to activate church');
    },
  });
}

/**
 * Hook to delete a church organization
 */
export function useDeleteChurch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteChurchOrganization,
    onSuccess: (data, organizationId) => {
      if (data.success) {
        // Invalidate specific church details
        queryClient.invalidateQueries({
          queryKey: ['church-details', organizationId],
        });
        // Invalidate churches list
        queryClient.invalidateQueries({
          queryKey: ['churches', 'all'],
        });
        // Invalidate statistics
        queryClient.invalidateQueries({
          queryKey: ['churches', 'statistics'],
        });
        toast.success('Church deleted successfully');
      } else {
        toast.error(data.error || 'Failed to delete church');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete church');
    },
  });
}

// ============================================
// COMBINED HOOKS
// ============================================

/**
 * Hook for church management actions (suspend, activate, delete)
 * Combines all church management mutations
 */
export function useChurchActions() {
  const suspend = useSuspendChurch();
  const activate = useActivateChurch();
  const deleteChurch = useDeleteChurch();
  const update = useUpdateChurch();
  return {
    suspend,
    activate,
    delete: deleteChurch,
    update,
    isLoading:
      suspend.isPending ||
      activate.isPending ||
      deleteChurch.isPending ||
      update.isPending,
  };
}

// ============================================
// TYPE EXPORTS
// ============================================

export type ChurchDetailsData = Awaited<
  ReturnType<typeof getChurchDetails>
>['data'];
export type AllChurchesData = Awaited<
  ReturnType<typeof getAllChurchesSummary>
>['data'];
export type ChurchStatistics = Awaited<
  ReturnType<typeof getChurchStatistics>
>['data'];
