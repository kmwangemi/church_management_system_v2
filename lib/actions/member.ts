import { organization } from 'better-auth/plugins';
'use server';

import { auth, type IMemberWithUser } from '@/lib/auth';
import { getServerSession } from '@/lib/get-session';
import prisma from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

export interface GetMembersParams {
  organizationId: string;
  page?: number;
  pageSize?: number;
  search?: string;
  role?: string;
  status?: string;
  branchId?: string;
  sortBy?: 'name' | 'createdAt' | 'role';
  sortOrder?: 'asc' | 'desc';
}

export interface GetMembersResponse {
  members: IMemberWithUser[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export async function getOrganizationMembers(
  params: GetMembersParams
): Promise<GetMembersResponse> {
  const session = await getServerSession();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }
  const {
    organizationId,
    page = 1,
    pageSize = 10,
    search = '',
    role,
    status,
    branchId,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = params;
  // Build where clause
  const where: Prisma.MemberWhereInput = {
    organizationId,
  };
  // Add role filter
  if (role && role !== 'all') {
    where.role = role;
  }
  // Add branch filter
  if (branchId && branchId !== 'all') {
    where.branchId = branchId;
  }
  // Add search filter (search across user fields)
  if (search) {
    where.user = {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phoneNumber: { contains: search, mode: 'insensitive' } },
      ],
    };
  }
  // Add status filter (from user)
  if (status && status !== 'all') {
    where.user = {
      ...where.user,
      status,
    };
  }
  // Build orderBy clause
  let orderBy: Prisma.MemberOrderByWithRelationInput = {};
  switch (sortBy) {
    case 'name':
      orderBy = { user: { name: sortOrder } };
      break;
    case 'role':
      orderBy = { role: sortOrder };
      break;
    default:
      orderBy = { createdAt: sortOrder };
      break;
  }
  // Calculate pagination
  const skip = (page - 1) * pageSize;
  // Execute queries in parallel
  const [members, total] = await Promise.all([
    prisma.member.findMany({
      where,
      include: {
        user: {
          include: {
            address: true,
            emergencyContact: true,
            memberDetails: true,
            pastorDetails: true,
            bishopDetails: true,
            staffDetails: true,
            volunteerDetails: true,
            adminDetails: true,
            visitorDetails: true,
          },
        },
        branch: true,
      },
      orderBy,
      skip,
      take: pageSize,
    }),
    prisma.member.count({ where }),
  ]);
  const totalPages = Math.ceil(total / pageSize);
  return {
    members,
    pagination: {
      total,
      page,
      pageSize,
      totalPages,
      hasMore: page < totalPages,
    },
  };
}

export async function getMemberById(memberId: string) {
  const session = await getServerSession();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }
  const member = await prisma.member.findUnique({
    where: { id: memberId },
    include: {
      user: {
        include: {
          address: true,
          emergencyContact: true,
          memberDetails: true,
          pastorDetails: true,
          bishopDetails: true,
          staffDetails: true,
          volunteerDetails: true,
          adminDetails: true,
          visitorDetails: true,
          // Include other relations as needed
          departmentMemberships: {
            include: {
              department: true,
            },
          },
          groupMemberships: {
            include: {
              group: true,
            },
          },
        },
      },
      branch: true,
      organization: true,
    },
  });
  return member;
}

export async function addMember(
  organizationId: string,
  userId: string,
  role: 'VISITOR' | 'OWNER' | 'ADMIN' | 'MEMBER' | 'PASTOR' | 'BISHOP'
) {
  const session = await getServerSession();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }
  try {
    await auth.api.addMember({
      body: {
        userId,
        role,
        organizationId,
        // teamId: 'team-id',
      },
    });
  } catch (_error) {
    throw new Error('Failed to add new organization member');
  }
}
