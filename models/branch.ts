import mongoose, { type Document, Schema } from 'mongoose';

export interface IBranch extends Document {
  churchId: mongoose.Types.ObjectId;
  branchName: string;
  address: string;
  country: string;
  email?: string;
  phoneNumber?: string;
  pastorId?: mongoose.Types.ObjectId;
  capacity: number;
  establishedDate: Date;
  isActive: boolean;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BranchSchema = new Schema<IBranch>(
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
    address: { type: String, required: true, trim: true, lowercase: true },
    country: { type: String, required: true, trim: true, lowercase: true },
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
  mongoose.model<IBranch>('Branch', BranchSchema);
