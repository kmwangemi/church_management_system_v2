import bcrypt from 'bcryptjs';
import mongoose, { type Document, Schema } from 'mongoose';
import './Role';

export interface IUser extends Document {
  churchId?: mongoose.Types.ObjectId; // Optional for superadmin
  branchId?: mongoose.Types.ObjectId; // Optional for superadmin
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: mongoose.Types.ObjectId;
  phoneNumber: string;
  profilePictureUrl?: string;
  agreeToTerms: boolean;
  isActive: boolean;
  lastLogin?: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  // Common fields moved from other models
  dateOfBirth?: Date;
  gender?: 'male' | 'female';
  maritalStatus?: 'single' | 'married' | 'divorced' | 'widowed';
  address?: string;
  country?: string;
  emergencyContact?: {
    fullName?: string;
    relationship?: string;
    phoneNumber?: string;
  };
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema(
  {
    churchId: {
      type: Schema.Types.ObjectId,
      ref: 'Church',
      required: false, // Handle validation in application layer
    },
    branchId: {
      type: Schema.Types.ObjectId,
      ref: 'Branch',
      required: false, // Handle validation in application layer
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: { type: String, required: true, trim: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    role: {
      type: Schema.Types.ObjectId,
      ref: 'Role',
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    profilePictureUrl: { type: String, default: null },
    agreeToTerms: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    // Common fields moved from other models
    dateOfBirth: { type: Date },
    gender: {
      type: String,
      enum: ['male', 'female'],
      trim: true,
      lowercase: true,
    },
    maritalStatus: {
      type: String,
      enum: ['single', 'married', 'divorced', 'widowed'],
      trim: true,
      lowercase: true,
    },
    address: { type: String, trim: true },
    country: { type: String, trim: true },
    emergencyContact: {
      fullName: { type: String, trim: true },
      relationship: { type: String, trim: true },
      phoneNumber: { type: String, trim: true },
    },
    notes: { type: String, trim: true },
  },
  {
    timestamps: true,
  },
);

// Pre-save middleware for password hashing
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Pre-save middleware for conditional validation
UserSchema.pre('save', async function (next) {
  try {
    // Populate the role to check if it's superadmin
    const populatedUser = await this.populate('role');
    const userRole = populatedUser.role as any; // Type assertion needed
    // Check if role is superadmin (adjust the condition based on your role structure)
    const isSuperAdmin =
      userRole.name === 'superadmin' || userRole.code === 'SUPERADMIN';
    if (!isSuperAdmin) {
      // If not superadmin, churchId and branchId are required
      if (!this.churchId) {
        throw new Error('churchId is required for non-superadmin users');
      }
      if (!this.branchId) {
        throw new Error('branchId is required for non-superadmin users');
      }
    }
    next();
  } catch (error) {
    next(error);
  }
});

UserSchema.methods.comparePassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.models.User ||
  mongoose.model<IUser>('User', UserSchema);
