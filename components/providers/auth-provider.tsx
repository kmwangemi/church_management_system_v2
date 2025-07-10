'use client';

import { AuthUser } from '@/lib/types';
import { useAuth } from '@/lib/use-auth';
import { createContext, ReactNode, useContext } from 'react';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isError: boolean;
  error: Error | null;
  // Methods
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuthProvider() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}

// 8. Loading states and error handling
// components/ProtectedPage.tsx
// 'use client';

// import { useAuthContext } from '@/contexts/AuthContext';
// import { useRouter } from 'next/navigation';
// import { useEffect } from 'react';

// export default function ProtectedPage() {
//   const { user, isLoading, isAuthenticated } = useAuthContext();
//   const router = useRouter();

//   useEffect(() => {
//     if (!isLoading && !isAuthenticated) {
//       router.push('/auth/login');
//     }
//   }, [isLoading, isAuthenticated, router]);

//   if (isLoading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//       </div>
//     );
//   }

//   if (!isAuthenticated) {
//     return null; // Will redirect via useEffect
//   }

//   return (
//     <div className="p-4">
//       <h1 className="text-2xl font-bold">Protected Content</h1>
//       <p>Hello, {user?.role}!</p>
//       <p>Church ID: {user?.churchId}</p>
//       <p>Branch ID: {user?.branchId}</p>
//     </div>
//   );
// }

// // 9. Form submission with auth context
// // components/CreateEventForm.tsx
// 'use client';

// import { useAuthContext } from '@/contexts/AuthContext';
// import { useState } from 'react';

// export default function CreateEventForm() {
//   const { user, isAuthenticated } = useAuthContext();
//   const [eventName, setEventName] = useState('');
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!isAuthenticated || !user) {
//       alert('You must be logged in to create events');
//       return;
//     }

//     setIsSubmitting(true);

//     try {
//       const response = await fetch('/api/events', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           name: eventName,
//           churchId: user.churchId,
//           branchId: user.branchId,
//         }),
//         credentials: 'include',
//       });

//       if (response.ok) {
//         alert('Event created successfully!');
//         setEventName('');
//       } else {
//         alert('Failed to create event');
//       }
//     } catch (error) {
//       console.error('Error creating event:', error);
//       alert('An error occurred');
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   if (!isAuthenticated) {
//     return <div>Please log in to create events</div>;
//   }

//   return (
//     <form onSubmit={handleSubmit} className="p-4">
//       <h2 className="text-xl font-bold mb-4">Create Event</h2>
//       <div className="mb-4">
//         <label className="block text-sm font-medium mb-2">
//           Event Name
//         </label>
//         <input
//           type="text"
//           value={eventName}
//           onChange={(e) => setEventName(e.target.value)}
//           className="w-full p-2 border rounded"
//           required
//         />
//       </div>
//       <button
//         type="submit"
//         disabled={isSubmitting}
//         className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
//       >
//         {isSubmitting ? 'Creating...' : 'Create Event'}
//       </button>
//     </form>
//   );
// }

// // 10. Logout confirmation
// // components/LogoutButton.tsx
// 'use client';

// import { useAuthContext } from '@/contexts/AuthContext';
// import { useState } from 'react';

// export default function LogoutButton() {
//   const { logout } = useAuthContext();
//   const [isLoggingOut, setIsLoggingOut] = useState(false);

//   const handleLogout = async () => {
//     if (confirm('Are you sure you want to logout?')) {
//       setIsLoggingOut(true);
//       await logout();
//       setIsLoggingOut(false);
//     }
//   };

//   return (
//     <button
//       onClick={handleLogout}
//       disabled={isLoggingOut}
//       className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded disabled:opacity-50"
//     >
//       {isLoggingOut ? 'Logging out...' : 'Logout'}
//     </button>
//   );
// }
