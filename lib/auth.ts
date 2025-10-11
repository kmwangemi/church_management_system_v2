/** biome-ignore-all lint/suspicious/useAwait: ignore */
import type { OrganizationPlan } from '@/generated/prisma';
import {
  ac,
  admin,
  bishop,
  member,
  owner,
  pastor,
  visitor,
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
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
  },
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
        type: 'string',
        required: false,
        returned: true,
      },
      notes: {
        type: 'string',
        required: false,
      },
      role: {
        type: 'string',
        required: false,
        defaultValue: 'VISITOR',
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
      isMember: {
        type: 'boolean',
        required: false,
        defaultValue: false,
      },
      isStaff: {
        type: 'boolean',
        required: false,
        defaultValue: false,
      },
      isVolunteer: {
        type: 'boolean',
        required: false,
        defaultValue: false,
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
        PASTOR: pastor,
        VISITOR: visitor,
        BISHOP: bishop,
      },
      allowUserToCreateOrganization: async (user) => {
        return user.role === 'SUPER_ADMIN';
      },
      creatorRole: 'OWNER',
      membershipLimit: 10_000,
      invitationExpiresIn: 60 * 60 * 48,
      cancelPendingInvitationsOnReInvite: true,
      invitationLimit: 100,
      organizationDeletion: {
        disabled: false,
      },
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
      organizationCreation: {
        beforeCreate: async ({ organization, user }) => {
          return {
            data: {
              ...organization,
            },
          };
        },
        afterCreate: async ({ organization, member, user }) => {
          try {
            // Extract metadata
            const metadata = organization.metadata as IOrganizationMetadata;
            const plan = metadata?.subscriptionPlan || 'BASIC';
            // Calculate trial end date
            const trialEnd = new Date();
            trialEnd.setDate(trialEnd.getDate() + 30);
            // Create subscription
            await prisma.organizationSubscription.create({
              data: {
                organizationId: organization.id,
                plan: plan.toUpperCase() as OrganizationPlan,
                status: 'TRIAL',
                startDate: new Date(),
                endDate: trialEnd,
                isActive: true,
                nextBillingDate: trialEnd,
              },
            });
          } catch (_error) {
            throw new Error('Failed to create default subscription or team');
            // Log the error but don't throw - organization was already created
            // You could also choose to throw here to rollback the organization creation
          }
        },
      },
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
