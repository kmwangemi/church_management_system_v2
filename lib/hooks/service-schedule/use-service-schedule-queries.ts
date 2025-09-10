import apiClient from '@/lib/api-client';
import { successToastStyle } from '@/lib/toast-styles';
import type {
  ServiceSchedule,
  ServiceScheduleAddResponse,
  ServiceScheduleListResponse,
  ServiceScheduleStatsResponse,
} from '@/lib/types/service-schedule';
import type {
  AddServiceSchedulePayload,
  UpdateServiceSchedulePayload,
} from '@/lib/validations/service-schedule';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

/* ========== CREATE SERVICE SCHEDULE ========== */
const createServiceSchedule = async (
  payload: AddServiceSchedulePayload
): Promise<ServiceScheduleAddResponse> => {
  const { data } = await apiClient.post('/service-schedules', payload);
  return data;
};

export const useCreateServiceSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createServiceSchedule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-schedules'] });
      queryClient.invalidateQueries({ queryKey: ['service-schedule-stats'] });
      toast.success('Service schedule has been created successfully.', {
        style: successToastStyle,
      });
    },
  });
};

/* ========== FETCH SERVICE SCHEDULES ========== */
interface FetchServiceSchedulesParams {
  page?: number;
  limit?: number;
  search?: string;
  day?: string;
  type?: string;
  branchId?: string;
  status?: 'active' | 'inactive';
}

const fetchServiceSchedules = async ({
  page = 1,
  limit = 10,
  search = '',
  day,
  type,
  branchId,
  status,
}: FetchServiceSchedulesParams): Promise<ServiceScheduleListResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  if (search) params.append('search', search);
  if (day) params.append('day', day);
  if (type) params.append('type', type);
  if (branchId) params.append('branchId', branchId);
  if (status) params.append('status', status);
  const { data } = await apiClient.get(
    `/service-schedules?${params.toString()}`
  );
  return data;
};

export const useFetchServiceSchedules = (
  params: FetchServiceSchedulesParams = {}
) => {
  return useQuery({
    queryKey: ['service-schedules', params],
    queryFn: () => fetchServiceSchedules(params),
  });
};

/* ========== FETCH SERVICE SCHEDULE BY ID ========== */
const fetchServiceScheduleById = async (
  scheduleId: string
): Promise<ServiceSchedule> => {
  const {
    data: { schedule },
  } = await apiClient.get(`/service-schedules/${scheduleId}`);
  return schedule;
};

export const useFetchServiceScheduleById = (scheduleId: string) => {
  return useQuery({
    queryKey: ['service-schedule', scheduleId],
    queryFn: () => fetchServiceScheduleById(scheduleId),
    enabled: !!scheduleId, // only fetch if id is provided
  });
};

/* ========== UPDATE SERVICE SCHEDULE BY ID ========== */
const updateServiceScheduleById = async ({
  scheduleId,
  payload,
}: {
  scheduleId: string;
  payload: Partial<UpdateServiceSchedulePayload>;
}): Promise<{ schedule: ServiceSchedule; message: string }> => {
  const { data } = await apiClient.put(
    `/service-schedules/${scheduleId}`,
    payload
  );
  return data;
};

export const useUpdateServiceScheduleById = (scheduleId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateServiceScheduleById,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-schedules'] });
      queryClient.invalidateQueries({
        queryKey: ['service-schedule', scheduleId],
      });
      queryClient.invalidateQueries({ queryKey: ['service-schedule-stats'] });
      toast.success('Service schedule has been updated successfully.', {
        style: successToastStyle,
      });
    },
  });
};

/* ========== DELETE SERVICE SCHEDULE BY ID ========== */
const deleteServiceScheduleById = async (
  scheduleId: string,
  options?: { force?: boolean }
): Promise<{ message: string; schedule?: ServiceSchedule }> => {
  const params = new URLSearchParams();
  if (options?.force) params.append('force', 'true');
  const url = params.toString()
    ? `/service-schedules/${scheduleId}?${params.toString()}`
    : `/service-schedules/${scheduleId}`;
  const { data } = await apiClient.delete(url);
  return data;
};

