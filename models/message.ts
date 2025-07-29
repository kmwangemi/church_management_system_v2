import mongoose, { Schema, type Document, type Model } from 'mongoose';

// Define the interface for a Message document
export interface IMessage extends Document {
  churchId: mongoose.Types.ObjectId;
  branchId: mongoose.Types.ObjectId;
  type: 'sms' | 'email';
  title: string;
  content: string;
  recipients: string[]; // Array of recipient group IDs
  scheduleType: 'now' | 'scheduled' | 'draft';
  scheduleDate?: Date;
  scheduleTime?: string;
  templateId?: mongoose.Types.ObjectId;
  status: 'draft' | 'scheduled' | 'sent' | 'failed' | 'cancelled';
  sentAt?: Date;
  deliveryStats: {
    total: number;
    sent: number;
    delivered: number;
    failed: number;
  };
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Define the interface for static methods
export interface IMessageModel extends Model<IMessage> {
  findMessagesByChurch(churchId: mongoose.Types.ObjectId): Promise<IMessage[]>;
  findScheduledMessages(): Promise<IMessage[]>;
}

// Define the Mongoose Schema for Message
const MessageSchema = new Schema<IMessage>(
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
    type: {
      type: String,
      required: true,
      enum: ['sms', 'email'],
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: [2, 'Message title must be at least 2 characters'],
      maxlength: [100, 'Message title must be less than 100 characters'],
    },
    content: {
      type: String,
      required: true,
      trim: true,
      minlength: [10, 'Message content must be at least 10 characters'],
      maxlength: [5000, 'Message content must be less than 5000 characters'],
    },
    recipients: {
      type: [String],
      required: true,
      validate: {
        validator(v: string[]) {
          return v && v.length > 0;
        },
        message: 'At least one recipient group must be selected',
      },
    },
    scheduleType: {
      type: String,
      required: true,
      enum: ['now', 'scheduled', 'draft'],
      default: 'now',
    },
    scheduleDate: {
      type: Date,
      validate: {
        validator(this: IMessage, v: Date) {
          if (this.scheduleType === 'scheduled') {
            return v && v > new Date();
          }
          return true;
        },
        message: 'Schedule date must be in the future for scheduled messages',
      },
    },
    scheduleTime: {
      type: String,
      trim: true,
      validate: {
        validator(v: string) {
          if (!v) return true;
          // Validate time format (HH:MM)
          // biome-ignore lint/performance/useTopLevelRegex: ignore
          return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
        },
        message: 'Invalid time format. Use HH:MM format',
      },
    },
    templateId: {
      type: Schema.Types.ObjectId,
      ref: 'MessageTemplate',
    },
    status: {
      type: String,
      required: true,
      enum: ['draft', 'scheduled', 'sent', 'failed', 'cancelled'],
      default(this: IMessage) {
        return this.scheduleType === 'draft'
          ? 'draft'
          : this.scheduleType === 'scheduled'
            ? 'scheduled'
            : 'sent';
      },
    },
    sentAt: {
      type: Date,
    },
    deliveryStats: {
      total: {
        type: Number,
        default: 0,
        min: 0,
      },
      sent: {
        type: Number,
        default: 0,
        min: 0,
      },
      delivered: {
        type: Number,
        default: 0,
        min: 0,
      },
      failed: {
        type: Number,
        default: 0,
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
MessageSchema.index({ churchId: 1, branchId: 1 });
MessageSchema.index({ churchId: 1, status: 1 });
MessageSchema.index({ churchId: 1, type: 1 });
MessageSchema.index({ scheduleDate: 1, status: 1 }); // For scheduled messages
MessageSchema.index({ createdBy: 1 });

// Add text index for searching
MessageSchema.index({
  title: 'text',
  content: 'text',
});

// Pre-save middleware
MessageSchema.pre('save', function (next) {
  // Set sentAt when status changes to sent
  if (this.isModified('status') && this.status === 'sent' && !this.sentAt) {
    this.sentAt = new Date();
  }
  // Validate schedule requirements
  if (this.scheduleType === 'scheduled') {
    if (!this.scheduleDate) {
      return next(
        new Error('Schedule date is required for scheduled messages')
      );
    }
    if (this.scheduleDate <= new Date()) {
      return next(new Error('Schedule date must be in the future'));
    }
  }
  next();
});

// Static methods
MessageSchema.statics.findMessagesByChurch = function (
  churchId: mongoose.Types.ObjectId
) {
  return this.find({ churchId }).sort({ createdAt: -1 });
};

MessageSchema.statics.findScheduledMessages = function () {
  return this.find({
    status: 'scheduled',
    scheduleDate: { $lte: new Date() },
  });
};

// Virtual for delivery rate
MessageSchema.virtual('deliveryRate').get(function () {
  if (this.deliveryStats.total === 0) return 0;
  return Math.round(
    (this.deliveryStats.delivered / this.deliveryStats.total) * 100
  );
});

// Virtual for formatted schedule datetime
MessageSchema.virtual('scheduledDateTime').get(function () {
  if (!this.scheduleDate) return null;
  const date = this.scheduleDate;
  if (this.scheduleTime) {
    const [hours, minutes] = this.scheduleTime.split(':');
    date.setHours(Number.parseInt(hours, 10), Number.parseInt(minutes, 10));
  }
  return date;
});

// Ensure virtuals are included in JSON output
MessageSchema.set('toJSON', { virtuals: true });
MessageSchema.set('toObject', { virtuals: true });

// Export the Message model
export default (mongoose.models.Message as IMessageModel) ||
  mongoose.model<IMessage, IMessageModel>('Message', MessageSchema);
