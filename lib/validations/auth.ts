import * as z from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

// Church data schema
export const churchDataSchema = z.object({
  churchName: z.string().min(2, 'Church name must be at least 2 characters'),
  denomination: z.string().min(1, 'Please select a denomination'),
  description: z.string().optional(),
  // establishedDate: z.string().min(1, 'Please enter establishment date'),
  establishedDate: z
    .string()
    .min(1, 'Please enter establishment date')
    .refine(val => !isNaN(Date.parse(val)), {
      message: 'Please enter a valid date',
    }),
  email: z.string().email('Please enter a valid email address'),
  phoneNumber: z.string().min(8, 'Please enter a valid phone number'),
  country: z.string().min(2, 'Please enter country'),
  website: z
    .string()
    .url('Please enter a valid website URL')
    .optional()
    .or(z.literal('')),
  address: z.object({
    address: z.string().min(5, 'Please enter a complete address'),
    city: z.string().min(2, 'Please enter city'),
    state: z.string().optional(),
    zipCode: z.string().optional(),
  }),
  subscriptionPlan: z.enum([
    'basic',
    'standard',
    'premium',
    'enterprise',
    'freetrial',
  ]),
  // expectedMembers: z.coerce.number().min(1, 'Please enter expected number of members'),
  // numberOfBranches: z.coerce.number().min(1, 'Please enter number of branches'),
  churchSize: z.string().min(1, 'Please select number of members'),
  numberOfBranches: z.string().min(1, 'Please enter number of branches'),
});

// Admin data schema
export const adminDataSchema = z
  .object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Please enter a valid email address'),
    phoneNumber: z.string().min(1, 'Phone number is required'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/\d/, 'Password must contain at least one number')
      .regex(
        /[!@#$%^&*(),.?":{}|<>]/,
        'Password must contain at least one special character',
      ),
    confirmPassword: z.string(),
    role: z.enum(['admin', 'superadmin']),
    agreeToTerms: z.boolean().refine(val => val === true, {
      message: 'You must agree to the terms and conditions',
    }),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const churchAdminRegistrationSchema = z.object({
  churchData: churchDataSchema,
  adminData: adminDataSchema,
});

export type ChurchAdminRegistrationFormData = z.infer<
  typeof churchAdminRegistrationSchema
>;

export const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

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
        'Password must contain at least one special character',
      ),
    confirmPassword: z.string(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
