/** biome-ignore-all lint/suspicious/useAwait: ignore */
import {
  ac,
  admin,
  member,
  owner,
  staff,
  visitor,
  volunteer,
} from '@/lib/auth/permissions';
import { logger } from '@/lib/logger';
import prisma from '@/lib/prisma';
import { passwordSchema } from '@/lib/validations/auth';
import bcrypt from 'bcryptjs';
import { APIError, betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { nextCookies } from 'better-auth/next-js';
import { createAuthMiddleware, organization } from 'better-auth/plugins';

export const auth = betterAuth({
  appName: 'Church Management System',
  // trustedOrigins: ['http://localhost:3000', 'https://example.com'],
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
    password: {
      hash: async (password) => {
        return await bcrypt.hash(password, 10);
      },
      verify: async ({ hash, password }) => {
        return await bcrypt.compare(password, hash);
      },
    },
  },
  // socialProviders: {
  //   github: {
  //     clientId: process.env.GITHUB_CLIENT_ID as string,
  //     clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
  //   },
  // },
  user: {
    additionalFields: {
      phoneNumber: {
        type: 'string',
        required: false,
      },
      dateOfBirth: {
        type: 'date',
        required: false,
      },
      gender: {
        type: 'string',
        required: false,
      },
      occupation: {
        type: 'string',
        required: false,
      },
      maritalStatus: {
        type: 'string',
        required: false,
      },
      skills: {
        type: 'string[]',
        required: false,
      },
      notes: {
        type: 'string',
        required: false,
      },
      position: {
        type: 'string',
        required: false,
      },
      globalRole: {
        type: 'string',
        required: false,
        defaultValue: 'USER',
        input: false,
      },
      organizationRoles: {
        type: 'string[]',
        required: false,
        input: false,
      },
      status: {
        type: 'string',
        required: false,
        defaultValue: 'ACTIVE',
        input: false,
      },
      lastLogin: {
        type: 'date',
        required: false,
        input: false,
      },
      isPasswordUpdated: {
        type: 'boolean',
        required: false,
        defaultValue: false,
      },
      agreeToTerms: {
        type: 'boolean',
        required: false,
        defaultValue: true,
      },
      isDeleted: {
        type: 'boolean',
        required: false,
        defaultValue: false,
        input: false,
      },
      createdBy: {
        type: 'string',
        required: false,
        input: false,
      },
      updatedBy: {
        type: 'string',
        required: false,
        input: false,
      },
    },
  },
  // Better Auth Logging Integration
  logger: {
    // Custom logger that integrates with your logging system
    log: async (level, message, data) => {
      const context = {
        ...data,
        context: 'authentication',
      };
      // Use custom logger for all levels and ensure at least one await
      switch (level) {
        case 'error':
          await logger.error(`[Better Auth] ${message}`, context, 'SERVER');
          break;
        case 'warn':
          await logger.warn(`[Better Auth] ${message}`, context, 'SERVER');
          break;
        case 'info':
          await logger.info(`[Better Auth] ${message}`, context, 'SERVER');
          break;
        case 'debug':
          await logger.debug(`[Better Auth] ${message}`, context, 'SERVER');
          break;
        default:
          await logger.info(`[Better Auth] ${message}`, context, 'SERVER');
          break;
      }
    },
  },
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (
        ctx.path === '/sign-up/email' ||
        ctx.path === '/reset-password' ||
        ctx.path === '/change-password'
      ) {
        const password = ctx.body.password || ctx.body.newPassword;
        const { error } = passwordSchema.safeParse(password);
        if (error) {
          throw new APIError('BAD_REQUEST', {
            message: 'Password not strong enough',
          });
        }
      }
    }),
    after: createAuthMiddleware(async (ctx) => {
      const path = ctx.path;
      const request = ctx.request;
      const ip = request?.headers?.get('x-forwarded-for') || 'unknown';
      const userAgent = request?.headers?.get('user-agent') || 'unknown';
      // Helper to get user's organizationId
      const getUserOrganizationId = async (
        userId: string
      ): Promise<string | undefined> => {
        try {
          const member = await prisma.member.findFirst({
            where: { userId },
            select: { organizationId: true },
          });
          return member?.organizationId;
        } catch (error) {
          // biome-ignore lint/suspicious/noConsole: ignore console
          console.error('Error fetching user organization:', error);
          return;
        }
      };
      // Log sign-in events
      if (path.startsWith('/sign-in')) {
        const newSession = ctx.context.newSession;
        if (newSession) {
          const organizationId = await getUserOrganizationId(
            newSession.user.id
          );
          await logger.info(
            'User signed in successfully',
            {
              userId: newSession.user.id,
              email: newSession.user.email,
              sessionId: newSession.session.id,
              ip,
              userAgent,
            },
            'SERVER',
            newSession.user.id,
            organizationId
          );
        }
      }
      // Log sign-up events
      if (path.startsWith('/sign-up')) {
        const newSession = ctx.context.newSession;
        if (newSession) {
          const organizationId = await getUserOrganizationId(
            newSession.user.id
          );
          await logger.info(
            'New user registered',
            {
              userId: newSession.user.id,
              email: newSession.user.email,
              name: newSession.user.name,
              ip,
              userAgent,
            },
            'SERVER',
            newSession.user.id,
            organizationId
          );
        }
      }
      // Log sign-out events
      if (path.startsWith('/sign-out')) {
        const session = ctx.context.session;
        if (session) {
          const organizationId = await getUserOrganizationId(session.user.id);
          await logger.info(
            'User signed out',
            {
              userId: session.user.id,
              sessionId: session.session.id,
            },
            'SERVER',
            session.user.id,
            organizationId
          );
        }
      }
      // Log password reset events
      if (path.startsWith('/reset-password')) {
        const body = ctx.body as any;
        if (body?.email) {
          // For password reset, we might not have userId yet
          await logger.info(
            'Password reset requested',
            {
              email: body.email,
              ip,
              userAgent,
            },
            'SERVER'
          );
        }
      }
      // Log email verification events
      if (path.startsWith('/verify-email')) {
        const newSession = ctx.context.newSession;
        if (newSession) {
          const organizationId = await getUserOrganizationId(
            newSession.user.id
          );
          await logger.info(
            'Email verified',
            {
              userId: newSession.user.id,
              email: newSession.user.email,
            },
            'SERVER',
            newSession.user.id,
            organizationId
          );
        }
      }
      // Log forgot password events
      if (path.startsWith('/forget-password')) {
        const body = ctx.body as any;
        if (body?.email) {
          await logger.info(
            'Forgot password request',
            {
              email: body.email,
              ip,
              userAgent,
            },
            'SERVER'
          );
        }
      }
      // Log session refresh events
      if (path.startsWith('/refresh-session')) {
        const newSession = ctx.context.newSession;
        if (newSession) {
          const organizationId = await getUserOrganizationId(
            newSession.user.id
          );
          await logger.debug(
            'Session refreshed',
            {
              userId: newSession.user.id,
              sessionId: newSession.session.id,
            },
            'SERVER',
            newSession.user.id,
            organizationId
          );
        }
      }
    }),
    // Log failed authentication attempts
    onError: async (ctx: {
      error: unknown;
      context?: {
        path?: string;
        request?: {
          method?: string;
          headers?: {
            get: (name: string) => string | undefined;
          };
        };
      };
    }) => {
      const context = ctx.context;
      const path = context?.path;
      const method = context?.request?.method;
      const ip = context?.request?.headers?.get('x-forwarded-for') || 'unknown';
      const userAgent =
        context?.request?.headers?.get('user-agent') || 'unknown';
      // Use custom logger for error reporting
      await logger.error(
        'Authentication error occurred',
        {
          error: ctx.error,
          path,
          method,
          ip,
          userAgent,
        },
        'SERVER'
      );
    },
  },
  // Add database hooks to set active organization on session creation
  databaseHooks: {
    session: {
      create: {
        before: async (session) => {
          // Find user's first organization
          const membership = await prisma.member.findFirst({
            where: { userId: session.userId },
            orderBy: { createdAt: 'asc' },
            select: { organizationId: true },
          });
          // Set active organization if found
          if (membership?.organizationId) {
            return {
              data: {
                ...session,
                activeOrganizationId: membership.organizationId,
              },
            };
          }
          return { data: session };
        },
      },
    },
  },
  plugins: [
    organization({
      schema: {
        organization: {
          additionalFields: {
            denomination: {
              type: 'string',
              required: false,
            },
            email: {
              type: 'string',
              required: false,
            },
            phoneNumber: {
              type: 'string',
              required: false,
            },
            website: {
              type: 'string',
              required: false,
            },
            establishedDate: {
              type: 'date',
              required: false,
            },
            churchSize: {
              type: 'string',
              required: false,
            },
            numberOfBranches: {
              type: 'number',
              required: false,
            },
            description: {
              type: 'string',
              required: false,
            },
            status: {
              type: 'string',
              required: false,
              defaultValue: 'ACTIVE',
              input: false,
            },
            isSuspended: {
              type: 'boolean',
              required: false,
              defaultValue: false,
              input: false,
            },
            isDeleted: {
              type: 'boolean',
              required: false,
              defaultValue: false,
              input: false,
            },
            createdAt: {
              type: 'date',
              required: false,
              input: false,
            },
            updatedAt: {
              type: 'date',
              required: false,
              input: false,
            },
          },
        },
        member: {
          additionalFields: {
            // Add custom fields to the member table
            position: {
              type: 'string',
              input: true,
              required: false,
            },
          },
        },
        team: {
          additionalFields: {
            // Add custom fields to the team table
            description: {
              type: 'string',
              input: true,
              required: false,
            },
          },
        },
      },
      // Enable teams for departmental management within the church
      teams: {
        enabled: true,
        maximumTeams: 1000, // Optional: limit teams per organization
        allowRemovingAllTeams: false, // Optional: prevent removing the last team
      },
      ac,
      roles: {
        OWNER: owner,
        ADMIN: admin,
        MEMBER: member,
        VOLUNTEER: volunteer,
        VISITOR: visitor,
        STAFF: staff,
      },
      // allowUserToCreateOrganization: async (user) => {
      //   return user.role === 'SUPER_ADMIN';
      // },
      creatorRole: 'OWNER',
      membershipLimit: 10_000,
      invitationExpiresIn: 60 * 60 * 48,
      cancelPendingInvitationsOnReInvite: true,
      invitationLimit: 100,
      organizationHooks: {
        // Organization creation hooks
        // beforeCreateOrganization: async ({ organization, user }) => {
        //   // Run custom logic before organization is created
        //   // Optionally modify the organization data
        //   return {
        //     data: {
        //       ...organization,
        //       // metadata: {
        //       //   customField: 'value',
        //       // },
        //     },
        //   };
        // },
        // afterCreateOrganization: async ({ organization }) => {
        //   // Run custom logic after organization is created
        //   // e.g., create default resources, send notifications
        //   try {
        //     // Create organization default resources
        //     await createOrganizationResources({ organization });
        //   } catch (_error) {
        //     throw new Error('Failed to create organization resources');
        //     // Log the error but don't throw - organization was already created
        //     // You could also choose to throw here to rollback the organization creation
        //   }
        // },
        // Organization update hooks
        // beforeUpdateOrganization: async ({ organization, user, member }) => {
        //   // Validate updates, apply business rules
        //   return {
        //     data: {
        //       ...organization,
        //       name: organization.name?.toLowerCase(),
        //     },
        //   };
        // },
        // afterUpdateOrganization: async ({ organization, user, member }) => {
        //   // Sync changes to external systems
        //   await syncOrganizationToExternalSystems(organization);
        // },
        // Before a member is added to an organization
        // beforeAddMember: async ({ member, user, organization }) => {
        //   // Custom validation or modification
        //   console.log(`Adding ${user.email} to ${organization.name}`);
        //   // Optionally modify member data
        //   return {
        //     data: {
        //       ...member,
        //       role: 'custom-role', // Override the role
        //     },
        //   };
        // },
        // After a member is added
        // afterAddMember: async ({ member, user, organization }) => {
        //   // Send welcome email, create default resources, etc.
        //   await sendWelcomeEmail(user.email, organization.name);
        // },
        // Before a member is removed
        // beforeRemoveMember: async ({ member, user, organization }) => {
        //   // Cleanup user's resources, send notification, etc.
        //   await cleanupUserResources(user.id, organization.id);
        // },
        // After a member is removed
        // afterRemoveMember: async ({ member, user, organization }) => {
        //   await logMemberRemoval(user.id, organization.id);
        // },
        // Before updating a member's role
        // beforeUpdateMemberRole: async ({
        //   member,
        //   newRole,
        //   user,
        //   organization,
        // }) => {
        //   // Validate role change permissions
        //   if (newRole === 'owner' && !hasOwnerUpgradePermission(user)) {
        //     throw new Error('Cannot upgrade to owner role');
        //   }
        //   // Optionally modify the role
        //   return {
        //     data: {
        //       role: newRole,
        //     },
        //   };
        // },
        // After updating a member's role
        // afterUpdateMemberRole: async ({
        //   member,
        //   previousRole,
        //   user,
        //   organization,
        // }) => {
        //   await logRoleChange(user.id, previousRole, member.role);
        // },
        // Before creating a team
        // beforeCreateTeam: async ({ team, user, organization }) => {
        //   // Validate team name, apply naming conventions
        //   return {
        //     data: {
        //       ...team,
        //       name: team.name.toLowerCase().replace(/\s+/g, '-'),
        //     },
        //   };
        // },
        // After creating a team
        // afterCreateTeam: async ({ team, user, organization }) => {
        //   // Create default team resources, channels, etc.
        //   await createDefaultTeamResources(team.id);
        // },
        // Before updating a team
        // beforeUpdateTeam: async ({ team, updates, user, organization }) => {
        //   // Validate updates, apply business rules
        //   return {
        //     data: {
        //       ...updates,
        //       name: updates.name?.toLowerCase(),
        //     },
        //   };
        // },
        // After updating a team
        // afterUpdateTeam: async ({ team, user, organization }) => {
        //   await syncTeamChangesToExternalSystems(team);
        // },
        // Before deleting a team
        // beforeDeleteTeam: async ({ team, user, organization }) => {
        //   // Backup team data, notify members
        //   await backupTeamData(team.id);
        // },
        // After deleting a team
        // afterDeleteTeam: async ({ team, user, organization }) => {
        //   await cleanupTeamResources(team.id);
        // },
        // Team member operations
        // beforeAddTeamMember: async ({
        //   teamMember,
        //   team,
        //   user,
        //   organization,
        // }) => {
        //   // Validate team membership limits, permissions
        //   const memberCount = await getTeamMemberCount(team.id);
        //   if (memberCount >= 10) {
        //     throw new Error('Team is full');
        //   }
        // },
        // afterAddTeamMember: async ({
        //   teamMember,
        //   team,
        //   user,
        //   organization,
        // }) => {
        //   await grantTeamAccess(user.id, team.id);
        // },
        // beforeRemoveTeamMember: async ({
        //   teamMember,
        //   team,
        //   user,
        //   organization,
        // }) => {
        //   // Backup user's team-specific data
        //   await backupTeamMemberData(user.id, team.id);
        // },
        // afterRemoveTeamMember: async ({
        //   teamMember,
        //   team,
        //   user,
        //   organization,
        // }) => {
        //   await revokeTeamAccess(user.id, team.id);
        // },
      },
      disableOrganizationDeletion: false, // enable organization deletion
      // Invitation settings
      // sendInvitationEmail: async (data) => {
      //   const { email, organization, inviter, invitationId } = data;
      //   const invitationUrl = `${process.env.APP_URL}/invite/${invitationId}`;
      //   await sendEmail({
      //     to: email,
      //     subject: `You're invited to join ${organization.name}`,
      //     html: `
      //       <h2>Church Invitation</h2>
      //       <p>${inviter.name} has invited you to join ${organization.name}.</p>
      //       <p>Click the link below to accept the invitation:</p>
      //       <a href="${invitationUrl}">Accept Invitation</a>
      //       <p>This invitation will expire in 48 hours.</p>
      //     `,
      //   });
      // },

      // ✅ FIXED: Correct hook names
    }),
    nextCookies(),
  ],
});

