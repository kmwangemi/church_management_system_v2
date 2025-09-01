import * as z from 'zod';

// 🔹 Common reusable schemas
const addressSchema = z.object({
  street: z
    .string()
    .min(2, 'Street address must be at least 2 characters')
    .optional(),
  city: z.string().min(2, 'City name must be at least 2 characters').optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z
    .string()
    .min(2, 'Country name must be at least 2 characters')
    .optional(),
});

const emergencyDetailsSchema = z.object({
  emergencyContactFullName: z.string().optional(),
  emergencyContactEmail: z.email().optional(),
  emergencyContactPhoneNumber: z.string().optional(),
  emergencyContactRelationship: z.string().optional(),
  emergencyContactAddress: z.string().optional(),
  emergencyContactNotes: z.string().optional(),
});

const memberDetailsSchema = z.object({
  memberId: z.string().optional(),
  membershipDate: z.date().optional(),
  membershipStatus: z.enum(['active', 'inactive', 'transferred', 'deceased']),
  departmentIds: z
    .array(
      z.object({
        _id: z.string().optional(),
        churchId: z.string().optional(),
        branchId: z.any().optional(),
        departmentName: z.string().optional(),
        meetingDay: z.array(z.string()).optional(),
        meetingTime: z.string().optional(),
        description: z.string().optional(),
        isActive: z.boolean().optional(),
        createdAt: z.string().optional(),
        updatedAt: z.string().optional(),
      })
    )
    .optional(),
  groupIds: z
    .array(
      z.object({
        churchId: z.string().optional(),
        groupName: z.string().optional(),
        leaderId: z.string().optional(),
        meetingDay: z.array(z.string()).optional(),
        meetingTime: z.array(z.string()).optional(),
        description: z.string().optional(),
        category: z.string().optional(),
        location: z.string().optional(),
        capacity: z.number().optional(),
        isActive: z.boolean().optional(),
        createdAt: z.date().optional(),
        updatedAt: z.date().optional(),
      })
    )
    .optional(),
  occupation: z.string().optional(),
  baptismDate: z.date().optional(),
  joinedDate: z.date().optional(),
});

// 🔹 Other role-based details
const pastorDetailsSchema = z.object({
  pastorId: z.string().optional(),
  ordinationDate: z.date().optional(),
  qualifications: z.array(z.string()).optional(),
  specializations: z.array(z.string()).optional(),
  assignments: z.array(z.any()).optional(),
  sermonCount: z.number().optional(),
  counselingSessions: z.number().optional(),
  biography: z.string().optional(),
});

const bishopDetailsSchema = z.object({
  bishopId: z.string().optional(),
  appointmentDate: z.date().optional(),
  jurisdictionArea: z.string().optional(),
  oversight: z.record(z.string(), z.any()).optional(),
  qualifications: z.array(z.string()).optional(),
  achievements: z.array(z.string()).optional(),
  biography: z.string().optional(),
});

const staffDetailsSchema = z.object({
  staffId: z.string().optional(),
  jobTitle: z.string().optional(),
  department: z.string().optional(),
  startDate: z.date().optional(),
  salary: z.number().optional(),
  employmentType: z
    .enum(['full-time', 'part-time', 'contract', 'casual'])
    .optional(),
  isActive: z.boolean().optional(),
});

const volunteerDetailsSchema = z.object({
  volunteerId: z.string().optional(),
  volunteerStatus: z
    .enum(['active', 'inactive', 'on_hold', 'suspended'])
    .optional(),
  availabilitySchedule: z.record(z.string(), z.any()).optional(),
  departments: z.array(z.any()).optional(),
  volunteerRoles: z.array(z.any()).optional(),
  backgroundCheck: z.record(z.string(), z.any()).optional(),
  hoursContributed: z.number().optional(),
});

const adminDetailsSchema = z.object({
  adminId: z.string().optional(),
  accessLevel: z.enum(['branch', 'regional', 'national', 'global']).optional(),
  assignedBranches: z.array(z.string()).optional(),
});

const superAdminDetailsSchema = z.object({
  superAdminId: z.string().optional(),
  accessLevel: z.enum(['global', 'system']).optional(),
  systemSettings: z.record(z.string(), z.any()).optional(),
  companyInfo: z.record(z.string(), z.any()).optional(),
});

const visitorDetailsSchema = z.object({
  visitorId: z.string().optional(),
  visitDate: z.date().optional(),
  invitedBy: z.string().optional(),
  howDidYouHear: z
    .enum(['friend', 'family', 'online', 'flyer', 'other'])
    .optional(),
  followUpStatus: z
    .enum(['pending', 'contacted', 'interested', 'not_interested'])
    .optional(),
  followUpDate: z.date().optional(),
  followUpNotes: z.string().optional(),
  interestedInMembership: z.boolean().optional(),
  servicesAttended: z.array(z.string()).optional(),
  occupation: z.string().optional(),
});

// 🔹 Create Schema (minimal required)
export const userSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.email().optional(),
  phoneNumber: z.string().min(8, 'Please enter a valid phone number'),
  isMember: z.boolean(),
  isStaff: z.boolean(),
  address: addressSchema,
  gender: z.enum(['male', 'female'], {
    error: 'Gender is required',
  }),
  role: z.string().min(1, 'Please select a role'),
  branchId: z.string().min(1, 'Please select a branch'),
});

export type AddUserPayload = z.infer<typeof userSchema>;

// 🔹 Update Schema (full detailed)
export const userUpdateSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.email().optional(),
  phoneNumber: z.string().min(10, 'Please enter a valid phone number'),
  address: addressSchema,
  dateOfBirth: z.date().optional(),
  gender: z.enum(['male', 'female']),
  profilePictureUrl: z.string().optional(),
  occupation: z.string().optional(),
  churchId: z.string().optional(),
  branchId: z
    .union([z.string(), z.object({ _id: z.string().optional() })])
    .optional(),
  isMember: z.boolean(),
  role: z.enum([
    'member',
    'pastor',
    'bishop',
    'admin',
    'superadmin',
    'visitor',
    'staff',
  ]),
  isStaff: z.boolean(),
  isVolunteer: z.boolean(),
  status: z.enum(['active', 'inactive', 'suspended', 'pending']),
  isEmailVerified: z.boolean().default(false),
  lastLogin: z.date().optional(),
  maritalStatus: z.enum(['single', 'married', 'divorced', 'widowed']),
  emergencyDetails: emergencyDetailsSchema,
  notes: z.string().optional(),
  skills: z.array(z.string()).optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  // Attach role-based details
  memberDetails: memberDetailsSchema.optional(),
  pastorDetails: pastorDetailsSchema.optional(),
  bishopDetails: bishopDetailsSchema.optional(),
  staffDetails: staffDetailsSchema.optional(),
  volunteerDetails: volunteerDetailsSchema.optional(),
  adminDetails: adminDetailsSchema.optional(),
  superAdminDetails: superAdminDetailsSchema.optional(),
  visitorDetails: visitorDetailsSchema.optional(),
});

export type UpdateUserPayload = z.infer<typeof userUpdateSchema>;
