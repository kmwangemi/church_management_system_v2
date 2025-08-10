import mongoose, { type Document, Schema } from 'mongoose';

export interface IUserSubscription extends Document {
  userId: mongoose.Types.ObjectId;
  plan: 'basic' | 'standard' | 'premium' | 'enterprise';
  status: 'active' | 'expired' | 'canceled' | 'trial';
  isPaid: boolean;
  invoiceAmount: number;
  paidAmount: number;
  balAmount: number;
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
  // Instance methods
  cancel(reason?: string): Promise<IUserSubscription>;
  renew(months?: number): Promise<IUserSubscription>;
}

// Extend the Model interface for static methods
interface IUserSubscriptionModel extends mongoose.Model<IUserSubscription> {
  findActiveSubscriptions(): mongoose.Query<
    IUserSubscription[],
    IUserSubscription
  >;
  findExpiredSubscriptions(): mongoose.Query<
    IUserSubscription[],
    IUserSubscription
  >;
  findNearExpiry(
    days?: number
  ): mongoose.Query<IUserSubscription[], IUserSubscription>;
  findByUser(
    userId: mongoose.Types.ObjectId
  ): mongoose.Query<IUserSubscription[], IUserSubscription>;
  findByPlan(
    plan: string
  ): mongoose.Query<IUserSubscription[], IUserSubscription>;
}

const UserSubscriptionSchema = new Schema<IUserSubscription>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
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
UserSubscriptionSchema.index({ userId: 1, status: 1 });
UserSubscriptionSchema.index({ status: 1, endDate: 1 });
UserSubscriptionSchema.index({ plan: 1, status: 1 });
UserSubscriptionSchema.index({ nextBillingDate: 1, isAutoRenew: 1 });

// Virtual to check if subscription is expired
UserSubscriptionSchema.virtual('isExpired').get(function (
  this: IUserSubscription
) {
  return new Date() > this.endDate;
});

// Virtual to check days remaining
UserSubscriptionSchema.virtual('daysRemaining').get(function (
  this: IUserSubscription
) {
  const now = new Date();
  if (now > this.endDate) return 0;
  const diffTime = this.endDate.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual to check if approaching renewal
UserSubscriptionSchema.virtual('isNearExpiry').get(function (
  this: IUserSubscription
) {
  const daysRemaining = this.daysRemaining;
  return daysRemaining <= 7 && daysRemaining > 0;
});

function calculateBalanceAndPaidStatus(doc: IUserSubscription) {
  doc.balAmount = doc.invoiceAmount - doc.paidAmount;
  doc.isPaid = doc.paidAmount >= doc.invoiceAmount;
}

function updateStatusIfExpired(doc: IUserSubscription) {
  if (new Date() > doc.endDate && doc.status === 'active') {
    doc.status = 'expired';
  }
}

function setNextBillingDate(doc: IUserSubscription) {
  if (doc.isAutoRenew && doc.status === 'active') {
    doc.nextBillingDate = doc.endDate;
  }
}

function setCanceledTimestamp(doc: IUserSubscription) {
  if (doc.status === 'canceled' && !doc.canceledAt) {
    doc.canceledAt = new Date();
  }
}

function setDefaultFeatures(doc: IUserSubscription) {
  if (!doc.features || doc.features.length === 0) {
    switch (doc.plan) {
      case 'basic':
        doc.features = [
          'project_management',
          'basic_analytics',
          'file_storage_1gb',
        ];
        break;
      case 'standard':
        doc.features = [
          'project_management',
          'basic_analytics',
          'file_storage_5gb',
          'collaboration_tools',
          'advanced_analytics',
        ];
        break;
      case 'premium':
        doc.features = [
          'project_management',
          'basic_analytics',
          'file_storage_25gb',
          'collaboration_tools',
          'advanced_analytics',
          'custom_branding',
          'api_access',
        ];
        break;
      case 'enterprise':
        doc.features = [
          'project_management',
          'basic_analytics',
          'file_storage_unlimited',
          'collaboration_tools',
          'advanced_analytics',
          'custom_branding',
          'api_access',
          'priority_support',
          'sso_integration',
        ];
        break;
      default:
        doc.features = [
          'project_management',
          'basic_analytics',
          'file_storage_1gb',
        ];
    }
  }
}

// Pre-save middleware
UserSubscriptionSchema.pre('save', function (this: IUserSubscription) {
  calculateBalanceAndPaidStatus(this);
  updateStatusIfExpired(this);
  setNextBillingDate(this);
  setCanceledTimestamp(this);
  setDefaultFeatures(this);
});

// Instance methods
UserSubscriptionSchema.methods.cancel = function (
  this: IUserSubscription,
  reason?: string
) {
  this.status = 'canceled';
  this.canceledAt = new Date();
  this.isAutoRenew = false;
  if (reason) this.cancelReason = reason;
  return this.save();
};

UserSubscriptionSchema.methods.renew = function (
  this: IUserSubscription,
  months = 1
) {
  const newEndDate = new Date(this.endDate);
  newEndDate.setMonth(newEndDate.getMonth() + months);
  this.endDate = newEndDate;
  this.status = 'active';
  this.nextBillingDate = newEndDate;
  return this.save();
};

// Static methods
UserSubscriptionSchema.statics.findActiveSubscriptions = function () {
  return this.find({ status: 'active' });
};

UserSubscriptionSchema.statics.findExpiredSubscriptions = function () {
  return this.find({
    $or: [{ status: 'expired' }, { endDate: { $lt: new Date() } }],
  });
};

UserSubscriptionSchema.statics.findNearExpiry = function (days = 7) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  return this.find({
    status: 'active',
    endDate: { $gte: new Date(), $lte: futureDate },
  });
};

UserSubscriptionSchema.statics.findByUser = function (
  userId: mongoose.Types.ObjectId
) {
  return this.find({ userId }).sort({ createdAt: -1 });
};

UserSubscriptionSchema.statics.findByPlan = function (plan: string) {
  return this.find({ plan, status: 'active' });
};

const UserSubscriptionModel =
  (mongoose.models.UserSubscription as IUserSubscriptionModel) ||
  mongoose.model<IUserSubscription, IUserSubscriptionModel>(
    'UserSubscription',
    UserSubscriptionSchema
  );

export default UserSubscriptionModel;

// Usage Examples:
// // Create a subscription
// const subscription = new UserSubscriptionModel({
//   userId: user._id,
//   plan: 'premium',
//   status: 'trial',
//   invoiceAmount: 99.99,
//   paidAmount: 0,
//   startDate: new Date(),
//   endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
// });

// // The balAmount, isPaid, maxProjects, and features will be calculated automatically
// await subscription.save();

// // Query examples
// const activeSubscriptions = await UserSubscriptionModel.findActiveSubscriptions();
// const userSubscriptions = await UserSubscriptionModel.findByUser(userId);
// const expiredSubs = await UserSubscriptionModel.findExpiredSubscriptions();
// const nearExpiry = await UserSubscriptionModel.findNearExpiry(7);

// // Check virtual fields
// console.log(subscription.isExpired); // true/false
// console.log(subscription.daysRemaining); // number of days
// console.log(subscription.isNearExpiry); // true/false
// console.log(subscription.usagePercentage); // percentage of projects used

// // Instance methods
// await subscription.cancel('User requested cancellation');
// await subscription.renew(12); // Renew for 12 months
