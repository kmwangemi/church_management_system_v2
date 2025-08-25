import apiClient from '@/lib/api-client';
import { successToastStyle } from '@/lib/toast-styles';
import type { UserAddResponse, UserListResponse } from '@/lib/types';
import type { AddUserPayload } from '@/lib/validations/users';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const registerUser = async (
  payload: AddUserPayload
): Promise<UserAddResponse> => {
  const { data } = await apiClient.post('/users', payload);
  return data;
};

export const useRegisterUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: registerUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User has been created successfully.', {
        style: successToastStyle,
      });
    },
  });
};

const fetchUsers = async (
  page = 1,
  search = ''
): Promise<UserListResponse> => {
  const { data } = await apiClient.get(
    `/users?page=${page}&search=${search}`
  );
  return data;
};

export const useFetchUsers = (page = 1, search = '') => {
  return useQuery({
    queryKey: ['users', page, search],
    queryFn: () => fetchUsers(page, search),
  });
};
