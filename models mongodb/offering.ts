import mongoose, { Schema, type Document, type Model } from 'mongoose';

// Define the interface for an Offering document
export interface IOffering extends Document {
  churchId: mongoose.Types.ObjectId;
  memberId: mongoose.Types.ObjectId; // Reference to User Model
  type:
    | 'tithe'
    | 'offering'
    | 'special-offering'
    | 'building-fund'
    | 'thanksgiving'
    | 'partnership'
    | 'donation'
    | 'mission'
    | 'other';
  amount: number;
  method:
    | 'cash'
    | 'm-pesa'
    | 'bank-transfer'
    | 'card'
    | 'online'
    | 'check'
    | 'other';
  date: Date;
  reference?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Define the interface for the static methods (if any, none explicitly from the Zod schema)
// For now, we'll keep it simple as there are no custom static methods implied by the Zod schema.
// If you later add static methods to Offering, you would extend Model<IOffering> here.
export interface IOfferingModel extends Model<IOffering> {
  // Example if you later add a static method:
  // findOfferingsByMember(memberId: mongoose.Types.ObjectId): Promise<IOffering[]>;
}

// Define the Mongoose Schema for Offering
const OfferingSchema = new Schema<IOffering>(
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
    type: {
      type: String,
      required: true,
      enum: [
        'tithe',
        'offering',
        'special-offering',
        'building-fund',
        'thanksgiving',
        'partnership',
        'donation',
        'mission',
        'other',
      ],
      trim: true,
    },
    amount: {
      type: Number,
      required: true, // Amount is optional in Zod but typically required for an offering
      min: [1, 'Amount must be greater than or equal to 1'],
      max: [1_000_000, 'Amount must be less than or equal to 1,000,000'],
    },
    method: {
      type: String,
      required: true,
      enum: [
        'cash',
        'm-pesa',
        'bank-transfer',
        'card',
        'online',
        'check',
        'other',
      ],
      trim: true,
    },
    date: {
      type: Date,
      required: true,
    },
    reference: {
      type: String,
      trim: true,
      sparse: true, // Allows null values to not be indexed if you add an index later
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields automatically
  }
);

// You can add pre-save/update hooks, virtuals, instance methods, or static methods here
// similar to how they are implemented in the Pledge model, if needed for Offering.

// Example of an index for better query performance
OfferingSchema.index({ churchId: 1, date: -1 }); // Index by church and descending date
OfferingSchema.index({ memberId: 1, date: -1 }); // Index by member and descending date

// Ensure virtuals (if any) are included in JSON output
OfferingSchema.set('toJSON', { virtuals: true });
OfferingSchema.set('toObject', { virtuals: true });

// Export the Offering model
export default (mongoose.models.Offering as IOfferingModel) ||
  mongoose.model<IOffering, IOfferingModel>('Offering', OfferingSchema);
