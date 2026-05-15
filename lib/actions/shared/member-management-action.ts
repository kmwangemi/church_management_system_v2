'use server';

import type {
  Gender,
  MaritalStatus,
  OrganizationRole,
} from '@/generated/prisma';
import { getServerSession } from '@/lib/get-session';
import prisma from '@/lib/prisma';
import type { Member } from '@/lib/types/member';
import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';

// ============================================
// TYPES
// ============================================

interface AdminAddMemberParams {
  organizationId: string;
  // Basic Info
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  password: string;
  // Personal Info
  dateOfBirth?: string;
  gender?: Gender;
  maritalStatus?: MaritalStatus;
  occupation?: string;
  // Organization Info
  role: OrganizationRole[]; // OWNER, ADMIN, MEMBER, STAFF, VOLUNTEER, VISITOR
  position?: string;
  teamId?: string; // Branch/Team assignment
  // Address
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  // Settings
  sendWelcomeEmail?: boolean;
}

interface AdminUpdateMemberParams {
  organizationId: string;
  userId: string;
  // Basic Info
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  // Personal Info
  dateOfBirth?: string;
  gender?: Gender;
  maritalStatus?: MaritalStatus;
  occupation?: string;
  // Organization Info
  role?: OrganizationRole;
  position?: string;
  teamId?: string | null; // null to remove from team
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  // Address
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  // Emergency Contact
  emergencyContact?: {
    fullName?: string;
    phoneNumber?: string;
    relationship?: string;
    email?: string;
    address?: string;
  };
  // Role-Specific Updates
  memberDetails?: {
    membershipDate?: string;
    membershipStatus?: 'ACTIVE' | 'INACTIVE' | 'NEW' | 'TRANSFERRED';
    baptismDate?: string;
    departmentIds?: string[];
    groupIds?: string[];
  };
  pastorDetails?: {
    ordinationDate?: string;
    qualifications?: string[];
    specializations?: string[];
    biography?: string;
  };
  staffDetails?: {
    jobTitle?: string;
    department?: string;
    startDate?: string;
    endDate?: string;
    salary?: number;
    employmentType?: 'FULL_TIME' | 'PART_TIME' | 'CASUAL' | 'CONTRACT';
    isActive?: boolean;
  };
  volunteerDetails?: {
    volunteerStatus?: 'ACTIVE' | 'INACTIVE' | 'ON_HOLD' | 'SUSPENDED';
    departments?: string[];
    hoursContributed?: number;
    availableDays?: string[];
    preferredTimes?: string[];
  };
  visitorDetails?: {
    howDidYouHear?: string;
    followUpStatus?: 'PENDING' | 'CONTACTED' | 'CONVERTED' | 'DECLINED';
    followUpNotes?: string;
    interestedInMembership?: boolean;
  };
  adminDetails?: {
    accessLevel?: 'NATIONAL' | 'REGIONAL' | 'TEAM';
    assignedTeams?: string[];
  };
}

interface AdminServerActionResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface AdminGetMembersParams {
  organizationId: string;
  role?: OrganizationRole;
  status?: string;
  search?: string;
  page?: number;
  pageSize?: number;
  sortBy?: 'name' | 'email' | 'createdAt' | 'status';
  sortOrder?: 'asc' | 'desc';
  gender?: Gender;
  maritalStatus?: MaritalStatus;
  dateFrom?: string; // Filter by memberSince date
  dateTo?: string;
}

interface AdminPaginatedResponse<T> {
  members: T[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasMore: boolean;
  };
}

interface AdminMemberStatistics {
  totalMembers: number;
  activeMembers: number;
  inactiveMembers: number;
  membersByRole?: number;
  byRole: {
    role: string;
    count: number;
  }[];
  byTeam: {
    teamId: string;
    teamName: string;
    count: number;
  }[];
  recentJoins: {
    userId: string;
    name: string;
    joinedAt: Date;
  }[];
  missingInfo: {
    missingAddress: number;
    missingEmergencyContact: number;
    missingPhone: number;
  };
}

// ============================================
// FULL MEMBER DETAILS INTERFACE
// ============================================

export interface AdminMemberFullDetails {
  member: IMember; // ✅ ADD THIS - the member record with role and position
  user: User;
  address: Address | null;
  emergencyContact: EmergencyContact | null;
  memberDetails: MemberDetails | null;
  pastorDetails: PastorDetails | null;
  staffDetails: StaffDetails | null;
  volunteerDetails: VolunteerDetails | null;
  visitorDetails: VisitorDetails | null;
  adminDetails: AdminDetails | null;
  organizations: Organization[];
  teams: Team[];
  subscriptions: Subscription[];
}

// ---------- MEMBER ----------
export interface IMember {
  id: string;
  userId: string;
  organizationId: string;
  teamId: string | null;
  role: ('OWNER' | 'ADMIN' | 'MEMBER' | 'STAFF' | 'VOLUNTEER' | 'VISITOR')[]; // ✅ Array of roles
  position: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
  organization?: Organization; // Optional if included
}

// ---------- USER ----------
export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  phoneNumber: string | null; // ✅ CHANGED: Should be nullable
  dateOfBirth: Date | null;
  gender: 'MALE' | 'FEMALE' | null;
  occupation: string | null;
  maritalStatus: 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED' | null; // ✅ More specific
  skills: string[];
  notes: string | null;
  globalRole: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  lastLogin: string | null;
  isPasswordUpdated: boolean;
  agreeToTerms: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
}

// ---------- ADDRESS ----------
export interface Address {
  id: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  organizationId: string | null;
  teamId: string | null;
}

// ---------- EMERGENCY CONTACT ----------
export interface EmergencyContact {
  id: string;
  emergencyContactFullName: string; // ✅ CHANGED: Your schema uses 'fullName' not 'name'
  emergencyContactRelationship: string;
  emergencyContactPhoneNumber: string;
  emergencyContactEmail: string | null;
  emergencyContactAddress: string | null;
  emergencyContactNotes: string | null;
  userId: string;
  createdAt: string; // ✅ ADD
  updatedAt: string; // ✅ ADD
}

