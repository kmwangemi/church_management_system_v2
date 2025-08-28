import z from 'zod';

export const addBranchSchema = z.object({
  branchName: z.string().min(1, 'Branch name is required'),
  address: z.object({
    street: z.string().min(2, 'Street address must be at least 2 characters'),
    city: z.string().min(2, 'City name must be at least 2 characters'),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    country: z.string().min(2, 'Country name must be at least 2 characters'),
  }),
  capacity: z
    .string()
    .min(1, 'Capacity is required')
    .regex(/^\d+(\.\d+)?$/, 'Capacity must be a valid number')
    .refine((val) => {
      const num = Number.parseFloat(val);
      return num >= 1 && num <= 100_000;
    }, 'Capacity must be between 1 and 100,000'),
  establishedDate: z.string().min(1, 'Established date is required'),
});

export type AddBranchPayload = z.infer<typeof addBranchSchema>;
