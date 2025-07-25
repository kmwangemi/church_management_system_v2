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

export interface ContextLogger {
  error: (
    message: string,
    error?: Error | unknown,
    additionalMetadata?: Record<string, unknown>
  ) => Promise<void>;
  warn: (
    message: string,
    additionalMetadata?: Record<string, unknown>
  ) => Promise<void>;
  info: (
    message: string,
    additionalMetadata?: Record<string, unknown>
  ) => Promise<void>;
  debug: (
    message: string,
    additionalMetadata?: Record<string, unknown>
  ) => Promise<void>;
}

export interface UploadResponse {
  success: boolean;
  message: string;
  data?: {
    url: string;
    secure_url: string;
    public_id: string;
    resource_type: string;
    format: string;
    bytes: number;
    width?: number;
    height?: number;
    created_at: string;
  };
}

export type FileType = 'image' | 'document' | 'logo';

export interface AuthUser {
  sub: string;
  churchId: string;
  branchId: string;
  role: string;
  email?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  profilePictureUrl?: string;
  fullName?: string;
}

export interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isError: boolean;
  error?: APIError;
  isAuthenticated: boolean;
}

export interface LoginResponse {
  message: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}

export interface ChurchRegistrationResponse {
  message: string;
  churchId: string;
  userId: string;
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
  meetingDay: string[];
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
  capacity: number;
  pastorId?: string; // Optional, if not always present
  members?: number; // Optional, if not always present
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

export interface Member {
  _id: string;
  churchId: string;
  branchId?: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'member' | 'visitor' | 'pastor' | 'bishop' | 'admin' | 'superadmin';
  phoneNumber: string;
  createdBy: string;
  profilePictureUrl: string | null;
  agreeToTerms: boolean;
  isActive: boolean;
  isSuspended: boolean;
  isDeleted: boolean;
  loginAttempts: number;
  gender?: 'male' | 'female' | string;
  maritalStatus?: 'single' | 'married' | string;
  address?: string;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  __v: number;
}

export interface MemberListResponse {
  users: Member[];
  pagination: Pagination;
}
