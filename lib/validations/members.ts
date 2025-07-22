import z from 'zod';

export const memberSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.email().optional(),
  phoneNumber: z.string().min(10, 'Please enter a valid phone number'),
  address: z.string().min(5, 'Please enter a valid address'),
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

export type AddMemberPayload = z.infer<typeof memberSchema>;
