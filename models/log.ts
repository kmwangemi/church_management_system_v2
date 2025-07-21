import mongoose, { type Document, Schema } from 'mongoose';

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
    },
    error: {
      name: { type: String, trim: true },
      message: { type: String, trim: true },
      stack: { type: String, trim: true },
      code: { type: String, trim: true },
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
    },
    environment: {
      type: String,
      required: true,
      trim: true,
      index: true,
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

// TTL index to automatically delete old logs (optional - removes logs after 90 days)
LogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

export const Log =
  mongoose.models.Log || mongoose.model<ILog>('Log', LogSchema);
