import { Badge } from '@/components/ui/badge';

export const getRoleBadge = (role: string) => {
  const roleColors: Record<string, string> = {
    OWNER: 'bg-purple-100 text-purple-800',
    ADMIN: 'bg-red-100 text-red-800',
    STAFF: 'bg-green-100 text-green-800',
    VOLUNTEER: 'bg-orange-100 text-orange-800',
    MEMBER: 'bg-blue-100 text-blue-800',
    VISITOR: 'bg-yellow-100 text-yellow-800',
  };
  return (
    <Badge className={roleColors[role] || 'bg-gray-100 text-gray-800'}>
      {role}
    </Badge>
  );
};

export const getStatusBadge = (status: string) => {
  const statusColors: Record<string, string> = {
    ACTIVE: 'bg-green-100 text-green-800',
    active: 'bg-green-100 text-green-800',
    PENDING: 'bg-yellow-100 text-yellow-800',
    pending: 'bg-yellow-100 text-yellow-800',
    SUSPENDED: 'bg-red-100 text-red-800',
    suspended: 'bg-red-100 text-red-800',
    INACTIVE: 'bg-gray-100 text-gray-800',
    inactive: 'bg-gray-100 text-gray-800',
  };
  return (
    <Badge className={statusColors[status] || 'bg-gray-100 text-gray-800'}>
      {status}
    </Badge>
  );
};
