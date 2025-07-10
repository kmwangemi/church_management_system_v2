import apiClient from '@/lib/api-client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

// -------------
// Check auth status
// -------------

export interface VerifyResponse {
  user: {
    sub: string;
    firstName: string;
    lastName: string;
    email: string;
    profilePictureUrl: string;
    churchId: string;
    branchId: string;
    role: string;
    fullName: string;
  };
}

const checkAuthStatus = async (): Promise<VerifyResponse> => {
  const { data } = await apiClient.get('/auth/verify');
  return data;
};

export const useAuthStatus = () => {
  return useQuery({
    queryKey: ['authStatus'],
    queryFn: checkAuthStatus,
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
      queryClient.invalidateQueries({ queryKey: ['authStatus'] });
      router.push('/auth/login');
    },
    onError: error => {
      console.error('Logout failed:', error);
    },
  });
};
