import mongoose, { type Document, Schema } from 'mongoose';

export interface IUserSubscription extends Document {
  userId: mongoose.Types.ObjectId;
  plan: 'basic' | 'standard' | 'premium' | 'enterprise';
  status: 'active' | 'expired' | 'canceled' | 'trial';
  startDate: Date;
  endDate: Date;
  isAutoRenew: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSubscriptionSchema = new Schema<IUserSubscription>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    plan: {
      type: String,
      enum: ['basic', 'standard', 'premium', 'enterprise'],
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'expired', 'canceled', 'trial'],
      required: true,
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isAutoRenew: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.UserSubscription ||
  mongoose.model<IUserSubscription>('UserSubscription', UserSubscriptionSchema);
