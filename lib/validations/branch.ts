import * as z from 'zod';

export const addBranchSchema = z.object({
  branchName: z.string().min(1, 'Branch name is required'),
  country: z.string().min(1, 'Country is required'),
  capacity: z.coerce
    .string()
    .min(1, 'Capacity minimum should be not less than 1')
    .max(100000, 'Capacity maximum should be not more than 100,000'),
  address: z.string().min(1, 'Physical address is required'),
  // pastorId: z.string().min(1, 'Pastor name is required'),
  establishedDate: z.string().min(1, 'Established date is required'),
});

export type AddBranchPayload = z.infer<typeof addBranchSchema>;
