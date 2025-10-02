/** biome-ignore-all lint/suspicious/useAwait: <explanation> */
import prisma from '@/lib/prisma';
import { APIError, betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { nextCookies } from 'better-auth/next-js';
import { createAuthMiddleware, organization } from 'better-auth/plugins';
import {
  ac,
  owner,
  admin,
  member,
  pastor,
  visitor,
  bishop,
} from './auth/permissions';
import { passwordSchema } from './validations/auth';

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
    // requireEmailVerification: true, // Only if you want to block login completely
    // async sendResetPassword({ user, url }) {
    //   await sendEmail({
    //     to: user.email,
    //     subject: 'Reset your password',
    //     text: `Click the link to reset your password: ${url}`,
    //   });
    // },
  },
  // emailVerification: {
  //   sendOnSignUp: true,
  //   autoSignInAfterVerification: true,
  //   async sendVerificationEmail({ user, url }) {
  //     await sendEmail({
  //       to: user.email,
  //       subject: 'Verify your email',
  //       text: `Click the link to verify your email: ${url}`,
  //     });
  //   },
  // },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
  },
  user: {
    // changeEmail: {
    //   enabled: true,
    //   async sendChangeEmailVerification({ user, newEmail, url }) {
    //     await sendEmail({
    //       to: user.email,
    //       subject: 'Approve email change',
    //       text: `Your email has been changed to ${newEmail}. Click the link to approve the change: ${url}`,
    //     });
    //   },
    // },
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
        // required: false,
        defaultValue: 'VISITOR',
        input: false, // Don't allow users to set their own role
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
        owner,
        admin,
        member,
        pastor,
        visitor,
        bishop,
      },
      // Organization creation settings
      allowUserToCreateOrganization: async (user) => {
        // Only SUPER_ADMIN can create churches
        return user.role === 'SUPER_ADMIN';
      },

      creatorRole: 'owner', // Church creator gets owner role

      membershipLimit: 10_000, // Max members per church

      // Invitation settings
      sendInvitationEmail: async (data) => {
        const { email, organization, inviter, invitationId } = data;

        const invitationUrl = `${process.env.APP_URL}/invite/${invitationId}`;

        await sendEmail({
          to: email,
          subject: `You're invited to join ${organization.name}`,
          html: `
            <h2>Church Invitation</h2>
            <p>${inviter.name} has invited you to join ${organization.name}.</p>
            <p>Click the link below to accept the invitation:</p>
            <a href="${invitationUrl}">Accept Invitation</a>
            <p>This invitation will expire in 48 hours.</p>
          `,
        });
      },

      invitationExpiresIn: 60 * 60 * 48, // 48 hours
      cancelPendingInvitationsOnReInvite: true,
      invitationLimit: 100,

      // Organization deletion
      organizationDeletion: {
        enabled: true,
        requirePassword: true, // Require password for deletion
      },

      // Hooks
      beforeCreate: async ({ organization, user }) => {
        // Add validation or modifications before church creation
        return {
          data: {
            ...organization,
            // You can add computed fields here
          },
        };
      },

      afterCreate: async ({ organization, member, user }) => {
        // Post-creation actions (e.g., send welcome email, create default branch)
        console.log(`Church ${organization.name} created by ${user.name}`);

        // Create default main branch
        await prisma.branch.create({
          data: {
            branchName: 'Main Branch',
            churchId: organization.id,
            establishedDate: new Date(),
            capacity: 500,
            isActive: true,
          },
        });
      },
    }),
    nextCookies(),
  ],
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;