import bcrypt from 'bcryptjs';
import mongoose, { type Document, Schema } from 'mongoose';

export interface IUser extends Document {
  churchId?: mongoose.Types.ObjectId; // Made optional for superadmin
  branchId?: mongoose.Types.ObjectId; // Made optional for superadmin
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'member' | 'visitor' | 'pastor' | 'bishop' | 'admin' | 'superadmin';
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

const UserSchema = new Schema<IUser>(
  {
    churchId: {
      type: Schema.Types.ObjectId,
      ref: 'Church',
      required: function (this: IUser) {
        // Only required if role is not superadmin
        return this.role !== 'superadmin';
      },
    },
    branchId: {
      type: Schema.Types.ObjectId,
      ref: 'Branch',
      required: function (this: IUser) {
        // Only required if role is not superadmin
        return this.role !== 'superadmin';
      },
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
      enum: ['member', 'visitor', 'pastor', 'bishop', 'admin', 'superadmin'],
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
      name: { type: String, trim: true },
      relationship: { type: String, trim: true },
      phone: { type: String, trim: true },
    },
    notes: { type: String, trim: true },
  },
  {
    timestamps: true,
  },
);

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

UserSchema.methods.comparePassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.models.User ||
  mongoose.model<IUser>('User', UserSchema);
