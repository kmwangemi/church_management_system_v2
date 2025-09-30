import mongoose, { Schema, type Document, type Model } from 'mongoose';

export interface IAnnouncement extends Document {
  churchId: mongoose.Types.ObjectId;
  branchId?: mongoose.Types.ObjectId; // Reference to Branch Model Optional
  title: string;
  content: string;
  category:
    | 'general'
    | 'service'
    | 'event'
    | 'prayer'
    | 'ministry'
    | 'youth'
    | 'children'
    | 'finance'
    | 'volunteer'
    | 'emergency';
  priority: 'low' | 'medium' | 'high';
  publishDate: Date;
  expiryDate?: Date;
  status: 'draft' | 'published' | 'scheduled' | 'expired';
  authorId: mongoose.Types.ObjectId; // Reference to User who created it
  viewCount: number;
  targetAudience?: string[]; // Could be ministry groups, age groups, etc.
  attachments?: string[]; // URLs to attached files
  isSticky: boolean; // Pin to top
  notificationSent: boolean; // Track if notifications were sent
  createdAt: Date;
  updatedAt: Date;
}

// Define the interface for the static methods
export interface IAnnouncementModel extends Model<IAnnouncement> {
  // Example static methods you might add later:
  // findActiveAnnouncements(churchId: mongoose.Types.ObjectId): Promise<IAnnouncement[]>;
  // findByCategory(churchId: mongoose.Types.ObjectId, category: string): Promise<IAnnouncement[]>;
}

// Define the Mongoose Schema for Announcement
const AnnouncementSchema = new Schema<IAnnouncement>(
  {
    churchId: {
      type: Schema.Types.ObjectId,
      ref: 'Church',
      required: true,
    },
    branchId: {
      type: Schema.Types.ObjectId,
      ref: 'Branch',
    },
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: [2, 'Announcement title must be at least 2 characters'],
      maxlength: [200, 'Announcement title must be less than 200 characters'],
    },
    content: {
      type: String,
      required: true,
      trim: true,
      minlength: [10, 'Announcement content must be at least 10 characters'],
      maxlength: [
        5000,
        'Announcement content must be less than 5000 characters',
      ],
    },
    category: {
      type: String,
      required: true,
      trim: true,
      enum: [
        'general',
        'service',
        'event',
        'prayer',
        'ministry',
        'youth',
        'children',
        'finance',
        'volunteer',
        'emergency',
      ],
    },
    priority: {
      type: String,
      required: true,
      enum: ['low', 'medium', 'high'],
      trim: true,
      default: 'medium',
    },
    publishDate: {
      type: Date,
      required: true,
    },
    expiryDate: {
      type: Date,
      validate: {
        validator(this: IAnnouncement, value: Date) {
          // Expiry date should be after publish date if provided
          return !value || value > this.publishDate;
        },
        message: 'Expiry date must be after publish date',
      },
    },
    status: {
      type: String,
      required: true,
      enum: ['draft', 'published', 'scheduled', 'expired'],
      trim: true,
      default: 'draft',
    },
    authorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    viewCount: {
      type: Number,
      default: 0,
      min: [0, 'View count cannot be negative'],
    },
    targetAudience: {
      type: [String],
      default: [],
    },
    attachments: {
      type: [String],
      default: [],
      validate: {
        validator(attachments: string[]) {
          return attachments.length <= 5; // Limit to 5 attachments
        },
        message: 'Maximum 5 attachments allowed',
      },
    },
    isSticky: {
      type: Boolean,
      default: false,
    },
    notificationSent: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields automatically
  }
);

// Add indexes for better query performance
AnnouncementSchema.index({ churchId: 1, branchId: 1 }); // Index by church and branch
AnnouncementSchema.index({ churchId: 1, category: 1 }); // Index by church and category
AnnouncementSchema.index({ churchId: 1, status: 1 }); // Index by church and status
AnnouncementSchema.index({ churchId: 1, priority: 1 }); // Index by church and priority
AnnouncementSchema.index({ churchId: 1, publishDate: -1 }); // Index by church and publish date (desc)
AnnouncementSchema.index({ churchId: 1, isSticky: -1, publishDate: -1 }); // For sticky announcements
AnnouncementSchema.index({ expiryDate: 1 }); // For cleaning up expired announcements
AnnouncementSchema.index({ authorId: 1 }); // Index by author

// Add text index for searching by title and content
AnnouncementSchema.index({
  title: 'text',
  content: 'text',
  category: 'text',
});

// Pre-save middleware for validation and data processing
AnnouncementSchema.pre('save', function (next) {
  // Ensure publish date is not too far in the future (1 year max)
  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
  if (this.publishDate > oneYearFromNow) {
    return next(
      new Error('Publish date cannot be more than 1 year in the future')
    );
  }
  // Auto-expire announcements if expiry date is passed
  if (
    this.expiryDate &&
    this.expiryDate <= new Date() &&
    this.status === 'published'
  ) {
    this.status = 'expired';
  }
  // Auto-publish if publish date is reached and status is draft
  if (this.publishDate <= new Date() && this.status === 'draft') {
    this.status = 'published';
  }
  next();
});

// Virtual for checking if announcement is active
AnnouncementSchema.virtual('isActive').get(function () {
  const now = new Date();
  return (
    this.status === 'published' &&
    this.publishDate <= now &&
    (!this.expiryDate || this.expiryDate > now)
  );
});

// Virtual for days until expiry
AnnouncementSchema.virtual('daysUntilExpiry').get(function () {
  if (!this.expiryDate) return null;
  const now = new Date();
  const diffTime = this.expiryDate.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for formatted publish date
AnnouncementSchema.virtual('formattedPublishDate').get(function () {
  return new Intl.DateTimeFormat('en-KE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(this.publishDate);
});

// Virtual for content preview (first 150 characters)
AnnouncementSchema.virtual('contentPreview').get(function () {
  return this.content.length > 150
    ? `${this.content.substring(0, 150)}...`
    : this.content;
});

// Method to increment view count
AnnouncementSchema.methods.incrementViewCount = function () {
  this.viewCount += 1;
  return this.save();
};

// Ensure virtuals are included in JSON output
AnnouncementSchema.set('toJSON', { virtuals: true });
AnnouncementSchema.set('toObject', { virtuals: true });

// Export the Announcement model
export default (mongoose.models.Announcement as IAnnouncementModel) ||
  mongoose.model<IAnnouncement, IAnnouncementModel>(
    'Announcement',
    AnnouncementSchema
  );
