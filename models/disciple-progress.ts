import mongoose, { Schema, type Document, type Model } from 'mongoose';

// Define the interface for a DiscipleProgress document
export interface IDiscipleProgress extends Document {
  churchId: mongoose.Types.ObjectId;
  branchId: mongoose.Types.ObjectId;
  discipleId: mongoose.Types.ObjectId; // Reference to Disciple Model
  milestoneId: mongoose.Types.ObjectId; // Reference to Milestone Model
  completedDate: Date;
  pointsEarned: number;
  verifiedBy: mongoose.Types.ObjectId; // Reference to Member Model (mentor/admin)
  notes?: string;
  evidence?: string; // URL or description of evidence
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

// Define the interface for the static methods
export interface IDiscipleProgressModel extends Model<IDiscipleProgress> {
  // Example static methods you might add later:
  // findProgressByDisciple(discipleId: mongoose.Types.ObjectId): Promise<IDiscipleProgress[]>;
  // calculateTotalPoints(discipleId: mongoose.Types.ObjectId): Promise<number>;
}

// Define the Mongoose Schema for DiscipleProgress
const DiscipleProgressSchema = new Schema<IDiscipleProgress>(
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
    discipleId: {
      type: Schema.Types.ObjectId,
      ref: 'Disciple',
      required: true,
    },
    milestoneId: {
      type: Schema.Types.ObjectId,
      ref: 'Milestone',
      required: true,
    },
    completedDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    pointsEarned: {
      type: Number,
      required: true,
      min: [0, 'Points earned cannot be negative'],
    },
    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: 'Member',
      required: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes must be less than 500 characters'],
    },
    evidence: {
      type: String,
      trim: true,
      maxlength: [
        1000,
        'Evidence description must be less than 1000 characters',
      ],
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

// Add indexes for better query performance
DiscipleProgressSchema.index({ churchId: 1, branchId: 1 });
DiscipleProgressSchema.index({ discipleId: 1, completedDate: -1 });
DiscipleProgressSchema.index({ milestoneId: 1 });
DiscipleProgressSchema.index({ verifiedBy: 1 });
DiscipleProgressSchema.index({ status: 1 });
DiscipleProgressSchema.index(
  { discipleId: 1, milestoneId: 1 },
  { unique: true }
); // Prevent duplicate completions

// Pre-save middleware
DiscipleProgressSchema.pre('save', function (next) {
  // Ensure completed date is not in the future
  if (this.completedDate > new Date()) {
    return next(new Error('Completion date cannot be in the future'));
  }
  next();
});

// Static method to calculate total points for a disciple
DiscipleProgressSchema.statics.calculateTotalPoints = async function (
  discipleId: mongoose.Types.ObjectId
) {
  const result = await this.aggregate([
    {
      $match: {
        discipleId,
        status: 'approved',
      },
    },
    {
      $group: {
        _id: null,
        totalPoints: { $sum: '$pointsEarned' },
      },
    },
  ]);

  return result.length > 0 ? result[0].totalPoints : 0;
};

// Export the DiscipleProgress model
export default (mongoose.models.DiscipleProgress as IDiscipleProgressModel) ||
  mongoose.model<IDiscipleProgress, IDiscipleProgressModel>(
    'DiscipleProgress',
    DiscipleProgressSchema
  );
