import dotenv from 'dotenv';
import mongoose from 'mongoose';
import promptSync from 'prompt-sync';

// Load environment variables FIRST, before any other imports
dotenv.config();

// Also try loading from .env for Next.js compatibility
dotenv.config({ path: '.env' });

// Import your models with proper paths
import dbConnect from '@/lib/mongodb';
import { Role } from '@/models/Role';
import SuperAdmin from '@/models/SuperAdmin';
import User from '@/models/User';

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
    throw new Error('SEEDER_SECURITY_CODE environment variable is not set');
  }
  console.log('🔒 Security verification required before proceeding...');
  console.log(
    '⚠️  Note: Your input will be visible on screen for security reasons',
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

async function findSuperadminRole() {
  console.log('🔍 Looking for superadmin role...');
  // Try different ways to find the superadmin role
  let superadminRole = await Role.findOne({ code: 'SUPERADMIN' });
  if (!superadminRole) {
    superadminRole = await Role.findOne({ name: 'superadmin' });
  }
  if (!superadminRole) {
    superadminRole = await Role.findOne({
      name: { $regex: /superadmin/i },
    });
  }
  if (!superadminRole) {
    throw new Error(
      '❌ Superadmin role not found. Please run your roles seeding script first.',
    );
  }
  console.log(`✅ Found superadmin role: ${superadminRole.name}`);
  return superadminRole;
}

async function seedSuperAdmin() {
  console.log('🌱 Seeding superadmin user...');
  try {
    // Find the superadmin role
    const superadminRole = await findSuperadminRole();
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
    // Hash the password
    // const hashedPassword = await bcrypt.hash(superadminData.password, 12);
    // Create superadmin user
    const superadmin = new User({
      email: superadminData.email,
      password: superadminData.password,
      firstName: superadminData.firstName,
      lastName: superadminData.lastName,
      phoneNumber: superadminData.phoneNumber,
      role: superadminRole._id,
      // Note: churchId and branchId are intentionally omitted for superadmin
      agreeToTerms: true,
      isActive: true,
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
