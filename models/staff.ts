import mongoose, { type Document, Schema } from 'mongoose';

export interface IStaff extends Document {
  churchId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  staffId: string;
  jobTitle?: string;
  department?: string;
  startDate?: Date;
  endDate?: Date;
  salary?: number;
  employmentType: 'full-time' | 'part-time' | 'contract' | 'casual';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const StaffSchema = new Schema<IStaff>(
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
    staffId: { type: String, required: true, unique: true, trim: true },
    jobTitle: { type: String, trim: true, lowercase: true },
    department: { type: String, trim: true, lowercase: true },
    startDate: { type: Date },
    endDate: { type: Date },
    salary: { type: Number },
    employmentType: {
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'casual'],
      default: 'casual',
    },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Staff ||
  mongoose.model<IStaff>('Staff', StaffSchema);
