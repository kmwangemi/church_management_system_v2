import z from 'zod';

export const AddAnnouncementSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  category: z.string().min(1, 'Please select a category'),
  priority: z.string().min(1, 'Please select priority level'),
  publishDate: z.string().min(1, 'Publish date is required'),
  expiryDate: z.string().optional(),
  status: z.string().min(1, 'Please select status'),
});

export type AddAnnouncementPayload = z.infer<typeof AddAnnouncementSchema>;
