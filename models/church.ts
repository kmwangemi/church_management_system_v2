import mongoose, { Schema, type Document, type Model } from 'mongoose';

export interface IChurch extends Document {
  churchName: string;
  denomination: string;
  email: string;
  phoneNumber: string;
  website?: string;
  establishedDate: Date;
  churchLogoUrl?: string;
  churchSize: string;
  numberOfBranches: number;
  createdBy: mongoose.Types.ObjectId;
  address: {
    street: string;
    city: string;
    state?: string;
    zipCode?: string;
    country: string;
  };
  description?: string;
  isSuspended: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Define the interface for the static methods
export interface IChurchModel extends Model<IChurch> {
  findActive(): mongoose.Query<IChurch[], IChurch>;
  findSuspended(): mongoose.Query<IChurch[], IChurch>;
  findByCreator(
    creatorId: mongoose.Types.ObjectId
  ): mongoose.Query<IChurch[], IChurch>;
  findByDenomination(denomination: string): mongoose.Query<IChurch[], IChurch>;
  search(query: string): mongoose.Query<IChurch[], IChurch>;
}

const AddressSchema = new Schema(
  {
    street: {
      type: String,
      required: [true, 'Street address is required'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },
    state: {
      type: String,
      trim: true,
    },
    zipCode: {
      type: String,
      trim: true,
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      trim: true,
    },
  },
  { _id: false }
);

const ChurchSchema = new Schema<IChurch>(
  {
    churchName: {
      type: String,
      required: [true, 'Church name is required'],
      trim: true,
      minlength: [2, 'Church name must be at least 2 characters'],
      maxlength: [100, 'Church name cannot exceed 100 characters'],
      index: true,
    },
    denomination: {
      type: String,
      required: [true, 'Denomination is required'],
      trim: true,
      maxlength: [50, 'Denomination cannot exceed 50 characters'],
      index: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    phoneNumber: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      unique: true,
      index: true,
    },
    address: {
      type: AddressSchema,
      required: [true, 'Address is required'],
    },
    establishedDate: {
      type: Date,
      required: [true, 'Established date is required'],
      validate: {
        validator(v: Date) {
          return v <= new Date();
        },
        message: 'Established date cannot be in the future',
      },
    },
    website: {
      type: String,
      trim: true,
    },
    churchSize: {
      type: String,
      required: [true, 'Church size is required'],
      trim: true,
      index: true,
    },
    numberOfBranches: {
      type: Number,
      required: [true, 'Number of branches is required'],
      min: [1, 'Number of branches must be at least 1'],
      max: [1000, 'Number of branches cannot exceed 1000'],
      default: 1,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator is required'],
      index: true,
    },
    churchLogoUrl: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    isSuspended: {
      type: Boolean,
      default: false,
      index: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc, ret) {
        // Hide deleted churches from JSON output unless explicitly requested
        if (ret.isDeleted) {
          ret.email = undefined;
          ret.phoneNumber = undefined;
        }
        return ret;
      },
    },
    toObject: {
      virtuals: true,
    },
  }
);

// Compound indexes for better query performance
ChurchSchema.index({ isSuspended: 1, isDeleted: 1 });
ChurchSchema.index({ createdBy: 1, isDeleted: 1 });
ChurchSchema.index({ denomination: 1, churchSize: 1 });

// Text index for search functionality
ChurchSchema.index({
  churchName: 'text',
  denomination: 'text',
  description: 'text',
});

// Virtual to get full address as string
ChurchSchema.virtual('fullAddress').get(function () {
  const addr = this.address;
  const parts = [addr.street, addr.city];
  if (addr.state) parts.push(addr.state);
  if (addr.zipCode) parts.push(addr.zipCode);
  parts.push(addr.country);
  return parts.join(', ');
});

// Virtual to check if church is active
ChurchSchema.virtual('isActive').get(function () {
  return !(this.isSuspended || this.isDeleted);
});

// Virtual to get church age in years
ChurchSchema.virtual('ageInYears').get(function () {
  const now = new Date();
  const established = new Date(this.establishedDate);
  return Math.floor(
    (now.getTime() - established.getTime()) / (1000 * 60 * 60 * 24 * 365.25)
  );
});

// Pre-save middleware
ChurchSchema.pre('save', function (next) {
  // Ensure suspended churches cannot be active
  if (this.isSuspended) {
    this.isDeleted = false; // Can't be both suspended and deleted
  }
  // Convert phone number to consistent format (remove spaces, dashes, parentheses)
  if (this.phoneNumber) {
    this.phoneNumber = this.phoneNumber.replace(/[\s\-()]/g, '');
  }
  next();
});

// Instance methods
ChurchSchema.methods.suspend = function (reason?: string) {
  this.isSuspended = true;
  this.isDeleted = false;
  if (reason && this.description) {
    this.description = `${this.description} | Suspended: ${reason}`;
  }
  return this.save();
};

ChurchSchema.methods.restore = function () {
  this.isSuspended = false;
  this.isDeleted = false;
  return this.save();
};

ChurchSchema.methods.softDelete = function () {
  this.isDeleted = true;
  this.isSuspended = false;
  return this.save();
};

// Static methods
ChurchSchema.statics.findActive = function () {
  return this.find({ isSuspended: false, isDeleted: false });
};

ChurchSchema.statics.findSuspended = function () {
  return this.find({ isSuspended: true, isDeleted: false });
};

ChurchSchema.statics.findByCreator = function (
  creatorId: mongoose.Types.ObjectId
) {
  return this.find({ createdBy: creatorId, isDeleted: false });
};

ChurchSchema.statics.findByDenomination = function (denomination: string) {
  return this.find({
    denomination: new RegExp(denomination, 'i'),
    isSuspended: false,
    isDeleted: false,
  });
};

ChurchSchema.statics.search = function (query: string) {
  return this.find({
    $text: { $search: query },
    isSuspended: false,
    isDeleted: false,
  }).sort({ score: { $meta: 'textScore' } });
};

// Export the Church model
export default (mongoose.models.Church as IChurchModel) ||
  mongoose.model<IChurch, IChurchModel>('Church', ChurchSchema);
