import mongoose, { Schema, type Document, type Model } from 'mongoose';

// Define the interface for an Asset document
export interface IAsset extends Document {
  churchId: mongoose.Types.ObjectId;
  branchId: mongoose.Types.ObjectId; // Reference to Branch Model
  name: string;
  type:
    | 'vehicle'
    | 'property'
    | 'equipment'
    | 'furniture'
    | 'technology'
    | 'musical';
  value: number;
  purchaseDate: Date;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  status:
    | 'active'
    | 'maintenance'
    | 'disposed'
    | 'sold'
    | 'donated'
    | 'lost'
    | 'stolen';
  serialNumber?: string;
  warranty?: string; // Could be warranty expiry date or description
  supplier?: string;
  maintenanceSchedule:
    | 'daily'
    | 'weekly'
    | 'monthly'
    | 'quarterly'
    | 'annually';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Define the interface for the static methods
export interface IAssetModel extends Model<IAsset> {
  // Example static methods you might add later:
  // findAssetsByBranch(branchId: mongoose.Types.ObjectId): Promise<IAsset[]>;
  // findAssetsByCondition(condition: string): Promise<IAsset[]>;
}

// Define the Mongoose Schema for Asset
const AssetSchema = new Schema<IAsset>(
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
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: [2, 'Asset name must be at least 2 characters'],
      maxlength: [100, 'Asset name must be less than 100 characters'],
    },
    type: {
      type: String,
      required: true,
      trim: true,
      enum: [
        'vehicle',
        'property',
        'equipment',
        'furniture',
        'technology',
        'musical',
      ],
    },
    value: {
      type: Number,
      required: true,
      min: [0, 'Asset value must be greater than or equal to 0'],
      max: [10_000_000, 'Asset value must be less than or equal to 10,000,000'],
    },
    purchaseDate: {
      type: Date,
      required: true,
    },
    condition: {
      type: String,
      required: true,
      enum: ['excellent', 'good', 'fair', 'poor'],
      trim: true,
    },
    status: {
      type: String,
      required: true,
      enum: [
        'active',
        'maintenance',
        'disposed',
        'sold',
        'donated',
        'lost',
        'stolen',
      ],
      trim: true,
      default: 'active',
    },
    serialNumber: {
      type: String,
      trim: true,
      sparse: true, // Allows null values to not be indexed if you add an index later
    },
    warranty: {
      type: String,
      trim: true,
      // This could be a date string, warranty period, or description
    },
    supplier: {
      type: String,
      trim: true,
      maxlength: [100, 'Supplier name must be less than 100 characters'],
    },
    maintenanceSchedule: {
      type: String,
      trim: true,
      enum: ['daily', 'weekly', 'monthly', 'quarterly', 'annually'],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes must be less than 500 characters'],
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields automatically
  }
);

// Add indexes for better query performance
AssetSchema.index({ churchId: 1, branchId: 1 }); // Index by church and branch
AssetSchema.index({ churchId: 1, type: 1 }); // Index by church and asset type
AssetSchema.index({ churchId: 1, status: 1 }); // Index by church and status
AssetSchema.index({ churchId: 1, condition: 1 }); // Index by church and condition
AssetSchema.index({ serialNumber: 1 }, { sparse: true }); // Index by serial number (sparse for optional field)

// Add text index for searching by name, type, supplier, and notes
AssetSchema.index({
  name: 'text',
  type: 'text',
  supplier: 'text',
  notes: 'text',
});

// Pre-save middleware example (if needed for validation or data processing)
AssetSchema.pre('save', function (next) {
  // Example: Ensure purchase date is not in the future
  if (this.purchaseDate > new Date()) {
    return next(new Error('Purchase date cannot be in the future'));
  }
  next();
});

// Virtual for asset age (in days)
AssetSchema.virtual('ageInDays').get(function () {
  return Math.floor(
    (Date.now() - this.purchaseDate.getTime()) / (1000 * 60 * 60 * 24)
  );
});

// Virtual for formatted value (you might want to format currency)
AssetSchema.virtual('formattedValue').get(function () {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
  }).format(this.value);
});

// Ensure virtuals are included in JSON output
AssetSchema.set('toJSON', { virtuals: true });
AssetSchema.set('toObject', { virtuals: true });

// Export the Asset model
export default (mongoose.models.Asset as IAssetModel) ||
  mongoose.model<IAsset, IAssetModel>('Asset', AssetSchema);
