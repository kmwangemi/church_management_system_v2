import apiClient from '@/lib/api-client';
import { successToastStyle } from '@/lib/toast-styles';
import type {
  Activity,
  ActivityAddResponse,
  ActivityListResponse,
  ActivityStatsResponse,
} from '@/lib/types/activity';
import type {
  AddActivityPayload,
  UpdateActivityPayload,
} from '@/lib/validations/activity';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

/* ========== CREATE ACTIVITY ========== */
const createActivity = async (
  payload: AddActivityPayload
): Promise<ActivityAddResponse> => {
  const { data } = await apiClient.post('/activities', payload);
  return data;
};

export const useCreateActivity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createActivity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      queryClient.invalidateQueries({ queryKey: ['activity-stats'] });
      toast.success('Activity has been created successfully.', {
        style: successToastStyle,
      });
    },
  });
};

/* ========== FETCH ACTIVITIES ========== */
interface FetchActivitiesParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  status?: string;
  branchId?: string;
  dateFrom?: string;
  dateTo?: string;
}

const fetchActivities = async ({
  page = 1,
  limit = 10,
  search = '',
  type,
  status,
  branchId,
  dateFrom,
  dateTo,
}: FetchActivitiesParams): Promise<ActivityListResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  if (search) params.append('search', search);
  if (type) params.append('type', type);
  if (status) params.append('status', status);
  if (branchId) params.append('branchId', branchId);
  if (dateFrom) params.append('dateFrom', dateFrom);
  if (dateTo) params.append('dateTo', dateTo);
  const { data } = await apiClient.get(`/activities?${params.toString()}`);
  return data;
};

export const useFetchActivities = (params: FetchActivitiesParams = {}) => {
  return useQuery({
    queryKey: ['activities', params],
    queryFn: () => fetchActivities(params),
  });
};

/* ========== FETCH ACTIVITY BY ID ========== */
const fetchActivityById = async (activityId: string): Promise<Activity> => {
  const {
    data: { activity },
  } = await apiClient.get(`/activities/${activityId}`);
  return activity;
};

export const useFetchActivityById = (activityId: string) => {
  return useQuery({
    queryKey: ['activity', activityId],
    queryFn: () => fetchActivityById(activityId),
    enabled: !!activityId, // only fetch if id is provided
  });
};

/* ========== UPDATE ACTIVITY BY ID ========== */
const updateActivityById = async ({
  activityId,
  payload,
}: {
  activityId: string;
  payload: Partial<UpdateActivityPayload>;
}): Promise<{ activity: Activity; message: string }> => {
  const { data } = await apiClient.put(`/activities/${activityId}`, payload);
  return data;
};

export const useUpdateActivityById = (activityId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateActivityById,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      queryClient.invalidateQueries({ queryKey: ['activity', activityId] });
      queryClient.invalidateQueries({ queryKey: ['activity-stats'] });
      toast.success('Activity has been updated successfully.', {
        style: successToastStyle,
      });
    },
  });
};

/* ========== DELETE ACTIVITY BY ID ========== */
const deleteActivityById = async (
  activityId: string,
  options?: { force?: boolean; cancel?: boolean }
): Promise<{ message: string }> => {
  const params = new URLSearchParams();
  if (options?.force) params.append('force', 'true');
  if (options?.cancel) params.append('cancel', 'true');
  const url = params.toString()
    ? `/activities/${activityId}?${params.toString()}`
    : `/activities/${activityId}`;
  const { data } = await apiClient.delete(url);
  return data;
};

export const useDeleteActivityById = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      activityId,
      options,
    }: {
      activityId: string;
      options?: { force?: boolean; cancel?: boolean };
    }) => deleteActivityById(activityId, options),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      queryClient.invalidateQueries({ queryKey: ['activity-stats'] });
      const message = variables.options?.cancel
        ? 'Activity has been cancelled successfully.'
        : 'Activity has been deleted successfully.';
      toast.success(message, {
        style: successToastStyle,
      });
    },
  });
};

/* ========== FETCH ACTIVITY STATISTICS ========== */
interface FetchActivityStatsParams {
  branchId?: string;
  year?: string;
  month?: string;
}

const fetchActivityStats = async ({
  branchId,
  year,
  month,
}: FetchActivityStatsParams = {}): Promise<ActivityStatsResponse> => {
  const params = new URLSearchParams();
  if (branchId) params.append('branchId', branchId);
  if (year) params.append('year', year);
  if (month) params.append('month', month);
  const url = params.toString()
    ? `/activities/stats?${params.toString()}`
    : '/activities/stats';
  const { data } = await apiClient.get(url);
  return data;
};

export const useFetchActivityStats = (
  params: FetchActivityStatsParams = {}
) => {
  return useQuery({
    queryKey: ['activity-stats', params],
    queryFn: () => fetchActivityStats(params),
  });
};

/* ========== BULK OPERATIONS ========== */
const bulkUpdateActivities = async ({
  activityIds,
  payload,
}: {
  activityIds: string[];
  payload: Partial<UpdateActivityPayload>;
}): Promise<{ message: string; updatedCount: number }> => {
  const { data } = await apiClient.patch('/activities/bulk-update', {
    activityIds,
    payload,
  });
  return data;
};

export const useBulkUpdateActivities = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: bulkUpdateActivities,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      queryClient.invalidateQueries({ queryKey: ['activity-stats'] });
      toast.success(`${data.updatedCount} activities updated successfully.`, {
        style: successToastStyle,
      });
    },
  });
};

const bulkDeleteActivities = async (
  activityIds: string[]
): Promise<{ message: string; deletedCount: number }> => {
  const { data } = await apiClient.delete('/activities/bulk-delete', {
    data: { activityIds },
  });
  return data;
};

export const useBulkDeleteActivities = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: bulkDeleteActivities,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      queryClient.invalidateQueries({ queryKey: ['activity-stats'] });
      toast.success(`${data.deletedCount} activities deleted successfully.`, {
        style: successToastStyle,
      });
    },
  });
};

// DELETE / api / activities / [id];

// Three;
// deletion;
// modes:

// ?force=true - Hard delete (permanent)
// ?cancel=true - Cancel activity (sets status to 'cancelled')
// Default - Hard delete
