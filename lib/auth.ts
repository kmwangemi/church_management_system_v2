/** biome-ignore-all lint/suspicious/useAwait: ignore */
import type { ChurchPlan } from '@/generated/prisma';
import {
  ac,
  admin,
  bishop,
  member,
  owner,
  pastor,
  visitor,
} from '@/lib/auth/permissions';
import prisma from '@/lib/prisma';
import { passwordSchema } from '@/lib/validations/auth';
import bcrypt from 'bcryptjs';
import { APIError, betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { nextCookies } from 'better-auth/next-js';
import { createAuthMiddleware, organization } from 'better-auth/plugins';

export const auth = betterAuth({
  appName: 'Church Management System',
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
            await prisma.churchSubscription.create({
              data: {
                churchId: organization.id,
                plan: plan.toUpperCase() as ChurchPlan,
                status: 'TRIAL',
                startDate: new Date(),
                endDate: trialEnd,
                isActive: true,
                nextBillingDate: trialEnd,
              },
            });
            await prisma.team.create({
              data: {
                name: 'Main Branch',
                organizationId: organization.id,
                establishedDate: new Date(),
                capacity: 500,
                isActive: true,
                // address: {
                //   street: '',
                //   city: '',
                //   state: '',
                //   zipCode: '',
                //   country: 'Kenya',
                // },
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
