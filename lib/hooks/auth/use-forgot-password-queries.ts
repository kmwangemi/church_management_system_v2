import apiClient from '@/lib/api-client';
import type { ForgotPasswordPayload } from '@/lib/validations/auth';
import { useMutation } from '@tanstack/react-query';

export function useForgotPassword() {
  return useMutation({
    mutationFn: async (payload: ForgotPasswordPayload) => {
      const { data } = await apiClient.post('/auth/forgot-password', payload, {});
      return data;
    },
  });
}
