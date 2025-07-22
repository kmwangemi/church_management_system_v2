import apiClient from '@/lib/api-client';
import { successToastStyle } from '@/lib/toast-styles';
import type { MemberAddResponse } from '@/lib/types';
import type { AddMemberPayload } from '@/lib/validations/members';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const registerMember = async (
  payload: AddMemberPayload
): Promise<MemberAddResponse> => {
  const { data } = await apiClient.post('/members', payload);
  return data;
};

export const useRegisterMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: registerMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      toast.success('Member has been created successfully.', {
        style: successToastStyle,
      });
    },
  });
};

const fetchMembers = async (page = 1, search = ''): Promise<any> => {
  const { data } = await apiClient.get(
    `/members?page=${page}&search=${search}`
  );
  return data;
};

export const useFetchMembers = (page = 1, search = '') => {
  return useQuery({
    queryKey: ['members', page, search],
    queryFn: () => fetchMembers(page, search),
  });
};
