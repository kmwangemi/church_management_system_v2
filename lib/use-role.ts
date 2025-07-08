'use client';

import { useAuthProvider } from '@/components/providers/auth-provider';

export function useRole() {
  const { user, isAuthenticated } = useAuthProvider();
  const hasRole = (role: string | string[]) => {
    if (!isAuthenticated || !user) return false;
    if (Array.isArray(role)) {
      return role.includes(user.role);
    }
    return user.role === role;
  };
  const hasAnyRole = (roles: string[]) => {
    if (!isAuthenticated || !user) return false;
    return roles.includes(user.role);
  };
  const hasAllRoles = (roles: string[]) => {
    if (!isAuthenticated || !user) return false;
    return roles.every(role => user.role === role);
  };
  return {
    hasRole,
    hasAnyRole,
    hasAllRoles,
    userRole: user?.role,
    isSuperAdmin: user?.role === 'superadmin',
    isAdmin: user?.role === 'admin' || user?.role === 'superadmin',
    isMember: user?.role === 'member',
  };
}


// 7. Using the role hook
// components/RoleBasedContent.tsx
// 'use client';

// import { useRole } from '@/hooks/use-role';

// export default function RoleBasedContent() {
//   const { isSuperAdmin, isAdmin, hasRole } = useRole();
  
//   return (
//     <div className="p-4">
//       <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
      
//       {isSuperAdmin && (
//         <div className="bg-red-100 p-4 mb-4 rounded">
//           <h3 className="font-bold">Super Admin Section</h3>
//           <p>Only super admins can see this</p>
//         </div>
//       )}
      
//       {isAdmin && (
//         <div className="bg-blue-100 p-4 mb-4 rounded">
//           <h3 className="font-bold">Admin Section</h3>
//           <p>Admins and super admins can see this</p>
//         </div>
//       )}
      
//       {hasRole(['member', 'admin', 'superadmin']) && (
//         <div className="bg-green-100 p-4 mb-4 rounded">
//           <h3 className="font-bold">Member Section</h3>
//           <p>All authenticated users can see this</p>
//         </div>
//       )}
//     </div>
//   );
// }
