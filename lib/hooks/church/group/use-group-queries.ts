import type { AddGroupGoalPayload } from '@/components/forms/add-group-goal-form';
import apiClient from '@/lib/api-client';
import { successToastStyle } from '@/lib/toast-styles';
import type {
  GroupAddResponse,
  GroupGoalsResponse,
  GroupListResponse,
} from '@/lib/types/small-group';
import type { AddGroupPayload } from '@/lib/validations/small-group';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const registerGroup = async (
  payload: AddGroupPayload
): Promise<GroupAddResponse> => {
  const { data } = await apiClient.post('/church/groups', payload);
  return data;
};

export const useRegisterGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: registerGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      toast.success('Group has been created successfully.', {
        style: successToastStyle,
      });
    },
  });
};

const fetchGroups = async (
  page = 1,
  search = ''
): Promise<GroupListResponse> => {
  const { data } = await apiClient.get(
    `/church/groups?page=${page}&search=${search}`
  );
  return data;
};

export const useFetchGroups = (page = 1, search = '') => {
  return useQuery({
    queryKey: ['groups', page, search],
    queryFn: () => fetchGroups(page, search),
  });
};

/* ========== ADD GROUP GOAL ========== */
const addGroupGoal = async ({
  groupId,
  payload,
}: {
  groupId: string;
  payload: AddGroupGoalPayload;
}): Promise<any> => {
  const { data } = await apiClient.post(
    `/church/groups/${groupId}/goals`,
    payload
  );
  return data;
};

export const useAddGroupGoal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addGroupGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-goals'] });
      toast.success('Group goal has been added successfully.', {
        style: successToastStyle,
      });
    },
  });
};

/* ========== FETCH GROUP GOALS ========== */
interface FetchGroupGoalsParams {
  groupId: string;
  page?: number;
  limit?: number;
  search?: string;
  priority?: string;
  category?: string;
  status?: string;
  assigneeId?: string;
}

const fetchGroupGoals = async ({
  groupId,
  page = 1,
  limit = 20,
  search = '',
  priority,
  category,
  status,
  assigneeId,
}: FetchGroupGoalsParams): Promise<GroupGoalsResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  if (search) params.append('search', search);
  if (priority) params.append('priority', priority);
  if (category) params.append('category', category);
  if (status) params.append('status', status);
  if (assigneeId) params.append('assigneeId', assigneeId);
  const { data } = await apiClient.get(
    `/church/groups/${groupId}/goals?${params.toString()}`
  );
  return data;
};

export const useFetchGroupGoals = (params: FetchGroupGoalsParams) => {
  return useQuery({
    queryKey: ['group-goals', params.groupId, params],
    queryFn: () => fetchGroupGoals(params),
    enabled: !!params.groupId,
  });
};

/* ========== DELETE GROUP GOAL ========== */
const deleteGroupGoal = async ({
  groupId,
  goalId,
}: {
  groupId: string;
  goalId: string;
}): Promise<{ message: string }> => {
  const { data } = await apiClient.delete(
    `/church/groups/${groupId}/goals/${goalId}`
  );
  return data;
};

export const useDeleteGroupGoal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteGroupGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-goals'] });
      toast.success('Group goal has been deleted successfully.', {
        style: successToastStyle,
      });
    },
  });
};

/* ========== UPDATE GROUP GOAL ========== */
const updateGroupGoal = async ({
  groupId,
  goalId,
  payload,
}: {
  groupId: string;
  goalId: string;
  payload: Partial<AddGroupGoalPayload>;
}): Promise<any> => {
  const { data } = await apiClient.put(
    `/church/groups/${groupId}/goals/${goalId}`,
    payload
  );
  return data;
};

export const useUpdateGroupGoal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateGroupGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-goals'] });
      toast.success('Group goal has been updated successfully.', {
        style: successToastStyle,
      });
    },
  });
};
