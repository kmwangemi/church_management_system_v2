/** biome-ignore-all lint/complexity/noExcessiveCognitiveComplexity: ignore complexity */

import mongoose, { Schema, type Document, type Model } from 'mongoose';

export interface IPledge extends Document {
  churchId: mongoose.Types.ObjectId;
  memberId: mongoose.Types.ObjectId; // Reference to User Model
  amount: number;
  paid: number;
  remaining: number;
  dueDate: Date;
  purpose: string;
  paymentSchedule:
    | 'one-time'
    | 'daily'
    | 'weekly'
    | 'monthly'
    | 'quarterly'
    | 'annually';
  notes?: string;
  status: 'active' | 'completed' | 'cancelled' | 'overdue';
  createdAt: Date;
  updatedAt: Date;
}

// Interface for the static methods
export interface IPledgeModel extends Model<IPledge> {
  findByStatus(
    status: string,
    churchId: mongoose.Types.ObjectId
  ): Promise<IPledge[]>;
  findOverdue(churchId: mongoose.Types.ObjectId): Promise<IPledge[]>;
  updateOverdueStatuses(
    churchId?: mongoose.Types.ObjectId
  ): Promise<{ modifiedCount: number }>;
}

const PledgeSchema = new Schema<IPledge>(
  {
    churchId: {
      type: Schema.Types.ObjectId,
      ref: 'Church',
      required: true,
    },
    memberId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [0, 'Amount must be greater than or equal to 0'],
    },
    paid: {
      type: Number,
      required: true,
      min: [0, 'Paid amount must be greater than or equal to 0'],
      default: 0,
    },
    remaining: {
      type: Number,
      // Remove required: true since we'll calculate it
      min: [0, 'Remaining amount must be greater than or equal to 0'],
    },
    dueDate: {
      type: Date,
      required: true,
    },
    purpose: {
      type: String,
      required: true,
      trim: true,
      enum: [
        'building-fund',
        'mission-trip',
        'youth-program',
        'equipment',
        'outreach',
        'education',
        'other',
      ],
    },
    paymentSchedule: {
      type: String,
      required: true,
      enum: ['one-time', 'daily', 'weekly', 'monthly', 'quarterly', 'annually'],
      default: 'one-time',
    },
    notes: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'cancelled', 'overdue'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware to auto-calculate remaining amount and status
PledgeSchema.pre('save', function (next) {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set to start of day for accurate comparison
  // Calculate remaining amount
  this.remaining = Math.max(0, this.amount - this.paid);
  // Auto-update status based on remaining amount and due date
  if (this.remaining === 0 && this.paid > 0) {
    this.status = 'completed';
  } else if (this.remaining > 0) {
    // Check if overdue (past due date and not completed/cancelled)
    if (this.dueDate < today && this.status !== 'cancelled') {
      this.status = 'overdue';
    } else if (
      this.dueDate >= today &&
      (this.status === 'overdue' || this.status !== 'cancelled')
    ) {
      // If due date is in future and was overdue, reset to active
      // Or if it's a new/updated pledge that's not cancelled
      this.status = 'active';
    }
  }
  next();
});

// Pre-update middleware for findOneAndUpdate operations
PledgeSchema.pre(
  ['findOneAndUpdate', 'updateOne', 'updateMany'],
  function (next) {
    const update = this.getUpdate() as any;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // If either amount, paid, or dueDate is being updated, recalculate status
    if (
      update.amount !== undefined ||
      update.paid !== undefined ||
      update.dueDate !== undefined
    ) {
      // We need to get the current document to calculate properly
      const currentAmount = update.amount;
      const currentPaid = update.paid;
      const currentDueDate = update.dueDate;
      if (currentAmount !== undefined && currentPaid !== undefined) {
        update.remaining = Math.max(0, currentAmount - currentPaid);
        // Auto-update status
        if (update.remaining === 0 && currentPaid > 0) {
          update.status = 'completed';
        } else if (update.remaining > 0) {
          const dueDate = currentDueDate || new Date(); // Use updated or current date
          if (dueDate < today && update.status !== 'cancelled') {
            update.status = 'overdue';
          } else if (
            dueDate >= today &&
            (update.status === 'overdue' || update.status !== 'cancelled')
          ) {
            update.status = 'active';
          }
        }
      }
    }
    next();
  }
);

// Virtual for completion percentage
PledgeSchema.virtual('completionPercentage').get(function () {
  if (this.amount === 0) return 0;
  return Math.round((this.paid / this.amount) * 100);
});

// Virtual for days until due
PledgeSchema.virtual('daysUntilDue').get(function () {
  const today = new Date();
  const diffTime = this.dueDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Virtual for overdue status
PledgeSchema.virtual('isOverdue').get(function () {
  return new Date() > this.dueDate && this.status === 'active';
});

// Instance method to make a payment
PledgeSchema.methods.makePayment = function (paymentAmount: number) {
  if (paymentAmount <= 0) {
    throw new Error('Payment amount must be greater than 0');
  }
  if (this.status === 'cancelled') {
    throw new Error('Cannot make payment on cancelled pledge');
  }
  const newPaidAmount = this.paid + paymentAmount;
  if (newPaidAmount > this.amount) {
    throw new Error('Payment amount exceeds remaining pledge amount');
  }
  this.paid = newPaidAmount;
  // The remaining amount and status will be calculated in the pre-save middleware
  return this.save();
};

// Static method to get pledges by status
PledgeSchema.statics.findByStatus = function (
  status: string,
  churchId: mongoose.Types.ObjectId
) {
  return this.find({ status, churchId }).populate(
    'memberId',
    'firstName lastName email'
  );
};

// Static method to get overdue pledges (now uses status instead of date comparison)
PledgeSchema.statics.findOverdue = function (
  churchId: mongoose.Types.ObjectId
) {
  return this.find({
    churchId,
    status: 'overdue',
  }).populate('memberId', 'firstName lastName email');
};

// Static method to update overdue statuses (useful for cron jobs)
PledgeSchema.statics.updateOverdueStatuses = function (
  churchId?: mongoose.Types.ObjectId
) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const query: any = {
    dueDate: { $lt: today },
    status: 'active', // Only update active pledges to overdue
    remaining: { $gt: 0 }, // Only if there's still amount remaining
  };
  if (churchId) {
    query.churchId = churchId;
  }
  return this.updateMany(query, { status: 'overdue' });
};

// Index for better query performance
PledgeSchema.index({ churchId: 1, status: 1 });
PledgeSchema.index({ memberId: 1, status: 1 });
PledgeSchema.index({ dueDate: 1, status: 1 });

// Ensure virtuals are included in JSON output
PledgeSchema.set('toJSON', { virtuals: true });
PledgeSchema.set('toObject', { virtuals: true });

export default (mongoose.models.Pledge as IPledgeModel) ||
  mongoose.model<IPledge, IPledgeModel>('Pledge', PledgeSchema);
