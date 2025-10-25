'use client';

// ============================================
// REACT QUERY HOOKS - lib/hooks/use-team-mutations.ts
// ============================================

import {
  adminCreateTeam,
  adminDeleteTeam,
  adminGetOrganizationTeams,
  adminGetTeamById,
  adminGetTeamStatistics,
  adminToggleTeamStatus,
  adminUpdateTeam,
  type AdminCreateTeamParams,
  type AdminGetTeamsParams,
  type AdminUpdateTeamParams,
} from '@/lib/actions/admin/team-management-action';
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from '@tanstack/react-query';
import React from 'react';
import { toast } from 'sonner';

// ============================================
// QUERY KEYS
// ============================================

export const teamKeys = {
  all: ['teams'] as const,
  lists: () => [...teamKeys.all, 'list'] as const,
  list: (params: AdminGetTeamsParams) => [...teamKeys.lists(), params] as const,
  details: () => [...teamKeys.all, 'detail'] as const,
  detail: (teamId: string, organizationId: string) =>
    [...teamKeys.details(), teamId, organizationId] as const,
  statistics: (organizationId: string) =>
    [...teamKeys.all, 'statistics', organizationId] as const,
};

// ============================================
// 1. FETCH ADMIN TEAMS (PAGINATED LIST)
// ============================================

export function useAdminTeams(params: AdminGetTeamsParams) {
  return useQuery({
    queryKey: teamKeys.list(params),
    queryFn: () => adminGetOrganizationTeams(params),
    enabled: !!params.organizationId,
    staleTime: 30_000, // 30 seconds
    retry: 2,
  });
}

// ============================================
// 2. ADMIN FETCH TEAM BY ID
// ============================================

export function useAdminTeam(
  teamId: string,
  organizationId: string,
  options?: Partial<UseQueryOptions>
) {
  return useQuery({
    queryKey: teamKeys.detail(teamId, organizationId),
    queryFn: async () => {
      const result = await adminGetTeamById(teamId, organizationId);
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch team');
      }
      return result.data;
    },
    enabled: !!teamId && !!organizationId,
    staleTime: 60_000, // 1 minute
    retry: 2,
    ...options,
  });
}

// ============================================
// 3. ADMIN FETCH TEAM STATISTICS
// ============================================

export function useAdminTeamStatistics(organizationId: string) {
  return useQuery({
    queryKey: teamKeys.statistics(organizationId),
    queryFn: async () => {
      const result = await adminGetTeamStatistics(organizationId);
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch team statistics');
      }
      return result.data;
    },
    enabled: !!organizationId,
    staleTime: 60_000, // 1 minute
    retry: 2,
  });
}

// ============================================
// 4. ADMIN CREATE TEAM MUTATION
// ============================================

export function useAdminCreateTeam(organizationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: AdminCreateTeamParams) => adminCreateTeam(params),
    onSuccess: (response) => {
      if (response.success) {
        toast.success(response.message || 'Team created successfully');
        // Invalidate team lists
        queryClient.invalidateQueries({
          queryKey: teamKeys.lists(),
          predicate: (query) => {
            const params = query.queryKey[2] as AdminGetTeamsParams;
            return params?.organizationId === organizationId;
          },
        });
        // Invalidate statistics
        queryClient.invalidateQueries({
          queryKey: teamKeys.statistics(organizationId),
        });
        // Set new team in cache
        if (response.data) {
          queryClient.setQueryData(
            teamKeys.detail(response.data.id, organizationId),
            response.data
          );
        }
      } else {
        toast.error(response.error || 'Failed to create team');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create team');
    },
  });
}

// ============================================
// 5. ADMIN UPDATE TEAM MUTATION
// ============================================

