import mongoose, { type Document, Schema } from 'mongoose';

export interface IGroup extends Document {
  churchId: mongoose.Types.ObjectId;
  groupName: string;
  leaderId?: mongoose.Types.ObjectId;
  meetingDay: string[];
  meetingTime: string[];
  description?: string;
  category:
    | 'bible-study'
    | 'fellowship'
    | 'prayer'
    | 'youth'
    | 'children'
    | 'marriage'
    | 'worship'
    | 'contribution'
    | 'others';
  location?: string;
  capacity: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface MeetingDayValidator {
  validator: (arr: string[]) => boolean;
  message: string;
}

const GroupSchema = new Schema<IGroup>(
  {
    churchId: { type: Schema.Types.ObjectId, ref: 'Church', required: true },
    groupName: { type: String, required: true, trim: true, lowercase: true },
    leaderId: { type: String },
    description: { type: String },
    category: {
      type: String,
      enum: [
        'bible-study',
        'fellowship',
        'prayer',
        'youth',
        'children',
        'marriage',
        'worship',
        'contribution',
        'others',
      ],
      required: true,
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
    location: { type: String, required: true, trim: true, lowercase: true },
    capacity: { type: Number, required: true, trim: true },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Group ||
  mongoose.model<IGroup>('Group', GroupSchema);
