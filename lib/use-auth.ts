'use client';

import { useAuthStatus, useLogout } from '@/lib/hooks/auth/use-auth';
import { useQueryClient } from '@tanstack/react-query';

export function useAuth() {
  const { data, isError, isPending, isSuccess, error } = useAuthStatus();
  const logoutMutation = useLogout();
  const queryClient = useQueryClient();
  return {
    user: data?.user ?? null,
    isLoading: isPending,
    // isAuthenticated: !!data?.user,
    isAuthenticated: isSuccess,
    isError,
    error: error ?? null,
    logout: logoutMutation.mutate,
    checkAuthStatus: () =>
      queryClient.invalidateQueries({ queryKey: ['authStatus'] }),
  };
}
