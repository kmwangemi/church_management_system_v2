import bcrypt from 'bcryptjs';
import mongoose, { Schema, type CallbackError, type Document } from 'mongoose';

export interface IUser extends Document {
  churchId?: mongoose.Types.ObjectId; // Optional for superadmin
  branchId?: mongoose.Types.ObjectId; // Optional for superadmin
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'member' | 'visitor' | 'pastor' | 'bishop' | 'admin' | 'superadmin';
  phoneNumber: string;
  profilePictureUrl?: string;
  createdBy: string | mongoose.Types.ObjectId;
  agreeToTerms: boolean;
  isActive: boolean;
  isSuspended: boolean;
  isDeleted: boolean;
  lastLogin?: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  // Rate limiting fields
  loginAttempts?: number;
  lockUntil?: Date;
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
  // Rate limiting methods
  isLocked: boolean;
  incLoginAttempts(): Promise<this>;
  resetLoginAttempts(): Promise<this>;
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
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      enum: ['member', 'visitor', 'pastor', 'bishop', 'admin', 'superadmin'],
    },
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: function (this: any) {
        return this.role !== 'superadmin';
      },
    },
    profilePictureUrl: { type: String, default: null },
    agreeToTerms: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    isSuspended: { type: Boolean, required: true, default: false },
    isDeleted: { type: Boolean, required: true, default: false },
    lastLogin: { type: Date },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    // Rate limiting fields
    loginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date },
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

// Constants for rate limiting
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME = 2 * 60 * 60 * 1000; // 2 hours in milliseconds

// Virtual property for checking if account is locked
UserSchema.virtual('isLocked').get(function (this: IUser) {
  return !!(this.lockUntil && this.lockUntil > new Date());
});

// Database indexes for frequently queried fields
UserSchema.index({ email: 1 });
UserSchema.index({ phoneNumber: 1 });
UserSchema.index({ churchId: 1 });
UserSchema.index({ branchId: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ isActive: 1 });
UserSchema.index({ isDeleted: 1 });
UserSchema.index({ createdBy: 1 });
UserSchema.index({ resetPasswordToken: 1 });
// Compound indexes for common queries
UserSchema.index({ churchId: 1, branchId: 1 });
UserSchema.index({ churchId: 1, role: 1 });
UserSchema.index({ isActive: 1, isDeleted: 1 });
UserSchema.index({ lockUntil: 1 }, { expireAfterSeconds: 0 }); // TTL index for automatic cleanup

// Rate limiting methods
UserSchema.methods.incLoginAttempts = function (this: IUser) {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < new Date()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 },
    });
  }
  const updates: any = { $inc: { loginAttempts: 1 } };
  // If we have hit max attempts and it's not locked yet, lock the account
  const currentLoginAttempts =
    typeof this.loginAttempts === 'number' ? this.loginAttempts : 0;
  const isLocked = typeof this.isLocked === 'boolean' ? this.isLocked : false;
  if (currentLoginAttempts + 1 >= MAX_LOGIN_ATTEMPTS && !isLocked) {
    updates.$set = { lockUntil: new Date(Date.now() + LOCK_TIME) };
  }
  return this.updateOne(updates);
};

UserSchema.methods.resetLoginAttempts = function (this: IUser) {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 },
  });
};

// Pre-save middleware for password hashing
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    this.password = await bcrypt.hash(this.password, 12);
    next();
  } catch (error) {
    const callbackError =
      error instanceof Error ? error : new Error(String(error));
    next(callbackError as CallbackError);
  }
});

// Pre-save middleware for conditional validation
UserSchema.pre('save', function (next) {
  try {
    // Since role is a string, directly check its value
    const userRole = this.role;
    // Validate churchId and branchId based on user role
    if (userRole === 'superadmin') {
      // superadmin: churchId and branchId are not required
      return next();
    }
    if (userRole === 'admin') {
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
  // Check if account is locked
  if (this.isLocked) {
    throw new Error(
      'Account is temporarily locked due to too many failed login attempts',
    );
  }
  const isMatch = await bcrypt.compare(candidatePassword, this.password);
  // If password is correct, reset login attempts
  if (isMatch) {
    // Only reset if there are attempts or lock time
    if (this.loginAttempts || this.lockUntil) {
      await this.resetLoginAttempts();
    }
    return true;
  }
  // Password is incorrect, increment login attempts
  await this.incLoginAttempts();
  return false;
};

export default mongoose.models.User ||
  mongoose.model<IUser>('User', UserSchema);
