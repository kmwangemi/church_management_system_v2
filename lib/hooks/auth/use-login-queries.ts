import { useMutation } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type { LoginResponse } from '@/lib/types';
import type { LoginPayload } from '@/lib/validations/auth';

const login = async (payload: LoginPayload): Promise<LoginResponse> => {
  const { data } = await apiClient.post('/auth/login', payload);
  return data;
};

export const useLogin = () => {
  return useMutation({
    mutationFn: login,
  });
};
