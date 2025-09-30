import mongoose, { Schema, type Document, type Model } from 'mongoose';

// Define the interface for a Disciple document
export interface IDisciple extends Document {
  churchId: mongoose.Types.ObjectId;
  branchId?: mongoose.Types.ObjectId; // Reference to Branch Model
  memberId: mongoose.Types.ObjectId; // Reference to Member Model
  mentorId: mongoose.Types.ObjectId; // Reference to Member Model (mentor)
  startDate: Date;
  endDate?: Date; // Optional completion date
  currentLevel: 'new-convert' | 'growing' | 'mature' | 'leader';
  status: 'active' | 'completed' | 'paused' | 'discontinued';
  goals: string;
  notes?: string;
  progress: number; // Percentage (0-100)
  milestonesCompleted: mongoose.Types.ObjectId[]; // Array of milestone IDs
  createdAt: Date;
  updatedAt: Date;
}

// Define the interface for the static methods
export interface IDiscipleModel extends Model<IDisciple> {
  // Example static methods you might add later:
  // findDisciplesByMentor(mentorId: mongoose.Types.ObjectId): Promise<IDisciple[]>;
  // findActiveDisciples(churchId: mongoose.Types.ObjectId): Promise<IDisciple[]>;
}

// Define the Mongoose Schema for Disciple
const DiscipleSchema = new Schema<IDisciple>(
  {
    churchId: {
      type: Schema.Types.ObjectId,
      ref: 'Church',
      required: true,
    },
    branchId: {
      type: Schema.Types.ObjectId,
      ref: 'Branch',
      default: null,
    },
    memberId: {
      type: Schema.Types.ObjectId,
      ref: 'Member',
      required: true,
    },
    mentorId: {
      type: Schema.Types.ObjectId,
      ref: 'Member',
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
    },
    currentLevel: {
      type: String,
      required: true,
      enum: ['new-convert', 'growing', 'mature', 'leader'],
      trim: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['active', 'completed', 'paused', 'discontinued'],
      trim: true,
      default: 'active',
    },
    goals: {
      type: String,
      required: true,
      trim: true,
      minlength: [10, 'Goals must be at least 10 characters'],
      maxlength: [1000, 'Goals must be less than 1000 characters'],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notes must be less than 1000 characters'],
    },
    progress: {
      type: Number,
      default: 0,
      min: [0, 'Progress must be between 0 and 100'],
      max: [100, 'Progress must be between 0 and 100'],
    },
    milestonesCompleted: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Milestone',
      },
    ],
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields automatically
  }
);

// Add indexes for better query performance
DiscipleSchema.index({ churchId: 1, branchId: 1 }); // Index by church and branch
DiscipleSchema.index({ churchId: 1, memberId: 1 }); // Index by church and member
DiscipleSchema.index({ churchId: 1, mentorId: 1 }); // Index by church and mentor
DiscipleSchema.index({ churchId: 1, status: 1 }); // Index by church and status
DiscipleSchema.index({ churchId: 1, currentLevel: 1 }); // Index by church and level
DiscipleSchema.index({ startDate: 1 }); // Index by start date

// Add text index for searching by goals and notes
DiscipleSchema.index({
  goals: 'text',
  notes: 'text',
});

// Pre-save middleware for validation
DiscipleSchema.pre('save', function (next) {
  // Ensure start date is not in the future
  if (this.startDate > new Date()) {
    return next(new Error('Start date cannot be in the future'));
  }

  // Ensure end date is after start date
  if (this.endDate && this.endDate <= this.startDate) {
    return next(new Error('End date must be after start date'));
  }

  // Ensure member and mentor are different
  if (this.memberId.equals(this.mentorId)) {
    return next(new Error('Member and mentor cannot be the same person'));
  }

  next();
});

// Virtual for discipleship duration (in days)
DiscipleSchema.virtual('durationInDays').get(function () {
  const endDate = this.endDate || new Date();
  return Math.floor(
    (endDate.getTime() - this.startDate.getTime()) / (1000 * 60 * 60 * 24)
  );
});

// Virtual for completion percentage based on milestones
DiscipleSchema.virtual('completionPercentage').get(function () {
  return this.progress;
});

// Ensure virtuals are included in JSON output
DiscipleSchema.set('toJSON', { virtuals: true });
DiscipleSchema.set('toObject', { virtuals: true });

// Export the Disciple model
export default (mongoose.models.Disciple as IDiscipleModel) ||
  mongoose.model<IDisciple, IDiscipleModel>('Disciple', DiscipleSchema);
