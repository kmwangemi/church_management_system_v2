export interface IOrganizationMetadata {
  // Church-specific fields
  denomination?: string;
  email?: string;
  phoneNumber?: string;
  website?: string;
  establishedDate?: string; // ISO date string
  churchSize?: string;
  numberOfBranches?: number;
  description?: string;
  isSuspended?: boolean;
  isDeleted?: boolean;
  status? : 'ACTIVE' | 'PENDING' | 'INACTIVE' | 'SUSPENDED';
  // Subscription
  subscriptionPlan?: 'BASIC' | 'MINISTRY' | 'CATHEDRAL' | 'CUSTOM';
  // Address (if storing in metadata instead of separate table)
  address?: {
    street: string;
    city: string;
    state?: string;
    zipCode?: string;
    country: string;
  };
  // Timestamps
  createdAt?: string;
  updatedAt?: string;
}

// Infer base organization from Better Auth
import type { auth } from '@/lib/auth';
export type IOrganization = typeof auth.$Infer.Organization;

// Create a typed version with your metadata
export interface IOrganizationWithMetadata
  extends Omit<IOrganization, 'metadata'> {
  metadata?: IOrganizationMetadata;
}