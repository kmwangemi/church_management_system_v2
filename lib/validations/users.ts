import z from 'zod';

export const userSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.email().optional(),
  phoneNumber: z.string().min(10, 'Please enter a valid phone number'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  isMember: z.boolean(),
  isStaff: z.boolean(),
  isVolunteer: z.boolean(),
  sendWelcomeEmail: z.boolean(),
  address: z.object({
    street: z.string().min(2, 'Street address must be at least 2 characters'),
    city: z.string().min(2, 'City name must be at least 2 characters'),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    country: z.string().min(2, 'Country name must be at least 2 characters'),
  }),
  gender: z.enum(['male', 'female'], {
    error: 'Gender is required',
  }),
  maritalStatus: z.enum(['single', 'married', 'divorced', 'widowed'], {
    error: 'Marital status is required',
  }),
  role: z.string().min(1, 'Please select a role'),
  branchId: z.string().min(1, 'Please select a branch'),
  emergencyDetails: z.object({
    emergencyContactFullName: z.string().optional(),
    emergencyContactEmail: z.email().optional(),
    emergencyContactPhoneNumber: z.string().optional(),
    emergencyContactRelationship: z.string().optional(),
    emergencyContactAddress: z.string().optional(),
    emergencyContactNotes: z.string().optional(),
  }),
});

export type AddUserPayload = z.infer<typeof userSchema>;
