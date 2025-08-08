import mongoose, { type Document, Schema } from 'mongoose';

// Role-specific interfaces
interface IMemberDetails {
  memberId: string;
  membershipDate?: Date;
  membershipStatus: 'active' | 'inactive' | 'transferred' | 'deceased';
  departmentIds?: mongoose.Types.ObjectId[];
  groupIds?: mongoose.Types.ObjectId[];
  occupation?: string;
  baptismDate?: Date;
  joinedDate?: Date;
}

interface IPastorDetails {
  pastorId: string;
  ordinationDate?: Date;
  qualifications?: string[];
  specializations?: string[];
  assignments?: {
    branchId?: mongoose.Types.ObjectId;
    position?: string;
    startDate?: Date;
    endDate?: Date;
    isActive?: boolean;
  }[];
  sermonCount?: number;
  counselingSessions?: number;
  biography?: string;
}

interface IBishopDetails {
  bishopId: string;
  appointmentDate?: Date;
  jurisdictionArea?: string;
  oversight?: {
    branchIds?: mongoose.Types.ObjectId[];
    pastorIds?: mongoose.Types.ObjectId[];
  };
  qualifications?: string[];
  achievements?: string[];
  biography?: string;
}

interface IStaffDetails {
  staffId: string;
  jobTitle?: string;
  department?: string;
  startDate?: Date;
  endDate?: Date;
  salary?: number;
  employmentType: 'full-time' | 'part-time' | 'contract' | 'casual';
  isActive: boolean;
}

interface IVolunteerDetails {
  volunteerId: string;
  volunteerStatus: 'active' | 'inactive' | 'on_hold' | 'suspended';
  availabilitySchedule?: {
    days?: string[];
    timeSlots?: string[];
    preferredTimes?: string;
  };
  skills?: string[];
  departments?: mongoose.Types.ObjectId[];
  ministries?: mongoose.Types.ObjectId[];
  volunteerRoles?: {
    role: string;
    department?: string;
    startDate?: Date;
    endDate?: Date;
    isActive: boolean;
  }[];
  backgroundCheck?: {
    completed: boolean;
    completedDate?: Date;
    expiryDate?: Date;
    clearanceLevel?: 'basic' | 'enhanced' | 'children_ministry';
  };
  emergencyContact?: {
    name: string;
    relationship: string;
    phoneNumber: string;
    email?: string;
  };
  hoursContributed?: number;
}

interface IAdminDetails {
  adminId: string;
  accessLevel: 'branch' | 'regional' | 'national';
  permissions?: string[];
  assignedBranches?: mongoose.Types.ObjectId[];
}

interface ISuperAdminDetails {
  superAdminId: string;
  accessLevel: 'global';
  permissions: string[];
  systemSettings: {
    canCreateChurches: boolean;
    canDeleteChurches: boolean;
    canManageUsers: boolean;
    canAccessAnalytics: boolean;
    canManageSubscriptions: boolean;
    canAccessSystemLogs: boolean;
  };
  companyInfo?: {
    position?: string;
    department?: string;
    startDate?: Date;
  };
}

interface IVisitorDetails {
  visitorId: string;
  visitDate?: Date;
  invitedBy?: mongoose.Types.ObjectId;
  howDidYouHear?: 'friend' | 'family' | 'online' | 'flyer' | 'other';
  followUpStatus: 'pending' | 'contacted' | 'interested' | 'not_interested';
  followUpDate?: Date;
  followUpNotes?: string;
  interestedInMembership: boolean;
  servicesAttended?: string[];
  occupation?: string;
}

