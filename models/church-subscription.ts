import mongoose, { Schema, type Document, type Model } from 'mongoose';

export interface IChurchSubscription extends Document {
  churchId: mongoose.Types.ObjectId;
  plan: 'basic' | 'standard' | 'premium' | 'enterprise';
  status: 'active' | 'expired' | 'canceled' | 'trial';
  isPaid: boolean;
  invoiceAmount: number;
  paidAmount: number;
  balAmount: number;
  maxUsers?: number;
  currentUsers?: number;
  features?: string[];
  startDate: Date;
  endDate: Date;
  isAutoRenew: boolean;
  paymentMethod?: string;
  lastPaymentDate?: Date;
  nextBillingDate?: Date;
  canceledAt?: Date;
  cancelReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Define the interface for the static methods
export interface IChurchSubscriptionModel extends Model<IChurchSubscription> {
  findActiveSubscriptions(): mongoose.Query<
    IChurchSubscription[],
    IChurchSubscription
  >;
  findExpiredSubscriptions(): mongoose.Query<
    IChurchSubscription[],
    IChurchSubscription
  >;
  findNearExpiry(
    days?: number
  ): mongoose.Query<IChurchSubscription[], IChurchSubscription>;
  findByChurch(
    churchId: mongoose.Types.ObjectId
  ): mongoose.Query<IChurchSubscription | null, IChurchSubscription>;
  findByPlan(
    plan: string
  ): mongoose.Query<IChurchSubscription[], IChurchSubscription>;
  findOverUserLimit(): mongoose.Query<
    IChurchSubscription[],
    IChurchSubscription
  >;
  updateUserCount(
    churchId: mongoose.Types.ObjectId,
    userCount: number
  ): mongoose.Query<IChurchSubscription | null, IChurchSubscription>;
}

const ChurchSubscriptionSchema = new Schema<IChurchSubscription>(
  {
    churchId: {
      type: Schema.Types.ObjectId,
      ref: 'Church',
      required: true,
      unique: true,
      index: true,
    },
    plan: {
      type: String,
      enum: {
        values: ['basic', 'standard', 'premium', 'enterprise'],
        message:
          'Subscription plan must be basic, standard, premium, or enterprise',
      },
      required: [true, 'Subscription plan is required'],
      index: true,
    },
    status: {
      type: String,
      enum: ['active', 'expired', 'canceled', 'trial'],
      required: true,
      default: 'trial',
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    invoiceAmount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    balAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxUsers: {
      type: Number,
      min: 1,
    },
    currentUsers: {
      type: Number,
      default: 0,
      min: 0,
    },
    features: [
      {
        type: String,
        trim: true,
      },
    ],
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    isAutoRenew: {
      type: Boolean,
      default: true,
    },
    paymentMethod: {
      type: String,
      trim: true,
      enum: ['credit_card', 'paypal', 'stripe', 'm-pesa'],
    },
    lastPaymentDate: {
      type: Date,
    },
    nextBillingDate: {
      type: Date,
    },
    canceledAt: {
      type: Date,
    },
    cancelReason: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better query performance
ChurchSubscriptionSchema.index({ churchId: 1, status: 1 });
ChurchSubscriptionSchema.index({ status: 1, endDate: 1 });
ChurchSubscriptionSchema.index({ plan: 1, status: 1 });
ChurchSubscriptionSchema.index({ nextBillingDate: 1, isAutoRenew: 1 });

// Virtual to check if subscription is expired
ChurchSubscriptionSchema.virtual('isExpired').get(function () {
  return new Date() > this.endDate;
});

// Virtual to check days remaining
ChurchSubscriptionSchema.virtual('daysRemaining').get(function () {
  const now = new Date();
  if (now > this.endDate) return 0;
  const diffTime = this.endDate.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual to check if approaching renewal
ChurchSubscriptionSchema.virtual('isNearExpiry').get(function () {
  const daysRemaining = this.get('daysRemaining');
  return daysRemaining <= 7 && daysRemaining > 0;
});

// Virtual to check if over user limit
ChurchSubscriptionSchema.virtual('isOverUserLimit').get(function () {
  return (
    this.currentUsers != null &&
    this.maxUsers != null &&
    this.currentUsers > this.maxUsers
  );
});

// Virtual to get usage percentage
ChurchSubscriptionSchema.virtual('usagePercentage').get(function () {
  if (this.currentUsers == null || this.maxUsers == null) return 0;
  return Math.round((this.currentUsers / this.maxUsers) * 100);
});

// Helper functions for pre-save logic
function setDefaultMaxUsers(doc: IChurchSubscription) {
  if (!doc.maxUsers) {
    switch (doc.plan) {
      case 'basic':
        doc.maxUsers = 50;
        break;
      case 'standard':
        doc.maxUsers = 200;
        break;
      case 'premium':
        doc.maxUsers = 500;
        break;
      case 'enterprise':
        doc.maxUsers = 9999;
        break;
      default:
        doc.maxUsers = 50;
    }
  }
}

function calculateBalanceAndPaidStatus(doc: IChurchSubscription) {
  doc.balAmount = doc.invoiceAmount - doc.paidAmount;
  doc.isPaid = doc.paidAmount >= doc.invoiceAmount;
}

function updateStatusIfExpired(doc: IChurchSubscription) {
  if (new Date() > doc.endDate && doc.status === 'active') {
    doc.status = 'expired';
  }
}

function setNextBillingDate(doc: IChurchSubscription) {
  if (doc.isAutoRenew && doc.status === 'active') {
    doc.nextBillingDate = doc.endDate;
  }
}

function setCanceledTimestamp(doc: IChurchSubscription) {
  if (doc.status === 'canceled' && !doc.canceledAt) {
    doc.canceledAt = new Date();
  }
}

function setDefaultFeatures(doc: IChurchSubscription) {
  if (!doc.features || doc.features.length === 0) {
    switch (doc.plan) {
      case 'basic':
        doc.features = ['user_management', 'basic_reports', 'events'];
        break;
      case 'standard':
        doc.features = [
          'user_management',
          'basic_reports',
          'events',
          'finances',
          'advanced_reports',
        ];
        break;
      case 'premium':
        doc.features = [
          'user_management',
          'basic_reports',
          'events',
          'finances',
          'advanced_reports',
          'custom_fields',
          'api_access',
        ];
        break;
      case 'enterprise':
        doc.features = [
          'user_management',
          'basic_reports',
          'events',
          'finances',
          'advanced_reports',
          'custom_fields',
          'api_access',
          'white_label',
          'priority_support',
        ];
        break;
      default:
        doc.features = ['user_management', 'basic_reports', 'events'];
    }
  }
}

// Pre-save middleware
ChurchSubscriptionSchema.pre('save', function (next) {
  setDefaultMaxUsers(this);
  calculateBalanceAndPaidStatus(this);
  updateStatusIfExpired(this);
  setNextBillingDate(this);
  setCanceledTimestamp(this);
  setDefaultFeatures(this);
  next();
});

// Instance methods
ChurchSubscriptionSchema.methods.cancel = function (reason?: string) {
  this.status = 'canceled';
  this.canceledAt = new Date();
  this.isAutoRenew = false;
  if (reason) this.cancelReason = reason;
  return this.save();
};

ChurchSubscriptionSchema.methods.renew = function (months = 1) {
  const newEndDate = new Date(this.endDate);
  newEndDate.setMonth(newEndDate.getMonth() + months);
  this.endDate = newEndDate;
  this.status = 'active';
  this.nextBillingDate = newEndDate;
  return this.save();
};

// Static methods
ChurchSubscriptionSchema.statics.findActiveSubscriptions = function () {
  return this.find({ status: 'active' });
};

ChurchSubscriptionSchema.statics.findExpiredSubscriptions = function () {
  return this.find({
    $or: [{ status: 'expired' }, { endDate: { $lt: new Date() } }],
  });
};

ChurchSubscriptionSchema.statics.findNearExpiry = function (days = 7) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  return this.find({
    status: 'active',
    endDate: { $gte: new Date(), $lte: futureDate },
  });
};

ChurchSubscriptionSchema.statics.findByChurch = function (
  churchId: mongoose.Types.ObjectId
) {
  return this.findOne({ churchId }).sort({ createdAt: -1 });
};

ChurchSubscriptionSchema.statics.findByPlan = function (plan: string) {
  return this.find({ plan, status: 'active' });
};

ChurchSubscriptionSchema.statics.findOverUserLimit = function () {
  return this.find({
    status: 'active',
    $expr: { $gt: ['$currentUsers', '$maxUsers'] },
  });
};

ChurchSubscriptionSchema.statics.updateUserCount = function (
  churchId: mongoose.Types.ObjectId,
  userCount: number
) {
  return this.findOneAndUpdate(
    { churchId },
    { currentUsers: userCount },
    { new: true }
  );
};

// Export the ChurchSubscription model
export default (mongoose.models
  .ChurchSubscription as IChurchSubscriptionModel) ||
  mongoose.model<IChurchSubscription, IChurchSubscriptionModel>(
    'ChurchSubscription',
    ChurchSubscriptionSchema
  );
