import apiClient from '@/lib/api-client';
import type { LoginFormValues } from '@/lib/validations/auth';
import { useMutation } from '@tanstack/react-query';

export function useLogin() {
  return useMutation({
    mutationFn: async (payload: LoginFormValues) => {
      const { data } = await apiClient.post('/auth/login', payload, {});
      return data;
    },
  });
}
