import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import apiClient from '@/lib/api-client';
import { successToastStyle } from '@/lib/toast-styles';
import type {
  DepartmentAddResponse,
  DepartmentListResponse,
} from '@/lib/types';
import type { AddDepartmentPayload } from '@/lib/validations/department';

const registerDepartment = async (
  payload: AddDepartmentPayload
): Promise<DepartmentAddResponse> => {
  const { data } = await apiClient.post('/departments', payload);
  return data;
};

export const useRegisterDepartment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: registerDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
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
    `/departments?page=${page}&search=${search}`
  );
  return data;
};

export const useFetchDepartments = (page = 1, search = '') => {
  return useQuery({
    queryKey: ['departments', page, search],
    queryFn: () => fetchDepartments(page, search),
  });
};
