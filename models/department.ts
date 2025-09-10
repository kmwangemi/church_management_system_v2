import mongoose, { type Document, Schema } from 'mongoose';

export interface IDepartment extends Document {
  churchId: mongoose.Types.ObjectId;
  leaderId?: mongoose.Types.ObjectId;
  branchId?: mongoose.Types.ObjectId;
  departmentName: string;
  description: string;
  meetingDay: string[];
  meetingTime: string[];
  isActive: boolean;
  budget?: number;
  createdAt: Date;
  updatedAt: Date;
}

interface MeetingDayValidator {
  validator: (arr: string[]) => boolean;
  message: string;
}

interface DepartmentSchemaType extends IDepartment {
  // Additional fields or overrides if needed
}

const DepartmentSchema = new Schema<DepartmentSchemaType>(
  {
    churchId: {
      type: Schema.Types.ObjectId,
      ref: 'Church',
      required: true,
      trim: true,
    },
    leaderId: { type: Schema.Types.ObjectId, ref: 'User', trim: true },
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch', trim: true },
    departmentName: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    meetingDay: {
      type: [String],
      required: true,
      validate: [
        {
          validator(arr: string[]): boolean {
            return arr && arr.length > 0;
          },
          message: 'At least one meeting day is required',
        } as MeetingDayValidator,
        {
          validator(arr: string[]): boolean {
            const validDays = [
              'monday',
              'tuesday',
              'wednesday',
              'thursday',
              'friday',
              'saturday',
              'sunday',
            ];
            return (arr as string[]).every((day: string) =>
              validDays.includes(day.toLowerCase())
            );
          },
          message: 'Invalid meeting day provided',
        } as MeetingDayValidator,
      ],
      set(arr: string[]): string[] {
        return arr.map((day: string) => day.toLowerCase().trim());
      },
    },
    meetingTime: {
      type: [String],
      required: true,
      trim: true,
    },
    description: { type: String, trim: true, required: true, lowercase: true },
    isActive: { type: Boolean, default: true },
    budget: { type: Number, trim: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Department ||
  mongoose.model<IDepartment>('Department', DepartmentSchema);
