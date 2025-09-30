import mongoose, { Schema, type Document, type Model } from 'mongoose';

// Define the interface for a Prayer Request document
export interface IPrayerRequest extends Document {
  churchId: mongoose.Types.ObjectId;
  branchId: mongoose.Types.ObjectId; // Reference to Branch Model
  memberId?: mongoose.Types.ObjectId; // Optional - null for anonymous requests
  title: string;
  description: string;
  category:
    | 'health'
    | 'family'
    | 'career'
    | 'financial'
    | 'spiritual'
    | 'thanksgiving'
    | 'guidance'
    | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'active' | 'answered' | 'closed' | 'archived';
  isAnonymous: boolean;
  isPublic: boolean;
  submittedBy: mongoose.Types.ObjectId; // The user who submitted it
  answeredDate?: Date;
  answerDescription?: string;
  prayerCount: number; // How many people have prayed for this
  createdAt: Date;
  updatedAt: Date;
}

// Define the interface for the static methods
export interface IPrayerRequestModel extends Model<IPrayerRequest> {
  // Example static methods you might add later:
  // findByCategory(category: string): Promise<IPrayerRequest[]>;
  // findActiveRequests(): Promise<IPrayerRequest[]>;
  // findByMember(memberId: mongoose.Types.ObjectId): Promise<IPrayerRequest[]>;
}

// Define the Mongoose Schema for Prayer Request
const PrayerRequestSchema = new Schema<IPrayerRequest>(
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
      default: null,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: [5, 'Prayer request title must be at least 5 characters'],
      maxlength: [200, 'Prayer request title must be less than 200 characters'],
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: [
        20,
        'Prayer request description must be at least 20 characters',
      ],
      maxlength: [
        2000,
        'Prayer request description must be less than 2000 characters',
      ],
    },
    category: {
      type: String,
      required: true,
      trim: true,
      enum: [
        'health',
        'family',
        'career',
        'financial',
        'spiritual',
        'thanksgiving',
        'guidance',
        'other',
      ],
    },
    priority: {
      type: String,
      required: true,
      enum: ['low', 'medium', 'high', 'urgent'],
      trim: true,
      default: 'medium',
    },
    status: {
      type: String,
      required: true,
      enum: ['active', 'answered', 'closed', 'archived'],
      trim: true,
      default: 'active',
    },
    isAnonymous: {
      type: Boolean,
      required: true,
      default: false,
    },
    isPublic: {
      type: Boolean,
      required: true,
      default: true,
    },
    submittedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    answeredDate: {
      type: Date,
      required: false,
    },
    answerDescription: {
      type: String,
      trim: true,
      maxlength: [1000, 'Answer description must be less than 1000 characters'],
    },
    prayerCount: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Prayer count must be greater than or equal to 0'],
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields automatically
  }
);

// Add indexes for better query performance
PrayerRequestSchema.index({ churchId: 1, branchId: 1 }); // Index by church and branch
PrayerRequestSchema.index({ churchId: 1, category: 1 }); // Index by church and category
PrayerRequestSchema.index({ churchId: 1, status: 1 }); // Index by church and status
PrayerRequestSchema.index({ churchId: 1, priority: 1 }); // Index by church and priority
PrayerRequestSchema.index({ churchId: 1, isPublic: 1 }); // Index by church and public status
PrayerRequestSchema.index({ memberId: 1 }, { sparse: true }); // Index by member (sparse for anonymous requests)
PrayerRequestSchema.index({ submittedBy: 1 }); // Index by submitter
PrayerRequestSchema.index({ createdAt: -1 }); // Index by creation date for sorting

// Add text index for searching by title and description
PrayerRequestSchema.index({
  title: 'text',
  description: 'text',
});

// Pre-save middleware for validation
PrayerRequestSchema.pre('save', function (next) {
  // If anonymous, ensure memberId is not set
  if (this.isAnonymous && this.memberId) {
    this.memberId = undefined;
  }
  // If not anonymous, ensure memberId is set
  if (!(this.isAnonymous || this.memberId)) {
    return next(
      new Error('Member ID is required for non-anonymous prayer requests')
    );
  }
  // Set answered date when status changes to answered
  if (this.status === 'answered' && !this.answeredDate) {
    this.answeredDate = new Date();
  }
  next();
});

// Virtual for days since submitted
PrayerRequestSchema.virtual('daysActive').get(function () {
  return Math.floor(
    (Date.now() - this.createdAt.getTime()) / (1000 * 60 * 60 * 24)
  );
});

// Virtual for requester name (handles anonymous requests)
PrayerRequestSchema.virtual('requesterName').get(function () {
  if (this.isAnonymous) {
    return 'Anonymous';
  }
  // This would be populated when you populate the memberId field
  return this.memberId ? 'Member Name' : 'Unknown';
});

// Virtual for formatted prayer count
PrayerRequestSchema.virtual('formattedPrayerCount').get(function () {
  if (this.prayerCount === 0) return 'No prayers yet';
  if (this.prayerCount === 1) return '1 person praying';
  return `${this.prayerCount} people praying`;
});

// Virtual for priority color (for UI)
PrayerRequestSchema.virtual('priorityColor').get(function () {
  switch (this.priority) {
    case 'urgent':
      return 'red';
    case 'high':
      return 'orange';
    case 'medium':
      return 'yellow';
    case 'low':
      return 'green';
    default:
      return 'gray';
  }
});

// Ensure virtuals are included in JSON output
PrayerRequestSchema.set('toJSON', { virtuals: true });
PrayerRequestSchema.set('toObject', { virtuals: true });

// Export the PrayerRequest model
export default (mongoose.models.PrayerRequest as IPrayerRequestModel) ||
  mongoose.model<IPrayerRequest, IPrayerRequestModel>(
    'PrayerRequest',
    PrayerRequestSchema
  );
