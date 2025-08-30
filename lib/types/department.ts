import type { Pagination } from '@/lib/types';

export interface DepartmentAddResponse {
  churchId: string;
  branchId: string;
  departmentName: string;
  meetingDay: string[];
  meetingTime: string;
  description: string;
  isActive: boolean;
  _id: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface Department {
  _id: string;
  churchId: string;
  branchId: {
    _id: string;
    branchName: string;
    address: string;
    country: string;
  };
  departmentName: string;
  meetingDay: string[];
  meetingTime: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface DepartmentListResponse {
  departments: Department[];
  pagination: Pagination;
}
