import type { Address, Pagination } from '@/lib/types';

import type {
  ActivityType,
  DepartmentCategory,
  ExpenseCategory,
  GoalStatus,
  MemberRole,
} from '@/models/department';

export interface DepartmentMember {
  userId: string;
  role: MemberRole;
  skills: string[];
  joinedDate: Date;
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
  participants: string[];
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
  // enhanced fields
  members: DepartmentMember[];
  totalBudget: number;
  budgetCategories: DepartmentBudgetCategory[];
  expenses: DepartmentExpense[];
  activities: DepartmentActivity[];
  goals: DepartmentGoal[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface DepartmentListResponse {
  departments: Department[];
  pagination: Pagination;
}
