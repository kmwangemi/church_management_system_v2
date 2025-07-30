import mongoose, { Schema, type Document, type Model } from 'mongoose';

// Define the interface for a MessageRecipient document
export interface IMessageRecipient extends Document {
  churchId: mongoose.Types.ObjectId;
  branchId?: mongoose.Types.ObjectId;
  id: string; // Unique identifier for the group (e.g., 'all-users', 'department-choir', 'group-youth-bible-study')
  name: string;
  description?: string;
  type: 'all-users' | 'active-users' | 'department' | 'group' | 'custom';
  targetModel: 'User' | 'Department' | 'Group';
  targetId?: mongoose.Types.ObjectId; // Reference to specific department or group
  criteria: {
    userStatus?: string[]; // For user-based filtering
    roles?: string[];
    ageRange?: {
      min?: number;
      max?: number;
    };
    gender?: 'male' | 'female';
    departmentIds?: mongoose.Types.ObjectId[];
    groupIds?: mongoose.Types.ObjectId[];
    customQuery?: Record<string, any>;
  };
  memberCount: number;
  isActive: boolean;
  autoUpdate: boolean;
  lastUpdated: Date;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Define the interface for static methods
export interface IMessageRecipientModel extends Model<IMessageRecipient> {
  findActiveGroups(
    churchId: mongoose.Types.ObjectId
  ): Promise<IMessageRecipient[]>;
  getDefaultRecipientGroups(
    churchId: mongoose.Types.ObjectId
  ): Promise<IMessageRecipient[]>;
  updateMemberCounts(churchId: mongoose.Types.ObjectId): Promise<void>;
}

// Define the Mongoose Schema for MessageRecipient
const MessageRecipientSchema = new Schema<IMessageRecipient>(
  {
    churchId: {
      type: Schema.Types.ObjectId,
      ref: 'Church',
      required: true,
    },
    branchId: {
      type: Schema.Types.ObjectId,
      ref: 'Branch',
      default: null
    },
    id: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: [
        /^[a-z0-9_-]+$/,
        'Group ID must contain only lowercase letters, numbers, hyphens, and underscores',
      ],
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: [2, 'Group name must be at least 2 characters'],
      maxlength: [100, 'Group name must be less than 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description must be less than 500 characters'],
    },
    type: {
      type: String,
      required: true,
      enum: ['all-users', 'active-users', 'department', 'group', 'custom'],
      default: 'custom',
    },
    targetModel: {
      type: String,
      required: true,
      enum: ['User', 'Department', 'Group'],
    },
    targetId: {
      type: Schema.Types.ObjectId,
      refPath: 'targetModel',
    },
    criteria: {
      userStatus: {
        type: [String],
        enum: ['active', 'inactive', 'pending', 'suspended'],
      },
      roles: {
        type: [String],
        enum: [
          'member',
          'leader',
          'pastor',
          'deacon',
          'elder',
          'volunteer',
          'admin',
          'superadmin',
        ],
      },
      ageRange: {
        min: {
          type: Number,
          min: 0,
          max: 150,
        },
        max: {
          type: Number,
          min: 0,
          max: 150,
        },
      },
      gender: {
        type: String,
        enum: ['male', 'female'],
      },
      departmentIds: [
        {
          type: Schema.Types.ObjectId,
          ref: 'Department',
        },
      ],
      groupIds: [
        {
          type: Schema.Types.ObjectId,
          ref: 'Group',
        },
      ],
      customQuery: {
        type: Schema.Types.Mixed,
      },
    },
    memberCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    autoUpdate: {
      type: Boolean,
      default: true,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Add indexes for better query performance
MessageRecipientSchema.index({ churchId: 1, isActive: 1 });
MessageRecipientSchema.index({ churchId: 1, type: 1, isActive: 1 });
MessageRecipientSchema.index({ branchId: 1 }, { sparse: true });
MessageRecipientSchema.index({ targetModel: 1, targetId: 1 });

// Ensure unique group IDs per church
MessageRecipientSchema.index({ churchId: 1, id: 1 }, { unique: true });

// Add text index for searching
MessageRecipientSchema.index({
  name: 'text',
  description: 'text',
});

// Pre-save middleware
MessageRecipientSchema.pre('save', function (next) {
  // Validate age range
  if (
    this.criteria.ageRange?.min &&
    this.criteria.ageRange?.max &&
    this.criteria.ageRange.min > this.criteria.ageRange.max
  ) {
    return next(new Error('Minimum age cannot be greater than maximum age'));
  }

  // Validate targetId is required for department and group types
  if ((this.type === 'department' || this.type === 'group') && !this.targetId) {
    return next(
      new Error('Target ID is required for department and group types')
    );
  }

  next();
});

// Static methods
MessageRecipientSchema.statics.findActiveGroups = function (
  churchId: mongoose.Types.ObjectId
) {
  return this.find({
    churchId,
    isActive: true,
  }).sort({ type: 1, name: 1 });
};

MessageRecipientSchema.statics.getDefaultRecipientGroups = async (
  churchId: mongoose.Types.ObjectId
) => {
  const User = mongoose.model('User');
  const Department = mongoose.model('Department');
  const Group = mongoose.model('Group');

  const [allUsersCount, activeUsersCount, departments, groups] =
    await Promise.all([
      User.countDocuments({ churchId }),
      User.countDocuments({ churchId, status: 'active' }),
      Department.find({ churchId, isActive: true }).select(
        '_id departmentName'
      ),
      Group.find({ churchId, isActive: true }).select('_id groupName category'),
    ]);

  const defaultGroups = [
    {
      id: 'all-users',
      name: 'All Members',
      count: allUsersCount,
      type: 'all-users',
      targetModel: 'User',
    },
    {
      id: 'active-users',
      name: 'Active Members',
      count: activeUsersCount,
      type: 'active-users',
      targetModel: 'User',
    },
  ];

  // Add departments
  departments.forEach((dept) => {
    defaultGroups.push({
      id: `department-${dept._id}`,
      name: `${dept.departmentName} Department`,
      count: 0, // Would need to calculate based on user assignments
      type: 'department',
      targetModel: 'Department',
      targetId: dept._id,
    });
  });

  // Add groups
  groups.forEach((group) => {
    defaultGroups.push({
      id: `group-${group._id}`,
      name: `${group.groupName} Group`,
      count: 0, // Would need to calculate based on user assignments
      type: 'group',
      targetModel: 'Group',
      targetId: group._id,
    });
  });

  return defaultGroups;
};

MessageRecipientSchema.statics.updateMemberCounts = async function (
  churchId: mongoose.Types.ObjectId
) {
  const groups = await this.find({
    churchId,
    autoUpdate: true,
    isActive: true,
  });

  for (const group of groups) {
    const count = await group.calculateMemberCount();
    group.memberCount = count;
    group.lastUpdated = new Date();
    await group.save();
  }
};

// Instance methods
MessageRecipientSchema.methods.calculateMemberCount = async function () {
  const User = mongoose.model('User');
  const Department = mongoose.model('Department');
  const Group = mongoose.model('Group');

  try {
    let count = 0;

    switch (this.type) {
      case 'all-users':
        count = await User.countDocuments({ churchId: this.churchId });
        break;

      case 'active-users':
        count = await User.countDocuments({
          churchId: this.churchId,
          status: 'active',
        });
        break;

      case 'department':
        if (this.targetId) {
          // Count users assigned to this department
          count = await User.countDocuments({
            churchId: this.churchId,
            departmentId: this.targetId,
            status: 'active',
          });
        }
        break;

      case 'group':
        if (this.targetId) {
          // Count users assigned to this group
          count = await User.countDocuments({
            churchId: this.churchId,
            groupId: this.targetId,
            status: 'active',
          });
        }
        break;

      case 'custom': {
        const query = this.buildUserQuery();
        count = await User.countDocuments(query);
        break;
      }
    }

    return count;
  } catch (error) {
    console.error('Error calculating member count for group:', this.id, error);
    return this.memberCount;
  }
};

MessageRecipientSchema.methods.buildUserQuery = function () {
  const query: any = { churchId: this.churchId };

  if (this.branchId) {
    query.branchId = this.branchId;
  }

  if (this.criteria.userStatus?.length) {
    query.status = { $in: this.criteria.userStatus };
  }

  if (this.criteria.roles?.length) {
    query.role = { $in: this.criteria.roles };
  }

  if (this.criteria.ageRange?.min || this.criteria.ageRange?.max) {
    const now = new Date();
    const ageQuery: any = {};

    if (this.criteria.ageRange.max) {
      const minBirthDate = new Date(
        now.getFullYear() - this.criteria.ageRange.max - 1,
        now.getMonth(),
        now.getDate()
      );
      ageQuery.$gte = minBirthDate;
    }

    if (this.criteria.ageRange.min) {
      const maxBirthDate = new Date(
        now.getFullYear() - this.criteria.ageRange.min,
        now.getMonth(),
        now.getDate()
      );
      ageQuery.$lte = maxBirthDate;
    }

    query.dateOfBirth = ageQuery;
  }

  if (this.criteria.gender) {
    query.gender = this.criteria.gender;
  }

  if (this.criteria.departmentIds?.length) {
    query.departmentId = { $in: this.criteria.departmentIds };
  }

  if (this.criteria.groupIds?.length) {
    query.groupId = { $in: this.criteria.groupIds };
  }

  if (this.criteria.customQuery) {
    Object.assign(query, this.criteria.customQuery);
  }

  return query;
};

MessageRecipientSchema.methods.getMembers = async function () {
  const User = mongoose.model('User');

  try {
    let users = [];

    switch (this.type) {
      case 'all-users':
        users = await User.find({ churchId: this.churchId }).select(
          '_id name email phone'
        );
        break;

      case 'active-users':
        users = await User.find({
          churchId: this.churchId,
          status: 'active',
        }).select('_id name email phone');
        break;

      case 'department':
        if (this.targetId) {
          users = await User.find({
            churchId: this.churchId,
            departmentId: this.targetId,
            status: 'active',
          }).select('_id name email phone');
        }
        break;

      case 'group':
        if (this.targetId) {
          users = await User.find({
            churchId: this.churchId,
            groupId: this.targetId,
            status: 'active',
          }).select('_id name email phone');
        }
        break;

      case 'custom': {
        const query = this.buildUserQuery();
        users = await User.find(query).select('_id name email phone');
        break;
      }
    }

    return users;
  } catch (error) {
    console.error('Error getting members for group:', this.id, error);
    return [];
  }
};

// Virtual for criteria summary
MessageRecipientSchema.virtual('criteriaSummary').get(function () {
  const summary = [];

  if (this.type === 'department' && this.targetId) {
    summary.push('Department-based');
  }

  if (this.type === 'group' && this.targetId) {
    summary.push('Group-based');
  }

  if (this.criteria.userStatus?.length) {
    summary.push(`Status: ${this.criteria.userStatus.join(', ')}`);
  }

  if (this.criteria.ageRange?.min || this.criteria.ageRange?.max) {
    const min = this.criteria.ageRange.min || 0;
    const max = this.criteria.ageRange.max || '∞';
    summary.push(`Age: ${min}-${max}`);
  }

  if (this.criteria.gender) {
    summary.push(`Gender: ${this.criteria.gender}`);
  }

  if (this.criteria.roles?.length) {
    summary.push(`Roles: ${this.criteria.roles.join(', ')}`);
  }

  return summary.join(' | ');
});

// Ensure virtuals are included in JSON output
MessageRecipientSchema.set('toJSON', { virtuals: true });
MessageRecipientSchema.set('toObject', { virtuals: true });

// Export the MessageRecipient model
export default (mongoose.models.MessageRecipient as IMessageRecipientModel) ||
  mongoose.model<IMessageRecipient, IMessageRecipientModel>(
    'MessageRecipient',
    MessageRecipientSchema
  );
