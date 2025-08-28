import mongoose, { type Document, Schema } from 'mongoose';

export interface IBranch extends Document {
  churchId: mongoose.Types.ObjectId;
  branchName: string;
  email?: string;
  phoneNumber?: string;
  pastorId?: mongoose.Types.ObjectId;
  capacity: number;
  establishedDate: Date;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  isActive: boolean;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BranchModel = new Schema<IBranch>(
  {
    churchId: {
      type: Schema.Types.ObjectId,
      ref: 'Church',
      required: true,
      trim: true,
    },
    pastorId: { type: Schema.Types.ObjectId, ref: 'User', trim: true },
    branchName: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    address: {
      street: { type: String, trim: true, lowercase: true },
      city: { type: String, trim: true, lowercase: true },
      state: { type: String, trim: true, lowercase: true },
      zipCode: { type: String, trim: true },
      country: { type: String, default: 'Kenya', trim: true },
    },
    phoneNumber: { type: String, trim: true },
    email: { type: String, trim: true },
    capacity: { type: Number, trim: true, required: true },
    establishedDate: { type: Date, required: true, trim: true },
    isActive: { type: Boolean, default: true },
    description: { type: String, trim: true, lowercase: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Branch ||
  mongoose.model<IBranch>('Branch', BranchModel);
