import mongoose, { type Document, Schema } from 'mongoose';

export interface IChurch extends Document {
  churchName: string;
  denomination: string;
  email: string;
  phoneNumber: string;
  website?: string;
  establishedDate: Date;
  churchLogoUrl?: string;
  country: string;
  churchSize: string;
  numberOfBranches: string;
  subscriptionPlan: 'basic' | 'standard' | 'premium' | 'enterprise';
  createdBy: string | mongoose.Types.ObjectId;
  address: {
    address: string;
    city: string;
    state?: string;
    zipCode?: string;
  };
  description?: string;
  isSuspended: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema(
  {
    address: { type: String, required: true, trim: true, lowercase: true },
    city: { type: String, required: true, trim: true, lowercase: true },
    state: { type: String, trim: true, lowercase: true },
    zipCode: { type: String, trim: true },
  },
  { _id: false }, // disables automatic _id for subdocument
);

const ChurchSchema = new Schema<IChurch>(
  {
    churchName: { type: String, required: true, trim: true, lowercase: true },
    denomination: { type: String, required: true, trim: true, lowercase: true },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    country: { type: String, required: true, trim: true, lowercase: true },
    address: { type: AddressSchema, required: true },
    establishedDate: { type: Date, required: true, trim: true },
    website: { type: String, trim: true },
    subscriptionPlan: {
      type: String,
      required: true,
      enum: ['basic', 'standard', 'premium', 'enterprise'],
      default: 'basic',
    },
    churchSize: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    numberOfBranches: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    churchLogoUrl: { type: String, trim: true },
    description: { type: String, trim: true, lowercase: true },
    isSuspended: { type: Boolean, required: true, default: false },
    isDeleted: { type: Boolean, required: true, default: false },
  },
  {
    timestamps: true,
  },
);

export default mongoose.models.Church ||
  mongoose.model<IChurch>('Church', ChurchSchema);
