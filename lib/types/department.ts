import type { Address, Pagination } from '@/lib/types';

// interface pagination {
//   currentPage: number;
//   totalPages: number;
//   totalMembers: number;
//   limit: number;
//   hasNextPage: boolean;
//   hasPrevPage: boolean;
// }

import type {
  ActivityType,
  DepartmentCategory,
  ExpenseCategory,
  GoalStatus,
  MemberRole,
} from '@/models/department';

export interface DepartmentMember {
  _id: string;
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    profilePictureUrl?: string;
  };
  role: MemberRole;
  skills: string[];
  joinedDate: string;
  isActive: boolean;
  notes?: string;
}

export interface DepartmentBudgetCategory {
  category: ExpenseCategory;
  allocatedAmount: number;
  spentAmount: number;
  description?: string;
}

export interface DepartmentExpense {
  _id: string;
  category: ExpenseCategory;
  amount: number;
  description: string;
  date: Date;
  approvedBy?: string;
  receiptUrl?: string;
  reference?: string;
  vendor?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DepartmentActivity {
  _id: string;
  title: string;
  description: string;
  type: ActivityType;
  date: Date;
  duration?: number;
  location?: string;
  participants: {
    _id: string;
    firstName: string;
    lastName: string;
    isLocked: boolean;
    fullName: string;
  }[];
  organizedBy: string;
  notes?: string;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DepartmentGoal {
  _id: string;
  title: string;
  description: string;
  targetDate: Date;
  status: GoalStatus;
  progress: number;
  assignedTo?: string[];
  milestones?: {
    title: string;
    description?: string;
    targetDate: Date;
    isCompleted: boolean;
    completedDate?: Date;
  }[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DepartmentAddResponse {
  _id: string;
  churchId: string;
  branchId: string;
  leaderId: string | null;
  departmentName: string;
  meetingDay: string[];
  meetingTime: string[];
  budget: number; // maps to totalBudget
  description: string;
  isActive: boolean;
  isDeleted: boolean;
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
  meetingTime: string[];
  description: string;
  location?: string;
  category: DepartmentCategory;
  establishedDate: string;
  isActive: boolean;
  isDeleted: boolean;
  totalBudget: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface DepartmentListResponse {
  departments: Department[];
  pagination: Pagination;
}

interface DepartmentInfo {
  id: string;
  departmentName: string;
  description?: string;
}

export interface DepartmentMembersResponse {
  success: boolean;
  data: {
    members: DepartmentMember[];
    department: DepartmentInfo;
    pagination: {
      currentPage: number;
      totalPages: number;
      totalMembers: number;
      limit: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}

export interface DepartmentActivitiesResponse {
  success: boolean;
  data: {
    activities: DepartmentActivity[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalActivities: number;
      hasMore: boolean;
    };
  };
}

export interface DepartmentExpensesResponse {
  success: boolean;
  expenses: DepartmentExpense[];
  pagination: Pagination;
  summary: {
    filteredTotal: number;
    departmentName: string;
    totalBudget: number;
    totalSpent: number;
    remainingBudget: number;
    budgetCategories: [];
  };
}

export interface DepartmentGoalsResponse {
  success: boolean;
  data: {
    goals: DepartmentGoal[];
    pagination: Pagination;
  };
}
