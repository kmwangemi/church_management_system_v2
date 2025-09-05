import type { UserResponse } from '@/lib/types/user';
import type { UseFormReturn } from 'react-hook-form';

// Form data interface
export interface UserFormData {
  // Pastor details
  pastorDetails?: {
    pastorId: string;
    ordinationDate: string;
    sermonCount: number;
    counselingSessions: number;
    biography: string;
  };
  // Bishop details
  bishopDetails?: {
    bishopId: string;
    appointmentDate: string;
    jurisdictionArea: string;
    biography: string;
  };
  // Admin details
  adminDetails?: {
    adminId: string;
    accessLevel: string;
  };
  // Super Admin details
  superAdminDetails?: {
    superAdminId: string;
    accessLevel: string;
  };
  // Visitor details
  visitorDetails?: {
    visitorId: string;
    visitDate: string;
    howDidYouHear: string;
    followUpStatus: string;
    interestedInMembership: boolean;
    invitedBy: string;
  };
  // Member details
  memberDetails?: {
    memberId: string;
    membershipDate: string;
    membershipStatus: string;
    baptismDate: string;
    joinedDate: string;
  };
  // Staff details
  staffDetails?: {
    staffId: string;
    jobTitle: string;
    department: string;
    employmentType: string;
    startDate: string;
    salary: number;
    isActive: boolean;
  };
  // Volunteer details
  volunteerDetails?: {
    volunteerId: string;
    volunteerStatus: string;
    availabilitySchedule: {
      days: string[];
      preferredTimes: string[];
    };
    departments: string[];
    backgroundCheck: {
      completed: boolean;
      clearanceLevel: string;
      completedDate?: string;
      expiryDate?: string;
    };
    hoursContributed: number;
  };
  // General fields
  isStaff?: boolean;
  isVolunteer?: boolean;
}

// Component prop interfaces
export interface PastorDetailsCardProps {
  form: UseFormReturn<UserFormData>;
}

export interface BishopDetailsCardProps {
  form: UseFormReturn<UserFormData>;
}

export interface AdminDetailsCardProps {
  form: UseFormReturn<UserFormData>;
}

export interface SuperAdminDetailsCardProps {
  form: UseFormReturn<UserFormData>;
}

export interface VisitorDetailsCardProps {
  form: UseFormReturn<UserFormData>;
}

export interface MemberDetailsCardProps {
  form: UseFormReturn<UserFormData>;
}

export interface StaffDetailsCardProps {
  form: UseFormReturn<UserFormData>;
}

export interface VolunteerDetailsCardProps {
  form: UseFormReturn<UserFormData>;
}

export interface RestSpecificFormProps {
  currentRole: string | undefined;
  user: UserResponse | undefined;
  form: UseFormReturn<UserFormData | any>;
}

export interface RoleSpecificFormProps {
  currentRole: string | undefined;
  form: UseFormReturn<UserFormData | any>;
}

export interface StaffDetailsFormProps {
  user: UserResponse | undefined;
  form: UseFormReturn<UserFormData | any>;
}