export function useAdminUpdateTeam(organizationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: AdminUpdateTeamParams) => adminUpdateTeam(params),
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: teamKeys.detail(variables.teamId, organizationId),
      });
      // Snapshot previous value
      const previousTeam = queryClient.getQueryData(
        teamKeys.detail(variables.teamId, organizationId)
      );
      // Optimistically update
      queryClient.setQueryData(
        teamKeys.detail(variables.teamId, organizationId),
        (old: any) => {
          if (!old) return old;
          return {
            ...old,
            ...variables,
            address:
              variables.street || variables.city
                ? [
                    {
                      ...old.address?.[0],
                      street: variables.street ?? old.address?.[0]?.street,
                      city: variables.city ?? old.address?.[0]?.city,
                      state: variables.state ?? old.address?.[0]?.state,
                      zipCode: variables.zipCode ?? old.address?.[0]?.zipCode,
                      country: variables.country ?? old.address?.[0]?.country,
                    },
                  ]
                : old.address,
          };
        }
      );
      return { previousTeam };
    },
    onSuccess: (response, variables) => {
      if (response.success) {
        toast.success(response.message || 'Team updated successfully');
        // Invalidate lists
        queryClient.invalidateQueries({
          queryKey: teamKeys.lists(),
          predicate: (query) => {
            const params = query.queryKey[2] as AdminGetTeamsParams;
            return params?.organizationId === organizationId;
          },
        });
        // Invalidate statistics
        queryClient.invalidateQueries({
          queryKey: teamKeys.statistics(organizationId),
        });
        // Update cache with server data
        if (response.data) {
          queryClient.setQueryData(
            teamKeys.detail(variables.teamId, organizationId),
            response.data
          );
        }
      } else {
        toast.error(response.error || 'Failed to update team');
      }
    },
    onError: (error: Error, variables, context) => {
      // Rollback on error
      if (context?.previousTeam) {
        queryClient.setQueryData(
          teamKeys.detail(variables.teamId, organizationId),
          context.previousTeam
        );
      }
      toast.error(error.message || 'Failed to update team');
    },
    onSettled: (data, error, variables) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({
        queryKey: teamKeys.detail(variables.teamId, organizationId),
      });
    },
  });
}

// ============================================
// 6. ADMIN DELETE TEAM MUTATION
// ============================================

export function useAdminDeleteTeam(organizationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (teamId: string) => adminDeleteTeam(teamId, organizationId),
    onSuccess: (response, teamId) => {
      if (response.success) {
        toast.success(response.message || 'Team deleted successfully');
        // Invalidate lists
        queryClient.invalidateQueries({
          queryKey: teamKeys.lists(),
          predicate: (query) => {
            const params = query.queryKey[2] as AdminGetTeamsParams;
            return params?.organizationId === organizationId;
          },
        });
        // Invalidate statistics
        queryClient.invalidateQueries({
          queryKey: teamKeys.statistics(organizationId),
        });
        // Remove from cache
        queryClient.removeQueries({
          queryKey: teamKeys.detail(teamId, organizationId),
        });
      } else {
        toast.error(response.error || 'Failed to delete team');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete team');
    },
  });
}

// ============================================
// 7. ADMIN TOGGLE TEAM STATUS MUTATION
// ============================================

export function useAdminToggleTeamStatus(organizationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (teamId: string) =>
      adminToggleTeamStatus(teamId, organizationId),
    onMutate: async (teamId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: teamKeys.detail(teamId, organizationId),
      });
      // Snapshot previous value
      const previousTeam = queryClient.getQueryData(
        teamKeys.detail(teamId, organizationId)
      );
      // Optimistically update
      queryClient.setQueryData(
        teamKeys.detail(teamId, organizationId),
        (old: any) => {
          if (!old) return old;
          return {
            ...old,
            isActive: !old.isActive,
          };
        }
      );
      return { previousTeam };
    },
    onSuccess: (response, teamId) => {
      if (response.success) {
        toast.success(response.message || 'Team status updated successfully');
        // Invalidate lists
        queryClient.invalidateQueries({
          queryKey: teamKeys.lists(),
          predicate: (query) => {
            const params = query.queryKey[2] as AdminGetTeamsParams;
            return params?.organizationId === organizationId;
          },
        });
        // Invalidate statistics
        queryClient.invalidateQueries({
          queryKey: teamKeys.statistics(organizationId),
        });
      } else {
        toast.error(response.error || 'Failed to update team status');
      }
    },
    onError: (error: Error, teamId, context) => {
      // Rollback on error
      if (context?.previousTeam) {
        queryClient.setQueryData(
          teamKeys.detail(teamId, organizationId),
          context.previousTeam
        );
      }
      toast.error(error.message || 'Failed to update team status');
    },
    onSettled: (data, error, teamId) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({
        queryKey: teamKeys.detail(teamId, organizationId),
      });
    },
  });
}

