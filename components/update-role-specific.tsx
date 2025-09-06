import { AdminUpdateCard } from '@/components/cards/usercard/updatecard/admin-update-card';
import { BishopUpdateCard } from '@/components/cards/usercard/updatecard/bishop-update-card';
import { MemberUpdateCard } from '@/components/cards/usercard/updatecard/member-update-card';
import { PastorUpdateCard } from '@/components/cards/usercard/updatecard/pastor-update-card';
import { StaffUpdateCard } from '@/components/cards/usercard/updatecard/staff-update-card';
import { SuperAdminUpdateCard } from '@/components/cards/usercard/updatecard/superadmin-update-card';
import { VisitorUpdateCard } from '@/components/cards/usercard/updatecard/visitor-update-card';
import { VolunteerUpdateCard } from '@/components/cards/usercard/updatecard/volunteer-update-card';
import type {
  RestSpecificFormProps,
  RoleSpecificFormProps,
  StaffUpdateFormProps,
} from '@/lib/types/index';

export const RenderUpdateRoleSpecificFields: React.FC<RoleSpecificFormProps> = ({
  currentRole,
  form,
}) => {
  switch (currentRole) {
    case 'pastor':
      return <PastorUpdateCard form={form} />;
    case 'bishop':
      return <BishopUpdateCard form={form} />;
    case 'admin':
      return <AdminUpdateCard form={form} />;
    case 'superadmin':
      return <SuperAdminUpdateCard form={form} />;
    case 'visitor':
      return <VisitorUpdateCard form={form} />;
    default:
      return null;
  }
};
export const RenderMemberUpdate: React.FC<RestSpecificFormProps> = ({
  user,
  currentRole,
  form,
}) => {
  if (user?.isMember || currentRole === 'member') {
    return <MemberUpdateCard form={form} />;
  }
  return null;
};
export const RenderStaffUpdate: React.FC<StaffUpdateFormProps> = ({
  user,
  form,
}) => {
  if (user?.isStaff || form.watch('isStaff') === true) {
    return <StaffUpdateCard form={form} />;
  }
  return null;
};
export const RenderVolunteerUpdate: React.FC<StaffUpdateFormProps> = ({
  user,
  form,
}) => {
  if (user?.isVolunteer || form.watch('isVolunteer') === true) {
    return <VolunteerUpdateCard form={form} />;
  }
  return null;
};
