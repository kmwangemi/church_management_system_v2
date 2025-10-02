import { createAccessControl } from 'better-auth/plugins/access';

/**
 * make sure to use `as const` so typescript can infer the type correctly
 */

// ============================================
// ACCESS CONTROL & PERMISSIONS
// ============================================

const statement = {
  // Organization (Church) permissions
  organization: ['update', 'delete', 'view'],
  // Member management
  member: ['create', 'update', 'delete', 'view'],
  // Invitation management
  invitation: ['create', 'cancel', 'view'],
  // Branch management
  branch: ['create', 'update', 'delete', 'view', 'assign_pastor'],
  // Department management
  department: [
    'create',
    'update',
    'delete',
    'view',
    'manage_budget',
    'approve_expense',
  ],
  // Group management (Small groups)
  group: ['create', 'update', 'delete', 'view', 'manage_members'],
  // Financial permissions
  finance: [
    'view',
    'manage_offerings',
    'manage_pledges',
    'view_reports',
    'approve_transactions',
  ],
  // Event management
  event: ['create', 'update', 'delete', 'view', 'manage_attendance'],
  // Content management (Sermons, media, etc.)
  content: ['create', 'update', 'delete', 'view', 'publish'],
  // Prayer requests
  prayer: ['create', 'view', 'manage', 'delete'],
  // Discipleship
  discipleship: ['view', 'manage', 'assign_mentor'],
  // Reports
  report: ['view', 'generate', 'export'],
  // Messaging
  messaging: ['create', 'send', 'view'],
  // Asset management
  asset: ['create', 'update', 'delete', 'view', 'manage_maintenance'],
} as const;

const ac = createAccessControl(statement);

// OWNER - Church creator, full control
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

const member = ac.newRole({
  member: ['view'],
  branch: ['view'],
  department: ['view'],
  group: ['view', 'create'], // Can create small groups
  event: ['view'],
  content: ['view'],
  prayer: ['view', 'create'],
  discipleship: ['view'],
  messaging: ['view'],
});

const bishop = ac.newRole({
  organization: ['view'],
  member: ['view', 'create'],
  branch: ['view', 'assign_pastor'],
  department: ['view'],
  group: ['view'],
  finance: ['view', 'view_reports'],
  event: ['view', 'create'],
  content: ['view', 'create', 'publish'],
  prayer: ['view', 'manage'],
  discipleship: ['view', 'manage'],
  report: ['view', 'generate'],
  messaging: ['create', 'send'],
  asset: ['view'],
});

const pastor = ac.newRole({
  organization: ['view'],
  member: ['view', 'create'],
  branch: ['view', 'update'],
  department: ['view', 'create', 'update'],
  group: ['view', 'create', 'manage_members'],
  finance: ['view'],
  event: ['create', 'update', 'delete', 'view', 'manage_attendance'],
  content: ['create', 'update', 'delete', 'view', 'publish'],
  prayer: ['create', 'view', 'manage', 'delete'],
  discipleship: ['view', 'manage', 'assign_mentor'],
  report: ['view', 'generate'],
  messaging: ['create', 'send'],
  asset: ['view', 'update'],
});

const visitor = ac.newRole({
  organization: ['view'],
  event: ['view'],
  content: ['view'],
  prayer: ['create'],
});

export { ac, admin, bishop, member, owner, pastor, statement, visitor };
