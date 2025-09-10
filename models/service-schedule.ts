import mongoose, { Schema, type Document, type Model } from 'mongoose';

// Define the interface for a ServiceSchedule document
export interface IServiceSchedule extends Document {
  churchId: mongoose.Types.ObjectId;
  branchId: mongoose.Types.ObjectId;
  day:
    | 'Sunday'
    | 'Monday'
    | 'Tuesday'
    | 'Wednesday'
    | 'Thursday'
    | 'Friday'
    | 'Saturday';
  time: string;
  service: string;
  attendance?: number;
  type:
    | 'worship'
    | 'prayer'
    | 'bible_study'
    | 'youth'
    | 'children'
    | 'special'
    | 'fellowship';
  duration?: number; // in minutes
  facilitator?: string;
  location?: string;
  recurring: boolean;
  isActive: boolean;
  startDate?: Date;
  endDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IServiceScheduleModel extends Model<IServiceSchedule> {
  // Example static methods:
  // findServicesByDay(day: string): Promise<IServiceSchedule[]>;
  // findActiveServices(): Promise<IServiceSchedule[]>;
}

const ServiceScheduleSchema = new Schema<IServiceSchedule>(
  {
    churchId: {
      type: Schema.Types.ObjectId,
      ref: 'Church',
      required: true,
    },
    branchId: {
      type: Schema.Types.ObjectId,
      ref: 'Branch',
      required: true,
    },
    day: {
      type: String,
      required: true,
      enum: [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
      ],
      trim: true,
    },
    time: {
      type: String,
      required: true,
      trim: true,
      match: [
        /^([01]?[0-9]|2[0-3]):[0-5][0-9]( (AM|PM))?$/i,
        'Invalid time format (use HH:MM or HH:MM AM/PM)',
      ],
    },
    service: {
      type: String,
      required: true,
      trim: true,
      minlength: [3, 'Service name must be at least 3 characters'],
      maxlength: [100, 'Service name must be less than 100 characters'],
    },
    attendance: {
      type: Number,
      min: [0, 'Attendance cannot be negative'],
      max: [10_000, 'Attendance seems too high'],
    },
    type: {
      type: String,
      required: true,
      enum: [
        'worship',
        'prayer',
        'bible_study',
        'youth',
        'children',
        'special',
        'fellowship',
      ],
      trim: true,
      default: 'worship',
    },
    duration: {
      type: Number,
      min: [15, 'Service duration must be at least 15 minutes'],
      max: [480, 'Service duration must be less than 8 hours'],
      default: 90,
    },
    facilitator: {
      type: String,
      trim: true,
      maxlength: [100, 'Facilitator name must be less than 100 characters'],
    },
    location: {
      type: String,
      trim: true,
      maxlength: [100, 'Location must be less than 100 characters'],
    },
    recurring: {
      type: Boolean,
      required: true,
      default: true,
    },
    isActive: {
      type: Boolean,
      required: true,
      default: true,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes must be less than 500 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Add indexes for better query performance
ServiceScheduleSchema.index({ churchId: 1, branchId: 1 });
ServiceScheduleSchema.index({ churchId: 1, day: 1, time: 1 });
ServiceScheduleSchema.index({ churchId: 1, type: 1 });
ServiceScheduleSchema.index({ day: 1, isActive: 1 });
ServiceScheduleSchema.index({ isActive: 1, recurring: 1 });

// Add text index for searching
ServiceScheduleSchema.index({
  service: 'text',
  type: 'text',
  facilitator: 'text',
  location: 'text',
});

// Pre-save middleware
ServiceScheduleSchema.pre('save', function (next) {
  // If endDate is provided, ensure it's after startDate
  if (this.startDate && this.endDate && this.endDate <= this.startDate) {
    return next(new Error('End date must be after start date'));
  }
  next();
});

// Virtual for formatted duration
ServiceScheduleSchema.virtual('formattedDuration').get(function () {
  if (!this.duration) return 'Not specified';
  const hours = Math.floor(this.duration / 60);
  const minutes = this.duration % 60;
  if (hours === 0) return `${minutes} minutes`;
  if (minutes === 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
  return `${hours}h ${minutes}m`;
});

// Virtual for formatted attendance
ServiceScheduleSchema.virtual('formattedAttendance').get(function () {
  if (!this.attendance) return 'Not recorded';
  return new Intl.NumberFormat('en-KE').format(this.attendance);
});

ServiceScheduleSchema.set('toJSON', { virtuals: true });
ServiceScheduleSchema.set('toObject', { virtuals: true });

// Export the ServiceSchedule model
export default (mongoose.models.ServiceSchedule as IServiceScheduleModel) ||
  mongoose.model<IServiceSchedule, IServiceScheduleModel>(
    'ServiceSchedule',
    ServiceScheduleSchema
  );