export const useDeleteServiceScheduleById = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      scheduleId,
      options,
    }: {
      scheduleId: string;
      options?: { force?: boolean };
    }) => deleteServiceScheduleById(scheduleId, options),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['service-schedules'] });
      queryClient.invalidateQueries({ queryKey: ['service-schedule-stats'] });
      const message = variables.options?.force
        ? 'Service schedule has been permanently deleted.'
        : 'Service schedule has been deactivated successfully.';
      toast.success(message, {
        style: successToastStyle,
      });
    },
  });
};

/* ========== FETCH SERVICE SCHEDULE STATISTICS ========== */
interface FetchServiceScheduleStatsParams {
  branchId?: string;
}

const fetchServiceScheduleStats = async ({
  branchId,
}: FetchServiceScheduleStatsParams = {}): Promise<ServiceScheduleStatsResponse> => {
  const params = new URLSearchParams();
  if (branchId) params.append('branchId', branchId);
  const url = params.toString()
    ? `/service-schedules/stats?${params.toString()}`
    : '/service-schedules/stats';
  const { data } = await apiClient.get(url);
  return data;
};

export const useFetchServiceScheduleStats = (
  params: FetchServiceScheduleStatsParams = {}
) => {
  return useQuery({
    queryKey: ['service-schedule-stats', params],
    queryFn: () => fetchServiceScheduleStats(params),
  });
};

/* ========== UPDATE ATTENDANCE ========== */
const updateAttendance = async ({
  scheduleId,
  attendance,
}: {
  scheduleId: string;
  attendance: number;
}): Promise<{ schedule: ServiceSchedule; message: string }> => {
  const { data } = await apiClient.patch(
    `/service-schedules/${scheduleId}/attendance`,
    {
      attendance,
    }
  );
  return data;
};

export const useUpdateAttendance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateAttendance,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['service-schedules'] });
      queryClient.invalidateQueries({
        queryKey: ['service-schedule', variables.scheduleId],
      });
      queryClient.invalidateQueries({ queryKey: ['service-schedule-stats'] });
      toast.success('Attendance has been updated successfully.', {
        style: successToastStyle,
      });
    },
  });
};

/* ========== BULK OPERATIONS ========== */
const bulkUpdateServiceSchedules = async ({
  scheduleIds,
  payload,
}: {
  scheduleIds: string[];
  payload: Partial<UpdateServiceSchedulePayload>;
}): Promise<{ message: string; updatedCount: number }> => {
  const { data } = await apiClient.patch('/service-schedules/bulk-update', {
    scheduleIds,
    payload,
  });
  return data;
};

export const useBulkUpdateServiceSchedules = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: bulkUpdateServiceSchedules,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['service-schedules'] });
      queryClient.invalidateQueries({ queryKey: ['service-schedule-stats'] });
      toast.success(
        `${data.updatedCount} service schedules updated successfully.`,
        {
          style: successToastStyle,
        }
      );
    },
  });
};

const bulkDeleteServiceSchedules = async (
  scheduleIds: string[]
): Promise<{ message: string; deletedCount: number }> => {
  const { data } = await apiClient.delete('/service-schedules/bulk-delete', {
    data: { scheduleIds },
  });
  return data;
};

export const useBulkDeleteServiceSchedules = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: bulkDeleteServiceSchedules,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['service-schedules'] });
      queryClient.invalidateQueries({ queryKey: ['service-schedule-stats'] });
      toast.success(
        `${data.deletedCount} service schedules deleted successfully.`,
        {
          style: successToastStyle,
        }
      );
    },
  });
};

/* ========== GET WEEKLY SCHEDULE ========== */
const fetchWeeklySchedule = async (
  branchId?: string
): Promise<{
  weeklySchedule: Record<string, ServiceSchedule[]>;
  totalServices: number;
}> => {
  const params = new URLSearchParams();
  if (branchId) params.append('branchId', branchId);
  const url = params.toString()
    ? `/service-schedules/weekly?${params.toString()}`
    : '/service-schedules/weekly';
  const { data } = await apiClient.get(url);
  return data;
};

export const useFetchWeeklySchedule = (branchId?: string) => {
  return useQuery({
    queryKey: ['weekly-schedule', branchId],
    queryFn: () => fetchWeeklySchedule(branchId),
  });
};