// ============================================
// 8. ADMIN PREFETCH TEAM
// ============================================

export function useAdminPrefetchTeam() {
  const queryClient = useQueryClient();
  return {
    prefetch: (teamId: string, organizationId: string) => {
      return queryClient.prefetchQuery({
        queryKey: teamKeys.detail(teamId, organizationId),
        queryFn: async () => {
          const result = await adminGetTeamById(teamId, organizationId);
          if (!result.success) {
            throw new Error(result.error || 'Failed to fetch team');
          }
          return result.data;
        },
        staleTime: 60_000,
      });
    },
  };
}

// ============================================
// 9. ADMIN INVALIDATE TEAMS
// ============================================

export function useAdminInvalidateTeams() {
  const queryClient = useQueryClient();
  return {
    invalidateAll: () => {
      return queryClient.invalidateQueries({
        queryKey: teamKeys.all,
      });
    },
    invalidateLists: (organizationId?: string) => {
      if (organizationId) {
        return queryClient.invalidateQueries({
          queryKey: teamKeys.lists(),
          predicate: (query) => {
            const params = query.queryKey[2] as AdminGetTeamsParams;
            return params?.organizationId === organizationId;
          },
        });
      }
      return queryClient.invalidateQueries({
        queryKey: teamKeys.lists(),
      });
    },
    invalidateTeam: (teamId: string, organizationId: string) => {
      return queryClient.invalidateQueries({
        queryKey: teamKeys.detail(teamId, organizationId),
      });
    },
    invalidateStatistics: (organizationId: string) => {
      return queryClient.invalidateQueries({
        queryKey: teamKeys.statistics(organizationId),
      });
    },
  };
}

// ============================================
// 10. ADMIN OPTIMISTIC UPDATES HELPER
// ============================================

export function useAdminOptimisticTeamUpdate(organizationId: string) {
  const queryClient = useQueryClient();
  return {
    updateTeamOptimistically: (teamId: string, updateFn: (old: any) => any) => {
      const queryKey = teamKeys.detail(teamId, organizationId);
      // Cancel outgoing refetches
      queryClient.cancelQueries({ queryKey });
      // Snapshot previous value
      const previousTeam = queryClient.getQueryData(queryKey);
      // Optimistically update
      queryClient.setQueryData(queryKey, updateFn);
      // Return context with rollback function
      return {
        previousTeam,
        rollback: () => {
          queryClient.setQueryData(queryKey, previousTeam);
        },
      };
    },
  };
}

// ============================================
// 11. ADMIN TEAM FILTERS HOOK
// ============================================