export type ISession = typeof auth.$Infer.Session;
export type IUser = typeof auth.$Infer.Session.user;
export type IOrganization = typeof auth.$Infer.Organization;
export type IMember = typeof auth.$Infer.Member;
export type IInvitation = typeof auth.$Infer.Invitation;

// ============================================
// EXTENDED ORGANIZATION TYPES WITH METADATA
// ============================================

export interface IOrganizationMetadata {
  // Church-specific fields
  denomination?: string;
  email?: string;
  phoneNumber?: string;
  website?: string;
  establishedDate?: string; // ISO date string
  churchSize?: string;
  numberOfBranches?: number;
  description?: string;
  isSuspended?: boolean;
  isDeleted?: boolean;
  status?: 'ACTIVE' | 'PENDING' | 'INACTIVE' | 'SUSPENDED';
  // Subscription
  subscriptionPlan?: 'BASIC' | 'MINISTRY' | 'CATHEDRAL' | 'CUSTOM';
  // Address (if storing in metadata instead of separate table)
  address?: {
    street: string;
    city: string;
    state?: string;
    zipCode?: string;
    country: string;
  };
  // Timestamps
  createdAt?: string;
  updatedAt?: string;
}

// Create a typed version with your metadata
export interface IOrganizationWithMetadata
  extends Omit<IOrganization, 'metadata'> {
  metadata?: IOrganizationMetadata;
}

// ============================================
// MEMBER TYPES WITH USER DETAILS
// ============================================

export interface IMemberWithUser extends Omit<IMember, 'user'> {
  user: IUser;
  branch?: {
    id: string;
    branchName: string;
  };
}
