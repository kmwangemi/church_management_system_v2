/** biome-ignore-all lint/suspicious/noConsole: ignore consoles */
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import promptSync from 'prompt-sync';

// Load environment variables FIRST, before any other imports
dotenv.config();

// Also try loading from .env for Next.js compatibility
dotenv.config({ path: '.env' });

// Import your models with proper paths
import dbConnect from '@/lib/mongodb';
import SuperAdmin from '@/models/superadmin';
import User from '@/models/user';

// Initialize prompt
const prompt = promptSync({ sigint: true });

interface SuperadminData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  superAdminId: string;
  companyInfo?: {
    position?: string;
    department?: string;
    startDate?: Date;
  };
}

// Validate required environment variables
const validateEnvVars = () => {
  const requiredVars = [
    'SUPERADMIN_EMAIL',
    'SUPERADMIN_PASSWORD',
    'SEEDER_SECURITY_CODE',
  ];
  const missing = requiredVars.filter((varName) => !process.env[varName]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }
};

// Function to verify security passcode with retry mechanism
const verifySecurityCode = (): boolean => {
  const maxAttempts = 3;
  const expectedCode = process.env.SEEDER_SECURITY_CODE;
  if (!expectedCode) {
    throw new Error('SEEDER_SECURITY_CODE environment variable is not set');
  }
  console.log('🔒 Security verification required before proceeding...');
  console.log(
    '⚠️  Note: Your input will be visible on screen for security reasons'
  );
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`\nAttempt ${attempt} of ${maxAttempts}`);
      const inputCode = prompt('🔐 Enter security passcode to proceed: ');
      if (!inputCode) {
        console.log('❌ No input provided');
        continue;
      }
      if (inputCode.trim() === expectedCode) {
        console.log('✅ Security code verified successfully!\n');
        return true;
      }
      const remainingAttempts = maxAttempts - attempt;
      if (remainingAttempts > 0) {
        console.log(
          `❌ Invalid security code. ${remainingAttempts} attempt(s) remaining.`
        );
      } else {
        console.log('❌ Invalid security code. Maximum attempts reached.');
      }
    } catch (_error) {
      console.error('❌ Script interrupted by user');
      return false;
    }
  }
  return false;
};

const superadminData: SuperadminData = {
  email: process.env.SUPERADMIN_EMAIL || 'superadmin@example.com',
  password: process.env.SUPERADMIN_PASSWORD || 'SuperAdmin123!',
  firstName: process.env.SUPERADMIN_FIRST_NAME || 'Super',
  lastName: process.env.SUPERADMIN_LAST_NAME || 'Admin',
  phoneNumber: process.env.SUPERADMIN_PHONE || '+1234567890',
  superAdminId: process.env.SUPERADMIN_ID || 'SA001',
  companyInfo: {
    position: process.env.SUPERADMIN_POSITION || 'System Administrator',
    department: process.env.SUPERADMIN_DEPARTMENT || 'IT',
    startDate: new Date(),
  },
};

async function createSystemUser() {
  console.log('🔍 Looking for system user for createdBy field...');
  // Try to find an existing system user or create one
  let systemUser = await User.findOne({
    email: 'system@internal.local',
    role: 'superadmin',
  });
  if (systemUser) {
    console.log('✅ System user already exists');
  } else {
    console.log('🔧 Creating system user for createdBy references...');
    systemUser = new User({
      email: 'system@internal.local',
      password: 'SystemUser123!', // This will be hashed automatically
      firstName: 'System',
      lastName: 'User',
      phoneNumber: '+0000000000',
      role: 'superadmin',
      // churchId and branchId are optional for superadmin
      agreeToTerms: true,
      isActive: true,
      isSuspended: false,
      isDeleted: false,
      createdBy: null, // Will be set after creation
    });
    // Save without createdBy first
    await systemUser.save();
    // Update createdBy to reference itself
    systemUser.createdBy = systemUser._id;
    await systemUser.save();
    console.log('✅ System user created successfully');
  }
  return systemUser;
}

async function seedSuperAdmin() {
  console.log('🌱 Seeding superadmin user...');
  try {
    // First, ensure we have a system user for createdBy
    const systemUser = await createSystemUser();
    // Check if superadmin user already exists
    const existingUser = await User.findOne({ email: superadminData.email });
    if (existingUser) {
      console.log('⚠️  Superadmin user already exists');
      console.log(`📧 Email: ${superadminData.email}`);
      // Check if SuperAdmin record exists for this user
      const existingSuperAdmin = await SuperAdmin.findOne({
        userId: existingUser._id,
      });
      if (existingSuperAdmin) {
        console.log('⚠️  SuperAdmin record already exists');
        return;
      }
      // Create SuperAdmin record if it doesn't exist
      console.log('🔧 Creating SuperAdmin record for existing user...');
      const superAdminRecord = new SuperAdmin({
        userId: existingUser._id,
        superAdminId: superadminData.superAdminId,
        companyInfo: superadminData.companyInfo,
      });
      await superAdminRecord.save();
      console.log('✅ SuperAdmin record created successfully');
      return;
    }
    // Create superadmin user with new model structure
    const superadmin = new User({
      email: superadminData.email,
      password: superadminData.password, // Will be hashed automatically by pre-save middleware
      firstName: superadminData.firstName,
      lastName: superadminData.lastName,
      phoneNumber: superadminData.phoneNumber,
      role: 'superadmin', // Direct string value instead of ObjectId reference
      // churchId and branchId are intentionally omitted for superadmin (optional)
      createdBy: systemUser._id, // Reference to system user
      agreeToTerms: true,
      isActive: true,
      isSuspended: false,
      isDeleted: false,
      // Rate limiting fields will be set to default values
      loginAttempts: 0,
      // lockUntil is optional and will be undefined initially
    });
    await superadmin.save();
    console.log('✅ Successfully created superadmin user');
    // Create SuperAdmin record
    const superAdminRecord = new SuperAdmin({
      userId: superadmin._id,
      superAdminId: superadminData.superAdminId,
      companyInfo: superadminData.companyInfo,
    });
    await superAdminRecord.save();
    console.log('✅ Successfully created SuperAdmin record');
    console.log(`📧 Email: ${superadminData.email}`);
    console.log(`🔑 Password: ${superadminData.password}`);
    console.log(`🆔 SuperAdmin ID: ${superadminData.superAdminId}`);
    console.log(`👤 Created By: ${systemUser.email}`);
    console.log('⚠️  Please change the default password after first login');
  } catch (error) {
    console.error('❌ Failed to create superadmin user:', error);
    throw error;
  }
}

async function main() {
  try {
    console.log('🚀 Starting superadmin seeding...');
    // First, validate environment variables
    validateEnvVars();
    // Verify security passcode before proceeding
    const isSecurityVerified = verifySecurityCode();
    if (!isSecurityVerified) {
      console.error('🚫 Security verification failed. Script terminated.');
      process.exit(1);
    }
    // Ensure database connection
    await dbConnect();
    // Check if connection is ready
    if (mongoose.connection.readyState !== 1) {
      throw new Error('Database connection not ready');
    }
    await seedSuperAdmin();
    console.log('🎉 Superadmin seeding completed successfully!');
  } catch (error) {
    console.error('❌ Superadmin seeding failed:', error);
    process.exit(1);
  } finally {
    // Only close if we're running this as a script, not as a module
    if (require.main === module) {
      await mongoose.connection.close();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run the seeding if this file is executed directly
if (require.main === module) {
  main();
}

export { main as seedSuperAdmin };
