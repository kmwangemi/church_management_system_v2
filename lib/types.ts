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

export interface MessageAddResponse {
  success: boolean;
  data: {
    _id: string;
    type: 'sms' | 'email';
    title: string;
    content: string;
    recipients: string[];
    scheduleType: 'now' | 'scheduled' | 'draft';
    scheduleDate?: string;
    scheduleTime?: string;
    status: 'draft' | 'scheduled' | 'sent' | 'failed' | 'cancelled';
    deliveryStats: {
      total: number;
      sent: number;
      delivered: number;
      failed: number;
    };
    createdBy: {
      _id: string;
      name: string;
      email: string;
    };
    templateId?: {
      _id: string;
      name: string;
      category: string;
    };
    createdAt: string;
    updatedAt: string;
  };
  message: string;
}

export interface MessageListResponse {
  success: boolean;
  data: {
    messages: MessageAddResponse['data'][];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}

export interface RecipientGroup {
  id: string;
  name: string;
  count: number;
  type: 'system' | 'department' | 'group';
  description: string;
  targetModel: 'User' | 'Department' | 'Group';
  targetId?: string;
  criteria: Record<string, any>;
}

export interface RecipientGroupsResponse {
  success: boolean;
  data: {
    groups: RecipientGroup[];
    total: number;
  };
}

export interface Disciple {
  _id: string;
  churchId: string;
  branchId: string;
  memberId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  mentorId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  startDate: string;
  endDate?: string;
  currentLevel: string;
  status: 'active' | 'completed' | 'paused' | 'discontinued';
  goals: string;
  notes?: string;
  progress: number;
  milestonesCompleted: Array<{
    _id: string;
    name: string;
    points: number;
    category: string;
  }>;
  durationInDays: number;
  completionPercentage: number;
  createdAt: string;
  updatedAt: string;
}

export interface DisciplesResponse {
  success: boolean;
  data: {
    disciples: Disciple[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}

export interface DiscipleResponse {
  success: boolean;
  data: {
    disciple: Disciple;
    progressRecords: Array<{
      _id: string;
      milestoneId: {
        _id: string;
        name: string;
        points: number;
        category: string;
      };
      completedDate: string;
      pointsEarned: number;
      status: 'pending' | 'approved' | 'rejected';
      notes?: string;
      evidence?: string;
    }>;
    totalPoints: number;
    stats: {
      milestonesCompleted: number;
      pendingApproval: number;
      totalPoints: number;
    };
  };
}

export interface DiscipleFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  level?: string;
  mentorId?: string;
}

export interface Milestone {
  _id: string;
  churchId: string;
  branchId: string;
  name: string;
  description: string;
  category: string;
  points: number;
  requirements?: string;
  isActive: boolean;
  order: number;
  level: string;
  prerequisiteMilestones: Array<{
    _id: string;
    name: string;
    points: number;
    category: string;
    level: string;
  }>;
  completionCount: number;
  difficulty: string;
  formattedPoints: string;
  createdAt: string;
  updatedAt: string;
}

export interface MilestonesResponse {
  success: boolean;
  data: {
    milestones: Milestone[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}

export interface MilestoneResponse {
  success: boolean;
  data: {
    milestone: Milestone;
    stats: {
      approved: number;
      pending: number;
      rejected: number;
      total: number;
    };
    recentCompletions: Array<{
      _id: string;
      discipleId: {
        memberId: {
          firstName: string;
          lastName: string;
        };
      };
      verifiedBy: {
        firstName: string;
        lastName: string;
      };
      completedDate: string;
      pointsEarned: number;
      status: string;
    }>;
  };
}

export interface MilestoneFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  level?: string;
  isActive?: boolean;
}

export interface PrayerRequest {
  memberId?: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  isAnonymous: boolean;
  isPublic: boolean;
}

export interface PrayerRequestAddResponse {
  success: boolean;
  data: PrayerRequest;
  message: string;
}

export interface PrayerRequestListResponse {
  success: boolean;
  data: {
    prayerRequests: PrayerRequest[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}

export interface PrayerCountUpdateResponse {
  success: boolean;
  data: {
    prayerRequestId: string;
    prayerCount: number;
  };
  message: string;
}
