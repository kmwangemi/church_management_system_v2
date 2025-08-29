import mongoose, { Schema, type Document, type Model } from 'mongoose';

// Define the interface for a Report document
export interface IReport extends Document {
  churchId: mongoose.Types.ObjectId;
  branchId?: mongoose.Types.ObjectId;
  name: string;
  type:
    | 'attendance'
    | 'financial'
    | 'membership'
    | 'events'
    | 'giving'
    | 'activities';
  description: string;
  dateRange:
    | 'last7days'
    | 'last30days'
    | 'last3months'
    | 'last6months'
    | 'lastyear'
    | 'custom';
  customStartDate?: Date;
  customEndDate?: Date;
  format: 'pdf' | 'excel' | 'csv';
  includeCharts: boolean;
  includeComparisons: boolean;
  departments: string[]; // Array of department/group IDs
  status: 'generating' | 'completed' | 'failed' | 'cancelled';
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  generatedAt?: Date;
  downloadCount: number;
  reportData?: {
    totalRecords: number;
    departmentCounts: Array<{
      departmentId: string;
      departmentName: string;
      count: number;
    }>;
    dateRangeUsed: {
      startDate: Date;
      endDate: Date;
    };
    generationTime: number; // in milliseconds
  };
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Define the interface for static methods
export interface IReportModel extends Model<IReport> {
  findReportsByChurch(churchId: mongoose.Types.ObjectId): Promise<IReport[]>;
  findPendingReports(): Promise<IReport[]>;
  findCompletedReports(churchId: mongoose.Types.ObjectId): Promise<IReport[]>;
}

// Define the Mongoose Schema for Report
const ReportSchema = new Schema<IReport>(
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
      minlength: [5, 'Report name must be at least 5 characters'],
      maxlength: [100, 'Report name must be less than 100 characters'],
    },
    type: {
      type: String,
      required: true,
      enum: [
        'attendance',
        'financial',
        'membership',
        'events',
        'giving',
        'activities',
      ],
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: [10, 'Description must be at least 10 characters'],
      maxlength: [500, 'Description must be less than 500 characters'],
    },
    dateRange: {
      type: String,
      required: true,
      enum: [
        'last7days',
        'last30days',
        'last3months',
        'last6months',
        'lastyear',
        'custom',
      ],
      default: 'last30days',
    },
    customStartDate: {
      type: Date,
      validate: {
        validator(this: IReport, v: Date) {
          if (this.dateRange === 'custom') {
            return v && v <= new Date();
          }
          return true;
        },
        message: 'Custom start date is required and must not be in the future',
      },
    },
    customEndDate: {
      type: Date,
      validate: {
        validator(this: IReport, v: Date) {
          if (this.dateRange === 'custom') {
            return (
              v &&
              v <= new Date() &&
              (!this.customStartDate || v >= this.customStartDate)
            );
          }
          return true;
        },
        message: 'Custom end date is required and must be after start date',
      },
    },
    format: {
      type: String,
      required: true,
      enum: ['pdf', 'excel', 'csv'],
      default: 'pdf',
    },
    includeCharts: {
      type: Boolean,
      default: true,
    },
    includeComparisons: {
      type: Boolean,
      default: false,
    },
    departments: {
      type: [String],
      required: true,
      validate: {
        validator(v: string[]) {
          return v && v.length > 0;
        },
        message: 'At least one department must be selected',
      },
    },
    status: {
      type: String,
      required: true,
      enum: ['generating', 'completed', 'failed', 'cancelled'],
      default: 'generating',
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
      min: 0,
    },
    generatedAt: {
      type: Date,
    },
    downloadCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    reportData: {
      totalRecords: {
        type: Number,
        default: 0,
        min: 0,
      },
      departmentCounts: [
        {
          departmentId: {
            type: String,
            required: true,
          },
          departmentName: {
            type: String,
            required: true,
          },
          count: {
            type: Number,
            required: true,
            min: 0,
          },
        },
      ],
      dateRangeUsed: {
        startDate: {
          type: Date,
          required: true,
        },
        endDate: {
          type: Date,
          required: true,
        },
      },
      generationTime: {
        type: Number,
        min: 0,
      },
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Add indexes for better query performance
ReportSchema.index({ churchId: 1, branchId: 1 });
ReportSchema.index({ churchId: 1, status: 1 });
ReportSchema.index({ churchId: 1, type: 1 });
ReportSchema.index({ createdBy: 1 });
ReportSchema.index({ status: 1, createdAt: 1 }); // For pending reports
ReportSchema.index({ generatedAt: 1 }); // For cleanup operations

// Add text index for searching
ReportSchema.index({
  name: 'text',
  description: 'text',
});

// Pre-save middleware
ReportSchema.pre('save', function (next) {
  // Set generatedAt when status changes to completed
  if (
    this.isModified('status') &&
    this.status === 'completed' &&
    !this.generatedAt
  ) {
    this.generatedAt = new Date();
  }

  // Validate custom date requirements
  if (this.dateRange === 'custom') {
    if (!(this.customStartDate && this.customEndDate)) {
      return next(
        new Error('Both start and end dates are required for custom date range')
      );
    }
    if (this.customStartDate >= this.customEndDate) {
      return next(new Error('Start date must be before end date'));
    }
  }

  // Generate file name if not provided
  if (this.status === 'completed' && !this.fileName) {
    const timestamp = new Date().toISOString().slice(0, 10);
    const extension = this.format === 'excel' ? 'xlsx' : this.format;
    this.fileName = `${this.name.replace(/\s+/g, '_').toLowerCase()}_${timestamp}.${extension}`;
  }
  next();
});

// Static methods
ReportSchema.statics.findReportsByChurch = function (
  churchId: mongoose.Types.ObjectId
) {
  return this.find({ churchId }).sort({ createdAt: -1 });
};

ReportSchema.statics.findPendingReports = function () {
  return this.find({
    status: 'generating',
    createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // Within last 24 hours
  });
};

ReportSchema.statics.findCompletedReports = function (
  churchId: mongoose.Types.ObjectId
) {
  return this.find({
    churchId,
    status: 'completed',
  }).sort({ generatedAt: -1 });
};

// Virtual for formatted file size
ReportSchema.virtual('formattedFileSize').get(function () {
  if (!this.fileSize) return null;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(this.fileSize) / Math.log(1024));
  return `${Math.round((this.fileSize / 1024 ** i) * 100) / 100} ${sizes[i]}`;
});

// Virtual for generation duration
ReportSchema.virtual('generationDuration').get(function () {
  if (!this.reportData?.generationTime) return null;
  const seconds = Math.round(this.reportData.generationTime / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
});

// Virtual for date range display
ReportSchema.virtual('dateRangeDisplay').get(function () {
  if (
    this.dateRange === 'custom' &&
    this.customStartDate &&
    this.customEndDate
  ) {
    return `${this.customStartDate.toLocaleDateString()} - ${this.customEndDate.toLocaleDateString()}`;
  }
  const ranges = {
    last7days: 'Last 7 days',
    last30days: 'Last 30 days',
    last3months: 'Last 3 months',
    last6months: 'Last 6 months',
    lastyear: 'Last year',
  };
  return ranges[this.dateRange as keyof typeof ranges] || this.dateRange;
});

// Ensure virtuals are included in JSON output
ReportSchema.set('toJSON', { virtuals: true });
ReportSchema.set('toObject', { virtuals: true });

// Export the Report model
export default (mongoose.models.Report as IReportModel) ||
  mongoose.model<IReport, IReportModel>('Report', ReportSchema);
