import type { Address, Pagination } from '@/lib/types';

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
  address: Address;
  capacity: number;
  pastorId?: string; // Optional, if not always present
  users?: number; // Optional, if not always present
  establishedDate: Date; // ISO string; use `Date` if you parse it
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
}

export interface BranchListResponse {
  branches: Branch[];
  pagination: Pagination;
}
