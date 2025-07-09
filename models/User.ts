import '@/models/Role';
import bcrypt from 'bcryptjs';
import mongoose, { Schema, type CallbackError, type Document } from 'mongoose';

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
  isSuspended: boolean;
  isDeleted: boolean;
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
    },
    branchId: {
      type: Schema.Types.ObjectId,
      ref: 'Branch',
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
    isSuspended: { type: Boolean, required: true, default: false },
    isDeleted: { type: Boolean, required: true, default: false },
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
    const isAdmin = userRole.name === 'admin' || userRole.code === 'ADMIN';
    // Validate churchId and branchId based on user role
    if (isSuperAdmin) {
      // superadmin: churchId and branchId are not required
      return next();
    }
    if (isAdmin) {
      // admin: churchId required, branchId not required
      if (!this.churchId) {
        return next(new Error('churchId is required for admin users'));
      }
      return next();
    }
    // all other roles: both churchId and branchId required
    if (!this.churchId) {
      return next(new Error('churchId is required for this role'));
    }
    if (!this.branchId) {
      return next(new Error('branchId is required for this role'));
    }
    next();
  } catch (error) {
    // Type guard to ensure error is properly typed
    const callbackError =
      error instanceof Error ? error : new Error(String(error));
    next(callbackError as CallbackError);
  }
});

UserSchema.methods.comparePassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.models.User ||
  mongoose.model<IUser>('User', UserSchema);
