import z from 'zod';

export const addBranchSchema = z.object({
  branchName: z.string().min(1, 'Branch name is required'),
  country: z.string().min(1, 'Country is required'),
  capacity: z
    .string()
    .min(1, 'Capacity is required')
    .regex(/^\d+(\.\d+)?$/, 'Capacity must be a valid number')
    .refine((val) => {
      const num = Number.parseFloat(val);
      return num >= 1 && num <= 100_000;
    }, 'Capacity must be between 1 and 100,000'),
  address: z.string().min(1, 'Physical address is required'),
  establishedDate: z.string().min(1, 'Established date is required'),
});

export type AddBranchPayload = z.infer<typeof addBranchSchema>;
