import mongoose, { type Document, Schema } from 'mongoose';

export interface IMember extends Document {
  userId: mongoose.Types.ObjectId;
  memberId: string;
  membershipDate: Date;
  membershipStatus: 'active' | 'inactive' | 'transferred' | 'deceased';
  branchId?: mongoose.Types.ObjectId;
  departmentIds: mongoose.Types.ObjectId[];
  groupIds: mongoose.Types.ObjectId[];
  occupation?: string; // Kept here as it's specific to member context
  baptismDate?: Date;
  joinedDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MemberSchema = new Schema<IMember>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    memberId: { type: String, required: true, unique: true, trim: true },
    membershipDate: { type: Date, default: Date.now },
    membershipStatus: {
      type: String,
      enum: ['active', 'inactive', 'transferred', 'deceased'],
      default: 'active',
    },
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch' },
    departmentIds: [{ type: Schema.Types.ObjectId, ref: 'Department' }],
    groupIds: [{ type: Schema.Types.ObjectId, ref: 'Group' }],
    occupation: { type: String, trim: true },
    baptismDate: { type: Date },
    joinedDate: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  },
);

export default mongoose.models.Member ||
  mongoose.model<IMember>('Member', MemberSchema);
