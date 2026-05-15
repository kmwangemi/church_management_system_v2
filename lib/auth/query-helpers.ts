import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();


/**
 * Get all members of a church
 */
export async function getChurchMembers(
  churchId: string,
  options?: {
    role?: string;
    status?: string;
    limit?: number;
    offset?: number;
    search?: string;
  }
) {
  const where: any = {
    churchId,
    isDeleted: false,
  };
  if (options?.status) {
    where.status = options.status;
  }
  if (options?.search) {
    where.OR = [
      { firstName: { contains: options.search, mode: 'insensitive' } },
      { lastName: { contains: options.search, mode: 'insensitive' } },
      { email: { contains: options.search, mode: 'insensitive' } },
      { phoneNumber: { contains: options.search } },
    ];
  }
  const query: any = {
    where,
    include: {
      memberDetails: true,
      pastorDetails: true,
      bishopDetails: true,
      staffDetails: true,
      volunteerDetails: true,
      visitorDetails: true,
      branch: true,
      members: {
        include: {
          organization: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  };
  if (options?.limit) {
    query.take = options.limit;
  }
  if (options?.offset) {
    query.skip = options.offset;
  }
  const [users, total] = await Promise.all([
    prisma.user.findMany(query),
    prisma.user.count({ where }),
  ]);
  // Filter by role if specified
  let filteredUsers = users;
  if (options?.role) {
    filteredUsers = users.filter((user) =>
      user.members.some((member) => member.role === options.role)
    );
  }
  return {
    users: filteredUsers,
    total,
    hasMore: options?.offset ? total > options.offset + users.length : false,
  };
}

/**
 * Get church statistics
 */
export async function getChurchStats(churchId: string) {
  const [
    totalMembers,
    totalVisitors,
    totalPastors,
    totalStaff,
    totalVolunteers,
    activeMembers,
  ] = await Promise.all([
    prisma.user.count({
      where: { churchId, isMember: true, isDeleted: false },
    }),
    prisma.user.count({
      where: { churchId, isMember: false, isDeleted: false },
    }),
    prisma.member.count({
      where: {
        organization: { church: { id: churchId } },
        role: 'pastor',
      },
    }),
    prisma.user.count({
      where: { churchId, isStaff: true, isDeleted: false },
    }),
    prisma.user.count({
      where: { churchId, isVolunteer: true, isDeleted: false },
    }),
    prisma.user.count({
      where: { churchId, isMember: true, status: 'active', isDeleted: false },
    }),
  ]);
  return {
    totalMembers,
    totalVisitors,
    totalPastors,
    totalStaff,
    totalVolunteers,
    activeMembers,
    inactiveMembers: totalMembers - activeMembers,
  };
}

/**
 * Search users across church
 */
export async function searchUsers(churchId: string, query: string) {
  return await prisma.user.findMany({
    where: {
      churchId,
      isDeleted: false,
      OR: [
        { firstName: { contains: query, mode: 'insensitive' } },
        { lastName: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
        { phoneNumber: { contains: query } },
        { occupation: { contains: query, mode: 'insensitive' } },
      ],
    },
    include: {
      memberDetails: true,
      pastorDetails: true,
      bishopDetails: true,
      members: {
        include: {
          organization: true,
        },
      },
    },
    take: 50,
  });
}