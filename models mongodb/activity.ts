import mongoose, { Schema, type Document, type Model } from 'mongoose';

// Define the interface for an Activity document
export interface IActivity extends Document {
  churchId: mongoose.Types.ObjectId;
  branchId: mongoose.Types.ObjectId;
  date: Date;
  activity: string;
  participants: number;
  type:
    | 'service'
    | 'meeting'
    | 'event'
    | 'program'
    | 'ministry'
    | 'social'
    | 'outreach';
  status: 'planned' | 'ongoing' | 'completed' | 'cancelled' | 'postponed';
  startTime?: string;
  endTime?: string;
  location?: string;
  facilitator?: string;
  budget?: number;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Define the interface for the static methods
export interface IActivityModel extends Model<IActivity> {
  // Example static methods:
  // findActivitiesByDateRange(startDate: Date, endDate: Date): Promise<IActivity[]>;
  // findActivitiesByType(type: string): Promise<IActivity[]>;
}

// Define the Mongoose Schema for Activity
const ActivitySchema = new Schema<IActivity>(
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
    date: {
      type: Date,
      required: true,
    },
    activity: {
      type: String,
      required: true,
      trim: true,
      minlength: [3, 'Activity name must be at least 3 characters'],
      maxlength: [200, 'Activity name must be less than 200 characters'],
    },
    participants: {
      type: Number,
      required: true,
      min: [0, 'Participants count cannot be negative'],
      max: [10_000, 'Participants count seems too high'],
    },
    type: {
      type: String,
      required: true,
      enum: [
        'service',
        'meeting',
        'event',
        'program',
        'ministry',
        'social',
        'outreach',
      ],
      trim: true,
      default: 'event',
    },
    status: {
      type: String,
      required: true,
      enum: ['planned', 'ongoing', 'completed', 'cancelled', 'postponed'],
      trim: true,
      default: 'planned',
    },
    startTime: {
      type: String,
      trim: true,
      match: [
        /^([01]?[0-9]|2[0-3]):[0-5][0-9]( (AM|PM))?$/i,
        'Invalid time format',
      ],
    },
    endTime: {
      type: String,
      trim: true,
      match: [
        /^([01]?[0-9]|2[0-3]):[0-5][0-9]( (AM|PM))?$/i,
        'Invalid time format',
      ],
    },
    location: {
      type: String,
      trim: true,
      maxlength: [100, 'Location must be less than 100 characters'],
    },
    facilitator: {
      type: String,
      trim: true,
      maxlength: [100, 'Facilitator name must be less than 100 characters'],
    },
    budget: {
      type: Number,
      min: [0, 'Budget must be greater than or equal to 0'],
      max: [1_000_000, 'Budget must be less than or equal to 1,000,000'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description must be less than 1000 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Add indexes for better query performance
ActivitySchema.index({ churchId: 1, branchId: 1 });
ActivitySchema.index({ churchId: 1, date: 1 });
ActivitySchema.index({ churchId: 1, type: 1 });
ActivitySchema.index({ churchId: 1, status: 1 });
ActivitySchema.index({ date: 1, status: 1 });

// Add text index for searching
ActivitySchema.index({
  activity: 'text',
  type: 'text',
  location: 'text',
  facilitator: 'text',
  description: 'text',
});

// Pre-save middleware
ActivitySchema.pre('save', function (next) {
  // Ensure activity date is not too far in the past (more than 5 years)
  const fiveYearsAgo = new Date();
  fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);
  if (this.date < fiveYearsAgo) {
    return next(
      new Error('Activity date cannot be more than 5 years in the past')
    );
  }
  next();
});

// Virtual for days until activity (negative if past)
ActivitySchema.virtual('daysUntilActivity').get(function () {
  return Math.floor((this.date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
});

// Virtual for formatted participants count
ActivitySchema.virtual('formattedParticipants').get(function () {
  return new Intl.NumberFormat('en-KE').format(this.participants);
});

ActivitySchema.set('toJSON', { virtuals: true });
ActivitySchema.set('toObject', { virtuals: true });

// Export the Activity model
export default (mongoose.models.Activity as IActivityModel) ||
  mongoose.model<IActivity, IActivityModel>('Activity', ActivitySchema);
