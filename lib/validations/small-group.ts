import z from 'zod';

export const addGroupSchema = z.object({
  groupName: z.string().min(1, 'Group name is required'),
  leaderId: z.string().min(1, 'Leader ID is required'),
  meetingDay: z
    .array(z.string())
    .min(1, 'At least one meeting day is required'),
  meetingTime: z
    .array(z.string())
    .min(1, 'At least one meeting time is required'),
  description: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  capacity: z
      .string()
      .min(1, 'Capacity is required')
      .regex(/^\d+(\.\d+)?$/, 'Capacity must be a valid number')
      .refine((val) => {
        const num = Number.parseFloat(val);
        return num >= 1 && num <= 20;
      }, 'Capacity must be between 1 and 20'),
  // capacity: z
  //   .number()
  //   .min(1, 'Capacity must be at least 1')
  //   .max(30, 'Capacity cannot exceed 30'),
  location: z.string().min(1, 'Location is required'),
});

export type AddGroupPayload = z.infer<typeof addGroupSchema>;