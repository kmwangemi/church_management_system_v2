import { APIError, FastAPIValidationError } from '@/lib/types';
import { clsx, type ClassValue } from 'clsx';
import { formatDate, formatDistanceToNowStrict } from 'date-fns';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface FormatToNewDate {
  (date: Date | number): string;
}

export const formatToNewDate: FormatToNewDate = date => {
  return formatDate(date, 'dd/MM/yyyy');
};

export function formatRelativeDate(createdAt: Date): string {
  const currentDate: Date = new Date();
  const oneYearInMs: number = 365 * 24 * 60 * 60 * 1000; // One year in milliseconds
  if (currentDate.getTime() - createdAt.getTime() <= oneYearInMs) {
    // Return relative time if difference is less than or equal to 1 year
    return formatDistanceToNowStrict(createdAt, { addSuffix: true });
  }
  // Return full date with year if difference is more than 1 year
  return formatDate(createdAt, 'MMM d, yyyy');
}

export const getError = (err: APIError | any): string => {
  try {
    const responseData = err?.response?.data;
    // Handle FastAPI validation errors (array of validation errors)
    if (Array.isArray(responseData?.detail)) {
      return responseData.detail
        .map((e: FastAPIValidationError) => {
          // Better field name extraction with fallbacks
          const field = e.loc?.[1] || e.loc?.[0] || 'field';
          const message = e.msg || 'Invalid value';
          return `${field}: ${message}`;
        })
        .join(', ');
    }
    // Handle FastAPI string detail errors
    if (typeof responseData?.detail === 'string') {
      return responseData.detail;
    }
    // Handle custom API errors with message field
    if (responseData?.message) {
      return responseData.message;
    }
    // Handle custom API errors with error field
    if (responseData?.error) {
      return responseData.error;
    }
    // Handle HTTP status errors with meaningful messages
    if (err?.response?.status) {
      const status = err.response.status;
      const statusText = err.response.statusText || 'Error';
      switch (status) {
        case 400:
          return 'Bad request. Please check your input.';
        case 401:
          return 'Unauthorized. Please log in again.';
        case 403:
          return "Access denied. You don't have permission.";
        case 404:
          return 'Resource not found.';
        case 422:
          return 'Validation error. Please check your input.';
        case 429:
          return 'Too many requests. Please try again later.';
        case 500:
          return 'Internal server error. Please try again.';
        case 502:
          return 'Bad gateway. Service temporarily unavailable.';
        case 503:
          return 'Service unavailable. Please try again later.';
        default:
          return `${status}: ${statusText}`;
      }
    }
    // Fallback to standard error message
    if (err?.message) {
      return err.message;
    }
    // Final fallback
    return 'An unexpected error occurred. Please try again.';
  } catch (parseError) {
    // If error parsing fails, return a safe fallback
    console.error('Error parsing error object:', parseError);
    return 'An unexpected error occurred. Please try again.';
  }
};

export const capitalizeFirstLetter = (str: string) => {
  if (typeof str !== 'string' || str.length === 0) {
    return '';
  }
  return str.charAt(0).toUpperCase() + str.substring(1);
};

export const getFirstLetter = (str: string) => {
  if (typeof str !== 'string' || str.length === 0) return '';
  return str.charAt(0).toLocaleUpperCase();
};

export function capitalizeFirstLetterOfEachWord(str: string) {
  if (typeof str !== 'string' || str.length === 0) return '';
  const words = str.split(' ');
  for (let i = 0; i < words.length; i++) {
    words[i] =
      words[i].charAt(0).toUpperCase() + words[i].slice(1).toLowerCase();
  }
  return words.join(' ');
}

