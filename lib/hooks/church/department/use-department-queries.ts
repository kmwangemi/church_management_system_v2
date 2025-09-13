import apiClient from '@/lib/api-client';
import { successToastStyle } from '@/lib/toast-styles';
import type {
  Department,
  DepartmentAddResponse,
  DepartmentListResponse,
} from '@/lib/types/department';
import type { AddDepartmentPayload } from '@/lib/validations/department';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const registerDepartment = async (
  payload: AddDepartmentPayload
): Promise<DepartmentAddResponse> => {
  const { data } = await apiClient.post('/church/departments', payload);
  return data;
};

export const useRegisterDepartment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: registerDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      queryClient.invalidateQueries({ queryKey: ['branchDepartments'] });
      toast.success('Church department has been created successfully.', {
        style: successToastStyle,
      });
    },
  });
};

const fetchDepartments = async (
  page = 1,
  search = ''
): Promise<DepartmentListResponse> => {
  const { data } = await apiClient.get(
    `/church/departments?page=${page}&search=${search}`
  );
  return data;
};

export const useFetchDepartments = (page = 1, search = '') => {
  return useQuery({
    queryKey: ['departments', page, search],
    queryFn: () => fetchDepartments(page, search),
  });
};

/* ========== FETCH DEPARTMENT BY ID ========== */
const fetchDepartmentById = async (
  departmentId: string
): Promise<Department> => {
  const {
    data: { department },
  } = await apiClient.get(`/church/departments/${departmentId}`);
  return department;
};

export const useFetchDepartmentById = (departmentId: string) => {
  return useQuery({
    queryKey: ['department', departmentId],
    queryFn: () => fetchDepartmentById(departmentId),
    enabled: !!departmentId, // only fetch if id is provided
  });
};

/* ========== UPDATE DEPARTMENT BY ID ========== */
const updateDepartmentById = async ({
  departmentId,
  payload,
}: {
  departmentId: string;
  payload: Partial<AddDepartmentPayload>;
}): Promise<Department> => {
  const { data } = await apiClient.put(
    `/church/departments/${departmentId}`,
    payload
  );
  return data;
};

export const useUpdateDepartmentById = (departmentId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateDepartmentById,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      queryClient.invalidateQueries({ queryKey: ['department', departmentId] });
      toast.success('Department has been updated successfully.', {
        style: successToastStyle,
      });
    },
  });
};

/* ========== DELETE DEPARTMENT BY ID ========== */
const deleteDepartmentById = async ({
  departmentId,
  options,
}: {
  departmentId: string;
  options?: { force?: boolean; cancel?: boolean };
}): Promise<{ message: string }> => {
  const params = new URLSearchParams();
  if (options?.force) params.append('force', 'true');
  if (options?.cancel) params.append('cancel', 'true');
  const url = params.toString()
    ? `/church/departments/${departmentId}?${params.toString()}`
    : `/church/departments/${departmentId}`;
  const { data } = await apiClient.delete(url);
  return data;
};

export const useDeleteDepartmentById = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteDepartmentById,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      const message = variables.options?.cancel
        ? 'Department has been cancelled successfully.'
        : variables.options?.force
          ? 'Department has been permanently deleted.'
          : 'Department has been deleted successfully.';
      toast.success(message, {
        style: successToastStyle,
      });
    },
  });
};
