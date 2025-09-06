import { AdminViewCard } from '@/components/cards/usercard/viewcard/admin-view-card';
import { BishopViewCard } from '@/components/cards/usercard/viewcard/bishop-view-card';
import { MemberViewCard } from '@/components/cards/usercard/viewcard/member-view-card';
import { PastorViewCard } from '@/components/cards/usercard/viewcard/pastor-view-card';
import { SuperAdminViewCard } from '@/components/cards/usercard/viewcard/superadmin-view-card';
import { VisitorViewCard } from '@/components/cards/usercard/viewcard/visitor-view-card';
import type { RoleViewProps, UserViewProps } from '@/lib/types/index';
import { StaffViewCard } from './cards/usercard/viewcard/staff-view-card';
import { VolunteerViewCard } from './cards/usercard/viewcard/volunteer-view-card';

export const RenderViewRoleSpecificFields: React.FC<RoleViewProps> = ({
  currentRole,
  user,
}) => {
  switch (currentRole) {
    case 'pastor':
      return <PastorViewCard user={user} />;
    case 'bishop':
      return <BishopViewCard user={user} />;
    case 'admin':
      return <AdminViewCard user={user} />;
    case 'superadmin':
      return <SuperAdminViewCard user={user} />;
    case 'visitor':
      return <VisitorViewCard user={user} />;
    default:
      return null;
  }
};
export const RenderMemberView: React.FC<RoleViewProps> = ({
  user,
  currentRole,
}) => {
  if (user?.isMember || currentRole === 'member') {
    return <MemberViewCard user={user} />;
  }
  return null;
};
export const RenderStaffView: React.FC<UserViewProps> = ({ user }) => {
  if (user?.isStaff) {
    return <StaffViewCard user={user} />;
  }
  return null;
};
export const RenderVolunteerView: React.FC<UserViewProps> = ({ user }) => {
  if (user?.isVolunteer) {
    return <VolunteerViewCard user={user} />;
  }
  return null;
};
