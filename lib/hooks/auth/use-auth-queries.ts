import apiClient from '@/lib/api-client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

// -------------
// Types
// -------------

export interface AuthUser {
  sub: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePictureUrl: string;
  churchId: string;
  branchId: string;
  role: string;
  fullName: string;
}

export interface VerifyResponse {
  user: AuthUser;
}

// -------------
// Check auth status
// -------------

const checkAuthStatus = async (): Promise<VerifyResponse> => {
  const { data } = await apiClient.get('/auth/verify');
  return data;
};

export const useAuthStatus = () => {
  return useQuery({
    queryKey: ['authStatus'],
    queryFn: checkAuthStatus,
    retry: false, // Don't retry auth checks
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    refetchOnWindowFocus: false,
    refetchOnMount: true, // Always refetch on mount
    refetchOnReconnect: true,
  });
};

// -------------
// Logout
// -------------

const logoutRequest = async (): Promise<void> => {
  await apiClient.post('/auth/logout');
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: logoutRequest,
    onSuccess: () => {
      queryClient.clear(); // Clear all queries
      router.push('/auth/login');
    },
    onError: error => {
      console.error('Logout failed:', error);
      // Still redirect on error as the intent is to logout
      queryClient.clear();
      router.push('/auth/login');
    },
  });
};
