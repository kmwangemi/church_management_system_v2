// types/auth.ts
import type { auth } from '@/lib/auth';
import type { inferOrgAdditionalFields } from 'better-auth/plugins/organization';

// Infer additional organization fields
export type OrganizationFields = inferOrgAdditionalFields<typeof auth>;

// Export church-specific types
export type Church = OrganizationFields['organization'];
export type ChurchMember = OrganizationFields['member'];
export type ChurchInvitation = OrganizationFields['invitation'];

// Role types for your church system
export type ChurchRole =
  | 'owner'
  | 'admin'
  | 'bishop'
  | 'pastor'
  | 'member'
  | 'visitor';

// Permission resources
export type PermissionResource =
  | 'organization'
  | 'member'
  | 'invitation'
  | 'branch'
  | 'department'
  | 'group'
  | 'finance'
  | 'event'
  | 'content'
  | 'prayer'
  | 'discipleship'
  | 'report'
  | 'messaging'
  | 'asset';

// Permission actions
export type PermissionAction =
  | 'create'
  | 'view'
  | 'update'
  | 'delete'
  | 'manage'
  | 'approve_expense'
  | 'manage_budget'
  | 'assign_pastor'
  | 'manage_members'
  | 'publish'
  | 'send'
  | 'generate'
  | 'export'
  | 'assign_mentor'
  | 'manage_offerings'
  | 'manage_pledges'
  | 'view_reports'
  | 'approve_transactions'
  | 'manage_attendance'
  | 'manage_maintenance';

// Helper type for checking permissions
export type Permission = `${PermissionResource}:${PermissionAction | '*'}`;

// Example usage in components
export interface ChurchContextType {
  church: Church | null;
  member: ChurchMember | null;
  hasPermission: (permission: Permission) => boolean;
  isOwner: boolean;
  isAdmin: boolean;
  isPastor: boolean;
  isBishop: boolean;
  isMember: boolean;
}