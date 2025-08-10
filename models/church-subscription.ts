import mongoose, { type Document, Schema } from 'mongoose';

export interface ISubscription extends Document {
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
  // Virtual properties
  readonly isExpired: boolean;
  readonly daysRemaining: number;
  readonly isNearExpiry: boolean;
  readonly isOverUserLimit: boolean;
  readonly usagePercentage: number;
  // Instance methods
  cancel(reason?: string): Promise<ISubscription>;
  renew(months?: number): Promise<ISubscription>;
}

// Extend the Model interface for static methods
interface ISubscriptionModel extends mongoose.Model<ISubscription> {
  findActiveSubscriptions(): mongoose.Query<ISubscription[], ISubscription>;
  findExpiredSubscriptions(): mongoose.Query<ISubscription[], ISubscription>;
  findNearExpiry(days?: number): mongoose.Query<ISubscription[], ISubscription>;
  findByChurch(
    churchId: mongoose.Types.ObjectId
  ): mongoose.Query<ISubscription | null, ISubscription>;
  findByPlan(plan: string): mongoose.Query<ISubscription[], ISubscription>;
  findOverUserLimit(): mongoose.Query<ISubscription[], ISubscription>;
  updateUserCount(
    churchId: mongoose.Types.ObjectId,
    userCount: number
  ): mongoose.Query<ISubscription | null, ISubscription>;
}

const SubscriptionSchema = new Schema<ISubscription>(
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
      enum: ['basic', 'standard', 'premium', 'enterprise'],
      required: true,
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
SubscriptionSchema.index({ churchId: 1, status: 1 });
SubscriptionSchema.index({ status: 1, endDate: 1 });
SubscriptionSchema.index({ plan: 1, status: 1 });
SubscriptionSchema.index({ nextBillingDate: 1, isAutoRenew: 1 });

// Virtual to check if subscription is expired
SubscriptionSchema.virtual('isExpired').get(function (this: ISubscription) {
  return new Date() > this.endDate;
});

// Virtual to check days remaining
SubscriptionSchema.virtual('daysRemaining').get(function (this: ISubscription) {
  const now = new Date();
  if (now > this.endDate) return 0;
  const diffTime = this.endDate.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual to check if approaching renewal
SubscriptionSchema.virtual('isNearExpiry').get(function (this: ISubscription) {
  const daysRemaining = this.daysRemaining;
  return daysRemaining <= 7 && daysRemaining > 0;
});

// Virtual to check if over user limit
SubscriptionSchema.virtual('isOverUserLimit').get(function (
  this: ISubscription
) {
  return (
    this.currentUsers != null &&
    this.maxUsers != null &&
    this.currentUsers > this.maxUsers
  );
});

// Virtual to get usage percentage
SubscriptionSchema.virtual('usagePercentage').get(function (
  this: ISubscription
) {
  if (this.currentUsers == null || this.maxUsers == null) return 0;
  return Math.round((this.currentUsers / this.maxUsers) * 100);
});

// Helper functions for pre-save logic
function setDefaultMaxUsers(doc: ISubscription) {
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

function calculateBalanceAndPaidStatus(doc: ISubscription) {
  doc.balAmount = doc.invoiceAmount - doc.paidAmount;
  doc.isPaid = doc.paidAmount >= doc.invoiceAmount;
}

function updateStatusIfExpired(doc: ISubscription) {
  if (new Date() > doc.endDate && doc.status === 'active') {
    doc.status = 'expired';
  }
}

function setNextBillingDate(doc: ISubscription) {
  if (doc.isAutoRenew && doc.status === 'active') {
    doc.nextBillingDate = doc.endDate;
  }
}

function setCanceledTimestamp(doc: ISubscription) {
  if (doc.status === 'canceled' && !doc.canceledAt) {
    doc.canceledAt = new Date();
  }
}

function setDefaultFeatures(doc: ISubscription) {
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
SubscriptionSchema.pre('save', function (this: ISubscription) {
  setDefaultMaxUsers(this);
  calculateBalanceAndPaidStatus(this);
  updateStatusIfExpired(this);
  setNextBillingDate(this);
  setCanceledTimestamp(this);
  setDefaultFeatures(this);
});

// Instance methods
SubscriptionSchema.methods.cancel = function (
  this: ISubscription,
  reason?: string
) {
  this.status = 'canceled';
  this.canceledAt = new Date();
  this.isAutoRenew = false;
  if (reason) this.cancelReason = reason;
  return this.save();
};

SubscriptionSchema.methods.renew = function (this: ISubscription, months = 1) {
  const newEndDate = new Date(this.endDate);
  newEndDate.setMonth(newEndDate.getMonth() + months);
  this.endDate = newEndDate;
  this.status = 'active';
  this.nextBillingDate = newEndDate;
  return this.save();
};

// Static methods
SubscriptionSchema.statics.findActiveSubscriptions = function () {
  return this.find({ status: 'active' });
};

SubscriptionSchema.statics.findExpiredSubscriptions = function () {
  return this.find({
    $or: [{ status: 'expired' }, { endDate: { $lt: new Date() } }],
  });
};

SubscriptionSchema.statics.findNearExpiry = function (days = 7) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  return this.find({
    status: 'active',
    endDate: { $gte: new Date(), $lte: futureDate },
  });
};

SubscriptionSchema.statics.findByChurch = function (
  churchId: mongoose.Types.ObjectId
) {
  return this.findOne({ churchId }).sort({ createdAt: -1 });
};

SubscriptionSchema.statics.findByPlan = function (plan: string) {
  return this.find({ plan, status: 'active' });
};

SubscriptionSchema.statics.findOverUserLimit = function () {
  return this.find({
    status: 'active',
    $expr: { $gt: ['$currentUsers', '$maxUsers'] },
  });
};

SubscriptionSchema.statics.updateUserCount = function (
  churchId: mongoose.Types.ObjectId,
  userCount: number
) {
  return this.findOneAndUpdate(
    { churchId },
    { currentUsers: userCount },
    { new: true }
  );
};

const SubscriptionModel =
  (mongoose.models.Subscription as ISubscriptionModel) ||
  mongoose.model<ISubscription, ISubscriptionModel>(
    'Subscription',
    SubscriptionSchema
  );

export default SubscriptionModel;
