import mongoose, { Schema, type Document, type Model } from 'mongoose';

export interface IChurchSubscription extends Document {
  churchId: mongoose.Types.ObjectId;
  plan: 'basic' | 'ministry' | 'cathedral';
  status: 'active' | 'expired' | 'canceled' | 'trial';
  isPaid: boolean;
  invoiceAmount: number;
  paidAmount: number;
  balAmount: number;
  maxUsers?: number;
  maxBranches?: number;
  maxSmallGroups?: number;
  currentUsers?: number;
  currentBranches?: number;
  currentSmallGroups?: number;
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
  updateBranchCount(
    churchId: mongoose.Types.ObjectId,
    branchCount: number
  ): mongoose.Query<IChurchSubscription | null, IChurchSubscription>;
  updateSmallGroupCount(
    churchId: mongoose.Types.ObjectId,
    groupCount: number
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
        values: ['basic', 'ministry', 'cathedral'],
        message: 'Subscription plan must be basic, ministry, or cathedral',
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
    maxBranches: {
      type: Number,
      min: 1,
      default: 1,
    },
    maxSmallGroups: {
      type: Number,
      min: 0,
    },
    currentUsers: {
      type: Number,
      default: 0,
      min: 0,
    },
    currentBranches: {
      type: Number,
      default: 0,
      min: 0,
    },
    currentSmallGroups: {
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
      default: 'm-pesa',
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

// Virtual to check if over branch limit
ChurchSubscriptionSchema.virtual('isOverBranchLimit').get(function () {
  return (
    this.currentBranches != null &&
    this.maxBranches != null &&
    this.currentBranches > this.maxBranches
  );
});

// Virtual to check if over small group limit
ChurchSubscriptionSchema.virtual('isOverSmallGroupLimit').get(function () {
  return (
    this.currentSmallGroups != null &&
    this.maxSmallGroups != null &&
    this.maxSmallGroups !== -1 && // -1 means unlimited
    this.currentSmallGroups > this.maxSmallGroups
  );
});

// Virtual to get usage percentage
ChurchSubscriptionSchema.virtual('usagePercentage').get(function () {
  if (this.currentUsers == null || this.maxUsers == null) return 0;
  if (this.maxUsers === -1) return 0; // Unlimited
  return Math.round((this.currentUsers / this.maxUsers) * 100);
});

// Virtual to get branch usage percentage
ChurchSubscriptionSchema.virtual('branchUsagePercentage').get(function () {
  if (this.currentBranches == null || this.maxBranches == null) return 0;
  if (this.maxBranches === -1) return 0; // Unlimited
  return Math.round((this.currentBranches / this.maxBranches) * 100);
});

// Virtual to get small group usage percentage
ChurchSubscriptionSchema.virtual('smallGroupUsagePercentage').get(function () {
  if (this.currentSmallGroups == null || this.maxSmallGroups == null) return 0;
  if (this.maxSmallGroups === -1) return 0; // Unlimited
  return Math.round((this.currentSmallGroups / this.maxSmallGroups) * 100);
});

// Helper functions for pre-save logic
function setDefaultLimits(doc: IChurchSubscription) {
  if (!(doc.maxUsers && doc.maxBranches) || doc.maxSmallGroups === undefined) {
    switch (doc.plan) {
      case 'basic':
        if (!doc.maxUsers) doc.maxUsers = 100;
        if (!doc.maxBranches) doc.maxBranches = 1;
        if (doc.maxSmallGroups === undefined) doc.maxSmallGroups = 5;
        break;
      case 'ministry':
        if (!doc.maxUsers) doc.maxUsers = 500;
        if (!doc.maxBranches) doc.maxBranches = 3;
        if (doc.maxSmallGroups === undefined) doc.maxSmallGroups = -1; // Unlimited
        break;
      case 'cathedral':
        if (!doc.maxUsers) doc.maxUsers = -1; // Unlimited
        if (!doc.maxBranches) doc.maxBranches = -1; // Unlimited
        if (doc.maxSmallGroups === undefined) doc.maxSmallGroups = -1; // Unlimited
        break;
      default:
        if (!doc.maxUsers) doc.maxUsers = 100;
        if (!doc.maxBranches) doc.maxBranches = 1;
        if (doc.maxSmallGroups === undefined) doc.maxSmallGroups = 5;
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
        doc.features = [
          'user_management',
          'basic_departments',
          'small_groups_limited',
          'attendance_tracking',
          'event_scheduling',
          'basic_finance',
          'prayer_requests',
          'email_support',
        ];
        break;
      case 'ministry':
        doc.features = [
          'advanced_user_management',
          'department_management',
          'unlimited_small_groups',
          'advanced_attendance',
          'event_registration',
          'finance_budget_management',
          'contributions_tracking',
          'basic_asset_management',
          'communication_tools',
          'prayer_management',
          'basic_discipleship',
          'volunteer_scheduling',
          'basic_reporting',
          'priority_support',
        ];
        break;
      case 'cathedral':
        doc.features = [
          'complete_user_management',
          'advanced_department_management',
          'unlimited_small_groups',
          'advanced_attendance_analytics',
          'advanced_event_management',
          'complete_finance_management',
          'advanced_contributions_tracking',
          'complete_asset_management',
          'advanced_communication_suite',
          'prayer_pastoral_care',
          'complete_discipleship_programs',
          'advanced_volunteer_management',
          'content_management_system',
          'comprehensive_reporting_analytics',
          'custom_integrations',
          'priority_support_training',
        ];
        break;
      default:
        doc.features = [
          'user_management',
          'basic_departments',
          'small_groups_limited',
          'attendance_tracking',
          'event_scheduling',
          'basic_finance',
          'prayer_requests',
        ];
    }
  }
}

// Pre-save middleware
ChurchSubscriptionSchema.pre('save', function (next) {
  setDefaultLimits(this);
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

ChurchSubscriptionSchema.methods.canCreateBranch = function () {
  if (this.maxBranches === -1) return true; // Unlimited
  return this.currentBranches < this.maxBranches;
};

ChurchSubscriptionSchema.methods.canAddUser = function () {
  if (this.maxUsers === -1) return true; // Unlimited
  return this.currentUsers < this.maxUsers;
};

ChurchSubscriptionSchema.methods.canCreateSmallGroup = function () {
  if (this.maxSmallGroups === -1) return true; // Unlimited
  return this.currentSmallGroups < this.maxSmallGroups;
};

ChurchSubscriptionSchema.methods.hasFeature = function (feature: string) {
  return this.features?.includes(feature);
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
    maxUsers: { $ne: -1 }, // Exclude unlimited plans
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

ChurchSubscriptionSchema.statics.updateBranchCount = function (
  churchId: mongoose.Types.ObjectId,
  branchCount: number
) {
  return this.findOneAndUpdate(
    { churchId },
    { currentBranches: branchCount },
    { new: true }
  );
};

ChurchSubscriptionSchema.statics.updateSmallGroupCount = function (
  churchId: mongoose.Types.ObjectId,
  groupCount: number
) {
  return this.findOneAndUpdate(
    { churchId },
    { currentSmallGroups: groupCount },
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
