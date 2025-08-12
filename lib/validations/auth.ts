import z from 'zod';

const REGEX = /^\d+(\.\d+)?$/;

export const loginSchema = z.object({
  email: z.email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginPayload = z.infer<typeof loginSchema>;

// Church data schema
export const churchDataSchema = z.object({
  churchName: z.string().min(2, 'Church name must be at least 2 characters'),
  denomination: z.string().min(1, 'Please select a denomination'),
  description: z.string().optional(),
  churchLogoUrl: z.string().optional().or(z.literal('')),
  establishedDate: z
    .string()
    .min(1, 'Please enter establishment date')
    .refine((val) => !Number.isNaN(Date.parse(val)), {
      message: 'Please enter a valid date',
    }),
  email: z.email('Please enter a valid email address'),
  phoneNumber: z.string().min(8, 'Please enter a valid phone number'),
  website: z
    .url('Please enter a valid website URL')
    .optional()
    .or(z.literal('')),
  address: z.object({
    street: z.string().min(5, 'Please enter a street address'),
    country: z.string().min(2, 'Please enter country'),
    city: z.string().min(2, 'Please enter city'),
    state: z.string().optional(),
    zipCode: z.string().optional(),
  }),
  subscriptionPlan: z.enum(['basic', 'standard', 'premium', 'enterprise']),
  // numberOfBranches: z.coerce.number().min(1, 'Please enter number of branches'),
  numberOfBranches: z
    .string()
    .min(1, 'Number of branches is required')
    .refine((val) => REGEX.test(val.trim()), {
      message: 'Number of branches must be a valid number',
    })
    .refine(
      (val) => {
        const num = Number.parseFloat(val.trim());
        return num >= 1 && num <= 1000;
      },
      {
        message: 'Number of branches must be between 1 and 1,000',
      }
    ),
  churchSize: z.string().min(1, 'Please select number of members'),
});

// Admin data schema
export const adminDataSchema = z
  .object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.email('Please enter a valid email address'),
    phoneNumber: z.string().min(1, 'Phone number is required'),
    gender: z.enum(['male', 'female'], {
      error: 'Gender is required',
    }),
    maritalStatus: z.enum(['single', 'married', 'divorced', 'widowed'], {
      error: 'Marital status is required',
    }),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/\d/, 'Password must contain at least one number')
      .regex(
        /[!@#$%^&*(),.?":{}|<>]/,
        'Password must contain at least one special character'
      ),
    confirmPassword: z.string(),
    role: z.enum(['admin', 'superadmin']),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const churchRegistrationSchema = z.object({
  churchData: churchDataSchema,
  adminData: adminDataSchema,
});

export type ChurchPayload = z.infer<typeof churchDataSchema>;
export type AdminPayload = z.infer<typeof adminDataSchema>;
export type ChurchRegistrationPayload = z.infer<
  typeof churchRegistrationSchema
>;

export const forgotPasswordSchema = z.object({
  email: z.email('Please enter a valid email address'),
});

export type ForgotPasswordPayload = z.infer<typeof forgotPasswordSchema>;

export const verificationSchema = z.object({
  code: z.string().min(4, 'Verification code must be at least 4 characters'),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().optional(),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/\d/, 'Password must contain at least one number')
      .regex(
        /[!@#$%^&*(),.?":{}|<>]/,
        'Password must contain at least one special character'
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export type ResetPasswordPayload = z.infer<typeof resetPasswordSchema>;
