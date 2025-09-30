import mongoose, { Schema, type Document, type Model } from 'mongoose';

export interface ILog extends Document {
  level: 'error' | 'warn' | 'info' | 'debug';
  message: string;
  error?: {
    name?: string;
    message?: string;
    stack?: string;
    code?: string;
  };
  metadata?: {
    userId?: string;
    churchId?: string;
    endpoint?: string;
    method?: string;
    userAgent?: string;
    ip?: string;
    requestId?: string;
    [key: string]: any;
  };
  timestamp: Date;
  source: string; // e.g., 'api', 'client', 'server', 'database'
  environment: string; // e.g., 'development', 'production', 'staging'
  createdAt: Date;
  updatedAt: Date;
}

// Define the interface for the static methods
export interface ILogModel extends Model<ILog> {
  findByLevel(level: string): mongoose.Query<ILog[], ILog>;
  findBySource(source: string): mongoose.Query<ILog[], ILog>;
  findByEnvironment(environment: string): mongoose.Query<ILog[], ILog>;
  findRecent(hours?: number): mongoose.Query<ILog[], ILog>;
  findErrors(): mongoose.Query<ILog[], ILog>;
  findByChurch(churchId: mongoose.Types.ObjectId): mongoose.Query<ILog[], ILog>;
  findByUser(userId: mongoose.Types.ObjectId): mongoose.Query<ILog[], ILog>;
  cleanup(olderThanDays?: number): Promise<any>;
}

const LogSchema = new Schema<ILog>(
  {
    level: {
      type: String,
      enum: ['error', 'warn', 'info', 'debug'],
      required: true,
      index: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: [2000, 'Log message cannot exceed 2000 characters'],
    },
    error: {
      name: {
        type: String,
        trim: true,
        maxlength: [200, 'Error name cannot exceed 200 characters'],
      },
      message: {
        type: String,
        trim: true,
        maxlength: [1000, 'Error message cannot exceed 1000 characters'],
      },
      stack: {
        type: String,
        trim: true,
        maxlength: [5000, 'Error stack cannot exceed 5000 characters'],
      },
      code: {
        type: String,
        trim: true,
        maxlength: [50, 'Error code cannot exceed 50 characters'],
      },
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    source: {
      type: String,
      required: true,
      trim: true,
      index: true,
      enum: ['api', 'client', 'server', 'database', 'auth', 'payment', 'email'],
    },
    environment: {
      type: String,
      required: true,
      trim: true,
      index: true,
      enum: ['development', 'staging', 'production', 'test'],
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for efficient queries
LogSchema.index({ level: 1, timestamp: -1 });
LogSchema.index({ source: 1, level: 1, timestamp: -1 });
LogSchema.index({ environment: 1, timestamp: -1 });
LogSchema.index({ 'metadata.churchId': 1, timestamp: -1 });
LogSchema.index({ 'metadata.userId': 1, timestamp: -1 });

// TTL index to automatically delete old logs (optional - removes logs after 90 days)
LogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

// Add text index for searching log messages
LogSchema.index({
  message: 'text',
  'error.message': 'text',
  source: 'text',
});

// Virtual to format timestamp
LogSchema.virtual('formattedTimestamp').get(function () {
  return new Intl.DateTimeFormat('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short',
  }).format(this.timestamp);
});

// Virtual to check if log is recent (within last hour)
LogSchema.virtual('isRecent').get(function () {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  return this.timestamp > oneHourAgo;
});

// Virtual to get log severity level as number (for sorting)
LogSchema.virtual('severityLevel').get(function () {
  const levels = { debug: 1, info: 2, warn: 3, error: 4 };
  return levels[this.level] || 0;
});

// Virtual to check if it's an error log
LogSchema.virtual('isError').get(function () {
  return this.level === 'error';
});

// Pre-save middleware
LogSchema.pre('save', function (next) {
  // Ensure timestamp is not in the future
  if (this.timestamp > new Date()) {
    this.timestamp = new Date();
  }

  // Auto-set environment if not provided
  if (!this.environment) {
    this.environment = process.env.NODE_ENV || 'development';
  }

  // Sanitize metadata to prevent circular references
  if (this.metadata && typeof this.metadata === 'object') {
    try {
      JSON.stringify(this.metadata);
    } catch (_error) {
      this.metadata = { error: 'Circular reference detected in metadata' };
    }
  }

  next();
});

// Static methods
LogSchema.statics.findByLevel = function (level: string) {
  return this.find({ level }).sort({ timestamp: -1 });
};

LogSchema.statics.findBySource = function (source: string) {
  return this.find({ source }).sort({ timestamp: -1 });
};

LogSchema.statics.findByEnvironment = function (environment: string) {
  return this.find({ environment }).sort({ timestamp: -1 });
};

LogSchema.statics.findRecent = function (hours = 24) {
  const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
  return this.find({ timestamp: { $gte: cutoff } }).sort({ timestamp: -1 });
};

LogSchema.statics.findErrors = function () {
  return this.find({ level: 'error' }).sort({ timestamp: -1 });
};

LogSchema.statics.findByChurch = function (churchId: mongoose.Types.ObjectId) {
  return this.find({ 'metadata.churchId': churchId.toString() }).sort({
    timestamp: -1,
  });
};

LogSchema.statics.findByUser = function (userId: mongoose.Types.ObjectId) {
  return this.find({ 'metadata.userId': userId.toString() }).sort({
    timestamp: -1,
  });
};

LogSchema.statics.cleanup = function (olderThanDays = 90) {
  const cutoff = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000);
  return this.deleteMany({ timestamp: { $lt: cutoff } });
};

// Ensure virtuals are included in JSON output
LogSchema.set('toJSON', { virtuals: true });
LogSchema.set('toObject', { virtuals: true });

// Export the Log model
export default (mongoose.models.Log as ILogModel) ||
  mongoose.model<ILog, ILogModel>('Log', LogSchema);
