import mongoose, { Schema, type Document, type Model } from 'mongoose';

export interface IBranch extends Document {
  churchId: mongoose.Types.ObjectId;
  branchName: string;
  email?: string;
  phoneNumber?: string;
  pastorId?: mongoose.Types.ObjectId;
  members?: number;
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
  isDeleted: boolean;
  description?: string;
  createdAt: Date;
  updatedAt: Date;

  // Virtual properties
  ageInYears: number;
  fullAddress: string;
  formattedEstablishedDate: string;
  statusText: string;

  // Instance methods
  deactivate(): Promise<IBranch>;
  activate(): Promise<IBranch>;
  softDelete(): Promise<IBranch>; // Fixed: Added parentheses
  restore(): Promise<IBranch>; // Added restore method
  updateCapacity(newCapacity: number): Promise<IBranch>;
}

// Define the interface for the static methods
export interface IBranchModel extends Model<IBranch> {
  // Existing static methods
  findByChurch(churchId: mongoose.Types.ObjectId): Promise<IBranch[]>;
  findActiveBranches(churchId: mongoose.Types.ObjectId): Promise<IBranch[]>;
  findByPastor(pastorId: mongoose.Types.ObjectId): Promise<IBranch[]>;
  getTotalCapacity(churchId: mongoose.Types.ObjectId): Promise<number>;

