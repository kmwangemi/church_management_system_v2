import z from 'zod';

const REGEX = /^\d+(\.\d+)?$/;

// export const AddAssetSchema = z.object({
//   name: z
//     .string()
//     .min(2, 'Asset name must be at least 2 characters')
//     .max(100, 'Asset name must be less than 100 characters')
//     .trim(),
//   type: z.string().min(1, 'Please select an asset type').trim(),
//   value: z
//     .string()
//     .min(1, 'Asset value is required')
//     .refine((val) => REGEX.test(val.trim()), {
//       message: 'Asset value must be a valid number',
//     })
//     .refine(
//       (val) => {
//         const num = Number.parseFloat(val.trim());
//         return num >= 1 && num <= 1_000_000;
//       },
//       {
//         message: 'Asset value must be between 1 and 1,000,000',
//       }
//     ),
//   // Fixed: Validate date format and range
//   purchaseDate: z
//     .string()
//     .min(1, 'Purchase date is required')
//     .refine(
//       (val) => {
//         const date = new Date(val);
//         return !Number.isNaN(date.getTime());
//       },
//       {
//         message: 'Please provide a valid date',
//       }
//     )
//     .refine(
//       (val) => {
//         const date = new Date(val);
//         const now = new Date();
//         const twentyYearsAgo = new Date();
//         twentyYearsAgo.setFullYear(now.getFullYear() - 20);
//         const oneYearFromNow = new Date();
//         oneYearFromNow.setFullYear(now.getFullYear() + 1);
//         return date >= twentyYearsAgo && date <= oneYearFromNow;
//       },
//       {
//         message:
//           'Purchase date must be within the last 20 years and not more than 1 year in the future',
//       }
//     ),
//   condition: z
//     .string()
//     .min(1, 'Please select the condition')
//     .refine((val) => ['excellent', 'good', 'fair', 'poor'].includes(val), {
//       message: 'Please select a valid condition',
//     }),
//   branchId: z.string().min(1, 'Please select a branch'),
//   status: z
//     .string()
//     .min(1, 'Please select the status')
//     .refine(
//       (val) =>
//         [
//           'active',
//           'maintenance',
//           'disposed',
//           'sold',
//           'donated',
//           'lost',
//           'stolen',
//         ].includes(val),
//       {
//         message: 'Please select a valid status',
//       }
//     ),
//   // Optional fields with better validation
//   serialNumber: z.string().trim().optional().or(z.literal('')),
//   warranty: z.string().trim().optional().or(z.literal('')),
//   supplier: z.string().trim().optional().or(z.literal('')),
//   maintenanceSchedule: z
//     .string()
//     .min(1, 'Please select maintenance schedule')
//     .refine(
//       (val) =>
//         ['daily', 'weekly', 'monthly', 'quarterly', 'annually'].includes(val),
//       {
//         message: 'Please select a valid maintenance schedule',
//       }
//     ),
//   notes: z.string().trim().optional().or(z.literal('')),
// });

// export type AddAssetPayload = z.infer<typeof AddAssetSchema>;

// Alternative approach using enums for better type safety
export const AssetCondition = z.enum(['excellent', 'good', 'fair', 'poor']);
export const AssetStatus = z.enum([
  'active',
  'maintenance',
  'disposed',
  'sold',
  'donated',
  'lost',
  'stolen',
]);
export const MaintenanceSchedule = z.enum([
  'daily',
  'weekly',
  'monthly',
  'quarterly',
  'annually',
]);
// More robust schema using enums
export const AddAssetSchema = z.object({
  name: z
    .string()
    .min(2, 'Asset name must be at least 2 characters')
    .max(100, 'Asset name must be less than 100 characters')
    .trim(),
  type: z.string().min(1, 'Please select an asset type').trim(),
  value: z
    .string()
    .min(1, 'Asset value is required')
    .refine((val) => REGEX.test(val.trim()), {
      message: 'Asset value must be a valid number',
    })
    .refine(
      (val) => {
        const num = Number.parseFloat(val.trim());
        return num >= 1 && num <= 1_000_000;
      },
      {
        message: 'Asset value must be between 1 and 1,000,000',
      }
    ),
  purchaseDate: z
    .string()
    .min(1, 'Purchase date is required')
    .datetime({ message: 'Invalid date format' })
    .or(z.string().date('Invalid date format')),
  condition: AssetCondition,
  branchId: z.string().min(1, 'Please select a branch'),
  status: AssetStatus,
  serialNumber: z.string().trim().optional().or(z.literal('')),
  warranty: z.string().trim().optional().or(z.literal('')),
  supplier: z.string().trim().optional().or(z.literal('')),
  maintenanceSchedule: MaintenanceSchedule,
  notes: z.string().trim().optional().or(z.literal('')),
});

export type AddAssetPayload = z.infer<typeof AddAssetSchema>;
