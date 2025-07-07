import apiClient from '@/lib/api-client';
import { successToastStyle } from '@/lib/toast-styles';
import { ChurchRegistrationResponse } from '@/lib/types';
import { ChurchRegistrationPayload } from '@/lib/validations/auth';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

const registerChurch = async (
  payload: ChurchRegistrationPayload,
): Promise<ChurchRegistrationResponse> => {
  const { data } = await apiClient.post('/auth/register', payload);
  return data;
};

export const useRegisterChurch = () => {
  return useMutation({
    mutationFn: registerChurch,
    onSuccess: () => {
      toast.success('Church has been created successfully.', {
        style: successToastStyle,
      });
    },
  });
};
