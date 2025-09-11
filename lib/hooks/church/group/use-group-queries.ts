import apiClient from '@/lib/api-client';
import { successToastStyle } from '@/lib/toast-styles';
import type {
  GroupAddResponse,
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
  const { data } = await apiClient.get(`/church/groups?page=${page}&search=${search}`);
  return data;
};

export const useFetchGroups = (page = 1, search = '') => {
  return useQuery({
    queryKey: ['groups', page, search],
    queryFn: () => fetchGroups(page, search),
  });
};
