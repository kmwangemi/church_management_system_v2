/** biome-ignore-all lint/complexity/noExcessiveCognitiveComplexity: ignore */
import bcrypt from 'bcryptjs';
import mongoose, { type CallbackError, type Document, Schema } from 'mongoose';

// Role-specific interfaces (keep these for embedded data)
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
  hoursContributed?: number;
}

interface IAdminDetails {
  adminId: string;
  accessLevel: 'branch' | 'regional' | 'national';
  assignedBranches?: mongoose.Types.ObjectId[];
}

interface ISuperAdminDetails {
  superAdminId: string;
  accessLevel: 'global';
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

// Main User interface - Fixed inconsistencies
export interface IUserModel extends Document {
  // Common fields
  firstName: string;
  lastName: string;
  email?: string;
  phoneNumber: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  dateOfBirth?: Date;
  gender?: 'male' | 'female';
  profilePictureUrl?: string;
  // Church association - Optional for superadmin
  churchId?: mongoose.Types.ObjectId;
  // Branch association - Optional for admin/superadmin
  branchId?: mongoose.Types.ObjectId;
  isMember: boolean;
  // Simple role system - single string role
  role: 'member' | 'pastor' | 'bishop' | 'admin' | 'superadmin' | 'visitor';
  // Secondary role flags (kept for backward compatibility and specific logic)
  isStaff: boolean;
  isVolunteer: boolean;
  // Role-specific details (embedded data based on role type)
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
  passwordHash?: string; // ✅ Fixed: Made optional since not all users may have passwords
  // Audit fields
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  // Additional fields
  isPasswordUpdated: boolean;
  agreeToTerms: boolean;
  isDeleted: boolean;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  // Rate limiting fields
  loginAttempts?: number;
  lockUntil?: Date;
  maritalStatus?: 'single' | 'married' | 'divorced' | 'widowed';
  emergencyDetails?: {
    emergencyContactFullName?: string;
    emergencyContactEmail?: string;
    emergencyContactPhoneNumber?: string;
    emergencyContactRelationship?: string;
    emergencyContactAddress?: string;
    emergencyContactNotes?: string;
  };
  notes?: string;
  // Methods
  hasRole(roleName: string): boolean;
  isStaffMember(): boolean;
  isVolunteerMember(): boolean;
  comparePassword(candidatePassword: string): Promise<boolean>;
  incLoginAttempts(): Promise<this>;
  resetLoginAttempts(): Promise<this>;
  fullName: string;
  isLocked: boolean;
}

// Subdocument schemas
const MemberDetailsSchema = new Schema<IMemberDetails>(
  {
    memberId: { type: String, trim: true },
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
    pastorId: { type: String, trim: true },
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
    bishopId: { type: String, trim: true },
    appointmentDate: { type: Date },
    jurisdictionArea: { type: String, trim: true },
    oversight: {
      branchIds: [{ type: Schema.Types.ObjectId, ref: 'Branch' }],
      pastorIds: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    },
    qualifications: [{ type: String, trim: true }],
    achievements: [{ type: String, trim: true }],
    biography: { type: String, trim: true },
  },
  { _id: false }
);

const StaffDetailsSchema = new Schema<IStaffDetails>(
  {
    staffId: { type: String, trim: true },
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
    volunteerId: { type: String, trim: true },
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
    hoursContributed: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

const AdminDetailsSchema = new Schema<IAdminDetails>(
  {
    adminId: { type: String, trim: true },
    accessLevel: {
      type: String,
      enum: ['branch', 'regional', 'national'],
      default: 'national',
    },
    assignedBranches: [{ type: Schema.Types.ObjectId, ref: 'Branch' }],
  },
  { _id: false }
);

const SuperAdminDetailsSchema = new Schema<ISuperAdminDetails>(
  {
    superAdminId: { type: String, trim: true },
    accessLevel: {
      type: String,
      enum: ['global'],
      default: 'global',
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
    visitorId: { type: String, trim: true },
    visitDate: { type: Date, default: Date.now },
    invitedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    howDidYouHear: {
      type: String,
      enum: ['friend', 'family', 'online', 'flyer', 'other'],
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

// Main User Schema - Fixed all issues
const UserSchema = new Schema<IUserModel>(
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
    phoneNumber: { type: String, required: true, trim: true },
    address: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      zipCode: { type: String, trim: true },
      country: { type: String, default: 'Kenya', trim: true },
    },
    dateOfBirth: { type: Date },
    gender: {
      type: String,
      enum: ['male', 'female'],
      required: true,
    },
    profilePictureUrl: { type: String, trim: true },
    churchId: {
      type: Schema.Types.ObjectId,
      ref: 'Church',
      required(this: IUserModel) {
        return this.role !== 'superadmin';
      },
    },
    branchId: {
      type: Schema.Types.ObjectId,
      ref: 'Branch',
      required(this: IUserModel) {
        return !['admin', 'superadmin'].includes(this.role);
      },
    },
    isMember: {
      type: Boolean,
      required: true,
      default: false,
    },
    // Simple role system - single string role
    role: {
      type: String,
      enum: ['member', 'pastor', 'bishop', 'admin', 'superadmin', 'visitor'],
      required: true,
      default: 'visitor',
      lowercase: true,
    },
    // Secondary role flags
    isStaff: {
      type: Boolean,
      default: false,
    },
    isVolunteer: {
      type: Boolean,
      default: false,
    },
    // Role-specific details (embedded data)
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
    // ✅ Fixed: Made optional since not all users need passwords
    passwordHash: { type: String, trim: true },
    // Audit fields - ✅ Fixed: Proper conditional required
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required(this: IUserModel) {
        return this.role !== 'superadmin';
      },
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required(this: IUserModel) {
        return this.role !== 'superadmin';
      },
    },
    isPasswordUpdated: { type: Boolean, required: true, default: false },
    agreeToTerms: { type: Boolean, default: true },
    isDeleted: { type: Boolean, required: true, default: false },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    // Rate limiting fields
    loginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date },
    maritalStatus: {
      type: String,
      enum: ['single', 'married', 'divorced', 'widowed'],
      trim: true,
      lowercase: true,
      default: 'single',
    },
    emergencyDetails: {
      emergencyContactFullName: { type: String, trim: true, lowercase: true },
      emergencyContactEmail: { type: String, trim: true, lowercase: true },
      emergencyContactPhoneNumber: { type: String, trim: true },
      emergencyContactRelationship: {
        type: String,
        trim: true,
        lowercase: true,
      },
      emergencyContactAddress: { type: String, trim: true, lowercase: true },
      emergencyContactNotes: { type: String, trim: true, lowercase: true },
    },
    notes: { type: String, trim: true, lowercase: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
UserSchema.index({ churchId: 1, isMember: 1, status: 1 });
UserSchema.index({ role: 1, status: 1 });
UserSchema.index({ email: 1 });
UserSchema.index({ firstName: 1, lastName: 1 });
UserSchema.index({ isMember: 1, status: 1 });
UserSchema.index({ isStaff: 1, status: 1 });
UserSchema.index({ isVolunteer: 1, status: 1 });
UserSchema.index({ role: 1, isStaff: 1, isVolunteer: 1 });
UserSchema.index({ 'memberDetails.memberId': 1 }, { sparse: true });
UserSchema.index({ 'pastorDetails.pastorId': 1 }, { sparse: true });
UserSchema.index({ 'bishopDetails.bishopId': 1 }, { sparse: true });
UserSchema.index({ 'visitorDetails.visitorId': 1 }, { sparse: true });
UserSchema.index({ isDeleted: 1 }); // ✅ Added index for soft delete

// Constants for rate limiting
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME = 2 * 60 * 60 * 1000; // 2 hours in milliseconds

// Virtual property for checking if account is locked
UserSchema.virtual('isLocked').get(function (this: IUserModel) {
  return !!(this.lockUntil && this.lockUntil > new Date());
});

// Virtual for full name
UserSchema.virtual('fullName').get(function (this: IUserModel) {
  return `${this.firstName} ${this.lastName}`;
});

// Rate limiting methods
UserSchema.methods.incLoginAttempts = function (this: IUserModel) {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < new Date()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 },
    });
  }
  const updates: Record<string, unknown> = { $inc: { loginAttempts: 1 } };
  // If we have hit max attempts and it's not locked yet, lock the account
  const currentLoginAttempts =
    typeof this.loginAttempts === 'number' ? this.loginAttempts : 0;
  const isLocked = this.isLocked;
  if (currentLoginAttempts + 1 >= MAX_LOGIN_ATTEMPTS && !isLocked) {
    updates.$set = { lockUntil: new Date(Date.now() + LOCK_TIME) };
  }
  return this.updateOne(updates);
};

UserSchema.methods.resetLoginAttempts = function (this: IUserModel) {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 },
  });
};

