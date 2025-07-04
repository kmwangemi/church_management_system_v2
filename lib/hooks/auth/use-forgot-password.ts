import apiClient from '@/lib/api-client';
import type { ForgotPasswordFormValues } from '@/lib/validations/auth';
import { useMutation } from '@tanstack/react-query';

export function useForgotPassword() {
  return useMutation({
    mutationFn: async (payload: ForgotPasswordFormValues) => {
      const { data } = await apiClient.post('/auth/forgot-password', payload, {});
      return data;
    },
  });
}
