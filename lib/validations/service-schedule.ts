import * as z from 'zod';

const REGEX = /^\d+(\.\d+)?$/;

export const addServiceScheduleSchema = z.object({
  day: z.enum([
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ]),
  time: z.string().min(1, 'Time is required'),
  service: z
    .string()
    .min(3, 'Service name must be at least 3 characters')
    .max(100, 'Service name must be less than 100 characters'),
  attendance: z
    .string()
    .min(1, 'Attendance number is required')
    .refine((val) => REGEX.test(val.trim()), {
      message: 'Attendance number must be a valid number',
    })
    .refine(
      (val) => {
        const num = Number.parseFloat(val.trim());
        return num >= 1 && num <= 10_000;
      },
      {
        message: 'Attendance number must be between 1 and 10,000',
      }
    ),
  type: z.enum([
    'worship',
    'prayer',
    'bible_study',
    'youth',
    'children',
    'special',
    'fellowship',
  ]),
  duration: z
    .string()
    .min(15, 'Duration is required')
    .refine((val) => REGEX.test(val.trim()), {
      message: 'Duration must be a valid number',
    })
    .refine(
      (val) => {
        const num = Number.parseFloat(val.trim());
        return num >= 1 && num <= 480;
      },
      {
        message: 'Duration must be between 1 and 480 minutes',
      }
    ),
  facilitator: z.string().optional(),
  location: z
    .string()
    .max(100, 'Location must be less than 100 characters')
    .optional(),
  recurring: z.boolean(),
  isActive: z.boolean(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  notes: z
    .string()
    .max(500, 'Notes must be less than 500 characters')
    .optional(),
  branchId: z.string().optional(),
});

export type AddServiceSchedulePayload = z.infer<
  typeof addServiceScheduleSchema
>;
