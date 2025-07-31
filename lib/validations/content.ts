import { z } from 'zod';

// Content Type Enum
export const ContentTypeEnum = z.enum([
  'sermon',
  'bible_study',
  'prayer',
  'worship',
  'announcement',
  'event',
  'devotional',
  'testimony',
  'music',
  'video',
  'document',
  'image',
  'audio',
]);

// Content Category Enum
export const ContentCategoryEnum = z.enum([
  'spiritual',
  'educational',
  'administrative',
  'worship',
  'youth',
  'children',
  'missions',
  'fellowship',
  'outreach',
  'discipleship',
]);

// Content Status Enum
export const ContentStatusEnum = z.enum([
  'draft',
  'published',
  'archived',
  'private',
]);

// Base Content Schema
const BaseContentSchema = z.object({
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(200, 'Title must be less than 200 characters')
    .trim(),
  description: z
    .string()
    .min(20, 'Description must be at least 20 characters')
    .max(1000, 'Description must be less than 1000 characters')
    .trim(),
  type: ContentTypeEnum,
  category: ContentCategoryEnum,
  tags: z
    .union([
      z.string().min(1, 'Please add at least one tag'),
      z
        .array(z.string().min(1, 'Tag cannot be empty'))
        .min(1, 'Please add at least one tag'),
    ])
    .transform((val) => {
      if (typeof val === 'string') {
        return val
          .split(',')
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0);
      }
      return val.filter((tag) => tag.trim().length > 0);
    }),
  status: ContentStatusEnum.default('draft'),
  isPublic: z.boolean().default(false),
});

// File-related schema
const FileSchema = z.object({
  fileUrl: z.string().url('Invalid file URL').optional(),
  fileName: z.string().max(255, 'File name too long').optional(),
  fileSize: z
    .number()
    .min(0, 'File size must be greater than or equal to 0')
    .max(104_857_600, 'File size must be less than or equal to 100MB')
    .optional(),
  fileMimeType: z.string().optional(),
});

// Add Content Schema
export const AddContentSchema = BaseContentSchema.extend({
  branchId: z.string().min(1, 'Branch ID is required'),
  ...FileSchema.shape,
});

// Update Content Schema (all fields optional except id)
export const UpdateContentSchema = BaseContentSchema.partial().extend({
  id: z.string().min(1, 'Content ID is required'),
  publishedAt: z.date().optional(),
  ...FileSchema.shape,
});

// Query Parameters Schema
export const ContentQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(10),
  search: z.string().optional(),
  type: ContentTypeEnum.optional(),
  category: ContentCategoryEnum.optional(),
  status: ContentStatusEnum.optional(),
  tags: z.string().optional(),
  sortBy: z
    .enum([
      'createdAt',
      'updatedAt',
      'publishedAt',
      'title',
      'viewCount',
      'downloadCount',
    ])
    .default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Bulk Operations Schema
export const BulkUpdateStatusSchema = z.object({
  ids: z
    .array(z.string().min(1, 'Invalid content ID'))
    .min(1, 'At least one content ID is required'),
  status: ContentStatusEnum,
});

export const BulkDeleteSchema = z.object({
  ids: z
    .array(z.string().min(1, 'Invalid content ID'))
    .min(1, 'At least one content ID is required'),
});

// Content Stats Query Schema
export const ContentStatsQuerySchema = z.object({
  timeframe: z
    .enum(['week', 'month', 'quarter', 'year', 'all'])
    .default('month'),
  includeArchived: z.coerce.boolean().default(false),
});

// Popular Content Query Schema
export const PopularContentQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(50).default(10),
  timeframe: z.enum(['week', 'month', 'year', 'all']).default('month'),
  metric: z.enum(['views', 'downloads', 'engagement']).default('views'),
});

// Content Search Schema with advanced filters
export const ContentSearchSchema = z
  .object({
    query: z.string().min(1, 'Search query is required'),
    type: ContentTypeEnum.optional(),
    category: ContentCategoryEnum.optional(),
    status: ContentStatusEnum.optional(),
    tags: z.array(z.string()).optional(),
    dateFrom: z.date().optional(),
    dateTo: z.date().optional(),
    author: z.string().optional(),
    hasFile: z.boolean().optional(),
    minViews: z.number().min(0).optional(),
    maxViews: z.number().min(0).optional(),
  })
  .refine(
    (data) => {
      if (data.dateFrom && data.dateTo) {
        return data.dateFrom <= data.dateTo;
      }
      return true;
    },
    {
      message: 'Date from must be before date to',
      path: ['dateTo'],
    }
  )
  .refine(
    (data) => {
      if (data.minViews !== undefined && data.maxViews !== undefined) {
        return data.minViews <= data.maxViews;
      }
      return true;
    },
    {
      message: 'Minimum views must be less than or equal to maximum views',
      path: ['maxViews'],
    }
  );