// Main User interface
export interface IUser extends Document {
  // Common fields
  firstName: string;
  lastName: string;
  email?: string;
  phoneNumber?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other';
  profileImage?: string;
  // Church association
  churchId: mongoose.Types.ObjectId;
  // Role system
  roles: (
    | 'superadmin'
    | 'admin'
    | 'member'
    | 'pastor'
    | 'bishop'
    | 'visitor'
    | 'volunteer'
    | 'staff'
  )[];
  primaryRole:
    | 'superadmin'
    | 'admin'
    | 'member'
    | 'pastor'
    | 'bishop'
    | 'visitor'
    | 'volunteer'
    | 'staff';
  // Role-specific details (only populated if user has that role)
  memberDetails?: IMemberDetails;
  pastorDetails?: IPastorDetails;
  bishopDetails?: IBishopDetails;
  staffDetails?: IStaffDetails;
  volunteerDetails?: IVolunteerDetails;
  adminDetails?: IAdminDetails;
  superAdminDetails?: ISuperAdminDetails;
  visitorDetails?: IVisitorDetails;
  // Account status and metadata
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  isEmailVerified: boolean;
  lastLogin?: Date;
  passwordHash?: string;
  // Custom permissions
  customPermissions?: {
    action: string;
    granted: boolean;
  }[];
  // Audit fields
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  // Methods
  addRole(role: string): this;
  removeRole(role: string): this;
  hasRole(role: string): boolean;
  hasPermission(permission: string): boolean;
  fullName: string;
}

// Subdocument schemas
const MemberDetailsSchema = new Schema<IMemberDetails>(
  {
    memberId: { type: String, required: true, trim: true },
    membershipDate: { type: Date, default: Date.now },
    membershipStatus: {
      type: String,
      enum: ['active', 'inactive', 'transferred', 'deceased'],
      default: 'active',
    },
    departmentIds: [{ type: Schema.Types.ObjectId, ref: 'Department' }],
    groupIds: [{ type: Schema.Types.ObjectId, ref: 'Group' }],
    occupation: { type: String, trim: true },
    baptismDate: { type: Date },
    joinedDate: { type: Date, default: Date.now },
  },
  { _id: false }
);

const PastorDetailsSchema = new Schema<IPastorDetails>(
  {
    pastorId: { type: String, required: true, trim: true },
    ordinationDate: { type: Date },
    qualifications: [{ type: String, trim: true }],
    specializations: [{ type: String, trim: true }],
    assignments: [
      {
        branchId: { type: Schema.Types.ObjectId, ref: 'Branch' },
        position: { type: String, trim: true },
        startDate: { type: Date },
        endDate: { type: Date },
        isActive: { type: Boolean, default: true },
      },
    ],
    sermonCount: { type: Number, default: 0 },
    counselingSessions: { type: Number, default: 0 },
    biography: { type: String, trim: true },
  },
  { _id: false }
);

const BishopDetailsSchema = new Schema<IBishopDetails>(
  {
    bishopId: { type: String, required: true, trim: true },
    appointmentDate: { type: Date },
    jurisdictionArea: { type: String, trim: true },
    oversight: {
      branchIds: [{ type: Schema.Types.ObjectId, ref: 'Branch' }],
      pastorIds: [{ type: Schema.Types.ObjectId, ref: 'Pastor' }],
    },
    qualifications: [{ type: String, trim: true }],
    achievements: [{ type: String, trim: true }],
    biography: { type: String, trim: true },
  },
  { _id: false }
);

const StaffDetailsSchema = new Schema<IStaffDetails>(
  {
    staffId: { type: String, required: true, trim: true },
    jobTitle: { type: String, trim: true, lowercase: true },
    department: { type: String, trim: true, lowercase: true },
    startDate: { type: Date },
    endDate: { type: Date },
    salary: { type: Number },
    employmentType: {
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'casual'],
      default: 'casual',
    },
    isActive: { type: Boolean, default: true },
  },
  { _id: false }
);

