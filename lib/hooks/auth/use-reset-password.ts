import apiClient from '@/lib/api-client';
import type { ResetPasswordFormValues } from '@/lib/validations/auth';
import { useMutation } from '@tanstack/react-query';

export function useResetPassword() {
  return useMutation({
    mutationFn: async (payload: ResetPasswordFormValues) => {
      const { data } = await apiClient.post(
        '/auth/reset-password',
        payload,
        {},
      );
      return data;
    },
  });
}
