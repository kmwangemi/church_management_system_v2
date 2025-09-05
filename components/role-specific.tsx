import { AdminDetailsCard } from '@/components/cards/admin-details-card';
import { BishopDetailsCard } from '@/components/cards/bishop-details-card';
import { MemberDetailsCard } from '@/components/cards/member-details-card';
import { PastorDetailsCard } from '@/components/cards/pastor-details-card';
import { StaffDetailsCard } from '@/components/cards/staff-details-card';
import { SuperAdminDetailsCard } from '@/components/cards/superadmin-details-card';
import { VisitorDetailsCard } from '@/components/cards/visitor-details-card';
import { VolunteerDetailsCard } from '@/components/cards/volunteer-details-card';
import type {
  RestSpecificFormProps,
  RoleSpecificFormProps,
  StaffDetailsFormProps,
} from '@/lib/types/index';

export const RenderRoleSpecificFields: React.FC<RoleSpecificFormProps> = ({
  currentRole,
  form,
}) => {
  switch (currentRole) {
    case 'pastor':
      return <PastorDetailsCard form={form} />;
    case 'bishop':
      return <BishopDetailsCard form={form} />;
    case 'admin':
      return <AdminDetailsCard form={form} />;
    case 'superadmin':
      return <SuperAdminDetailsCard form={form} />;
    case 'visitor':
      return <VisitorDetailsCard form={form} />;
    default:
      return null;
  }
};
export const RenderMemberDetails: React.FC<RestSpecificFormProps> = ({
  user,
  currentRole,
  form,
}) => {
  if (user?.isMember || currentRole === 'member') {
    return <MemberDetailsCard form={form} />;
  }
  return null;
};
export const RenderStaffDetails: React.FC<StaffDetailsFormProps> = ({
  user,
  form,
}) => {
  if (user?.isStaff || form.watch('isStaff') === true) {
    return <StaffDetailsCard form={form} />;
  }
  return null;
};
export const RenderVolunteerDetails: React.FC<StaffDetailsFormProps> = ({
  user,
  form,
}) => {
  if (user?.isVolunteer || form.watch('isVolunteer') === true) {
    return <VolunteerDetailsCard form={form} />;
  }
  return null;
};
