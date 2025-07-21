import mongoose, { type Document, Schema } from 'mongoose';

export interface IStaff extends Document {
  userId: mongoose.Types.ObjectId; // Link to User
  jobTitle: string;
  department?: string;
  startDate: Date;
  endDate?: Date;
  salary?: number;
  employmentType: 'full-time' | 'part-time' | 'contract' | 'casual';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const StaffSchema = new Schema<IStaff>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // Each staff must have a unique user record
    },
    jobTitle: { type: String, required: true, trim: true },
    department: { type: String, trim: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    salary: { type: Number },
    employmentType: {
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'casual'],
      required: true,
    },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Staff ||
  mongoose.model<IStaff>('Staff', StaffSchema);
