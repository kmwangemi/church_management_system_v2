'use client';

import { useAuthStatus, useLogout } from '@/lib/hooks/auth/use-auth-queries';
import { useQueryClient } from '@tanstack/react-query';

export function useAuth() {
  const { data, isError, isPending, isSuccess, error } = useAuthStatus();
  const logoutMutation = useLogout();
  const queryClient = useQueryClient();
  return {
    user: data?.user ?? null,
    isLoading: isPending,
    isAuthenticated: isSuccess && !!data?.user,
    isError,
    error: error ?? null,
    logout: logoutMutation.mutate,
    checkAuthStatus: () =>
      queryClient.invalidateQueries({ queryKey: ['authStatus'] }),
  };
}
