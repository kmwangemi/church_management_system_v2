import type { Address, Pagination } from '@/lib/types';

export interface DepartmentAddResponse {
  churchId: string;
  branchId: string;
  leaderId: string | null;
  departmentName: string;
  meetingDay: string[];
  meetingTime: string;
  budget: number;
  description: string;
  isActive: boolean;
  _id: string;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
}

export interface Department {
  _id: string;
  churchId: string;
  branchId: {
    _id: string;
    branchName: string;
    address: Address;
  };
  leaderId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    profilePictureUrl: string;
  } | null;
  departmentName: string;
  meetingDay: string[];
  meetingTime: string;
  members?: number;
  budget?: number;
  description: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
}

export interface DepartmentListResponse {
  departments: Department[];
  pagination: Pagination;
}
