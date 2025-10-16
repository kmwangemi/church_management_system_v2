import { createAccessControl } from 'better-auth/plugins/access';

// ============================================
// ACCESS CONTROL & PERMISSIONS
// ============================================

const statement = {
  organization: ['update', 'delete', 'view'],
  member: ['create', 'update', 'delete', 'view'],
  invitation: ['create', 'cancel', 'view'],
  branch: ['create', 'update', 'delete', 'view', 'assign_pastor'],
  department: [
    'create',
    'update',
    'delete',
    'view',
    'manage_budget',
    'approve_expense',
  ],
  group: ['create', 'update', 'delete', 'view', 'manage_members'],
  finance: [
    'view',
    'manage_offerings',
    'manage_pledges',
    'view_reports',
    'approve_transactions',
  ],
  event: ['create', 'update', 'delete', 'view', 'manage_attendance'],
  content: ['create', 'update', 'delete', 'view', 'publish'],
  prayer: ['create', 'view', 'manage', 'delete'],
  discipleship: ['view', 'manage', 'assign_mentor'],
  report: ['view', 'generate', 'export'],
  messaging: ['create', 'send', 'view'],
  asset: ['create', 'update', 'delete', 'view', 'manage_maintenance'],
} as const;

const ac = createAccessControl(statement);

// OWNER - Full control
const owner = ac.newRole({
  organization: ['update', 'delete', 'view'],
  member: ['create', 'update', 'delete', 'view'],
  invitation: ['create', 'cancel', 'view'],
  branch: ['create', 'update', 'delete', 'view', 'assign_pastor'],
  department: [
    'create',
    'update',
    'delete',
    'view',
    'manage_budget',
    'approve_expense',
  ],
  group: ['create', 'update', 'delete', 'view', 'manage_members'],
  finance: [
    'view',
    'manage_offerings',
    'manage_pledges',
    'view_reports',
    'approve_transactions',
  ],
  event: ['create', 'update', 'delete', 'view', 'manage_attendance'],
  content: ['create', 'update', 'delete', 'view', 'publish'],
  prayer: ['create', 'view', 'manage', 'delete'],
  discipleship: ['view', 'manage', 'assign_mentor'],
  report: ['view', 'generate', 'export'],
  messaging: ['create', 'send', 'view'],
  asset: ['create', 'update', 'delete', 'view', 'manage_maintenance'],
});

// ADMIN - High-level operations
const admin = ac.newRole({
  organization: ['view', 'update'],
  member: ['create', 'update', 'delete', 'view'],
  invitation: ['create', 'cancel', 'view'],
  branch: ['create', 'update', 'delete', 'view', 'assign_pastor'],
  department: [
    'create',
    'update',
    'delete',
    'view',
    'manage_budget',
    'approve_expense',
  ],
  finance: [
    'view',
    'manage_offerings',
    'manage_pledges',
    'view_reports',
    'approve_transactions',
  ],
  event: ['create', 'update', 'delete', 'view', 'manage_attendance'],
  content: ['create', 'update', 'delete', 'view', 'publish'],
  prayer: ['create', 'view', 'manage', 'delete'],
  discipleship: ['view', 'manage', 'assign_mentor'],
  report: ['view', 'generate', 'export'],
  messaging: ['create', 'send', 'view'],
  asset: ['create', 'update', 'delete', 'view', 'manage_maintenance'],
});

// MEMBER - Basic engagement
const member = ac.newRole({
  member: ['view'],
  branch: ['view'],
  department: ['view'],
  group: ['view', 'create'],
  event: ['view'],
  content: ['view'],
  prayer: ['view', 'create'],
  discipleship: ['view'],
  messaging: ['view'],
});

// STAFF - Operational authority
const staff = ac.newRole({
  organization: ['view'],
  member: ['view', 'create'],
  branch: ['view', 'assign_pastor'],
  department: ['view', 'update'],
  finance: ['view', 'view_reports'],
  event: ['view', 'create', 'update'],
  content: ['view', 'create', 'publish'],
  prayer: ['view', 'manage'],
  discipleship: ['view', 'manage'],
  report: ['view', 'generate'],
  messaging: ['create', 'send'],
  asset: ['view', 'update'],
});

// VOLUNTEER - Participation access
const volunteer = ac.newRole({
  organization: ['view'],
  member: ['view'],
  branch: ['view'],
  department: ['view'],
  group: ['view', 'create'],
  event: ['view', 'manage_attendance'],
  content: ['view', 'create'],
  prayer: ['create', 'view'],
  discipleship: ['view'],
  messaging: ['create'],
  asset: ['view'],
});

// VISITOR - Minimal access
const visitor = ac.newRole({
  organization: ['view'],
  branch: ['view'],
  event: ['view'],
  content: ['view'],
  prayer: ['create'],
});

export { ac, admin, member, owner, staff, statement, visitor, volunteer };