  // Additional useful static methods
  findInactiveBranches(churchId: mongoose.Types.ObjectId): Promise<IBranch[]>;
  findDeletedBranches(churchId: mongoose.Types.ObjectId): Promise<IBranch[]>; // New method
  getTotalMembers(churchId: mongoose.Types.ObjectId): Promise<number>;
  getBranchStats(churchId: mongoose.Types.ObjectId): Promise<{
    totalBranches: number;
    activeBranches: number;
    inactiveBranches: number;
    deletedBranches: number; // Added deleted count
    totalCapacity: number;
    totalMembers: number;
    averageCapacity: number;
    averageMembers: number;
  }>;
  findByLocation(
    city?: string,
    state?: string,
    country?: string
  ): Promise<IBranch[]>;
  searchBranches(
    churchId: mongoose.Types.ObjectId,
    searchTerm: string
  ): Promise<IBranch[]>;
  getBranchesByCapacityRange(
    churchId: mongoose.Types.ObjectId,
    minCapacity: number,
    maxCapacity: number
  ): Promise<IBranch[]>;
  getOldestBranches(
    churchId: mongoose.Types.ObjectId,
    limit?: number
  ): Promise<IBranch[]>;
  getNewestBranches(
    churchId: mongoose.Types.ObjectId,
    limit?: number
  ): Promise<IBranch[]>;
  getBranchesNeedingPastor(
    churchId: mongoose.Types.ObjectId
  ): Promise<IBranch[]>;
  getBranchesOverCapacity(
    churchId: mongoose.Types.ObjectId
  ): Promise<IBranch[]>;
  getBranchesByEstablishedYear(
    churchId: mongoose.Types.ObjectId,
    year: number
  ): Promise<IBranch[]>;
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
    members: {
      type: Number,
      trim: true,
      default: 0,
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
    isDeleted: {
      type: Boolean,
      required: true,
      default: false,
      index: true, // Added index for better performance
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
BranchSchema.index({ churchId: 1, isDeleted: 1 }); // Index by church and deleted status
BranchSchema.index({ pastorId: 1 }); // Index by pastor
BranchSchema.index({ 'address.city': 1, 'address.state': 1 }); // Index by location
BranchSchema.index({ capacity: 1 }); // Index by capacity
BranchSchema.index({ members: 1 }); // Index by members
BranchSchema.index({ establishedDate: 1 }); // Index by established date
BranchSchema.index({ isDeleted: 1 }); // Index for soft delete filtering

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

// Add middleware to exclude soft-deleted documents by default
BranchSchema.pre(
  ['find', 'findOne', 'findOneAndUpdate', 'count', 'countDocuments'],
  function () {
    // Only add isDeleted filter if not already specified
    if (!this.getQuery().isDeleted) {
      this.where({ isDeleted: { $ne: true } });
    }
  }
);

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

// Virtual for status indicator - Updated to include deleted status
BranchSchema.virtual('statusText').get(function () {
  if (this.isDeleted) return 'Deleted';
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

BranchSchema.methods.softDelete = function () {
  this.isDeleted = true;
  this.isActive = false; // Deactivate when soft deleting
  return this.save();
};

BranchSchema.methods.restore = function () {
  this.isDeleted = false;
  // Note: Don't automatically activate on restore, let user decide
  return this.save();
};

BranchSchema.methods.updateCapacity = function (newCapacity: number) {
  this.capacity = newCapacity;
  return this.save();
};

// Base query helper to exclude deleted items
const nonDeletedQuery = (churchId: mongoose.Types.ObjectId) => ({
  churchId,
  isDeleted: { $ne: true },
});

// Existing static methods - Updated to exclude soft-deleted records
BranchSchema.statics.findByChurch = function (
  churchId: mongoose.Types.ObjectId
) {
  return this.find(nonDeletedQuery(churchId)).populate(
    'pastorId',
    'firstName lastName email'
  );
};

BranchSchema.statics.findActiveBranches = function (
  churchId: mongoose.Types.ObjectId
) {
  return this.find({
    ...nonDeletedQuery(churchId),
    isActive: true,
  }).populate('pastorId', 'firstName lastName email');
};

BranchSchema.statics.findByPastor = function (
  pastorId: mongoose.Types.ObjectId
) {
  return this.find({
    pastorId,
    isActive: true,
    isDeleted: { $ne: true },
  }).populate('pastorId', 'firstName lastName email');
};

BranchSchema.statics.getTotalCapacity = async function (
  churchId: mongoose.Types.ObjectId
) {
  const result = await this.aggregate([
    { $match: { churchId, isActive: true, isDeleted: { $ne: true } } },
    { $group: { _id: null, totalCapacity: { $sum: '$capacity' } } },
  ]);
  return result[0]?.totalCapacity || 0;
};

// Additional static methods implementations - Updated
BranchSchema.statics.findInactiveBranches = function (
  churchId: mongoose.Types.ObjectId
) {
  return this.find({
    ...nonDeletedQuery(churchId),
    isActive: false,
  }).populate('pastorId', 'firstName lastName email');
};

// New method to find soft-deleted branches
BranchSchema.statics.findDeletedBranches = function (
  churchId: mongoose.Types.ObjectId
) {
  return this.find({
    churchId,
    isDeleted: true,
  }).populate('pastorId', 'firstName lastName email');
};

BranchSchema.statics.getTotalMembers = async function (
  churchId: mongoose.Types.ObjectId
) {
  const result = await this.aggregate([
    { $match: { churchId, isActive: true, isDeleted: { $ne: true } } },
    { $group: { _id: null, totalMembers: { $sum: '$members' } } },
  ]);
  return result[0]?.totalMembers || 0;
};

BranchSchema.statics.getBranchStats = async function (
  churchId: mongoose.Types.ObjectId
) {
  const result = await this.aggregate([
    { $match: { churchId, isDeleted: { $ne: true } } }, // Exclude deleted
    {
      $group: {
        _id: null,
        totalBranches: { $sum: 1 },
        activeBranches: {
          $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] },
        },
        inactiveBranches: {
          $sum: { $cond: [{ $eq: ['$isActive', false] }, 1, 0] },
        },
        totalCapacity: { $sum: '$capacity' },
        totalMembers: { $sum: '$members' },
        averageCapacity: { $avg: '$capacity' },
        averageMembers: { $avg: '$members' },
      },
    },
  ]);

  // Separate query for deleted count
  const deletedCount = await this.countDocuments({ churchId, isDeleted: true });

  const stats = result[0] || {
    totalBranches: 0,
    activeBranches: 0,
    inactiveBranches: 0,
    totalCapacity: 0,
    totalMembers: 0,
    averageCapacity: 0,
    averageMembers: 0,
  };

  return {
    ...stats,
    deletedBranches: deletedCount,
  };
};

BranchSchema.statics.findByLocation = function (
  city?: string,
  state?: string,
  country?: string
) {
  const query: any = { isDeleted: { $ne: true } }; // Exclude deleted

  if (city) query['address.city'] = new RegExp(city, 'i');
  if (state) query['address.state'] = new RegExp(state, 'i');
  if (country) query['address.country'] = new RegExp(country, 'i');

  return this.find(query).populate('pastorId', 'firstName lastName email');
};

BranchSchema.statics.searchBranches = function (
  churchId: mongoose.Types.ObjectId,
  searchTerm: string
) {
  return this.find({
    churchId,
    isDeleted: { $ne: true }, // Exclude deleted
    $text: { $search: searchTerm },
  }).populate('pastorId', 'firstName lastName email');
};

BranchSchema.statics.getBranchesByCapacityRange = function (
  churchId: mongoose.Types.ObjectId,
  minCapacity: number,
  maxCapacity: number
) {
  return this.find({
    ...nonDeletedQuery(churchId),
    capacity: { $gte: minCapacity, $lte: maxCapacity },
  }).populate('pastorId', 'firstName lastName email');
};

BranchSchema.statics.getOldestBranches = function (
  churchId: mongoose.Types.ObjectId,
  limit = 5
) {
  return this.find(nonDeletedQuery(churchId))
    .sort({ establishedDate: 1 })
    .limit(limit)
    .populate('pastorId', 'firstName lastName email');
};

BranchSchema.statics.getNewestBranches = function (
  churchId: mongoose.Types.ObjectId,
  limit = 5
) {
  return this.find(nonDeletedQuery(churchId))
    .sort({ establishedDate: -1 })
    .limit(limit)
    .populate('pastorId', 'firstName lastName email');
};

BranchSchema.statics.getBranchesNeedingPastor = function (
  churchId: mongoose.Types.ObjectId
) {
  return this.find({
    ...nonDeletedQuery(churchId),
    isActive: true,
    $or: [{ pastorId: { $exists: false } }, { pastorId: null }],
  });
};

BranchSchema.statics.getBranchesOverCapacity = function (
  churchId: mongoose.Types.ObjectId
) {
  return this.find({
    ...nonDeletedQuery(churchId),
    isActive: true,
    $expr: { $gt: ['$members', '$capacity'] },
  }).populate('pastorId', 'firstName lastName email');
};

BranchSchema.statics.getBranchesByEstablishedYear = function (
  churchId: mongoose.Types.ObjectId,
  year: number
) {
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year + 1, 0, 1);

  return this.find({
    ...nonDeletedQuery(churchId),
    establishedDate: {
      $gte: startDate,
      $lt: endDate,
    },
  }).populate('pastorId', 'firstName lastName email');
};

// Ensure virtuals are included in JSON output
BranchSchema.set('toJSON', { virtuals: true });
BranchSchema.set('toObject', { virtuals: true });

// Export the Branch model with complex pattern
export default (mongoose.models.Branch as IBranchModel) ||
  mongoose.model<IBranch, IBranchModel>('Branch', BranchSchema);
