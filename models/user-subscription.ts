import mongoose, { type Document, Schema } from 'mongoose';

export interface IUserSubscription extends Document {
  userId: mongoose.Types.ObjectId;
  plan: 'connect' | 'engage' | 'serve';
  status: 'active' | 'expired' | 'canceled' | 'trial';
  isPaid: boolean;
  invoiceAmount: number;
  paidAmount: number;
  balAmount: number;
  features?: string[];
  churchId?: mongoose.Types.ObjectId; // Link to church they belong to
  maxSmallGroupsLead?: number; // How many small groups they can lead
  currentSmallGroupsLead?: number; // How many they currently lead
  maxEventsManage?: number; // How many events they can manage
  currentEventsManage?: number; // How many they currently manage
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
  readonly isOverSmallGroupLimit: boolean;
  readonly isOverEventLimit: boolean;
  // Instance methods
  cancel(reason?: string): Promise<IUserSubscription>;
  renew(months?: number): Promise<IUserSubscription>;
  canLeadSmallGroup(): boolean;
  canManageEvent(): boolean;
  hasFeature(feature: string): boolean;
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
  findByChurch(
    churchId: mongoose.Types.ObjectId
  ): mongoose.Query<IUserSubscription[], IUserSubscription>;
  updateSmallGroupCount(
    userId: mongoose.Types.ObjectId,
    count: number
  ): mongoose.Query<IUserSubscription | null, IUserSubscription>;
  updateEventCount(
    userId: mongoose.Types.ObjectId,
    count: number
  ): mongoose.Query<IUserSubscription | null, IUserSubscription>;
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
      enum: {
        values: ['connect', 'engage', 'serve'],
        message: 'User subscription plan must be connect, engage, or serve',
      },
      required: [true, 'User subscription plan is required'],
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
    features: [
      {
        type: String,
        trim: true,
      },
    ],
    churchId: {
      type: Schema.Types.ObjectId,
      ref: 'Church',
      index: true,
    },
    maxSmallGroupsLead: {
      type: Number,
      min: 0,
      default: 0,
    },
    currentSmallGroupsLead: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxEventsManage: {
      type: Number,
      min: 0,
      default: 0,
    },
    currentEventsManage: {
      type: Number,
      default: 0,
      min: 0,
    },
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
UserSubscriptionSchema.index({ userId: 1, status: 1 });
UserSubscriptionSchema.index({ status: 1, endDate: 1 });
UserSubscriptionSchema.index({ plan: 1, status: 1 });
UserSubscriptionSchema.index({ nextBillingDate: 1, isAutoRenew: 1 });
UserSubscriptionSchema.index({ churchId: 1, status: 1 });

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

// Virtual to check if over small group limit
UserSubscriptionSchema.virtual('isOverSmallGroupLimit').get(function (
  this: IUserSubscription
) {
  return (
    this.currentSmallGroupsLead != null &&
    this.maxSmallGroupsLead != null &&
    this.maxSmallGroupsLead !== -1 && // -1 means unlimited
    this.currentSmallGroupsLead > this.maxSmallGroupsLead
  );
});

// Virtual to check if over event limit
UserSubscriptionSchema.virtual('isOverEventLimit').get(function (
  this: IUserSubscription
) {
  return (
    this.currentEventsManage != null &&
    this.maxEventsManage != null &&
    this.maxEventsManage !== -1 && // -1 means unlimited
    this.currentEventsManage > this.maxEventsManage
  );
});

// Helper functions for pre-save logic
function setDefaultLimits(doc: IUserSubscription) {
  if (
    doc.maxSmallGroupsLead === undefined ||
    doc.maxEventsManage === undefined
  ) {
    switch (doc.plan) {
      case 'connect':
        if (doc.maxSmallGroupsLead === undefined) doc.maxSmallGroupsLead = 0;
        if (doc.maxEventsManage === undefined) doc.maxEventsManage = 0;
        break;
      case 'engage':
        if (doc.maxSmallGroupsLead === undefined) doc.maxSmallGroupsLead = 0;
        if (doc.maxEventsManage === undefined) doc.maxEventsManage = 2;
        break;
      case 'serve':
        if (doc.maxSmallGroupsLead === undefined) doc.maxSmallGroupsLead = -1; // Unlimited
        if (doc.maxEventsManage === undefined) doc.maxEventsManage = -1; // Unlimited
        break;
      default:
        if (doc.maxSmallGroupsLead === undefined) doc.maxSmallGroupsLead = 0;
        if (doc.maxEventsManage === undefined) doc.maxEventsManage = 0;
    }
  }
}

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
      case 'connect':
        doc.features = [
          'church_directory_access',
          'event_notifications',
          'prayer_request_submissions',
          'basic_giving_mpesa',
          'basic_profile_management',
          'community_announcements',
          'email_support',
        ];
        break;
      case 'engage':
        doc.features = [
          'church_directory_access',
          'event_registration_management',
          'prayer_circle_participation',
          'advanced_giving_mpesa',
          'complete_profile_management',
          'small_group_finder',
          'daily_devotional_content',
          'basic_communication_tools',
          'attendance_self_tracking',
          'volunteer_opportunity_access',
          'priority_support',
        ];
        break;
      case 'serve':
        doc.features = [
          'complete_church_access',
          'unlimited_event_management',
          'prayer_group_leadership',
          'advanced_giving_analytics_mpesa',
          'advanced_profile_ministry_management',
          'small_group_creation_management',
          'premium_devotional_library',
          'advanced_communication_suite',
          'comprehensive_attendance_tracking',
          'volunteer_coordination_management',
          'ministry_scheduling_tools',
          'content_creation_sharing',
          'discipleship_program_access',
          'leadership_resources',
          'priority_support_training',
        ];
        break;
      default:
        doc.features = [
          'church_directory_access',
          'event_notifications',
          'prayer_request_submissions',
          'basic_giving_mpesa',
        ];
    }
  }
}

