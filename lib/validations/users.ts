import { passwordSchema } from '@/lib/validations/auth';
import * as z from 'zod';

// 🔹 Helper function to handle empty strings as optional
const optionalString = z.string().optional().or(z.literal(''));
export const optionalEmail = z
  .email()
  .optional()
  .or(z.literal(''))
  .refine(
    (val) => {
      if (!val || val === '') return true;
      return z.email().safeParse(val).success;
    },
    { message: 'Please enter a valid email address' }
  );

// 🔹 Common reusable schemas
export const addressSchema = z.object({
  street: z.string().min(1, 'Street is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().min(1, 'Country is required'),
});

// 🔹 Fixed emergency details schema
const emergencyDetailsSchema = z.object({
  emergencyContactFullName: optionalString,
  emergencyContactEmail: optionalEmail, // ✅ Handles empty strings properly
  emergencyContactPhoneNumber: optionalString,
  emergencyContactRelationship: optionalString,
  emergencyContactAddress: optionalString,
  emergencyContactNotes: optionalString,
});

const memberDetailsSchema = z.object({
  memberId: optionalString,
  membershipDate: optionalString,
  membershipStatus: z.enum(['active', 'inactive', 'transferred', 'deceased']),
  departmentIds: z.array(z.string()).optional(),
  groupIds: z.array(z.string()).optional(),
  occupation: optionalString,
  baptismDate: optionalString,
  joinedDate: optionalString,
});

// 🔹 Other role-based details with fixed string handling
const pastorDetailsSchema = z.object({
  pastorId: optionalString,
  ordinationDate: optionalString,
  qualifications: z.array(z.string()).optional(),
  specializations: z.array(z.string()).optional(),
  assignments: z.array(z.any()).optional(),
  sermonCount: z.number().optional(),
  counselingSessions: z.number().optional(),
  biography: optionalString,
});

const bishopDetailsSchema = z.object({
  bishopId: optionalString,
  appointmentDate: optionalString,
  jurisdictionArea: optionalString,
  oversight: z.record(z.string(), z.any()).optional(),
  qualifications: z.array(z.string()).optional(),
  achievements: z.array(z.string()).optional(),
  biography: optionalString,
});

const staffDetailsSchema = z.object({
  staffId: optionalString,
  jobTitle: optionalString,
  department: optionalString,
  startDate: optionalString,
  salary: z.number().optional(),
  employmentType: z
    .enum(['full-time', 'part-time', 'contract', 'casual'])
    .optional(),
  isActive: z.boolean(),
});

const volunteerDetailsSchema = z.object({
  volunteerId: optionalString,
  volunteerStatus: z
    .enum(['active', 'inactive', 'on_hold', 'suspended'])
    .optional(),
  availabilitySchedule: z.record(z.string(), z.any()).optional(),
  departments: z.array(z.string()).optional(),
  volunteerRoles: z.array(z.any()).optional(),
  backgroundCheck: z.record(z.string(), z.any()).optional(),
  hoursContributed: z.number().optional(),
});

const adminDetailsSchema = z.object({
  adminId: optionalString,
  accessLevel: z.enum(['branch', 'regional', 'national', 'global']).optional(),
  assignedBranches: z.array(z.string()).optional(),
});

const superAdminDetailsSchema = z.object({
  superAdminId: optionalString,
  accessLevel: z.enum(['global', 'system']).optional(),
  systemSettings: z.record(z.string(), z.any()).optional(),
  companyInfo: z.record(z.string(), z.any()).optional(),
});

const visitorDetailsSchema = z.object({
  visitorId: optionalString,
  visitDate: optionalString,
  invitedBy: optionalString,
  howDidYouHear: z
    .enum(['friend', 'family', 'online', 'flyer', 'other'])
    .optional(),
  followUpStatus: z
    .enum(['pending', 'contacted', 'interested', 'not_interested'])
    .optional(),
  followUpDate: optionalString,
  followUpNotes: optionalString,
  interestedInMembership: z.boolean(),
  servicesAttended: z.array(z.string()).optional(),
  occupation: optionalString,
});

// 🔹 Create Schema (minimal required)
export const userSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: optionalEmail,
  phoneNumber: z.string().min(8, 'Please enter a valid phone number'),
  isMember: z.boolean(),
  isStaff: z.boolean(),
  address: addressSchema,
  gender: z.enum(['MALE', 'FEMALE'], {
    error: 'Gender is required',
  }),
  role: z.enum(['MEMBER', 'PASTOR', 'BISHOP', 'ADMIN', 'VISITOR'], {
    error: 'Role is required',
  }),
  branchId: z.string().min(1, 'Please select a branch'),
  sendWelcomeEmail: z.boolean().optional(),
});

export type AddUserPayload = z.infer<typeof userSchema>;

// Admin data schema
export const adminDataSchema = z
  .object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.email('Please enter a valid email address'),
    phoneNumber: z.string().min(1, 'Phone number is required'),
    gender: z.enum(['MALE', 'FEMALE'], {
      error: 'Gender is required',
    }),
    isMember: z.boolean(),
    password: passwordSchema,
    confirmPassword: z.string(),
    // organizationId: z.string().min(1, 'Organization ID is required'),
    role: z.enum(['MEMBER', 'PASTOR', 'BISHOP', 'ADMIN', 'VISITOR']),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type AdminPayload = z.infer<typeof adminDataSchema>;

// 🔹 Update Schema (full detailed) - Fixed version
export const userUpdateSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: optionalEmail,
  phoneNumber: z.string().min(10, 'Please enter a valid phone number'),
  address: addressSchema,
  dateOfBirth: optionalString,
  gender: z.enum(['male', 'female']),
  profilePictureUrl: optionalString,
  occupation: optionalString,
  branchId: optionalString,
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
  lastLogin: optionalString,
  maritalStatus: z.enum(['single', 'married', 'divorced', 'widowed']),
  emergencyDetails: emergencyDetailsSchema, // ✅ Using the fixed schema
  notes: optionalString,
  skills: z.array(z.string()).optional(),
  createdAt: optionalString,
  // role-based details
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
