import mongoose, { type Document, Schema } from 'mongoose';

export interface IMember extends Document {
  churchId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  memberId: string;
  membershipDate?: Date;
  membershipStatus: 'active' | 'inactive' | 'transferred' | 'deceased';
  departmentIds?: mongoose.Types.ObjectId[];
  groupIds?: mongoose.Types.ObjectId[];
  occupation?: string;
  baptismDate?: Date;
  joinedDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MemberSchema = new Schema<IMember>(
  {
    churchId: {
      type: Schema.Types.ObjectId,
      ref: 'Church',
      required: true,
    },
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
    departmentIds: [{ type: Schema.Types.ObjectId, ref: 'Department' }],
    groupIds: [{ type: Schema.Types.ObjectId, ref: 'Group' }],
    occupation: { type: String, trim: true },
    baptismDate: { type: Date },
    joinedDate: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Member ||
  mongoose.model<IMember>('Member', MemberSchema);
