import mongoose, { Schema, type Document, type Model } from 'mongoose';

// Define the interface for a Content document
export interface IContent extends Document {
  churchId: mongoose.Types.ObjectId;
  branchId: mongoose.Types.ObjectId; // Reference to Branch Model
  title: string;
  description: string;
  type:
    | 'sermon'
    | 'bible_study'
    | 'prayer'
    | 'worship'
    | 'announcement'
    | 'event'
    | 'devotional'
    | 'testimony'
    | 'music'
    | 'video'
    | 'document'
    | 'image'
    | 'audio';
  category:
    | 'spiritual'
    | 'educational'
    | 'administrative'
    | 'worship'
    | 'youth'
    | 'children'
    | 'missions'
    | 'fellowship'
    | 'outreach'
    | 'discipleship';
  tags: string[];
  status: 'draft' | 'published' | 'archived' | 'private';
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  fileMimeType?: string;
  author?: string; // Could be user ID or name
  publishedAt?: Date;
  viewCount: number;
  downloadCount: number;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Define the interface for the static methods
export interface IContentModel extends Model<IContent> {
  // Example static methods you might add later:
  // findContentByBranch(branchId: mongoose.Types.ObjectId): Promise<IContent[]>;
  // findContentByCategory(category: string): Promise<IContent[]>;
  // findPublishedContent(): Promise<IContent[]>;
}

// Define the Mongoose Schema for Content
const ContentSchema = new Schema<IContent>(
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
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: [5, 'Content title must be at least 5 characters'],
      maxlength: [200, 'Content title must be less than 200 characters'],
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: [20, 'Description must be at least 20 characters'],
      maxlength: [1000, 'Description must be less than 1000 characters'],
    },
    type: {
      type: String,
      required: true,
      trim: true,
      enum: [
        'sermon',
        'bible_study',
        'prayer',
        'worship',
        'announcement',
        'event',
        'devotional',
        'testimony',
        'music',
        'video',
        'document',
        'image',
        'audio',
      ],
    },
    category: {
      type: String,
      required: true,
      trim: true,
      enum: [
        'spiritual',
        'educational',
        'administrative',
        'worship',
        'youth',
        'children',
        'missions',
        'fellowship',
        'outreach',
        'discipleship',
      ],
    },
    tags: {
      type: [String],
      required: true,
      validate: {
        validator: (tags: string[]) =>
          tags.length > 0 && tags.every((tag) => tag.trim().length > 0),
        message: 'At least one valid tag is required',
      },
    },
    status: {
      type: String,
      required: true,
      enum: ['draft', 'published', 'archived', 'private'],
      trim: true,
      default: 'draft',
    },
    fileUrl: {
      type: String,
      trim: true,
    },
    fileName: {
      type: String,
      trim: true,
    },
    fileSize: {
      type: Number,
      min: [0, 'File size must be greater than or equal to 0'],
      max: [104_857_600, 'File size must be less than or equal to 100MB'], // 100MB in bytes
    },
    fileMimeType: {
      type: String,
      trim: true,
    },
    author: {
      type: String,
      trim: true,
      maxlength: [100, 'Author name must be less than 100 characters'],
    },
    publishedAt: {
      type: Date,
    },
    viewCount: {
      type: Number,
      default: 0,
      min: [0, 'View count must be greater than or equal to 0'],
    },
    downloadCount: {
      type: Number,
      default: 0,
      min: [0, 'Download count must be greater than or equal to 0'],
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields automatically
  }
);

// Add indexes for better query performance
ContentSchema.index({ churchId: 1, branchId: 1 }); // Index by church and branch
ContentSchema.index({ churchId: 1, type: 1 }); // Index by church and content type
ContentSchema.index({ churchId: 1, category: 1 }); // Index by church and category
ContentSchema.index({ churchId: 1, status: 1 }); // Index by church and status
ContentSchema.index({ churchId: 1, tags: 1 }); // Index by church and tags
ContentSchema.index({ publishedAt: -1 }); // Index by published date (descending)
ContentSchema.index({ viewCount: -1 }); // Index by view count (descending)

// Add text index for searching by title, description, tags, and author
ContentSchema.index({
  title: 'text',
  description: 'text',
  tags: 'text',
  author: 'text',
});

// Pre-save middleware for validation and data processing
ContentSchema.pre('save', function (next) {
  // Set publishedAt when status changes to published
  if (this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  // Clear publishedAt when status is not published
  if (this.status !== 'published') {
    this.publishedAt = undefined;
  }
  // Normalize tags (trim whitespace and convert to lowercase)
  if (this.tags && Array.isArray(this.tags)) {
    this.tags = this.tags
      .map((tag) => tag.trim().toLowerCase())
      .filter((tag) => tag.length > 0);
  }
  next();
});

// Virtual for content age (in days)
ContentSchema.virtual('ageInDays').get(function () {
  return Math.floor(
    (Date.now() - this.createdAt.getTime()) / (1000 * 60 * 60 * 24)
  );
});

// Virtual for formatted file size
ContentSchema.virtual('formattedFileSize').get(function () {
  if (!this.fileSize) return null;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (this.fileSize === 0) return '0 Bytes';
  const i = Math.floor(Math.log(this.fileSize) / Math.log(1024));
  return `${Math.round((this.fileSize / 1024 ** i) * 100) / 100} ${sizes[i]}`;
});

// Virtual for engagement score (based on views and downloads)
ContentSchema.virtual('engagementScore').get(function () {
  return this.viewCount + this.downloadCount * 2; // Downloads weighted more than views
});

// Ensure virtuals are included in JSON output
ContentSchema.set('toJSON', { virtuals: true });
ContentSchema.set('toObject', { virtuals: true });

// Export the Content model
export default (mongoose.models.Content as IContentModel) ||
  mongoose.model<IContent, IContentModel>('Content', ContentSchema);
