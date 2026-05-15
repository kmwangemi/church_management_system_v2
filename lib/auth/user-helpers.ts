import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Generate role-specific ID
 */
export async function generateRoleId(
  role: string,
  churchId: string
): Promise<string> {
  const prefix =
    {
      member: 'MEM',
      pastor: 'PST',
      bishop: 'BSH',
      admin: 'ADM',
      visitor: 'VIS',
      staff: 'STF',
      volunteer: 'VOL',
    }[role.toLowerCase()] || 'USR';
  // Count existing users of this role in this church
  const count = await prisma.user.count({
    where: {
      churchId,
      isDeleted: false,
    },
  });
  return `${prefix}-${String(count + 1).padStart(4, '0')}`;
}

/**
 * Create member with role-specific details
 */
export async function createMemberWithDetails(data: {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  gender: 'male' | 'female';
  role: 'member' | 'pastor' | 'bishop' | 'visitor';
  churchId: string;
  branchId: string;
  organizationId: string;
  createdBy: string;
  occupation?: string;
  dateOfBirth?: Date;
  // Role-specific data
  memberData?: {
    baptismDate?: Date;
    joinedDate?: Date;
  };
  pastorData?: {
    ordinationDate?: Date;
    qualifications?: string[];
    specializations?: string[];
  };
  bishopData?: {
    appointmentDate?: Date;
    jurisdictionArea?: string;
    qualifications?: string[];
  };
}) {
  // Create user
  const user = await prisma.user.create({
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phoneNumber: data.phoneNumber,
      gender: data.gender,
      occupation: data.occupation,
      dateOfBirth: data.dateOfBirth,
      churchId: data.churchId,
      branchId: data.branchId,
      isMember: data.role !== 'visitor',
      status: 'active',
      name: `${data.firstName} ${data.lastName}`,
      emailVerified: false,
      createdBy: data.createdBy,
      updatedBy: data.createdBy,
    },
  });
  // Add to organization
  await prisma.member.create({
    data: {
      userId: user.id,
      organizationId: data.organizationId,
      role: data.role,
    },
  });
  // Create role-specific details
  const roleId = await generateRoleId(data.role, data.churchId);
  if (data.role === 'member') {
    await prisma.memberDetails.create({
      data: {
        userId: user.id,
        memberId: roleId,
        membershipStatus: 'active',
        occupation: data.occupation,
        baptismDate: data.memberData?.baptismDate,
        joinedDate: data.memberData?.joinedDate || new Date(),
      },
    });
  } else if (data.role === 'pastor') {
    await prisma.pastorDetails.create({
      data: {
        userId: user.id,
        pastorId: roleId,
        ordinationDate: data.pastorData?.ordinationDate,
        qualifications: data.pastorData?.qualifications || [],
        specializations: data.pastorData?.specializations || [],
      },
    });
  } else if (data.role === 'bishop') {
    await prisma.bishopDetails.create({
      data: {
        userId: user.id,
        bishopId: roleId,
        appointmentDate: data.bishopData?.appointmentDate,
        jurisdictionArea: data.bishopData?.jurisdictionArea,
        qualifications: data.bishopData?.qualifications || [],
        achievements: [],
      },
    });
  } else if (data.role === 'visitor') {
    await prisma.visitorDetails.create({
      data: {
        userId: user.id,
        visitorId: roleId,
        followUpStatus: 'pending',
        interestedInMembership: false,
        servicesAttended: [],
      },
    });
  }
  return user;
}

/**
 * Get user with all details
 */
export async function getUserWithDetails(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      memberDetails: true,
      pastorDetails: {
        include: {
          assignments: true,
        },
      },
      bishopDetails: true,
      staffDetails: true,
      volunteerDetails: {
        include: {
          roles: true,
        },
      },
      visitorDetails: true,
      church: true,
      branch: true,
      members: {
        include: {
          organization: true,
        },
      },
    },
  });
  return user;
}

/**
 * Convert visitor to member
 */
export async function convertVisitorToMember(
  userId: string,
  data: {
    baptismDate?: Date;
    occupation?: string;
  }
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { visitorDetails: true, members: true },
  });
  if (!user) {
    throw new Error('User not found');
  }
  if (user.isMember) {
    throw new Error('User is already a member');
  }
  // Update user
  await prisma.user.update({
    where: { id: userId },
    data: {
      isMember: true,
      occupation: data.occupation,
    },
  });
  // Update organization member role
  if (user.members[0]) {
    await prisma.member.update({
      where: { id: user.members[0].id },
      data: { role: 'member' },
    });
  }
  // Create member details
  const memberId = await generateRoleId('member', user.churchId!);
  await prisma.memberDetails.create({
    data: {
      userId: user.id,
      memberId,
      membershipStatus: 'active',
      occupation: data.occupation,
      baptismDate: data.baptismDate,
      joinedDate: new Date(),
    },
  });
  // Delete visitor details
  if (user.visitorDetails) {
    await prisma.visitorDetails.delete({
      where: { id: user.visitorDetails.id },
    });
  }
  return await getUserWithDetails(userId);
}
