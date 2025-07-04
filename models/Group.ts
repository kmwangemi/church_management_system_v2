import mongoose, { type Document, Schema } from 'mongoose';

export interface IGroup extends Document {
  churchId: mongoose.Types.ObjectId;
  branchId: mongoose.Types.ObjectId;
  leaderId: mongoose.Types.ObjectId;
  groupName: string;
  description?: string;
  category:
    | 'Small Group'
    | 'Youth Group'
    | 'Bible Study'
    | 'Prayer Group'
    | 'Ministry Team'
    | 'Other';
  meetingSchedule: {
    day: string;
    time: string;
    frequency: 'Weekly' | 'Bi-weekly' | 'Monthly';
  };
  location?: string;
  capacity: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const GroupSchema = new Schema<IGroup>(
  {
    churchId: { type: Schema.Types.ObjectId, ref: 'Church', required: true },
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
    leaderId: { type: Schema.Types.ObjectId, ref: 'Member', required: true },
    groupName: { type: String, required: true, trim: true, lowercase: true },
    description: { type: String },
    category: {
      type: String,
      enum: [
        'Small Group',
        'Youth Group',
        'Bible Study',
        'Prayer Group',
        'Ministry Team',
        'Other',
      ],
      required: true,
    },
    meetingSchedule: {
      day: { type: String, required: true },
      time: { type: String, required: true },
      frequency: {
        type: String,
        enum: ['Weekly', 'Bi-weekly', 'Monthly'],
        required: true,
      },
    },
    location: { type: String },
    capacity: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  },
);

export default mongoose.models.Group ||
  mongoose.model<IGroup>('Group', GroupSchema);
