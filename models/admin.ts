import mongoose, { type Document, Schema } from 'mongoose';

export interface IAdmin extends Document {
  userId: mongoose.Types.ObjectId;
  adminId: string;
  accessLevel: 'branch' | 'regional' | 'national';
  permissions: string[];
  assignedBranches: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const AdminSchema = new Schema<IAdmin>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    adminId: { type: String, required: true, unique: true, trim: true },
    accessLevel: {
      type: String,
      enum: ['branch', 'regional', 'national'],
      required: true,
    },
    permissions: [{ type: String, trim: true }],
    assignedBranches: [{ type: Schema.Types.ObjectId, ref: 'Branch' }],
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Admin ||
  mongoose.model<IAdmin>('Admin', AdminSchema);
