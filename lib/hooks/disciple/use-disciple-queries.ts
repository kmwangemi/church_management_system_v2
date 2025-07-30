import apiClient from '@/lib/api-client';
import type {
  DiscipleFilters,
  DiscipleResponse,
  DisciplesResponse,
} from '@/lib/types';
import type { AddDisciplePayload } from '@/lib/validations/disciple';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const fetchDisciplesApi = async (
  filters: DiscipleFilters = {}
): Promise<DisciplesResponse> => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      params.append(key, value.toString());
    }
  });
  const { data } = await apiClient.get(`/disciples?${params.toString()}`);
  return data;
};

const fetchDiscipleApi = async (id: string): Promise<DiscipleResponse> => {
  const { data } = await apiClient.get(`/disciples/${id}`);
  return data;
};

const createDiscipleApi = async (payload: AddDisciplePayload) => {
  const { data } = await apiClient.post('/disciples', payload);
  return data;
};

const updateDiscipleApi = async ({
  id,
  ...payload
}: { id: string } & Partial<AddDisciplePayload>) => {
  const { data } = await apiClient.put(`/disciples/${id}`, payload);
  return data;
};

const deleteDiscipleApi = async (id: string) => {
  const { data } = await apiClient.delete(`/disciples/${id}`);
  return data;
};

const addMilestoneCompletionApi = async (payload: {
  discipleId: string;
  milestoneId: string;
  notes?: string;
  evidence?: string;
}) => {
  // const { discipleId, ...data } = payload;
  const { discipleId } = payload;
  const { data } = await apiClient.post(
    `/api/disciples/${discipleId}/milestones`,
    payload
  );
  return data;
};

// Query Keys
const discipleKeys = {
  all: ['disciples'] as const,
  lists: () => [...discipleKeys.all, 'list'] as const,
  list: (filters: DiscipleFilters) =>
    [...discipleKeys.lists(), filters] as const,
  details: () => [...discipleKeys.all, 'detail'] as const,
  detail: (id: string) => [...discipleKeys.details(), id] as const,
} as const;

// Custom Hooks
export function useDisciples(filters: DiscipleFilters = {}) {
  return useQuery({
    queryKey: discipleKeys.list(filters),
    queryFn: () => fetchDisciplesApi(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useDisciple(id: string) {
  return useQuery({
    queryKey: discipleKeys.detail(id),
    queryFn: () => fetchDiscipleApi(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useRegisterDisciple() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createDiscipleApi,
    onSuccess: (data) => {
      // Invalidate and refetch disciples list
      queryClient.invalidateQueries({ queryKey: discipleKeys.lists() });
      toast.success(data.message || 'Disciple added successfully!', {
        description: `${data.data.memberId.firstName} ${data.data.memberId.lastName} has been added to the discipleship program.`,
      });
    },
    onError: (error: Error) => {
      toast.error('Failed to add disciple', {
        description: error.message,
      });
    },
  });
}

export function useUpdateDisciple() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateDiscipleApi,
    onSuccess: (data, variables) => {
      // Update the specific disciple in cache
      queryClient.setQueryData(discipleKeys.detail(variables.id), data);
      // Invalidate disciples list to refetch
      queryClient.invalidateQueries({ queryKey: discipleKeys.lists() });
      toast.success(data.message || 'Disciple updated successfully!');
    },
    onError: (error: Error) => {
      toast.error('Failed to update disciple', {
        description: error.message,
      });
    },
  });
}

export function useDeleteDisciple() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteDiscipleApi,
    onSuccess: (data, discipleId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: discipleKeys.detail(discipleId) });
      // Invalidate disciples list to refetch
      queryClient.invalidateQueries({ queryKey: discipleKeys.lists() });
      toast.success(data.message || 'Disciple deleted successfully!');
    },
    onError: (error: Error) => {
      toast.error('Failed to delete disciple', {
        description: error.message,
      });
    },
  });
}

export function useAddMilestoneCompletion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addMilestoneCompletionApi,
    onSuccess: (data, variables) => {
      // Invalidate the specific disciple's data
      queryClient.invalidateQueries({
        queryKey: discipleKeys.detail(variables.discipleId),
      });
      // Invalidate disciples list to update progress
      queryClient.invalidateQueries({ queryKey: discipleKeys.lists() });
      toast.success(data.message || 'Milestone completion recorded!');
    },
    onError: (error: Error) => {
      toast.error('Failed to record milestone completion', {
        description: error.message,
      });
    },
  });
}
