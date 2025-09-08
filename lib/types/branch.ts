import type { Address, Pagination } from '@/lib/types';
import type { UserResponse } from '@/lib/types/user';

export interface BranchAddResponse {
  churchId: string;
  branchName: string;
  address: Address;
  capacity: number;
  establishedDate: string;
  isActive: boolean;
  _id: string;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
}

export interface Branch {
  _id: string;
  churchId: string;
  branchName: string;
  email?: string;
  phoneNumber?: string;
  address: Address;
  members?: number;
  capacity: number;
  pastorId?: UserResponse; // Optional, if not always present
  establishedDate: string ; // ISO string; use `Date` if you parse it
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
}

export interface BranchListResponse {
  branches: Branch[];
  pagination: Pagination;
}