// ✅ Fixed: Password comparison method
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  // Check if account is locked
  if (this.isLocked) {
    throw new Error(
      'Account is temporarily locked due to too many failed login attempts'
    );
  }
  if (!this.passwordHash) {
    throw new Error('No password set for this user');
  }
  const isMatch = await bcrypt.compare(candidatePassword, this.passwordHash);
  // If password is correct, reset login attempts
  if (isMatch) {
    // Only reset if there are attempts or lock time
    if (this.loginAttempts || this.lockUntil) {
      await this.resetLoginAttempts();
    }
    return true;
  }
  // Password is incorrect, increment login attempts
  await this.incLoginAttempts();
  return false;
};

// Methods - Updated to work with simple string role system
UserSchema.methods.hasRole = function (
  this: IUserModel,
  roleName: string
): boolean {
  return this.role === roleName.toLowerCase();
};

UserSchema.methods.isStaffMember = function (this: IUserModel): boolean {
  return this.isStaff;
};

UserSchema.methods.isVolunteerMember = function (this: IUserModel): boolean {
  return this.isVolunteer;
};

// Pre-save middleware for password hashing
UserSchema.pre('save', async function (next) {
  // Only hash if password is modified and exists
  if (!(this.isModified('passwordHash') && this.passwordHash)) {
    return next();
  }
  try {
    this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
    next();
  } catch (error) {
    const callbackError =
      error instanceof Error ? error : new Error(String(error));
    next(callbackError as CallbackError);
  }
});

