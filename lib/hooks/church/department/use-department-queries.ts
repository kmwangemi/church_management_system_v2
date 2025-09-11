import apiClient from '@/lib/api-client';
import { successToastStyle } from '@/lib/toast-styles';
import type {
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