// ---------- MEMBER DETAILS ----------
export interface MemberDetails {
  id: string;
  memberId: string;
  membershipDate: string | null; // ✅ CHANGED: Can be null
  membershipStatus: 'ACTIVE' | 'INACTIVE' | 'NEW' | 'TRANSFERRED';
  baptismDate: string | null;
  joinedDate: Date | null;
  createdAt: string;
  updatedAt: string;
  departmentIds: string[];
  groupIds: string[];
  userId: string;
}

// ---------- ADMIN DETAILS ----------
export interface AdminDetails {
  id: string;
  adminId: string;
  accessLevel: 'TEAM' | 'REGIONAL' | 'NATIONAL'; // ✅ CHANGED: 'LOCAL' -> 'TEAM'
  createdAt: string;
  updatedAt: string;
  assignedTeams: string[];
  userId: string;
}

// ---------- ORGANIZATION ----------
export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  denomination: string | null;
  email: string | null;
  phoneNumber: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  memberSince?: string;
  role?: ('OWNER' | 'ADMIN' | 'MEMBER' | 'STAFF' | 'VOLUNTEER' | 'VISITOR')[]; // ✅ ADD: From mapping
  position?: string | null; // ✅ ADD: From mapping
}

// ---------- TEAM ----------
export interface Team {
  id: string;
  name: string;
  organizationId: string;
  email: string | null;
  phoneNumber: string | null;
  description: string | null;
  isActive: boolean;
  address: string | null;
  joinedAt?: string; // ✅ ADD: From mapping
}

