import * as z from 'zod';

const REGEX = /^\d+(\.\d+)?$/;

export const addDepartmentSchema = z.object({
  departmentName: z.string().min(1, 'First name is required'),
  leaderId: z.string().optional().or(z.literal('')),
  branchId: z.string().optional().or(z.literal('')),
  budget: z
    .string()
    .min(1, 'Budget number is required')
    .refine((val) => REGEX.test(val.trim()), {
      message: 'Budget number must be a valid number',
    })
    .refine(
      (val) => {
        const num = Number.parseFloat(val.trim());
        return num >= 0 && num <= 1_000_000;
      },
      {
        message: 'Budget number must be between 0 and 1,000,000',
      }
    ),
  meetingDay: z
    .array(z.string())
    .min(1, 'At least one meeting day is required'),
  meetingTime: z
    .array(z.string())
    .min(1, 'At least one meeting time is required'),
  description: z.string().min(5, 'Description is required'),
});

export type AddDepartmentPayload = z.infer<typeof addDepartmentSchema>;