// ✅ Enhanced ID generation helper with church-based incremental IDs
async function generateRoleIds(user: IUserModel) {
  // const churchId = user.churchId?.toString() || 'DEFAULT';
  // Helper function to get next incremental number for a role
  const getNextNumber = async (role: string): Promise<string> => {
    const UserModel = mongoose.model<IUserModel>('User');
    // Count existing users of this role in this church
    const query: any = {
      churchId: user.churchId,
      isDeleted: false,
    };
    // For primary roles, count by role
    if (
      ['member', 'pastor', 'bishop', 'admin', 'superadmin', 'visitor'].includes(
        role
      )
    ) {
      query.role = role;
    }
    // For secondary roles, count by flag
    else if (role === 'staff') {
      query.isStaff = true;
    } else if (role === 'volunteer') {
      query.isVolunteer = true;
    }
    const count = await UserModel.countDocuments(query);
    return (count + 1).toString().padStart(4, '0'); // Pad with zeros for consistent format
  };
  if (
    user.role === 'member' &&
    user.memberDetails &&
    !user.memberDetails.memberId
  ) {
    const nextNum = await getNextNumber('member');
    user.memberDetails.memberId = `MEM-${nextNum}`;
  }
  if (
    user.role === 'pastor' &&
    user.pastorDetails &&
    !user.pastorDetails.pastorId
  ) {
    const nextNum = await getNextNumber('pastor');
    user.pastorDetails.pastorId = `PST-${nextNum}`;
  }
  if (
    user.role === 'bishop' &&
    user.bishopDetails &&
    !user.bishopDetails.bishopId
  ) {
    const nextNum = await getNextNumber('bishop');
    user.bishopDetails.bishopId = `BSH-${nextNum}`;
  }
  if (
    user.role === 'admin' &&
    user.adminDetails &&
    !user.adminDetails.adminId
  ) {
    const nextNum = await getNextNumber('admin');
    user.adminDetails.adminId = `ADM-${nextNum}`;
  }
  if (
    user.role === 'superadmin' &&
    user.superAdminDetails &&
    !user.superAdminDetails.superAdminId
  ) {
    const nextNum = await getNextNumber('superadmin');
    user.superAdminDetails.superAdminId = `SUP-${nextNum}`;
  }
  if (
    user.role === 'visitor' &&
    user.visitorDetails &&
    !user.visitorDetails.visitorId
  ) {
    const nextNum = await getNextNumber('visitor');
    user.visitorDetails.visitorId = `VIS-${nextNum}`;
  }
  if (user.isStaff && user.staffDetails && !user.staffDetails.staffId) {
    const nextNum = await getNextNumber('staff');
    user.staffDetails.staffId = `STF-${nextNum}`;
  }
  if (
    user.isVolunteer &&
    user.volunteerDetails &&
    !user.volunteerDetails.volunteerId
  ) {
    const nextNum = await getNextNumber('volunteer');
    user.volunteerDetails.volunteerId = `VOL-${nextNum}`;
  }
}