const VolunteerDetailsSchema = new Schema<IVolunteerDetails>(
  {
    volunteerId: { type: String, required: true, trim: true },
    volunteerStatus: {
      type: String,
      enum: ['active', 'inactive', 'on_hold', 'suspended'],
      default: 'active',
    },
    availabilitySchedule: {
      days: [{ type: String }],
      timeSlots: [{ type: String, trim: true }],
      preferredTimes: { type: String, trim: true },
    },
    skills: [{ type: String, trim: true, lowercase: true }],
    departments: [{ type: Schema.Types.ObjectId, ref: 'Department' }],
    ministries: [{ type: Schema.Types.ObjectId, ref: 'Ministry' }],
    volunteerRoles: [
      {
        role: { type: String, required: true, trim: true },
        department: { type: String, trim: true },
        startDate: { type: Date, default: Date.now },
        endDate: { type: Date },
        isActive: { type: Boolean, default: true },
      },
    ],
    backgroundCheck: {
      completed: { type: Boolean, default: false },
      completedDate: { type: Date },
      expiryDate: { type: Date },
      clearanceLevel: {
        type: String,
        enum: ['basic', 'enhanced', 'children_ministry'],
      },
    },
    emergencyContact: {
      name: { type: String, trim: true },
      relationship: { type: String, trim: true },
      phoneNumber: { type: String, trim: true },
      email: { type: String, trim: true, lowercase: true },
    },
    hoursContributed: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

const AdminDetailsSchema = new Schema<IAdminDetails>(
  {
    adminId: { type: String, required: true, trim: true },
    accessLevel: {
      type: String,
      enum: ['branch', 'regional', 'national'],
      default: 'national',
    },
    permissions: [{ type: String, trim: true }],
    assignedBranches: [{ type: Schema.Types.ObjectId, ref: 'Branch' }],
  },
  { _id: false }
);

const SuperAdminDetailsSchema = new Schema<ISuperAdminDetails>(
  {
    superAdminId: { type: String, required: true, trim: true },
    accessLevel: {
      type: String,
      enum: ['global'],
      default: 'global',
    },
    permissions: {
      type: [String],
      default: [
        'create_church',
        'delete_church',
        'manage_users',
        'access_analytics',
        'manage_subscriptions',
        'access_system_logs',
        'manage_system_settings',
        'view_all_data',
        'backup_restore',
        'manage_integrations',
      ],
    },
    systemSettings: {
      canCreateChurches: { type: Boolean, default: true },
      canDeleteChurches: { type: Boolean, default: true },
      canManageUsers: { type: Boolean, default: true },
      canAccessAnalytics: { type: Boolean, default: true },
      canManageSubscriptions: { type: Boolean, default: true },
      canAccessSystemLogs: { type: Boolean, default: true },
    },
    companyInfo: {
      position: { type: String, trim: true },
      department: { type: String, trim: true },
      startDate: { type: Date },
    },
  },
  { _id: false }
);

const VisitorDetailsSchema = new Schema<IVisitorDetails>(
  {
    visitorId: { type: String, required: true, trim: true },
    visitDate: { type: Date, default: Date.now },
    invitedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    howDidYouHear: {
      type: String,
      enum: ['friend', 'family', 'online', 'flyer', 'other'],
      required: true,
      default: 'other',
    },
    followUpStatus: {
      type: String,
      enum: ['pending', 'contacted', 'interested', 'not_interested'],
      default: 'pending',
    },
    followUpDate: { type: Date },
    followUpNotes: { type: String, trim: true },
    interestedInMembership: { type: Boolean, default: false },
    servicesAttended: [{ type: String, trim: true }],
    occupation: { type: String, trim: true },
  },
  { _id: false }
);

// Main User Schema
const UserSchema = new Schema<IUser>(
  {
    // Common fields
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      lowercase: true,
    },
    phoneNumber: { type: String, trim: true },
    address: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      zipCode: { type: String, trim: true },
      country: { type: String, default: 'USA', trim: true },
    },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ['male', 'female', 'other'] },
    profileImage: { type: String, trim: true },
    // Church association
    churchId: {
      type: Schema.Types.ObjectId,
      ref: 'Church',
      required(this: IUser) {
        // SuperAdmin doesn't need churchId
        return !this.roles?.includes('superadmin');
      },
    },
    // Role system
    roles: [
      {
        type: String,
        enum: [
          'superadmin',
          'admin',
          'member',
          'pastor',
          'bishop',
          'visitor',
          'volunteer',
          'staff',
        ],
        required: true,
      },
    ],
    primaryRole: {
      type: String,
      enum: [
        'superadmin',
        'admin',
        'member',
        'pastor',
        'bishop',
        'visitor',
        'volunteer',
        'staff',
      ],
      required: true,
    },
    // Role-specific details
    memberDetails: MemberDetailsSchema,
    pastorDetails: PastorDetailsSchema,
    bishopDetails: BishopDetailsSchema,
    staffDetails: StaffDetailsSchema,
    volunteerDetails: VolunteerDetailsSchema,
    adminDetails: AdminDetailsSchema,
    superAdminDetails: SuperAdminDetailsSchema,
    visitorDetails: VisitorDetailsSchema,
    // Account status
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended', 'pending'],
      default: 'active',
    },
    isEmailVerified: { type: Boolean, default: false },
    lastLogin: { type: Date },
    passwordHash: { type: String },
    // Custom permissions
    customPermissions: [
      {
        action: { type: String, required: true },
        granted: { type: Boolean, required: true },
      },
    ],
    // Audit fields
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
UserSchema.index({ churchId: 1, roles: 1, status: 1 });
UserSchema.index({ email: 1 });
UserSchema.index({ roles: 1 });
UserSchema.index({ primaryRole: 1 });
UserSchema.index({ firstName: 1, lastName: 1 });
UserSchema.index({ 'memberDetails.memberId': 1 }, { sparse: true });
UserSchema.index({ 'pastorDetails.pastorId': 1 }, { sparse: true });
UserSchema.index({ 'bishopDetails.bishopId': 1 }, { sparse: true });

