import z from 'zod';

export const addDepartmentSchema = z.object({
  departmentName: z.string().min(1, 'First name is required'),
  branchId: z.string().min(1, 'Branch name is required'),
  // leaderId: z.string().email('Please enter a valid email address'),
  meetingDay: z
    .array(z.string())
    .min(1, 'At least one meeting day is required'),
  meetingTime: z.string().min(1, 'Role is required'),
  description: z.string().optional(),
});

export type AddDepartmentPayload = z.infer<typeof addDepartmentSchema>;
