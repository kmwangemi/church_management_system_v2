'use client';

import { useAuthContext } from '@/contexts/auth-context';
import type { ReactNode } from 'react';

interface AppInitializerProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function AppInitializer({ children, fallback }: AppInitializerProps) {
  const { isInitialized, isLoading } = useAuthContext();
  // Show loading state until auth is initialized
  if (!isInitialized || isLoading) {
    return (
      fallback || (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-blue-600 border-b-2" />
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      )
    );
  }
  return <>{children}</>;
}