export const addCommasToNumber = (input: string | number): string => {
  // Convert the input to a number if it's a string
  const number: number =
    typeof input === 'string' ? parseFloat(input) : Number(input);
  // Check if the conversion was successful
  if (Number.isNaN(number)) {
    return '0';
  }
  // Convert the number to a string
  let numberString: string = number.toString();
  // Handle negative numbers
  let isNegative = false;
  if (number < 0) {
    isNegative = true;
    numberString = numberString.slice(1); // Remove the negative sign for processing
  }
  // Use a regular expression to add commas to the string
  numberString = numberString.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  // Add back the negative sign if needed
  if (isNegative) {
    numberString = `-${numberString}`;
  }
  return numberString;
};
export const generatePagination = (currentPage: number, totalPages: number) => {
  // If the total number of pages is 7 or less,
  // display all pages without any ellipsis.
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  // If the current page is among the first 3 pages,
  // show the first 3, an ellipsis, and the last 2 pages.
  if (currentPage <= 3) {
    return [1, 2, 3, '...', totalPages - 1, totalPages];
  }
  // If the current page is among the last 3 pages,
  // show the first 2, an ellipsis, and the last 3 pages.
  if (currentPage >= totalPages - 2) {
    return [1, 2, '...', totalPages - 2, totalPages - 1, totalPages];
  }
  // If the current page is somewhere in the middle,
  // show the first page, an ellipsis, the current page and its neighbors,
  // another ellipsis, and the last page.
  return [
    1,
    '...',
    currentPage - 1,
    currentPage,
    currentPage + 1,
    '...',
    totalPages,
  ];
};
export const stringToBool = (str: string): boolean => {
  return str.toLowerCase() === 'true';
};

export const formatNotificationCount = (count: number) => {
  // You can customize the threshold as needed
  const threshold = 99;
  if (count > threshold) {
    return `${threshold}+`;
  }
  return count.toString();
};

export const CHURCH_DENOMINATION_OPTIONS = [
  { value: 'baptist', label: 'Baptist' },
  { value: 'methodist', label: 'Methodist' },
  { value: 'presbyterian', label: 'Presbyterian' },
  { value: 'pentecostal', label: 'Pentecostal' },
  { value: 'catholic', label: 'Catholic' },
  { value: 'lutheran', label: 'Lutheran' },
  { value: 'episcopal', label: 'Episcopal' },
  { value: 'assembly of God', label: 'Assembly of God' },
  { value: 'church of Christ', label: 'Church of Christ' },
  { value: 'non-denominational', label: 'Non-denominational' },
  { value: 'other', label: 'Other' },
];

export const NUMBER_OF_CHURCH_BRANCHES_OPTIONS = [
  { value: '1', label: '1 branch (Main church only)' },
  { value: '2', label: '2 branches' },
  { value: '3', label: '3 branches' },
  { value: '4', label: '4 branches' },
  { value: '5', label: '5 branches' },
  { value: '6', label: 'More than 5 branches' },
];

export const NUMBER_OF_CHURCH_MEMBERS_OPTIONS = [
  { value: '1-50', label: '1-50 Members' },
  { value: '51-100', label: '51-100 Members' },
  { value: '101-250', label: '101-250 Members' },
  { value: '251-500', label: '251-500 Members' },
  { value: '501-1000', label: '501-1000 Members' },
  { value: '1000+', label: 'More than 1000 Members' },
];

export const SUBSCRIPTION_PLANS = [
  {
    value: 'basic',
    label: 'Basic - $29/month',
    description: 'Up to 100 members, basic features',
  },
  {
    value: 'standard',
    label: 'Standard - $79/month',
    description: 'Up to 500 members, advanced features',
  },
  {
    value: 'premium',
    label: 'Premium - $149/month',
    description: 'Unlimited members, all features',
  },
  {
    value: 'enterprise',
    label: 'Enterprise - Custom',
    description: 'Custom solution for large churches',
  },
];

export const getUserId = (userId: any): string => {
  if (typeof userId === 'string') return userId;
  if (userId && typeof userId === 'object' && userId.toString) {
    return userId.toString();
  }
  if (Buffer.isBuffer(userId)) {
    return userId.toString('hex');
  }
  return 'unknown';
};

// File type configurations
export const FILE_CONFIGS = {
  image: {
    allowedTypes: /jpeg|jpg|png|gif|webp/i,
    allowedMimeTypes: [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
    ],
    maxSize: 5 * 1024 * 1024, // 5MB
    folder: 'uploads/images',
    resourceType: 'image' as const,
  },
  document: {
    allowedTypes: /pdf|doc|docx/i,
    allowedMimeTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
    maxSize: 10 * 1024 * 1024, // 10MB
    folder: 'uploads/documents',
    resourceType: 'raw' as const,
  },
  logo: {
    allowedTypes: /jpeg|jpg|png|svg/i,
    allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml'],
    maxSize: 2 * 1024 * 1024, // 2MB
    folder: 'uploads/logos',
    resourceType: 'image' as const,
  },
};