// Pre-save middleware
UserSubscriptionSchema.pre('save', function (this: IUserSubscription) {
  setDefaultLimits(this);
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

UserSubscriptionSchema.methods.canLeadSmallGroup = function (
  this: IUserSubscription
) {
  if (this.maxSmallGroupsLead === -1) return true; // Unlimited
  return this.currentSmallGroupsLead < this.maxSmallGroupsLead;
};

UserSubscriptionSchema.methods.canManageEvent = function (
  this: IUserSubscription
) {
  if (this.maxEventsManage === -1) return true; // Unlimited
  return this.currentEventsManage < this.maxEventsManage;
};

UserSubscriptionSchema.methods.hasFeature = function (
  this: IUserSubscription,
  feature: string
) {
  return this.features?.includes(feature);
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

UserSubscriptionSchema.statics.findByChurch = function (
  churchId: mongoose.Types.ObjectId
) {
  return this.find({ churchId, status: 'active' });
};

UserSubscriptionSchema.statics.updateSmallGroupCount = function (
  userId: mongoose.Types.ObjectId,
  count: number
) {
  return this.findOneAndUpdate(
    { userId },
    { currentSmallGroupsLead: count },
    { new: true }
  );
};

UserSubscriptionSchema.statics.updateEventCount = function (
  userId: mongoose.Types.ObjectId,
  count: number
) {
  return this.findOneAndUpdate(
    { userId },
    { currentEventsManage: count },
    { new: true }
  );
};

export default (mongoose.models.UserSubscription as IUserSubscriptionModel) ||
  mongoose.model<IUserSubscription, IUserSubscriptionModel>(
    'UserSubscription',
    UserSubscriptionSchema
  );

// Usage Examples:
// // Create a user subscription
// const subscription = new UserSubscriptionModel({
//   userId: user._id,
//   churchId: church._id,
//   plan: 'engage',
//   status: 'trial',
//   invoiceAmount: 199,
//   paidAmount: 0,
//   startDate: new Date(),
//   endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
// });

// // The balAmount, isPaid, limits, and features will be calculated automatically
// await subscription.save();

// // Query examples
// const activeSubscriptions = await UserSubscriptionModel.findActiveSubscriptions();
// const userSubscriptions = await UserSubscriptionModel.findByUser(userId);
// const churchMembers = await UserSubscriptionModel.findByChurch(churchId);
// const expiredSubs = await UserSubscriptionModel.findExpiredSubscriptions();
// const nearExpiry = await UserSubscriptionModel.findNearExpiry(7);

// // Check virtual fields and permissions
// console.log(subscription.isExpired); // true/false
// console.log(subscription.daysRemaining); // number of days
// console.log(subscription.canLeadSmallGroup()); // true/false
// console.log(subscription.canManageEvent()); // true/false
// console.log(subscription.hasFeature('advanced_giving_mpesa')); // true/false

// // Instance methods
// await subscription.cancel('User requested cancellation');
// await subscription.renew(12); // Renew for 12 months