/** biome-ignore-all lint/suspicious/useAwait: ignore */
import prisma from '@/lib/prisma';
import type { IOrganizationMetadata } from '@/lib/types/index';
import { APIError, betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { nextCookies } from 'better-auth/next-js';
import { createAuthMiddleware, organization } from 'better-auth/plugins';
import {
  ac,
  admin,
  bishop,
  member,
  owner,
  pastor,
  visitor,
} from './auth/permissions';
import { passwordSchema } from './validations/auth';

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
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
  plugins: [
    organization({
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
        beforeCreate: async ({ organization, user }, request) => {
          return {
            data: {
              ...organization,
            },
          };
        },
        afterCreate: async ({ organization, member, user }, request) => {
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
                plan: plan.toUpperCase(),
                status: 'TRIAL',
                startDate: new Date(),
                endDate: trialEnd,
                isActive: true,
                nextBillingDate: trialEnd,
              },
            });
            await prisma.branch.create({
              data: {
                branchName: 'Main Branch',
                churchId: organization.id,
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
          } catch (error) {
            console.error('❌ Error in afterCreate hook:', error);
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
// export type IOrganization = typeof auth.$Infer.Organization;
export type IMember = typeof auth.$Infer.Member;
// export type IInvitation = typeof auth.$Infer.Invitation;
