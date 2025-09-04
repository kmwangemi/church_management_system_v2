import mongoose, { Schema, type Document, type Model } from 'mongoose';

export interface IBranch extends Document {
  churchId: mongoose.Types.ObjectId;
  branchName: string;
  email?: string;
  phoneNumber?: string;
  pastorId?: mongoose.Types.ObjectId;
  capacity: number;
  establishedDate: Date;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  isActive: boolean;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Define the interface for the static methods
export interface IBranchModel extends Model<IBranch> {
  findByChurch(churchId: mongoose.Types.ObjectId): Promise<IBranch[]>;
  findActiveBranches(churchId: mongoose.Types.ObjectId): Promise<IBranch[]>;
  findByPastor(pastorId: mongoose.Types.ObjectId): Promise<IBranch[]>;
  getTotalCapacity(churchId: mongoose.Types.ObjectId): Promise<number>;
}

const BranchSchema = new Schema<IBranch>(
  {
    churchId: {
      type: Schema.Types.ObjectId,
      ref: 'Church',
      required: true,
      trim: true,
    },
    pastorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      trim: true,
    },
    branchName: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      minlength: [2, 'Branch name must be at least 2 characters'],
      maxlength: [100, 'Branch name must be less than 100 characters'],
    },
    address: {
      street: {
        type: String,
        trim: true,
        lowercase: true,
        maxlength: [200, 'Street address must be less than 200 characters'],
      },
      city: {
        type: String,
        trim: true,
        lowercase: true,
        maxlength: [100, 'City name must be less than 100 characters'],
      },
      state: {
        type: String,
        trim: true,
        lowercase: true,
        maxlength: [100, 'State name must be less than 100 characters'],
      },
      zipCode: {
        type: String,
        trim: true,
        maxlength: [20, 'Zip code must be less than 20 characters'],
      },
      country: {
        type: String,
        default: 'Kenya',
        trim: true,
        maxlength: [100, 'Country name must be less than 100 characters'],
      },
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    capacity: {
      type: Number,
      trim: true,
      required: true,
      min: [1, 'Capacity must be at least 1'],
      max: [10_000, 'Capacity cannot exceed 10,000'],
    },
    establishedDate: {
      type: Date,
      required: true,
      trim: true,
      validate: {
        validator(value: Date) {
          return value <= new Date();
        },
        message: 'Established date cannot be in the future',
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    description: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: [1000, 'Description must be less than 1000 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Add indexes for better query performance
BranchSchema.index({ churchId: 1 }); // Index by church
BranchSchema.index({ churchId: 1, isActive: 1 }); // Index by church and active status
BranchSchema.index({ pastorId: 1 }); // Index by pastor
BranchSchema.index({ 'address.city': 1, 'address.state': 1 }); // Index by location

// Add text index for searching
BranchSchema.index({
  branchName: 'text',
  description: 'text',
  'address.city': 'text',
  'address.state': 'text',
});

// Pre-save middleware for validation and data processing
BranchSchema.pre('save', function (next) {
  // Ensure established date is not in the future
  if (this.establishedDate > new Date()) {
    return next(new Error('Established date cannot be in the future'));
  }
  // Auto-format branch name for consistency
  if (this.branchName) {
    this.branchName = this.branchName.toLowerCase().trim();
  }
  next();
});

// Virtual for branch age in years
BranchSchema.virtual('ageInYears').get(function () {
  const now = new Date();
  const established = new Date(this.establishedDate);
  return Math.floor(
    (now.getTime() - established.getTime()) / (1000 * 60 * 60 * 24 * 365.25)
  );
});

// Virtual for full address string
BranchSchema.virtual('fullAddress').get(function () {
  if (!this.address) return '';
  const parts = [
    this.address.street,
    this.address.city,
    this.address.state,
    this.address.zipCode,
    this.address.country,
  ].filter(Boolean);
  return parts.join(', ');
});

// Virtual for formatted established date
BranchSchema.virtual('formattedEstablishedDate').get(function () {
  return new Intl.DateTimeFormat('en-KE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(this.establishedDate);
});

// Virtual for status indicator
BranchSchema.virtual('statusText').get(function () {
  return this.isActive ? 'Active' : 'Inactive';
});

// Instance methods
BranchSchema.methods.deactivate = function () {
  this.isActive = false;
  return this.save();
};

BranchSchema.methods.activate = function () {
  this.isActive = true;
  return this.save();
};

BranchSchema.methods.updateCapacity = function (newCapacity: number) {
  this.capacity = newCapacity;
  return this.save();
};

// Static methods (these will be properly typed with IBranchModel)
BranchSchema.statics.findByChurch = function (
  churchId: mongoose.Types.ObjectId
) {
  return this.find({ churchId }).populate('pastorId', 'name email');
};

BranchSchema.statics.findActiveBranches = function (
  churchId: mongoose.Types.ObjectId
) {
  return this.find({ churchId, isActive: true }).populate(
    'pastorId',
    'name email'
  );
};

BranchSchema.statics.findByPastor = function (
  pastorId: mongoose.Types.ObjectId
) {
  return this.find({ pastorId, isActive: true });
};

BranchSchema.statics.getTotalCapacity = async function (
  churchId: mongoose.Types.ObjectId
) {
  const result = await this.aggregate([
    { $match: { churchId, isActive: true } },
    { $group: { _id: null, totalCapacity: { $sum: '$capacity' } } },
  ]);
  return result[0]?.totalCapacity || 0;
};

// Ensure virtuals are included in JSON output
BranchSchema.set('toJSON', { virtuals: true });
BranchSchema.set('toObject', { virtuals: true });

// Export the Branch model with complex pattern
export default (mongoose.models.Branch as IBranchModel) ||
  mongoose.model<IBranch, IBranchModel>('Branch', BranchSchema);
