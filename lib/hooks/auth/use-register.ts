import apiClient from '@/lib/api-client';
import type { ChurchFormValues, UserFormValues } from '@/lib/validations/auth';
import { useMutation } from '@tanstack/react-query';

export function useRegister() {
  return useMutation({
    mutationFn: async (payload: {
      churchData: ChurchFormValues['churchData']; // Inner church data
      adminData: UserFormValues['adminData']; // Inner admin data
    }) => {
      const { data } = await apiClient.post('/auth/register', payload, {});
      return data;
    },
  });
}