export function useAdminTeamFilters(
  initialParams: Partial<AdminGetTeamsParams> = {}
) {
  const [filters, setFilters] =
    React.useState<Partial<AdminGetTeamsParams>>(initialParams);
  const updateFilter = <K extends keyof AdminGetTeamsParams>(
    key: K,
    value: AdminGetTeamsParams[K]
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
// 12. ADMIN BULK OPERATIONS HELPER
// ============================================

export function useAdminBulkTeamOperations(organizationId: string) {
  const queryClient = useQueryClient();
  const toggleStatus = useAdminToggleTeamStatus(organizationId);
  const deleteTeamMutation = useAdminDeleteTeam(organizationId);
  return {
    bulkToggleStatus: async (teamIds: string[]) => {
      const results = await Promise.allSettled(
        teamIds.map((id) => toggleStatus.mutateAsync(id))
      );
      const successful = results.filter((r) => r.status === 'fulfilled').length;
      const failed = results.filter((r) => r.status === 'rejected').length;
      if (successful > 0) {
        toast.success(`${successful} team(s) status updated successfully`);
      }
      if (failed > 0) {
        toast.error(`Failed to update ${failed} team(s)`);
      }
      // Invalidate all lists after bulk operation
      queryClient.invalidateQueries({
        queryKey: teamKeys.lists(),
      });
    },
    bulkDelete: async (teamIds: string[]) => {
      const results = await Promise.allSettled(
        teamIds.map((id) => deleteTeamMutation.mutateAsync(id))
      );
      const successful = results.filter((r) => r.status === 'fulfilled').length;
      const failed = results.filter((r) => r.status === 'rejected').length;
      if (successful > 0) {
        toast.success(`${successful} team(s) deleted successfully`);
      }
      if (failed > 0) {
        toast.error(`Failed to delete ${failed} team(s)`);
      }
      // Invalidate all lists after bulk operation
      queryClient.invalidateQueries({
        queryKey: teamKeys.lists(),
      });
    },
  };
}

// ============================================
// 13. ADMIN TEAM CACHE UTILITIES
// ============================================

export function useAdminTeamCache() {
  const queryClient = useQueryClient();
  return {
    getTeamFromCache: (teamId: string, organizationId: string) => {
      return queryClient.getQueryData(teamKeys.detail(teamId, organizationId));
    },
    setTeamInCache: (teamId: string, organizationId: string, data: any) => {
      queryClient.setQueryData(teamKeys.detail(teamId, organizationId), data);
    },
    removeTeamFromCache: (teamId: string, organizationId: string) => {
      queryClient.removeQueries({
        queryKey: teamKeys.detail(teamId, organizationId),
      });
    },
    clearAllTeamCache: () => {
      queryClient.removeQueries({
        queryKey: teamKeys.all,
      });
    },
  };
}

// ============================================
// HELPER TYPES
// ============================================

export type TeamListFilters = Partial<AdminGetTeamsParams>;

export interface UseAdminTeamFiltersReturn {
  filters: TeamListFilters;
  updateFilter: <K extends keyof AdminGetTeamsParams>(
    key: K,
    value: AdminGetTeamsParams[K]
  ) => void;
  resetFilters: () => void;
  setFilters: React.Dispatch<React.SetStateAction<TeamListFilters>>;
}

// ============================================
// EXAMPLE USAGE IN COMPONENTS
// ============================================

/*
// 1. List Teams with Filters
function TeamsListPage({ organizationId }: { organizationId: string }) {
  const { filters, updateFilter, resetFilters } = useTeamFilters({
    organizationId,
    page: 1,
    pageSize: 10,
  });
  const { data, isLoading } = useTeams(filters as GetTeamsParams);
  return (
    <div>
      <input 
        onChange={(e) => updateFilter('search', e.target.value)}
        placeholder="Search teams..."
      />
      {data?.teams.map(team => <TeamCard key={team.id} team={team} />)}
    </div>
  );
}

// 2. Team Detail with Optimistic Updates
function TeamDetailPage({ teamId, organizationId }: any) {
  const { data: team, isLoading } = useTeam(teamId, organizationId);
  const updateMutation = useUpdateTeam(organizationId);
  const handleUpdate = (updates: Partial<UpdateTeamParams>) => {
    updateMutation.mutate({
      teamId,
      organizationId,
      ...updates,
    });
  };
  return <div>...</div>;
}

// 3. Create Team Form
function CreateTeamForm({ organizationId }: any) {
  const createMutation = useCreateTeam(organizationId);
  const { data: stats } = useTeamStatistics(organizationId);
  const handleSubmit = (data: CreateTeamParams) => {
    createMutation.mutate(data);
  };
  return <form onSubmit={handleSubmit}>...</form>;
}

// 4. Bulk Operations
function TeamBulkActions({ selectedTeamIds, organizationId }: any) {
  const { bulkDelete, bulkToggleStatus } = useBulkTeamOperations(organizationId);
  return (
    <div>
      <button onClick={() => bulkToggleStatus(selectedTeamIds)}>
        Toggle Status
      </button>
      <button onClick={() => bulkDelete(selectedTeamIds)}>
        Delete Selected
      </button>
    </div>
  );
}
*/