// ---------- SUBSCRIPTION ----------
export interface Subscription {
  id: string;
  plan: 'CONNECT' | 'GROW' | 'ENTERPRISE' | string;
  status: 'ACTIVE' | 'TRIAL' | 'EXPIRED' | 'CANCELLED';
  isPaid: boolean;
  invoiceAmount: number;
  paidAmount: number;
  balAmount: number;
  features: string[];
  maxSmallGroupsLead: number | null; // ✅ ADD: nullable
  currentSmallGroupsLead: number | null; // ✅ ADD: nullable
  maxEventsManage: number | null; // ✅ ADD: nullable
  currentEventsManage: number | null; // ✅ ADD: nullable
  startDate: string;
  endDate: string;
  isAutoRenew: boolean;
  paymentMethod: 'M_PESA' | 'CREDIT_CARD' | null;
  lastPaymentDate: string | null;
  nextBillingDate: string | null;
  canceledAt: string | null;
  cancelReason: string | null;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

// ---------- PASTOR DETAILS ----------
export interface PastorDetails {
  id: string;
  pastorId: string;
  userId: string;
  ordinationDate: string | null;
  qualifications: string[];
  specializations: string[];
  biography: string | null;
  createdAt: string;
  updatedAt: string;
  assignments?: PastorAssignment[]; // ✅ ADD: From your query
}

export interface PastorAssignment {
  id: string;
  pastorDetailsId: string;
  teamId: string;
  role: string;
  startDate: string;
  endDate: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ---------- STAFF DETAILS ----------
export interface StaffDetails {
  id: string;
  staffId: string;
  userId: string;
  jobTitle: string | null;
  department: string | null;
  startDate: string | null;
  endDate: string | null;
  salary: number | null;
  employmentType: 'FULL_TIME' | 'PART_TIME' | 'CASUAL' | 'CONTRACT';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ---------- VOLUNTEER DETAILS ----------
export interface VolunteerDetails {
  id: string;
  volunteerId: string;
  userId: string;
  volunteerStatus: 'ACTIVE' | 'INACTIVE' | 'ON_HOLD' | 'SUSPENDED';
  departments: string[];
  hoursContributed: number;
  createdAt: string;
  updatedAt: string;
  availabilitySchedule?: AvailabilitySchedule | null; // ✅ ADD: From your query
  volunteerRoles?: VolunteerRole[]; // ✅ ADD: From your query
  backgroundCheck?: BackgroundCheck | null; // ✅ ADD: From your query
}

export interface AvailabilitySchedule {
  id: string;
  volunteerDetailsId: string;
  days: string[];
  timeSlots: string[];
  preferredTimes: string[];
  createdAt: string;
  updatedAt: string;
}

export interface VolunteerRole {
  id: string;
  volunteerDetailsId: string;
  role: string;
  departmentId: string | null;
  startDate: string;
  endDate: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BackgroundCheck {
  id: string;
  volunteerDetailsId: string;
  checkDate: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

// ---------- VISITOR DETAILS ----------
export interface VisitorDetails {
  id: string;
  visitorId: string;
  userId: string;
  visitDate: string;
  howDidYouHear: string;
  followUpStatus: 'PENDING' | 'CONTACTED' | 'CONVERTED' | 'DECLINED';
  followUpNotes: string | null;
  interestedInMembership: boolean;
  invitedBy: string | null;
  servicesAttended: string[];
  createdAt: string;
  updatedAt: string;
}

// ============================================
// ADMIN ADD MEMBER TO ORGANIZATION (COMPREHENSIVE)
// ============================================

export async function adminAddMemberToOrganization(
  params: AdminAddMemberParams
): Promise<AdminServerActionResponse> {
  const userId: string | null = null;
  const organizationId = params.organizationId;
  try {
    // Step 1: Verify session
    const session = await getServerSession();
    if (!session?.user) {
      return { success: false, error: 'Unauthorized' };
    }
    // Check if user has permission to update members
    const hasPermission = await prisma.member.findFirst({
      where: {
        organizationId: params.organizationId,
        userId: session.user.id,
        role: {
          hasSome: ['OWNER', 'ADMIN'],
        },
      },
    });
    if (!hasPermission) {
      return {
        success: false,
        error: 'You do not have permission to add members in this organization',
      };
    }
    // Step 3: Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: params.email },
    });
    if (existingUser) {
      // Check if already a member of this organization
      const existingMember = await prisma.member.findFirst({
        where: {
          userId: existingUser.id,
          organizationId,
        },
      });
      if (existingMember) {
        return {
          success: false,
          error: 'This user is already a member of this organization',
        };
      }
      // Add existing user to organization
      return await adminAddExistingUserToOrganization(
        existingUser.id,
        params,
        session.user.id
      );
    }
    // Step 4: Create new user with all details
    const result = await adminCreateNewMemberWithDetails(
      params,
      session.user.id
    );
    if (!result.success) {
      throw new Error(result.error || 'Failed to create member');
    }
    // Step 5: Send welcome email if requested
    if (params.sendWelcomeEmail) {
      // TODO: Implement email sending
      // await sendWelcomeEmail({
      //   email: params.email,
      //   name: `${params.firstName} ${params.lastName}`,
      //   organizationId,
      //   temporaryPassword: params.password,
      // });
    }
    revalidatePath('/church/users');
    return {
      success: true,
      data: result.data,
      message: 'Member added successfully',
    };
  } catch (error: any) {
    console.error('Error adding member:', error);
    // Rollback: Delete user if created
    if (userId) {
      try {
        await prisma.user.delete({ where: { id: userId } });
        console.log('Rolled back user creation');
      } catch (rollbackError) {
        console.error('Failed to rollback user creation:', rollbackError);
      }
    }
    return {
      success: false,
      error: error.message || 'Failed to add member',
    };
  }
}

// ============================================
// HELPER: ADMIN ADD EXISTING USER TO ORGANIZATION
// ============================================

async function adminAddExistingUserToOrganization(
  userId: string,
  params: AdminAddMemberParams,
  createdBy: string
): Promise<AdminServerActionResponse> {
  try {
    const result = await prisma.$transaction(
      async (tx) => {
        // 1. Create Member record with Better Auth
        const member = await tx.member.create({
          data: {
            userId,
            organizationId: params.organizationId,
            position: params.position,
            role: params.role,
            teamId: params.teamId || null,
          },
          include: {
            user: true,
          },
        });
        // 2. Update user's created by
        await tx.user.update({
          where: { id: userId },
          data: {
            updatedBy: createdBy,
          },
        });
        // 3. Add to Team if teamId provided
        if (params.teamId) {
          await tx.teamMember.create({
            data: {
              userId,
              teamId: params.teamId,
            },
          });
        }
        // 4. Create or update Address if provided
        if (params.address) {
          await tx.address.upsert({
            where: { userId },
            create: {
              userId,
              street: params.address.street || '',
              city: params.address.city || '',
              state: params.address.state || '',
              zipCode: params.address.zipCode || '',
              country: params.address.country || 'Kenya',
            },
            update: {
              street: params.address.street || '',
              city: params.address.city || '',
              state: params.address.state || '',
              zipCode: params.address.zipCode || '',
              country: params.address.country || 'Kenya',
            },
          });
        }
        // 6. Create role-specific details based on organization role
        await createRoleSpecificDetails(tx, userId, params);
        return member;
      },
      {
        maxWait: 10_000, // Wait up to 10s to acquire transaction
        timeout: 10_000, // Transaction can run for up to 10s
      }
    );
    return {
      success: true,
      data: result,
      message: 'Existing user added to organization successfully',
    };
  } catch (error: any) {
    console.error('Error adding existing user:', error);
    return {
      success: false,
      error: error.message || 'Failed to add existing user',
    };
  }
}

// ============================================
// HELPER: ADMIN CREATE NEW MEMBER WITH DETAILS
// ============================================

async function adminCreateNewMemberWithDetails(
  params: AdminAddMemberParams,
  createdBy: string
): Promise<AdminServerActionResponse> {
  try {
    // Hash password
    const hashedPassword = await bcrypt.hash(params.password, 10);
    const result = await prisma.$transaction(
      async (tx) => {
        // 1. Create User
        const user = await tx.user.create({
          data: {
            name: `${params.firstName} ${params.lastName}`,
            email: params.email,
            emailVerified: false,
            phoneNumber: params.phoneNumber,
            dateOfBirth: params.dateOfBirth
              ? new Date(params.dateOfBirth)
              : undefined,
            gender: params.gender,
            maritalStatus: params.maritalStatus,
            occupation: params.occupation,
            globalRole: 'USER',
            status: 'ACTIVE',
            createdBy,
          },
        });
        // 2. Create Account with password
        await tx.account.create({
          data: {
            userId: user.id,
            accountId: user.id,
            providerId: 'credential',
            password: hashedPassword,
          },
        });
        // 3. Create Member record
        const member = await tx.member.create({
          data: {
            userId: user.id,
            organizationId: params.organizationId,
            position: params.position,
            role: params.role,
            teamId: params.teamId || null,
          },
          include: {
            user: true,
          },
        });
        // 4. Add to Team if teamId provided
        if (params.teamId) {
          await tx.teamMember.create({
            data: {
              userId: user.id,
              teamId: params.teamId,
            },
          });
        }
        // 5. Create Address if provided
        if (params.address) {
          await tx.address.create({
            data: {
              userId: user.id,
              street: params.address.street || '',
              city: params.address.city || '',
              state: params.address.state || '',
              zipCode: params.address.zipCode || '',
              country: params.address.country || 'Kenya',
            },
          });
        }
        // 7. Create role-specific details
        await createRoleSpecificDetails(tx, user.id, params);
        // 8. Create User Subscription
        const trialEnd = new Date();
        trialEnd.setDate(trialEnd.getDate() + 30);
        await tx.userSubscription.create({
          data: {
            userId: user.id,
            plan: 'CONNECT', // Default plan
            status: 'TRIAL',
            startDate: new Date(),
            endDate: trialEnd,
            isPaid: false,
            invoiceAmount: 0,
            paidAmount: 0,
            balAmount: 0,
            features: [],
            isAutoRenew: true,
            nextBillingDate: trialEnd,
          },
        });
        return { user, member };
      },
      {
        maxWait: 10_000, // Wait up to 10s to acquire transaction
        timeout: 10_000, // Transaction can run for up to 10s
      }
    );
    return {
      success: true,
      data: result.member,
    };
  } catch (error: any) {
    console.error('Error creating new member:', error);
    return {
      success: false,
      error: error.message || 'Failed to create new member',
    };
  }
}

// ============================================
// HELPER: ADMIN CREATE ROLE-SPECIFIC DETAILS
// ============================================

async function createRoleSpecificDetails(
  tx: any,
  userId: string,
  params: AdminAddMemberParams
): Promise<void> {
  const { role } = params;
  try {
    // Create MemberDetails for MEMBER role
    if (role.includes('MEMBER')) {
      await tx.memberDetails.create({
        data: {
          userId,
          memberId: userId,
          membershipDate: new Date(),
          baptismDate: undefined,
          membershipStatus: 'ACTIVE',
          departmentIds: [],
          groupIds: [],
        },
      });
    }
    // Create StaffDetails for STAFF role
    if (role.includes('STAFF')) {
      await tx.staffDetails.create({
        data: {
          userId,
          staffId: userId,
          jobTitle: undefined,
          department: undefined,
          startDate: undefined,
          salary: 0,
          employmentType: 'CASUAL',
          isActive: true,
        },
      });
    }
    // Create VolunteerDetails for VOLUNTEER role
    if (role.includes('VOLUNTEER')) {
      const volunteerDetails = await tx.volunteerDetails.create({
        data: {
          userId,
          volunteerId: userId,
          volunteerStatus: 'ACTIVE',
          departments: [],
          hoursContributed: 0,
        },
      });
      await tx.availabilitySchedule.create({
        data: {
          volunteerDetailsId: volunteerDetails.id,
          days: [],
          timeSlots: [],
          preferredTimes: [],
        },
      });
    }
    // Create VisitorDetails for VISITOR role
    if (role.includes('VISITOR')) {
      await tx.visitorDetails.create({
        data: {
          userId,
          visitorId: userId,
          visitDate: new Date(),
          howDidYouHear: 'OTHER',
          followUpStatus: 'PENDING',
          interestedInMembership: false,
          invitedBy: undefined,
          servicesAttended: [],
        },
      });
    }
    // Create AdminDetails for ADMIN role
    if (role.includes('ADMIN')) {
      await tx.adminDetails.create({
        data: {
          userId,
          adminId: userId,
          accessLevel: 'NATIONAL',
          assignedTeams: params.teamId ? [params.teamId] : [],
        },
      });
    }
    // Create PastorDetails for pastors
    // if (role.includes('STAFF') && params.staffDetails) {
    //   await tx.pastorDetails.create({
    //     data: {
    //       userId,
    //       pastorId: userId,
    //       ordinationDate: params.pastorDetails.ordinationDate
    //         ? new Date(params.pastorDetails.ordinationDate)
    //         : undefined,
    //       qualifications: params.pastorDetails.qualifications || [],
    //       specializations: params.pastorDetails.specializations || [],
    //       biography: params.pastorDetails.biography,
    //     },
    //   });
    // }
  } catch (error) {
    console.error('Error creating role-specific details:', error);
    throw error;
  }
}

// ============================================
// ADMIN UPDATE MEMBER DETAILS (COMPREHENSIVE)
// ============================================

export async function adminUpdateMemberDetails(
  params: AdminUpdateMemberParams
): Promise<AdminServerActionResponse> {
  try {
    // Step 1: Verify session
    const session = await getServerSession();
    if (!session?.user) {
      return { success: false, error: 'Unauthorized' };
    }
    // Check if user has permission to update members
    const hasPermission = await prisma.member.findFirst({
      where: {
        organizationId: params.organizationId,
        userId: session.user.id,
        role: {
          hasSome: ['OWNER', 'ADMIN'],
        },
      },
    });
    if (!hasPermission) {
      return {
        success: false,
        error:
          'You do not have permission to update members in this organization',
      };
    }
    // Step 3: Update member details in transaction
    const result = await prisma.$transaction(
      async (tx) => {
        // 1. Update User basic info
        const userUpdateData: any = {};
        if (params.firstName || params.lastName) {
          const currentUser = await tx.user.findUnique({
            where: { id: params.userId },
            select: { name: true },
          });
          const [currentFirst, ...currentLastParts] =
            currentUser?.name?.split(' ') || [];
          const currentLast = currentLastParts.join(' ');
          userUpdateData.name = `${params.firstName || currentFirst} ${params.lastName || currentLast}`;
        }
        if (params.email) userUpdateData.email = params.email;
        if (params.phoneNumber !== undefined)
          userUpdateData.phoneNumber = params.phoneNumber;
        if (params.dateOfBirth)
          userUpdateData.dateOfBirth = new Date(params.dateOfBirth);
        if (params.gender) userUpdateData.gender = params.gender;
        if (params.maritalStatus)
          userUpdateData.maritalStatus = params.maritalStatus;
        if (params.occupation !== undefined)
          userUpdateData.occupation = params.occupation;
        if (params.position !== undefined)
          userUpdateData.position = params.position;
        if (params.status) userUpdateData.status = params.status;
        if (params.role) userUpdateData.organizationRoles = [params.role];
        userUpdateData.updatedBy = session.user.id;
        if (Object.keys(userUpdateData).length > 0) {
          await tx.user.update({
            where: { id: params.userId },
            data: userUpdateData,
          });
        }
        // 2. Update or create Address
        if (params.address) {
          const existingAddress = await tx.address.findUnique({
            where: { userId: params.userId },
          });
          if (existingAddress) {
            await tx.address.update({
              where: { userId: params.userId },
              data: {
                street: params.address.street ?? existingAddress.street,
                city: params.address.city ?? existingAddress.city,
                state: params.address.state ?? existingAddress.state,
                zipCode: params.address.zipCode ?? existingAddress.zipCode,
                country: params.address.country ?? existingAddress.country,
              },
            });
          } else {
            await tx.address.create({
              data: {
                userId: params.userId,
                street: params.address.street || '',
                city: params.address.city || '',
                state: params.address.state || '',
                zipCode: params.address.zipCode || '',
                country: params.address.country || 'Kenya',
              },
            });
          }
        }
        // 3. Update or create Emergency Contact
        if (params.emergencyContact) {
          const existingContact = await tx.emergencyContact.findUnique({
            where: { userId: params.userId },
          });
          if (existingContact) {
            await tx.emergencyContact.update({
              where: { userId: params.userId },
              data: {
                fullName:
                  params.emergencyContact.fullName ?? existingContact.fullName,
                phoneNumber:
                  params.emergencyContact.phoneNumber ??
                  existingContact.phoneNumber,
                relationship:
                  params.emergencyContact.relationship ??
                  existingContact.relationship,
                email: params.emergencyContact.email ?? existingContact.email,
                address:
                  params.emergencyContact.address ?? existingContact.address,
              },
            });
          } else if (
            params.emergencyContact.fullName &&
            params.emergencyContact.phoneNumber
          ) {
            await tx.emergencyContact.create({
              data: {
                userId: params.userId,
                fullName: params.emergencyContact.fullName,
                phoneNumber: params.emergencyContact.phoneNumber,
                relationship: params.emergencyContact.relationship || 'Unknown',
                email: params.emergencyContact.email,
                address: params.emergencyContact.address,
              },
            });
          }
        }
        // 4. Handle Team assignment
        if (params.teamId !== undefined) {
          // Remove from all teams first
          await tx.teamMember.deleteMany({
            where: { userId: params.userId },
          });
          // Add to new team if provided
          if (params.teamId) {
            await tx.teamMember.create({
              data: {
                userId: params.userId,
                teamId: params.teamId,
              },
            });
          }
        }
        // 5. Update role-specific details
        await adminUpdateRoleSpecificDetails(tx, params.userId, params);
        // Return updated user with all relations
        return await tx.user.findUnique({
          where: { id: params.userId },
          include: {
            address: true,
            emergencyContact: true,
            memberDetails: true,
            pastorDetails: true,
            staffDetails: true,
            volunteerDetails: true,
            visitorDetails: true,
            adminDetails: true,
          },
        });
      },
      {
        maxWait: 10_000, // Wait up to 10s to acquire transaction
        timeout: 10_000, // Transaction can run for up to 10s
      }
    );
    revalidatePath(`/church/users/${params.organizationId}/members`);
    revalidatePath(`/church/users/${params.organizationId}/members`);
    return {
      success: true,
      data: result,
      message: 'Member details updated successfully',
    };
  } catch (error: any) {
    console.error('Error updating member details:', error);
    return {
      success: false,
      error: error.message || 'Failed to update member details',
    };
  }
}

// ============================================
// HELPER: ADMIN UPDATE ROLE-SPECIFIC DETAILS
// ============================================

async function adminUpdateRoleSpecificDetails(
  tx: any,
  userId: string,
  params: AdminUpdateMemberParams
): Promise<void> {
  try {
    // Update MemberDetails
    if (params.memberDetails) {
      const existing = await tx.memberDetails.findUnique({
        where: { userId },
      });
      const updateData: any = {};
      if (params.memberDetails.membershipDate) {
        updateData.membershipDate = new Date(
          params.memberDetails.membershipDate
        );
      }
      if (params.memberDetails.membershipStatus) {
        updateData.membershipStatus = params.memberDetails.membershipStatus;
      }
      if (params.memberDetails.baptismDate) {
        updateData.baptismDate = new Date(params.memberDetails.baptismDate);
      }
      if (params.memberDetails.departmentIds) {
        updateData.departmentIds = params.memberDetails.departmentIds;
      }
      if (params.memberDetails.groupIds) {
        updateData.groupIds = params.memberDetails.groupIds;
      }
      if (existing) {
        await tx.memberDetails.update({
          where: { userId },
          data: updateData,
        });
      } else if (Object.keys(updateData).length > 0) {
        await tx.memberDetails.create({
          data: {
            userId,
            memberId: userId,
            membershipStatus: 'ACTIVE',
            ...updateData,
          },
        });
      }
    }
    // Update PastorDetails
    if (params.pastorDetails) {
      const existing = await tx.pastorDetails.findUnique({
        where: { userId },
      });
      const updateData: any = {};
      if (params.pastorDetails.ordinationDate) {
        updateData.ordinationDate = new Date(
          params.pastorDetails.ordinationDate
        );
      }
      if (params.pastorDetails.qualifications) {
        updateData.qualifications = params.pastorDetails.qualifications;
      }
      if (params.pastorDetails.specializations) {
        updateData.specializations = params.pastorDetails.specializations;
      }
      if (params.pastorDetails.biography !== undefined) {
        updateData.biography = params.pastorDetails.biography;
      }
      if (existing) {
        await tx.pastorDetails.update({
          where: { userId },
          data: updateData,
        });
      } else if (Object.keys(updateData).length > 0) {
        await tx.pastorDetails.create({
          data: {
            userId,
            pastorId: userId,
            ...updateData,
          },
        });
      }
    }
    // Update StaffDetails
    if (params.staffDetails) {
      const existing = await tx.staffDetails.findUnique({
        where: { userId },
      });
      const updateData: any = {};
      if (params.staffDetails.jobTitle)
        updateData.jobTitle = params.staffDetails.jobTitle;
      if (params.staffDetails.department)
        updateData.department = params.staffDetails.department;
      if (params.staffDetails.startDate)
        updateData.startDate = new Date(params.staffDetails.startDate);
      if (params.staffDetails.endDate)
        updateData.endDate = new Date(params.staffDetails.endDate);
      if (params.staffDetails.salary !== undefined)
        updateData.salary = params.staffDetails.salary;
      if (params.staffDetails.employmentType)
        updateData.employmentType = params.staffDetails.employmentType;
      if (params.staffDetails.isActive !== undefined)
        updateData.isActive = params.staffDetails.isActive;
      if (existing) {
        await tx.staffDetails.update({
          where: { userId },
          data: updateData,
        });
      } else if (
        params.staffDetails.jobTitle &&
        params.staffDetails.department
      ) {
        await tx.staffDetails.create({
          data: {
            userId,
            staffId: userId,
            jobTitle: params.staffDetails.jobTitle,
            department: params.staffDetails.department,
            startDate: params.staffDetails.startDate
              ? new Date(params.staffDetails.startDate)
              : new Date(),
            employmentType: params.staffDetails.employmentType || 'CASUAL',
            salary: params.staffDetails.salary,
            isActive: params.staffDetails.isActive ?? true,
          },
        });
      }
    }
    // Update VolunteerDetails
    if (params.volunteerDetails) {
      const existing = await tx.volunteerDetails.findUnique({
        where: { userId },
      });
      const updateData: any = {};
      if (params.volunteerDetails.volunteerStatus) {
        updateData.volunteerStatus = params.volunteerDetails.volunteerStatus;
      }
      if (params.volunteerDetails.departments) {
        updateData.departments = params.volunteerDetails.departments;
      }
      if (params.volunteerDetails.hoursContributed !== undefined) {
        updateData.hoursContributed = params.volunteerDetails.hoursContributed;
      }
      if (existing) {
        await tx.volunteerDetails.update({
          where: { userId },
          data: updateData,
        });
        // Update availability schedule
        if (
          params.volunteerDetails.availableDays ||
          params.volunteerDetails.preferredTimes
        ) {
          const existingSchedule = await tx.availabilitySchedule.findUnique({
            where: { volunteerDetailsId: existing.id },
          });
          const scheduleData: any = {};
          if (params.volunteerDetails.availableDays) {
            scheduleData.days = params.volunteerDetails.availableDays;
          }
          if (params.volunteerDetails.preferredTimes) {
            scheduleData.preferredTimes =
              params.volunteerDetails.preferredTimes;
          }
          if (existingSchedule) {
            await tx.availabilitySchedule.update({
              where: { volunteerDetailsId: existing.id },
              data: scheduleData,
            });
          } else {
            await tx.availabilitySchedule.create({
              data: {
                volunteerDetailsId: existing.id,
                days: params.volunteerDetails.availableDays || [],
                timeSlots: [],
                preferredTimes: params.volunteerDetails.preferredTimes || [],
              },
            });
          }
        }
      } else if (Object.keys(updateData).length > 0) {
        const volunteerDetails = await tx.volunteerDetails.create({
          data: {
            userId,
            volunteerId: userId,
            volunteerStatus: 'ACTIVE',
            hoursContributed: 0,
            ...updateData,
          },
        });
        // Create availability schedule
        if (
          params.volunteerDetails.availableDays ||
          params.volunteerDetails.preferredTimes
        ) {
          await tx.availabilitySchedule.create({
            data: {
              volunteerDetailsId: volunteerDetails.id,
              days: params.volunteerDetails.availableDays || [],
              timeSlots: [],
              preferredTimes: params.volunteerDetails.preferredTimes || [],
            },
          });
        }
      }
    }
    // Update VisitorDetails
    if (params.visitorDetails) {
      const existing = await tx.visitorDetails.findUnique({
        where: { userId },
      });
      const updateData: any = {};
      if (params.visitorDetails.howDidYouHear) {
        updateData.howDidYouHear = params.visitorDetails.howDidYouHear;
      }
      if (params.visitorDetails.followUpStatus) {
        updateData.followUpStatus = params.visitorDetails.followUpStatus;
      }
      if (params.visitorDetails.followUpNotes !== undefined) {
        updateData.followUpNotes = params.visitorDetails.followUpNotes;
      }
      if (params.visitorDetails.interestedInMembership !== undefined) {
        updateData.interestedInMembership =
          params.visitorDetails.interestedInMembership;
      }
      if (existing) {
        await tx.visitorDetails.update({
          where: { userId },
          data: updateData,
        });
      } else if (Object.keys(updateData).length > 0) {
        await tx.visitorDetails.create({
          data: {
            userId,
            visitorId: userId,
            visitDate: new Date(),
            followUpStatus: 'PENDING',
            servicesAttended: [],
            ...updateData,
          },
        });
      }
    }
    // Update AdminDetails
    if (params.adminDetails) {
      const existing = await tx.adminDetails.findUnique({
        where: { userId },
      });
      const updateData: any = {};
      if (params.adminDetails.accessLevel) {
        updateData.accessLevel = params.adminDetails.accessLevel;
      }
      if (params.adminDetails.assignedTeams) {
        updateData.assignedTeams = params.adminDetails.assignedTeams;
      }
      if (existing) {
        await tx.adminDetails.update({
          where: { userId },
          data: updateData,
        });
      } else if (Object.keys(updateData).length > 0) {
        await tx.adminDetails.create({
          data: {
            userId,
            adminId: userId,
            accessLevel: 'TEAM',
            assignedTeams: [],
            ...updateData,
          },
        });
      }
    }
  } catch (error) {
    console.error('Error updating role-specific details:', error);
    throw error;
  }
}

// ============================================
// ADMIN GET MEMBER DETAILS BY USER ID
// ============================================

export async function adminGetMemberByUserId(
  memberId: string,
  organizationId: string | undefined
): Promise<AdminServerActionResponse<AdminMemberFullDetails>> {
  try {
    // Step 1: Verify session
    const session = await getServerSession();
    if (!session?.user) {
      return { success: false, error: 'Unauthorized' };
    }
    // Step 2: Check permissions
    const hasPermission = await prisma.member.findFirst({
      where: {
        organizationId,
        userId: session.user.id,
        role: {
          hasSome: ['OWNER', 'ADMIN'],
        },
      },
    });
    if (!hasPermission) {
      return {
        success: false,
        error:
          'You do not have permission to view members in this organization',
      };
    }
    // Step 3: Get the member record to find the userId
    const memberRecord = await prisma.member.findUnique({
      where: { id: memberId },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
            denomination: true,
            email: true,
            phoneNumber: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });
    if (!memberRecord) {
      return {
        success: false,
        error: 'Member not found',
      };
    }
    // Verify the member belongs to the organization
    if (memberRecord.organizationId !== organizationId) {
      return {
        success: false,
        error: 'Member does not belong to this organization',
      };
    }
    const userId = memberRecord.userId;
    // Step 4: Fetch comprehensive member data
    const [
      user,
      address,
      emergencyContact,
      memberDetails,
      pastorDetails,
      staffDetails,
      volunteerDetails,
      visitorDetails,
      adminDetails,
      organizations,
      teams,
      subscriptions,
    ] = await Promise.all([
      // User basic info
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          emailVerified: true,
          image: true,
          phoneNumber: true,
          dateOfBirth: true,
          gender: true,
          occupation: true,
          maritalStatus: true,
          skills: true,
          notes: true,
          globalRole: true,
          status: true,
          lastLogin: true,
          isPasswordUpdated: true,
          agreeToTerms: true,
          createdAt: true,
          updatedAt: true,
          createdBy: true,
          updatedBy: true,
        },
      }),
      // Address
      prisma.address.findUnique({
        where: { userId },
      }),
      // Emergency Contact
      prisma.emergencyContact.findUnique({
        where: { userId },
      }),
      // Member Details
      prisma.memberDetails.findUnique({
        where: { userId },
      }),
      // Pastor Details
      prisma.pastorDetails.findUnique({
        where: { userId },
        include: {
          assignments: {
            where: { isActive: true },
            orderBy: { startDate: 'desc' },
          },
        },
      }),
      // Staff Details
      prisma.staffDetails.findUnique({
        where: { userId },
      }),
      // Volunteer Details
      prisma.volunteerDetails.findUnique({
        where: { userId },
        include: {
          availabilitySchedule: true,
          volunteerRoles: {
            where: { isActive: true },
            orderBy: { startDate: 'desc' },
          },
          backgroundCheck: true,
        },
      }),
      // Visitor Details
      prisma.visitorDetails.findUnique({
        where: { userId },
      }),
      // Admin Details
      prisma.adminDetails.findUnique({
        where: { userId },
      }),
      // Organizations the user belongs to
      prisma.member.findMany({
        where: { userId },
        include: {
          organization: {
            select: {
              id: true,
              name: true,
              slug: true,
              logo: true,
              denomination: true,
              email: true,
              phoneNumber: true,
              status: true,
              createdAt: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      // Teams/Branches the user belongs to
      prisma.teamMember.findMany({
        where: { userId },
        include: {
          team: {
            select: {
              id: true,
              name: true,
              organizationId: true,
              email: true,
              phoneNumber: true,
              description: true,
              isActive: true,
              address: true,
            },
          },
        },
      }),
      // User Subscriptions
      prisma.userSubscription.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      }),
    ]);
    if (!user) {
      return {
        success: false,
        error: 'User not found',
      };
    }
    // Step 5: Format and return comprehensive data
    const memberFullDetails: AdminMemberFullDetails = {
      member: memberRecord, // Include the member record with position and role
      user,
      address,
      emergencyContact,
      memberDetails,
      pastorDetails,
      staffDetails,
      volunteerDetails,
      visitorDetails,
      adminDetails,
      organizations: organizations.map((m) => ({
        ...m.organization,
        memberSince: m.createdAt,
        role: m.role,
        position: m.position,
      })),
      teams: teams.map((tm) => ({
        ...tm.team,
        joinedAt: tm.createdAt,
      })),
      subscriptions,
    };
    return {
      success: true,
      data: memberFullDetails,
    };
  } catch (error: any) {
    console.error('Error fetching member details:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch member details',
    };
  }
}

// ============================================
// ADMIN GET ALL MEMBERS OF AN ORGANIZATION
// ============================================

export async function adminGetOrganizationMembers(
  params: AdminGetMembersParams
): Promise<AdminServerActionResponse<AdminPaginatedResponse<Member>>> {
  try {
    const {
      organizationId,
      role,
      status,
      search,
      page = 1,
      pageSize = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      gender,
      maritalStatus,
      dateFrom,
      dateTo,
    } = params;
    // Step 1: Verify session
    const session = await getServerSession();
    if (!session?.user) {
      return { success: false, error: 'Unauthorized' };
    }
    // Check if user has permission to update members
    const hasPermission = await prisma.member.findFirst({
      where: {
        organizationId: params.organizationId,
        userId: session.user.id,
        role: {
          hasSome: ['OWNER', 'ADMIN'],
        },
      },
    });
    if (!hasPermission) {
      return {
        success: false,
        error:
          'You do not have permission to update members in this organization',
      };
    }
    // Step 3: Build query conditions
    const whereConditions: any = {
      organizationId,
    };
    // User-level filters
    const userConditions: any = {};
    // Role filter - THIS SHOULD BE AT MEMBER LEVEL, NOT USER LEVEL
    if (role) {
      whereConditions.role = {
        has: role, // checks if the array contains that role
      };
    }
    // Status filter
    if (status) {
      userConditions.status = status;
    }
    // Gender filter
    if (gender) {
      userConditions.gender = gender;
    }
    // Marital status filter
    if (maritalStatus) {
      userConditions.maritalStatus = maritalStatus;
    }
    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      // Create an OR condition at the top level to search across both Member and User fields
      whereConditions.OR = [
        // Search in User fields
        {
          user: {
            OR: [
              { name: { contains: searchLower, mode: 'insensitive' } },
              { email: { contains: searchLower, mode: 'insensitive' } },
              { phoneNumber: { contains: searchLower, mode: 'insensitive' } },
              { occupation: { contains: searchLower, mode: 'insensitive' } },
            ],
          },
        },
        // Search in Member fields
        {
          position: { contains: searchLower, mode: 'insensitive' },
        },
      ];
    }
    // Apply user conditions
    if (Object.keys(userConditions).length > 0) {
      whereConditions.user = userConditions;
    }
    // Date range filter (memberSince)
    if (dateFrom || dateTo) {
      whereConditions.createdAt = {};
      if (dateFrom) {
        whereConditions.createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        whereConditions.createdAt.lte = new Date(dateTo);
      }
    }
    // Step 4: Build order by clause
    let orderBy: any;
    switch (sortBy) {
      case 'name':
        orderBy = { user: { name: sortOrder } };
        break;
      case 'email':
        orderBy = { user: { email: sortOrder } };
        break;
      case 'status':
        orderBy = { user: { status: sortOrder } };
        break;
      default:
        orderBy = { createdAt: sortOrder };
        break;
    }
    // Step 5: Calculate pagination
    const skip = (page - 1) * pageSize;
    // Step 6: Fetch total count
    const totalCount = await prisma.member.count({
      where: {
        ...whereConditions,
        // Exclude OWNER role - check that the role array doesn't contain 'OWNER'
        NOT: {
          role: {
            has: 'OWNER',
          },
        },
      },
    });
    // Step 7: Fetch members with related data
    const members = await prisma.member.findMany({
      where: {
        ...whereConditions,
        // Exclude OWNER role - check that the role array doesn't contain 'OWNER'
        NOT: {
          role: {
            has: 'OWNER',
          },
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            phoneNumber: true,
            occupation: true,
            gender: true,
            maritalStatus: true,
            globalRole: true,
            status: true,
            createdAt: true,
            address: {
              select: { id: true },
            },
            emergencyContact: {
              select: { id: true },
            },
            teammembers: {
              where: {
                team: {
                  organizationId,
                },
              },
              include: {
                team: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
              take: 1,
            },
          },
        },
      },
      orderBy,
      skip,
      take: pageSize,
    });
    // Step 9: Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / pageSize);
    return {
      success: true,
      data: {
        members,
        pagination: {
          total: totalCount,
          page,
          pageSize,
          totalPages,
          hasMore: page < totalPages,
        },
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to fetch organization members',
    };
  }
}

export async function adminGetMemberStatistics(
  organizationId: string
): Promise<AdminServerActionResponse<AdminMemberStatistics>> {
  try {
    // Verify session
    const session = await getServerSession();
    if (!session?.user) {
      return { success: false, error: 'Unauthorized' };
    }
    // Check permissions
    const member = await prisma.member.findFirst({
      where: {
        organizationId,
        userId: session.user.id,
      },
    });
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { globalRole: true },
    });
    const canView = member || currentUser?.globalRole === 'SUPER_ADMIN';
    if (!canView) {
      return {
        success: false,
        error: 'You do not have access to this organization',
      };
    }
    // Fetch statistics
    const [
      allMembers,
      activeMembers,
      inactiveMembers,
      membersByRole,
      membersByTeam,
      recentMembers,
      membersWithoutAddress,
      membersWithoutEmergency,
      membersWithoutPhone,
    ] = await Promise.all([
      // Total members
      prisma.member.count({ where: { organizationId } }),
      // Active members
      prisma.member.count({
        where: {
          organizationId,
          user: { status: 'ACTIVE' },
        },
      }),
      // Inactive members
      prisma.member.count({
        where: {
          organizationId,
          user: { status: { not: 'ACTIVE' } },
        },
      }),
      // Members by role (aggregate)
      prisma.member.findMany({
        where: { organizationId },
        include: {
          user: {
            select: { globalRole: true },
          },
        },
      }),
      // Members by team
      prisma.team.findMany({
        where: { organizationId },
        include: {
          _count: {
            select: { teammembers: true },
          },
        },
      }),
      // Recent joins
      prisma.member.findMany({
        where: { organizationId },
        include: {
          user: {
            select: { id: true, name: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      // Missing address
      prisma.member.count({
        where: {
          organizationId,
          user: { address: null },
        },
      }),
      // Missing emergency contact
      prisma.member.count({
        where: {
          organizationId,
          user: { emergencyContact: null },
        },
      }),
      // Missing phone
      prisma.member.count({
        where: {
          organizationId,
          user: { phoneNumber: null },
        },
      }),
    ]);
    // Process role counts
    const roleCount: Record<string, number> = {};
    membersByRole.forEach((m) => {
      m.user.role?.forEach((role) => {
        roleCount[role] = (roleCount[role] || 0) + 1;
      });
    });
    const statistics: AdminMemberStatistics = {
      totalMembers: allMembers,
      activeMembers,
      inactiveMembers,
      byRole: Object.entries(roleCount).map(([role, count]) => ({
        role,
        count,
      })),
      byTeam: membersByTeam.map((team) => ({
        teamId: team.id,
        teamName: team.name,
        count: team._count.teammembers,
      })),
      recentJoins: recentMembers.map((m) => ({
        userId: m.user.id,
        name: m.user.name,
        joinedAt: m.createdAt,
      })),
      missingInfo: {
        missingAddress: membersWithoutAddress,
        missingEmergencyContact: membersWithoutEmergency,
        missingPhone: membersWithoutPhone,
      },
    };
    return {
      success: true,
      data: statistics,
    };
  } catch (error: any) {
    console.error('Error fetching member statistics:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch member statistics',
    };
  }
}

// ============================================
// ADMIN REMOVE MEMBER FROM ORGANIZATION
// ============================================

export async function adminRemoveMemberFromOrganization(
  organizationId: string,
  userId: string
): Promise<AdminServerActionResponse> {
  try {
    // Verify session
    const session = await getServerSession();
    if (!session?.user) {
      throw new Error('Unauthorized');
    }
    // Check permission
    const hasPermission = await prisma.member.findFirst({
      where: {
        organizationId,
        userId: session.user.id,
      },
    });
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { globalRole: true },
    });
    const canRemove = currentUser?.globalRole === 'SUPER_ADMIN';
    if (!(hasPermission || canRemove)) {
      return {
        success: false,
        error: 'You do not have permission to remove members',
      };
    }
    // Don't allow removing OWNER
    const memberToRemove = await prisma.user.findUnique({
      where: { id: userId },
      select: { globalRole: true },
    });
    if (memberToRemove?.globalRole?.includes('OWNER')) {
      return {
        success: false,
        error: 'Cannot remove organization owner',
      };
    }
    // Remove member
    await prisma.$transaction(
      async (tx) => {
        // Remove from all teams
        await tx.teamMember.deleteMany({
          where: { userId },
        });
        // Remove member record
        await tx.member.deleteMany({
          where: {
            userId,
            organizationId,
          },
        });
      },
      {
        maxWait: 10_000,
        timeout: 10_000,
      }
    );
    revalidatePath(`/church/users/${organizationId}/members`);
    revalidatePath(`/church/users/${organizationId}/members`);
    return {
      success: true,
      message: 'Member removed successfully',
    };
  } catch (error: any) {
    console.error('Error removing member:', error);
    return {
      success: false,
      error: error.message || 'Failed to remove member',
    };
  }
}

// ============================================
// ADMIN UPDATE MEMBER ROLE
// ============================================

export async function adminUpdateMemberRole(
  organizationId: string,
  userId: string,
  newRole: OrganizationRole
): Promise<AdminServerActionResponse> {
  try {
    // Verify session
    const session = await getServerSession();
    if (!session?.user) {
      throw new Error('Unauthorized');
    }
    // Check permission
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { globalRole: true },
    });
    const canUpdate = currentUser?.globalRole === 'SUPER_ADMIN';
    if (!canUpdate) {
      return {
        success: false,
        error: 'Only owners can change member roles',
      };
    }
    // Update role
    await prisma.member.update({
      where: { id: userId },
      data: {
        role: [newRole],
        updatedBy: session.user.id,
      },
    });
    revalidatePath(`/superadmin/churches/${organizationId}/members`);
    return {
      success: true,
      message: 'Member role updated successfully',
    };
  } catch (error: any) {
    console.error('Error updating member role:', error);
    return {
      success: false,
      error: error.message || 'Failed to update member role',
    };
  }
}
