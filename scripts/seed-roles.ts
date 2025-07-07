import dotenv from 'dotenv';
import mongoose from 'mongoose';
import promptSync from 'prompt-sync';

// Load environment variables FIRST, before any other imports
dotenv.config();

// Also try loading from .env for Next.js compatibility
dotenv.config({ path: '.env' });

import dbConnect from '../lib/mongodb';
import { Permission } from '../models/Permission';
import { Role } from '../models/Role';

// Initialize prompt
const prompt = promptSync({ sigint: true });

// Define all permissions
const permissions = [
  // User Management
  {
    name: 'user:create',
    description: 'Create new users',
    module: 'users',
    action: 'create',
  },
  {
    name: 'user:read',
    description: 'View user information',
    module: 'users',
    action: 'read',
  },
  {
    name: 'user:update',
    description: 'Update user information',
    module: 'users',
    action: 'update',
  },
  {
    name: 'user:delete',
    description: 'Delete users',
    module: 'users',
    action: 'delete',
  },
  {
    name: 'user:manage',
    description: 'Full user management',
    module: 'users',
    action: 'manage',
  },
  // Church Management
  {
    name: 'church:create',
    description: 'Create new churches',
    module: 'churches',
    action: 'create',
  },
  {
    name: 'church:read',
    description: 'View church information',
    module: 'churches',
    action: 'read',
  },
  {
    name: 'church:update',
    description: 'Update church information',
    module: 'churches',
    action: 'update',
  },
  {
    name: 'church:delete',
    description: 'Delete churches',
    module: 'churches',
    action: 'delete',
  },
  {
    name: 'church:manage',
    description: 'Full church management',
    module: 'churches',
    action: 'manage',
  },
  // Member Management
  {
    name: 'member:create',
    description: 'Add new members',
    module: 'members',
    action: 'create',
  },
  {
    name: 'member:read',
    description: 'View member information',
    module: 'members',
    action: 'read',
  },
  {
    name: 'member:update',
    description: 'Update member information',
    module: 'members',
    action: 'update',
  },
  {
    name: 'member:delete',
    description: 'Remove members',
    module: 'members',
    action: 'delete',
  },
  {
    name: 'member:manage',
    description: 'Full member management',
    module: 'members',
    action: 'manage',
  },
  // Branch Management
  {
    name: 'branch:create',
    description: 'Create new branches',
    module: 'branches',
    action: 'create',
  },
  {
    name: 'branch:read',
    description: 'View branch information',
    module: 'branches',
    action: 'read',
  },
  {
    name: 'branch:update',
    description: 'Update branch information',
    module: 'branches',
    action: 'update',
  },
  {
    name: 'branch:delete',
    description: 'Delete branches',
    module: 'branches',
    action: 'delete',
  },
  {
    name: 'branch:manage',
    description: 'Full branch management',
    module: 'branches',
    action: 'manage',
  },
  // Analytics
  {
    name: 'analytics:read',
    description: 'View analytics and reports',
    module: 'analytics',
    action: 'read',
  },
  {
    name: 'analytics:manage',
    description: 'Full analytics access',
    module: 'analytics',
    action: 'manage',
  },
  // Role Management
  {
    name: 'role:create',
    description: 'Create new roles',
    module: 'roles',
    action: 'create',
  },
  {
    name: 'role:read',
    description: 'View role information',
    module: 'roles',
    action: 'read',
  },
  {
    name: 'role:update',
    description: 'Update role information',
    module: 'roles',
    action: 'update',
  },
  {
    name: 'role:delete',
    description: 'Delete roles',
    module: 'roles',
    action: 'delete',
  },
  {
    name: 'role:manage',
    description: 'Full role management',
    module: 'roles',
    action: 'manage',
  },
  // System Settings
  {
    name: 'system:manage',
    description: 'Manage system settings',
    module: 'system',
    action: 'manage',
  },
];

