import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Load environment variables
dotenv.config();

// Import your models (adjust paths as needed)
import dbConnect from '@/lib/mongodb';
import '../models/Role';
import '../models/SuperAdmin';
import '../models/User';

const Role = mongoose.model('Role');
const User = mongoose.model('User');
const SuperAdmin = mongoose.model('SuperAdmin');

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
    const hashedPassword = await bcrypt.hash(superadminData.password, 12);

    // Create superadmin user
    const superadmin = new User({
      email: superadminData.email,
      password: hashedPassword,
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

    await dbConnect();
    await seedSuperAdmin();

    console.log('🎉 Superadmin seeding completed successfully!');
  } catch (error) {
    console.error('❌ Superadmin seeding failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the seeding if this file is executed directly
if (require.main === module) {
  main();
}

export { main as seedSuperAdmin };
