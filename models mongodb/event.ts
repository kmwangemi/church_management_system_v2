import mongoose, { type Document, Schema } from 'mongoose';

export interface IEvent extends Document {
  churchId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  type: string;
  startDate: Date;
  endDate: Date;
  startTime: string;
  endTime: string;
  location: string;
  expectedAttendees: number;
  organizer: string; // Changed from organizerId to organizer (string name)
  maxAttendees?: number;
  requiresRegistration: boolean;
  isRecurring: boolean;
  recurringPattern?: string;
  registrationDeadline?: Date;
  notes?: string;
  isPublic: boolean;
  branchId?: mongoose.Types.ObjectId;
  status: 'active' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEvent>(
  {
    churchId: {
      type: Schema.Types.ObjectId,
      ref: 'Church',
      required: true,
    },
    title: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 100,
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: true,
      minlength: 5,
      maxlength: 1000,
      trim: true,
      lowercase: true,
    },
    type: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    startDate: {
      type: Date,
      required: true,
      trim: true,
    },
    endDate: {
      type: Date,
      required: true,
      trim: true,
    },
    startTime: {
      type: String,
      required: true,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, // HH:MM format validation
      trim: true,
    },
    endTime: {
      type: String,
      required: true,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, // HH:MM format validation
      trim: true,
    },
    location: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 200,
      trim: true,
      lowercase: true,
    },
    expectedAttendees: {
      type: Number,
      required: true,
      min: 1,
      max: 1_000_000,
      trim: true,
    },
    organizer: {
      type: String,
      minlength: 2,
      maxlength: 100,
      trim: true,
    },
    maxAttendees: {
      type: Number,
      min: 1,
      max: 1_000_000,
      trim: true,
      validate: {
        validator(this: IEvent, value: number) {
          // Ensure maxAttendees >= expectedAttendees if both are provided
          if (value && this.expectedAttendees) {
            return value >= this.expectedAttendees;
          }
          return true;
        },
        message:
          'Maximum attendees must be greater than or equal to expected attendees',
      },
    },
    requiresRegistration: {
      type: Boolean,
      default: false,
    },
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurringPattern: {
      type: String,
      trim: true,
      lowercase: true,
      validate: {
        validator(this: IEvent, value: string) {
          // Require recurringPattern if isRecurring is true
          if (this.isRecurring && !value) {
            return false;
          }
          return true;
        },
        message: 'Recurring pattern is required when event is recurring',
      },
    },
    registrationDeadline: {
      type: Date,
      trim: true,
      validate: {
        validator(this: IEvent, value: Date) {
          // Ensure registration deadline is before start date if registration is required
          if (this.requiresRegistration && value && this.startDate) {
            return value <= this.startDate;
          }
          return true;
        },
        message: 'Registration deadline must be before or on the start date',
      },
    },
    notes: {
      type: String,
      maxlength: 500,
      trim: true,
      lowercase: true,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    branchId: {
      type: Schema.Types.ObjectId,
      ref: 'Branch',
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'cancelled'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

// Add compound validation for dates
EventSchema.pre('validate', function (this: IEvent) {
  // Ensure end date is after start date
  if (this.startDate && this.endDate && this.endDate < this.startDate) {
    this.invalidate('endDate', 'End date must be after or equal to start date');
  }
  // Validate same-day time logic
  if (
    this.startDate &&
    this.endDate &&
    this.startDate.toDateString() === this.endDate.toDateString()
  ) {
    const [startHour, startMin] = this.startTime.split(':').map(Number);
    const [endHour, endMin] = this.endTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    if (endMinutes <= startMinutes) {
      this.invalidate(
        'endTime',
        'End time must be after start time for same-day events'
      );
    }
  }
});

// Add indexes for better query performance
EventSchema.index({ churchId: 1, startDate: 1 });
EventSchema.index({ status: 1 });
EventSchema.index({ branchId: 1 });
EventSchema.index({ isPublic: 1 });

export default mongoose.models.Event ||
  mongoose.model<IEvent>('Event', EventSchema);
