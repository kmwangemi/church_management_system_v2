import type { Pagination } from '@/lib/types';
import type {
  GroupActivityType,
  GroupGoalStatus,
  GroupMemberRole,
} from '@/models/group';

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
  establishedDate: string;
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

export interface GroupActivity {
  _id: string;
  title: string;
  description: string;
  type: GroupActivityType;
  date: Date;
  startTime: string;
  endTime: string;
  location: string;
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

export interface GroupActivitiesResponse {
  success: boolean;
  data: {
    activities: GroupActivity[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalActivities: number;
      hasMore: boolean;
    };
  };
}

export interface GroupMember {
  _id: string;
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    profilePictureUrl?: string;
  };
  role: GroupMemberRole;
  skills: string[];
  joinedDate: string;
  isActive: boolean;
  notes?: string;
}

interface GroupInfo {
  id: string;
  departmentName: string;
  description?: string;
}

export interface GroupMembersResponse {
  success: boolean;
  data: {
    members: GroupMember[];
    group: GroupInfo;
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

// Types for the attendance summary response
interface AttendanceSummary {
  date: string;
  activityId: string;
  title: string;
  type: string;
  isCompleted: boolean;
  totalExpected: number;
  totalPresent: number;
  totalLate: number;
  totalAbsent: number;
  totalExcused: number;
  attendanceRate: number;
  records?: any[]; // Only included if includeRecords=true
}

interface OverallStats {
  totalActivities: number;
  activitiesWithAttendance: number;
  averageAttendanceRate: number;
  totalExpected: number;
  totalPresent: number;
  totalLate: number;
  totalAbsent: number;
  totalExcused: number;
  bestAttendanceRate: number;
  worstAttendanceRate: number;
}

interface AttendanceInsights {
  bestAttendanceActivity: {
    title: string;
    date: string;
    rate: number;
  } | null;
  worstAttendanceActivity: {
    title: string;
    date: string;
    rate: number;
  } | null;
}

interface AttendanceFilters {
  dateRange: {
    startDate: string | null;
    endDate: string | null;
  };
  limit: number;
  includeRecords: boolean;
}

export interface AttendanceSummaryResponse {
  success: boolean;
  data: {
    summaries: AttendanceSummary[];
    overallStats: OverallStats;
    insights: AttendanceInsights;
    filters: AttendanceFilters;
  };
}