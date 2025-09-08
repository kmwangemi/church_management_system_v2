import { Crown, UserCheck, Users } from 'lucide-react';

export const getRoleIcon = (role: string) => {
  switch (role.toLowerCase()) {
    case 'pastor':
    case 'bishop':
      return <Crown className="h-4 w-4" />;
    case 'admin':
      return <UserCheck className="h-4 w-4" />;
    default:
      return <Users className="h-4 w-4" />;
  }
};

export const getRoleBadgeVariant = (role: string) => {
  switch (role.toLowerCase()) {
    case 'pastor':
    case 'bishop':
      return 'default';
    case 'admin':
      return 'secondary';
    case 'volunteer':
      return 'outline';
    default:
      return 'secondary';
  }
};