export interface FastAPIValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
}

interface APIErrorResponse {
  detail?: FastAPIValidationError[] | string;
  message?: string;
  error?: string;
}

export interface APIError {
  response?: {
    data?: APIErrorResponse;
    status?: number;
    statusText?: string;
  };
  message?: string;
  name?: string;
}

export interface BranchAddResponse {
  churchId: string;
  branchName: string;
  address: string;
  country: string;
  capacity: number;
  establishedDate: string;
  isActive: boolean;
  _id: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface DepartmentAddResponse {
  churchId: string;
  branchId: string;
  departmentName: string;
  meetingDay: Array<string>;
  meetingTime: string;
  description: string;
  isActive: boolean;
  _id: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface MemberAddResponse {
  message: string;
  memberId: string;
  branchId: string;
  userId: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface Branch {
  _id: string;
  churchId: string;
  branchName: string;
  address: string;
  country: string;
  establishedDate: string; // ISO string; use `Date` if you parse it
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface BranchListResponse {
  branches: Branch[];
  pagination: Pagination;
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
  meetingDay: Array<string>;
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

