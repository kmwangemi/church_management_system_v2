import z from 'zod';

export const addDepartmentSchema = z.object({
  departmentName: z.string().min(1, 'First name is required'),
  leaderId: z.string().optional().or(z.literal('')),
  meetingDay: z
    .array(z.string())
    .min(1, 'At least one meeting day is required'),
  meetingTime: z
    .array(z.string())
    .min(1, 'At least one meeting time is required'),
  description: z.string().optional(),
});

export type AddDepartmentPayload = z.infer<typeof addDepartmentSchema>;