// File Upload Schema
export const FileUploadSchema = z
  .object({
    file: z.instanceof(File, { message: 'Please select a file' }),
    contentId: z.string().min(1, 'Content ID is required'),
  })
  .refine(
    (data) => {
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'audio/mpeg',
        'audio/wav',
        'audio/mp3',
        'video/mp4',
        'video/avi',
        'video/quicktime',
        'image/jpeg',
        'image/png',
        'image/gif',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      ];
      return allowedTypes.includes(data.file.type);
    },
    {
      message:
        'Invalid file type. Please upload PDF, DOC, MP3, MP4, JPG, PNG, or PPT files.',
      path: ['file'],
    }
  )
  .refine(
    (data) => {
      const maxSize = 100 * 1024 * 1024; // 100MB
      return data.file.size <= maxSize;
    },
    {
      message: 'File size must be less than 100MB',
      path: ['file'],
    }
  );

// Content Analytics Schema
export const ContentAnalyticsSchema = z.object({
  contentId: z.string().min(1, 'Content ID is required'),
  timeframe: z
    .enum(['day', 'week', 'month', 'quarter', 'year'])
    .default('month'),
  metrics: z
    .array(z.enum(['views', 'downloads', 'shares', 'engagement']))
    .default(['views', 'downloads']),
});

// Export types
export type AddContentPayload = z.infer<typeof AddContentSchema>;
export type UpdateContentPayload = z.infer<typeof UpdateContentSchema>;
export type ContentQueryParams = z.infer<typeof ContentQuerySchema>;
export type BulkUpdateStatusPayload = z.infer<typeof BulkUpdateStatusSchema>;
export type BulkDeletePayload = z.infer<typeof BulkDeleteSchema>;
export type ContentStatsQuery = z.infer<typeof ContentStatsQuerySchema>;
export type PopularContentQuery = z.infer<typeof PopularContentQuerySchema>;
export type ContentSearchParams = z.infer<typeof ContentSearchSchema>;
export type FileUploadPayload = z.infer<typeof FileUploadSchema>;
export type ContentAnalyticsQuery = z.infer<typeof ContentAnalyticsSchema>;

// Content validation utilities
export const validateContentData = (data: unknown) => {
  return AddContentSchema.safeParse(data);
};

export const validateUpdateContentData = (data: unknown) => {
  return UpdateContentSchema.safeParse(data);
};

export const validateContentQuery = (query: unknown) => {
  return ContentQuerySchema.safeParse(query);
};

export const validateBulkOperation = (
  data: unknown,
  operation: 'update' | 'delete'
) => {
  if (operation === 'update') {
    return BulkUpdateStatusSchema.safeParse(data);
  }
  return BulkDeleteSchema.safeParse(data);
};

// Content Constants
export const CONTENT_TYPES = [
  { value: 'sermon', label: 'Sermon' },
  { value: 'bible_study', label: 'Bible Study' },
  { value: 'prayer', label: 'Prayer' },
  { value: 'worship', label: 'Worship' },
  { value: 'announcement', label: 'Announcement' },
  { value: 'event', label: 'Event' },
  { value: 'devotional', label: 'Devotional' },
  { value: 'testimony', label: 'Testimony' },
  { value: 'music', label: 'Music' },
  { value: 'video', label: 'Video' },
  { value: 'document', label: 'Document' },
  { value: 'image', label: 'Image' },
  { value: 'audio', label: 'Audio' },
] as const;

export const CONTENT_CATEGORIES = [
  { value: 'spiritual', label: 'Spiritual' },
  { value: 'educational', label: 'Educational' },
  { value: 'administrative', label: 'Administrative' },
  { value: 'worship', label: 'Worship' },
  { value: 'youth', label: 'Youth' },
  { value: 'children', label: 'Children' },
  { value: 'missions', label: 'Missions' },
  { value: 'fellowship', label: 'Fellowship' },
  { value: 'outreach', label: 'Outreach' },
  { value: 'discipleship', label: 'Discipleship' },
] as const;

export const CONTENT_STATUSES = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
  { value: 'private', label: 'Private' },
] as const;

export const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Created Date' },
  { value: 'updatedAt', label: 'Updated Date' },
  { value: 'publishedAt', label: 'Published Date' },
  { value: 'title', label: 'Title' },
  { value: 'viewCount', label: 'View Count' },
  { value: 'downloadCount', label: 'Download Count' },
] as const;