// Validate required environment variables
const validateEnvVars = () => {
  const requiredVars = ['SEEDER_SECURITY_CODE', 'NODE_ENV'];
  const missing = requiredVars.filter(varName => !process.env[varName]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`,
    );
  }
};

// Function to verify security passcode with retry mechanism
const verifySecurityCode = (): boolean => {
  const maxAttempts = 3;
  const expectedCode = process.env.SEEDER_SECURITY_CODE;
  if (!expectedCode) {
    throw new Error(
      'SEEDER_SECURITY_CODE environment variable is not set',
    );
  }
  console.log('🔒 Security verification required for roles seeding...');
  console.log(
    '⚠️  Note: Your input will be visible on screen for security reasons',
  );
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`\nAttempt ${attempt} of ${maxAttempts}`);
      const inputCode = prompt(
        '🔐 Enter security passcode to proceed with roles seeding: ',
      );
      if (!inputCode) {
        console.log('❌ No input provided');
        continue;
      }
      if (inputCode.trim() === expectedCode) {
        console.log('✅ Security code verified successfully!\n');
        return true;
      } else {
        const remainingAttempts = maxAttempts - attempt;
        if (remainingAttempts > 0) {
          console.log(
            `❌ Invalid security code. ${remainingAttempts} attempt(s) remaining.`,
          );
        } else {
          console.log('❌ Invalid security code. Maximum attempts reached.');
        }
      }
    } catch (error) {
      console.error('❌ Script interrupted by user');
      return false;
    }
  }
  return false;
};

// Environment check
const checkEnvironment = () => {
  const env = process.env.NODE_ENV;
  if (env === 'production') {
    console.log('⚠️  WARNING: Running in PRODUCTION environment!');
    console.log(
      '🚨 This will modify production database roles and permissions',
    );
    const confirm = prompt(
      '⚠️  Type "CONFIRM_PRODUCTION" to proceed in production: ',
    );
    if (confirm !== 'CONFIRM_PRODUCTION') {
      console.log('❌ Production confirmation failed. Script terminated.');
      process.exit(1);
    }
  }
  console.log(`🌍 Environment: ${env || 'development'}`);
};

// Additional safety check for destructive operations
const confirmDestructiveOperation = (): boolean => {
  console.log(
    '\n🚨 IMPORTANT: This script will create/update system roles and permissions',
  );
  console.log(
    '📋 This includes roles like: superadmin, admin, pastor, bishop, member, visitor',
  );
  console.log('⚠️  Existing roles with the same names will be updated');
  const confirm = prompt('⚠️  Type "YES" to confirm you want to proceed: ');
  return confirm === 'YES';
};

async function seedPermissions() {
  console.log('🌱 Seeding permissions...');
  const createdPermissions = new Map();
  for (const permissionData of permissions) {
    try {
      const existingPermission = await Permission.findOne({
        name: permissionData.name,
      });
      if (existingPermission) {
        console.log(`📝 Permission ${permissionData.name} already exists`);
        createdPermissions.set(permissionData.name, existingPermission._id);
      } else {
        const permission = new Permission(permissionData);
        await permission.save();
        console.log(`✅ Created permission: ${permissionData.name}`);
        createdPermissions.set(permissionData.name, permission._id);
      }
    } catch (error) {
      console.error(
        `❌ Error creating permission ${permissionData.name}:`,
        error,
      );
    }
  }
  return createdPermissions;
}

async function seedRoles(permissionMap: Map<string, mongoose.Types.ObjectId>) {
  console.log('🌱 Seeding roles...');
  const rolesData = [
    {
      name: 'superadmin',
      code: 'SUPERADMIN',
      description: 'Super Administrator with full system access',
      permissions: Array.from(permissionMap.values()), // All permissions
      isSystemRole: true,
    },
    {
      name: 'admin',
      code: 'ADMIN',
      description: 'Church Administrator with full church management access',
      permissions: [
        permissionMap.get('user:manage'),
        permissionMap.get('member:manage'),
        permissionMap.get('branch:manage'),
        permissionMap.get('analytics:read'),
        permissionMap.get('role:read'),
        permissionMap.get('church:read'),
        permissionMap.get('church:update'),
      ].filter(Boolean),
      isSystemRole: true,
    },
    {
      name: 'pastor',
      code: 'PASTOR',
      description: 'Pastor with member management and analytics access',
      permissions: [
        permissionMap.get('member:manage'),
        permissionMap.get('branch:read'),
        permissionMap.get('analytics:read'),
        permissionMap.get('user:read'),
        permissionMap.get('church:read'),
      ].filter(Boolean),
      isSystemRole: true,
    },
    {
      name: 'bishop',
      code: 'BISHOP',
      description: 'Bishop with extended church oversight',
      permissions: [
        permissionMap.get('member:manage'),
        permissionMap.get('branch:manage'),
        permissionMap.get('analytics:read'),
        permissionMap.get('user:read'),
        permissionMap.get('user:create'),
        permissionMap.get('church:read'),
        permissionMap.get('church:update'),
      ].filter(Boolean),
      isSystemRole: true,
    },
    {
      name: 'member',
      code: 'MEMBER',
      description: 'Regular church member with basic access',
      permissions: [
        permissionMap.get('member:read'),
        permissionMap.get('church:read'),
      ].filter(Boolean),
      isSystemRole: true,
    },
    {
      name: 'visitor',
      code: 'VISITOR',
      description: 'Church visitor with limited access',
      permissions: [permissionMap.get('church:read')].filter(Boolean),
      isSystemRole: true,
    },
  ];
  const createdRoles = new Map();
  for (const roleData of rolesData) {
    try {
      const existingRole = await Role.findOne({
        name: roleData.name,
        isSystemRole: true,
      });
      if (existingRole) {
        console.log(
          `📝 Role ${roleData.name} already exists - updating permissions`,
        );
        // Update permissions and code if needed
        existingRole.permissions =
          roleData.permissions as mongoose.Types.ObjectId[];
        if (roleData.code) {
          existingRole.code = roleData.code;
        }
        await existingRole.save();
        createdRoles.set(roleData.name, existingRole._id);
      } else {
        const role = new Role(roleData);
        await role.save();
        console.log(`✅ Created role: ${roleData.name}`);
        createdRoles.set(roleData.name, role._id);
      }
    } catch (error) {
      console.error(`❌ Error creating role ${roleData.name}:`, error);
    }
  }
  return createdRoles;
}

async function main() {
  try {
    console.log('🚀 Starting protected roles seeding process...');
    // First, validate environment variables
    validateEnvVars();
    // Check environment and show warnings
    checkEnvironment();
    // Verify security passcode before proceeding
    const isSecurityVerified = verifySecurityCode();
    if (!isSecurityVerified) {
      console.error('🚫 Security verification failed. Script terminated.');
      process.exit(1);
    }
    // Additional safety confirmation
    const confirmOperation = confirmDestructiveOperation();
    if (!confirmOperation) {
      console.error('🚫 Operation not confirmed. Script terminated.');
      process.exit(1);
    }
    // Connect to database
    await dbConnect();
    // Check if connection is ready
    if (mongoose.connection.readyState !== 1) {
      throw new Error('Database connection not ready');
    }
    console.log('📡 Connected to MongoDB');
    // Seed permissions first
    const permissionMap = await seedPermissions();
    console.log(`📊 Seeded ${permissionMap.size} permissions`);
    // Seed roles
    const roleMap = await seedRoles(permissionMap);
    console.log(`👥 Seeded ${roleMap.size} roles`);
    console.log('🎉 Roles seeding completed successfully!');
    // Display created roles
    console.log('\n📋 Created/Updated Roles:');
    for (const [roleName, roleId] of roleMap.entries()) {
      console.log(`  - ${roleName}: ${roleId}`);
    }
    console.log(
      '\n⚠️  Important: Make sure to run the superadmin seeding script next if needed',
    );
  } catch (error) {
    console.error('❌ Error seeding roles:', error);
    process.exit(1);
  } finally {
    // Only close if we're running this as a script, not as a module
    if (require.main === module) {
      await mongoose.connection.close();
      console.log('📡 Database connection closed');
    }
  }
}

// Run the seeding if this file is executed directly
if (require.main === module) {
  main();
}

export { seedPermissions, main as seedRoles };
