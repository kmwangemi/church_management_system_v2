'use client';

import { authClient } from '@/lib/auth-client';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

// ============================================
// LOADING SPINNER COMPONENT
// ============================================

function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  };
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="flex flex-col items-center space-y-4">
        {/* Spinner */}
        <div
          className={`${sizeClasses[size]} animate-spin rounded-full border-4 border-gray-300 border-t-blue-600`}
        />
        {/* Loading text */}
        <div className="space-y-2 text-center">
          <p className="font-semibold text-gray-700 text-lg dark:text-gray-200">
            Loading your session...
          </p>
          <p className="text-gray-500 text-sm dark:text-gray-400">
            Please wait while we authenticate you
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================
// SESSION LOADER WITH AUTHENTICATION
// ============================================

interface SessionLoaderProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
  allowedRoles?: string[];
}

export function SessionLoader({
  children,
  fallback,
  requireAuth = true,
  redirectTo = '/sign-in',
  allowedRoles,
}: SessionLoaderProps) {
  const { data: session, isPending, error } = authClient.useSession();
  const router = useRouter();
  const pathname = usePathname();
  useEffect(() => {
    if (!isPending && requireAuth && !session) {
      // Redirect to sign-in if authentication is required but user is not authenticated
      const callbackUrl = encodeURIComponent(pathname);
      router.push(`${redirectTo}?callbackUrl=${callbackUrl}`);
    }
  }, [isPending, session, requireAuth, router, redirectTo, pathname]);
  useEffect(() => {
    if (!isPending && session && allowedRoles && allowedRoles.length > 0) {
      // Check if user has the required role
      const userRole = session.user?.role;
      if (userRole && !allowedRoles.includes(userRole)) {
        router.push('/unauthorized');
      }
    }
  }, [isPending, session, allowedRoles, router]);
  // Show loading state
  if (isPending) {
    return fallback || <LoadingSpinner />;
  }
  // Show error state
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="space-y-4 text-center">
          <div className="text-6xl text-red-600">⚠️</div>
          <h2 className="font-bold text-2xl text-gray-800 dark:text-gray-200">
            Authentication Error
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {error.message || 'Failed to load session'}
          </p>
          <button
            className="rounded-lg bg-blue-600 px-6 py-2 text-white transition hover:bg-blue-700"
            onClick={() => router.push('/auth/login')}
            type="button"
          >
            Go to Sign In
          </button>
        </div>
      </div>
    );
  }
  // If authentication is required but no session exists, don't render children
  if (requireAuth && !session) {
    return null;
  }
  // Render children when session is ready
  return <>{children}</>;
}

// ============================================
// SKELETON LOADER (Alternative)
// ============================================

export function SkeletonLoader() {
  return (
    <div className="min-h-screen bg-gray-50 p-6 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header Skeleton */}
        <div className="h-16 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" />
        {/* Content Skeleton */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="h-32 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" />
          <div className="h-32 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" />
          <div className="h-32 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" />
        </div>
        {/* Table Skeleton */}
        <div className="space-y-3">
          <div className="h-12 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" />
          <div className="h-12 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" />
          <div className="h-12 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" />
          <div className="h-12 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" />
        </div>
      </div>
    </div>
  );
}

// ============================================
// HOC for Page-Level Protection
// ============================================

export function withSessionLoader<P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    requireAuth?: boolean;
    allowedRoles?: string[];
    fallback?: React.ReactNode;
  }
) {
  return function SessionProtectedComponent(props: P) {
    return (
      <SessionLoader
        allowedRoles={options?.allowedRoles}
        fallback={options?.fallback}
        requireAuth={options?.requireAuth}
      >
        <Component {...props} />
      </SessionLoader>
    );
  };
}

// ============================================
// 3. USAGE IN ROOT LAYOUT (app/layout.tsx)
// ============================================

// import { SessionLoader } from '@/components/session-loader';
// import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <html lang="en">
//       <body>
//         <QueryClientProvider client={queryClient}>
//           <SessionLoader requireAuth={false}>
//             {children}
//           </SessionLoader>
//         </QueryClientProvider>
//       </body>
//     </html>
//   );
// }

// ============================================
// 4. USAGE IN PROTECTED PAGES
// ============================================

// Option A: Using SessionLoader Component
// 'use client';

// import { SessionLoader } from '@/components/session-loader';

// export default function DashboardPage() {
//   return (
//     <SessionLoader requireAuth={true} allowedRoles={['ADMIN', 'OWNER']}>
//       <div>
//         <h1>Dashboard</h1>
//         {/* Your protected content */}
//       </div>
//     </SessionLoader>
//   );
// }

// Option B: Using withSessionLoader HOC
// 'use client';

// import { withSessionLoader } from '@/components/session-loader';

// function DashboardPage() {
//   return (
//     <div>
//       <h1>Dashboard</h1>
//       {/* Your protected content */}
//     </div>
//   );
// }

// export default withSessionLoader(DashboardPage, {
//   requireAuth: true,
//   allowedRoles: ['ADMIN', 'OWNER'],
// });

// Option C: Simple Loading State Only
// 'use client';

// import { SimpleSessionLoader } from '@/components/session-loader';

// export default function ProfilePage() {
//   return (
//     <SimpleSessionLoader>
//       <div>
//         <h1>Profile</h1>
//         {/* Your content */}
//       </div>
//     </SimpleSessionLoader>
//   );
// }
