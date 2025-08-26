import apiClient from '@/lib/api-client';
import type { LoginResponse } from '@/lib/types';
import type { LoginPayload } from '@/lib/validations/auth';
import { useMutation } from '@tanstack/react-query';

const login = async (payload: LoginPayload): Promise<LoginResponse> => {
  const { data } = await apiClient.post('/auth/login/admin', payload);
  return data;
};

const sendLoginCode = async (payload: LoginPayload): Promise<LoginResponse> => {
  const { data } = await apiClient.post(
    '/auth/login/member/send-login-code',
    payload
  );
  return data;
};

const verifyLoginCode = async (
  payload: LoginPayload
): Promise<LoginResponse> => {
  const { data } = await apiClient.post(
    '/auth/login/member/verify-login-code',
    payload
  );
  return data;
};

export const useLogin = () => {
  return useMutation({
    mutationFn: login,
  });
};

export const useSendLoginCode = () => {
  return useMutation({
    mutationFn: sendLoginCode,
  });
};

export const useVerifyLoginCode = () => {
  return useMutation({
    mutationFn: verifyLoginCode,
  });
};
