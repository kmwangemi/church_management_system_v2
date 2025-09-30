import mongoose, { Schema, type Document, type Model } from 'mongoose';

// Define the interface for a Milestone document
export interface IMilestone extends Document {
  churchId: mongoose.Types.ObjectId;
  branchId?: mongoose.Types.ObjectId; // Reference to Branch Model
  name: string;
  description: string;
  category:
    | 'spiritual'
    | 'bible_study'
    | 'prayer'
    | 'service'
    | 'leadership'
    | 'evangelism'
    | 'fellowship'
    | 'worship'
    | 'discipleship';
  points: number;
  requirements?: string;
  isActive: boolean;
  order: number; // For ordering milestones within categories
  level: 'new-convert' | 'growing' | 'mature' | 'leader';
  prerequisiteMilestones: mongoose.Types.ObjectId[]; // Array of milestone IDs that must be completed first
  completionCount: number; // Track how many times this milestone has been completed
  createdAt: Date;
  updatedAt: Date;
}

// Define the interface for the static methods
export interface IMilestoneModel extends Model<IMilestone> {
  // Example static methods you might add later:
  // findMilestonesByCategory(category: string): Promise<IMilestone[]>;
  // findMilestonesByLevel(level: string): Promise<IMilestone[]>;
}

// Define the Mongoose Schema for Milestone
const MilestoneSchema = new Schema<IMilestone>(
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
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: [2, 'Milestone name must be at least 2 characters'],
      maxlength: [100, 'Milestone name must be less than 100 characters'],
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: [10, 'Description must be at least 10 characters'],
      maxlength: [1000, 'Description must be less than 1000 characters'],
    },
    category: {
      type: String,
      required: true,
      trim: true,
      enum: [
        'spiritual_growth',
        'bible_study',
        'prayer',
        'service',
        'leadership',
        'evangelism',
        'fellowship',
        'worship',
        'discipleship',
      ],
    },
    points: {
      type: Number,
      required: true,
      min: [1, 'Points must be at least 1'],
      max: [100, 'Points must be less than or equal to 100'],
    },
    requirements: {
      type: String,
      trim: true,
      maxlength: [1000, 'Requirements must be less than 1000 characters'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
      min: [0, 'Order must be a positive number'],
    },
    level: {
      type: String,
      required: true,
      enum: ['new-convert', 'growing', 'mature', 'leader'],
      trim: true,
    },
    prerequisiteMilestones: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Milestone',
      },
    ],
    completionCount: {
      type: Number,
      default: 0,
      min: [0, 'Completion count cannot be negative'],
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields automatically
  }
);

// Add indexes for better query performance
MilestoneSchema.index({ churchId: 1, branchId: 1 }); // Index by church and branch
MilestoneSchema.index({ churchId: 1, category: 1 }); // Index by church and category
MilestoneSchema.index({ churchId: 1, level: 1 }); // Index by church and level
MilestoneSchema.index({ churchId: 1, isActive: 1 }); // Index by church and active status
MilestoneSchema.index({ category: 1, order: 1 }); // Index for ordering within categories
MilestoneSchema.index({ level: 1, order: 1 }); // Index for ordering within levels

// Add text index for searching by name, description, and requirements
MilestoneSchema.index({
  name: 'text',
  description: 'text',
  requirements: 'text',
});

// Pre-save middleware for validation
MilestoneSchema.pre('save', function (next) {
  // Ensure points is a positive number
  if (this.points <= 0) {
    return next(new Error('Points must be greater than 0'));
  }

  next();
});

// Virtual for difficulty level based on points
MilestoneSchema.virtual('difficulty').get(function () {
  if (this.points <= 10) return 'Easy';
  if (this.points <= 25) return 'Medium';
  if (this.points <= 50) return 'Hard';
  return 'Expert';
});

// Virtual for formatted points
MilestoneSchema.virtual('formattedPoints').get(function () {
  return new Intl.NumberFormat('en-US').format(this.points);
});

// Ensure virtuals are included in JSON output
MilestoneSchema.set('toJSON', { virtuals: true });
MilestoneSchema.set('toObject', { virtuals: true });

// Export the Milestone model
export default (mongoose.models.Milestone as IMilestoneModel) ||
  mongoose.model<IMilestone, IMilestoneModel>('Milestone', MilestoneSchema);
