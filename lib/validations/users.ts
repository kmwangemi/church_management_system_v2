import z from 'zod';

export const userSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.email().optional(),
  phoneNumber: z.string().min(8, 'Please enter a valid phone number'),
  isMember: z.boolean(),
  isStaff: z.boolean(),
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
  role: z.string().min(1, 'Please select a role'),
  branchId: z.string().min(1, 'Please select a branch'),
});

export type AddUserPayload = z.infer<typeof userSchema>;
