import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Create department as a team
 */
export async function createDepartment(data: {
  name: string;
  description?: string;
  churchId: string;
  organizationId: string;
}) {
  // Create as organization team
  const team = await prisma.team.create({
    data: {
      name: data.name,
      organizationId: data.organizationId,
    },
  });
  // Create department record
  const department = await prisma.department.create({
    data: {
      name: data.name,
      description: data.description,
      churchId: data.churchId,
    },
  });
  return { team, department };
}

/**
 * Add member to department
 */
export async function addMemberToDepartment(
  userId: string,
  teamId: string,
  organizationId: string
) {
  // Get user's member record
  const member = await prisma.member.findFirst({
    where: {
      userId,
      organizationId,
    },
  });
  if (!member) {
    throw new Error('User is not a member of this organization');
  }
  // Add to team
  return await prisma.teamMember.create({
    data: {
      teamId,
      userId,
      memberId: member.id,
    },
  });
}

/**
 * Get department members
 */
export async function getDepartmentMembers(teamId: string) {
  const teamMembers = await prisma.teamMember.findMany({
    where: { teamId },
    include: {
      member: {
        include: {
          user: {
            include: {
              memberDetails: true,
              pastorDetails: true,
              bishopDetails: true,
            },
          },
        },
      },
    },
  });
  return teamMembers.map((tm) => tm.member.user);
}