// Virtual for full name
UserSchema.virtual('fullName').get(function (this: IUser) {
  return `${this.firstName} ${this.lastName}`;
});

// Methods
UserSchema.methods.addRole = function (this: IUser, role: string) {
  if (!this.roles.includes(role as any)) {
    this.roles.push(role as any);
  }
  return this;
};

UserSchema.methods.removeRole = function (this: IUser, role: string) {
  this.roles = this.roles.filter((r) => r !== role) as any;
  return this;
};

UserSchema.methods.hasRole = function (this: IUser, role: string) {
  return this.roles.includes(role as any);
};

UserSchema.methods.hasPermission = function (this: IUser, permission: string) {
  // Role-based permissions logic here
  const rolePermissions: Record<string, string[]> = {
    superadmin: ['*'],
    admin: ['manage_users', 'manage_events', 'view_reports', 'manage_finances'],
    pastor: ['manage_members', 'view_reports', 'manage_events'],
    bishop: ['manage_pastors', 'view_all_reports', 'manage_events'],
    staff: ['manage_events', 'view_basic_reports'],
    member: ['view_profile', 'view_events'],
    volunteer: ['view_profile', 'view_events', 'manage_volunteer_tasks'],
    visitor: ['view_profile', 'view_public_events'],
  };
  const hasRolePermission = this.roles.some((role) => {
    const permissions = rolePermissions[role] || [];
    return permissions.includes('*') || permissions.includes(permission);
  });
  const customPerm = this.customPermissions?.find(
    (cp) => cp.action === permission
  );
  const hasCustomPermission = customPerm ? customPerm.granted : false;
  return hasRolePermission || hasCustomPermission;
};

// Pre-save middleware
UserSchema.pre('save', function (this: IUser, next) {
  // Ensure primary role is in roles array
  if (!this.roles.includes(this.primaryRole)) {
    this.roles.push(this.primaryRole);
  }
  // Clear role-specific details if role is removed
  if (
    !(
      this.roles.includes('member') ||
      this.roles.includes('pastor') ||
      this.roles.includes('bishop')
    )
  ) {
    this.memberDetails = undefined;
  }
  if (!this.roles.includes('pastor')) {
    this.pastorDetails = undefined;
  }
  if (!this.roles.includes('bishop')) {
    this.bishopDetails = undefined;
  }
  if (!this.roles.includes('staff')) {
    this.staffDetails = undefined;
  }
  if (!this.roles.includes('volunteer')) {
    this.volunteerDetails = undefined;
  }
  if (!this.roles.includes('admin')) {
    this.adminDetails = undefined;
  }
  if (!this.roles.includes('superadmin')) {
    this.superAdminDetails = undefined;
  }
  if (!this.roles.includes('visitor')) {
    this.visitorDetails = undefined;
  }
  next();
});

// Static methods
UserSchema.statics.findByRole = function (role: string) {
  return this.find({ roles: role, status: 'active' });
};

export default mongoose.models.User ||
  mongoose.model<IUser>('User', UserSchema);