function clearRoleDetails(user: IUserModel) {
  if (user.role !== 'member') user.memberDetails = undefined;
  if (user.role !== 'pastor') user.pastorDetails = undefined;
  if (user.role !== 'bishop') user.bishopDetails = undefined;
  if (user.role !== 'admin') user.adminDetails = undefined;
  if (user.role !== 'superadmin') user.superAdminDetails = undefined;
  if (user.role !== 'visitor') user.visitorDetails = undefined;
  if (!user.isStaff) user.staffDetails = undefined;
  if (!user.isVolunteer) user.volunteerDetails = undefined;
}

// function setIsMemberFlag(user: IUserModel) {
//   if (['member', 'pastor', 'bishop'].includes(user.role)) {
//     user.isMember = true;
//   } else if (user.role === 'visitor') {
//     user.isMember = false;
//   }
// }

// ✅ Enhanced pre-save middleware
UserSchema.pre('save', async function (this: IUserModel, next) {
  try {
    await generateRoleIds(this);
    clearRoleDetails(this);
    // setIsMemberFlag(this);
    next();
  } catch (error) {
    next(error as CallbackError);
  }
});

// ✅ Relaxed validation - only validate if role details exist
UserSchema.pre('validate', function (this: IUserModel, next) {
  // Only validate required fields for role details if they're provided
  // This allows for gradual data collection
  // Validate staff details if isStaff is true and staffDetails exist
  if (
    this.isStaff &&
    this.staffDetails &&
    !this.staffDetails.staffId &&
    this.isNew
  ) {
    // Will be generated in pre-save, so skip validation for new docs
  }
  // Validate volunteer details if isVolunteer is true and volunteerDetails exist
  if (
    this.isVolunteer &&
    this.volunteerDetails &&
    !this.volunteerDetails.volunteerId &&
    this.isNew
  ) {
    // Will be generated in pre-save, so skip validation for new docs
  }
  next();
});

// Static methods - Updated for simple role system
UserSchema.statics.findByRole = function (roleName: string) {
  return this.find({
    role: roleName.toLowerCase(),
    status: 'active',
    isDeleted: false, // ✅ Added soft delete filter
  });
};

UserSchema.statics.findMembers = function () {
  return this.find({
    isMember: true,
    status: 'active',
    isDeleted: false,
  });
};

UserSchema.statics.findVisitors = function () {
  return this.find({
    isMember: false,
    status: 'active',
    isDeleted: false,
  });
};

UserSchema.statics.findStaff = function () {
  return this.find({
    isStaff: true,
    status: 'active',
    isDeleted: false,
  });
};

UserSchema.statics.findVolunteers = function () {
  return this.find({
    isVolunteer: true,
    status: 'active',
    isDeleted: false,
  });
};

export default mongoose.models.User ||
  mongoose.model<IUserModel>('User', UserSchema);

// Usage Examples:
/*
// Check if user has a specific role
const isPastor = user.hasRole('pastor');

Clear hierarchy: Visitor → Member → Pastor → Bishop → Admin → SuperAdmin

user.role === 'pastor'

// Find users with specific role
const pastors = await User.findByRole('pastor');

// Create user with role
const user = new User({
  firstName: 'John',
  lastName: 'Doe',
  role: 'pastor', // Simple string role
  isMember: true,
  isStaff: true,
  // ... other fields
});

// Simple and clean
const user = {
  role: 'pastor',
  isStaff: true,     // Cross-cutting: can be staff + any role
  isVolunteer: false
}

// Easy permission checking in your frontend/API
if (user.role === 'pastor' || user.role === 'bishop') {
  // Can perform pastoral duties
}

if (user.isStaff) {
  // Can access staff-specific features
}

*/
