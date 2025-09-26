import type { Pagination } from '@/lib/types';
import type { GroupGoalStatus } from '@/models/group';

export interface GroupAddResponse {
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

export interface Group {
  _id: string;
  churchId: string;
  branchId: {
    _id: string;
    branchName: string;
    address: string;
    country: string;
  };
  groupName: string;
  leaderId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    profilePictureUrl: string;
  } | null;
  meetingDay: string[];
  meetingTime: string[];
  description: string;
  category: string;
  capacity: number;
  location: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
}

export interface GroupListResponse {
  groups: Group[];
  pagination: Pagination;
}

export interface GroupGoal {
  _id: string;
  title: string;
  description: string;
  targetDate: Date;
  status: GroupGoalStatus;
  progress: number;
  assignee?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
  };
  priority: string;
  category: string;
  success: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface GroupGoalsResponse {
  success: boolean;
  data: {
    goals: GroupGoal[];
    pagination: Pagination;
  };
}
