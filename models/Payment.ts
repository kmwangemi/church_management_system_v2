import mongoose, { type Document, Schema } from 'mongoose';

export interface IPayment extends Document {
  churchId: mongoose.Types.ObjectId;
  subscriptionId: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  paymentMethod: 'credit_card' | 'paypal' | 'mpesa' | 'bank_transfer';
  paymentDate: Date;
  status: 'paid' | 'failed' | 'pending' | 'refunded';
  transactionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    churchId: { type: Schema.Types.ObjectId, ref: 'Church', required: true },
    subscriptionId: {
      type: Schema.Types.ObjectId,
      ref: 'Subscription',
      required: true,
    },
    amount: { type: Number, required: true },
    currency: { type: String, required: true, default: 'USD' },
    paymentMethod: {
      type: String,
      enum: ['credit_card', 'paypal', 'mpesa', 'bank_transfer'],
      required: true,
    },
    paymentDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ['paid', 'failed', 'pending', 'refunded'],
      default: 'paid',
    },
    transactionId: { type: String, trim: true },
  },
  { timestamps: true },
);

export default mongoose.models.Payment ||
  mongoose.model<IPayment>('Payment', PaymentSchema);
