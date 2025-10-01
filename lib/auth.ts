import prisma from '@/lib/prisma';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { organization } from 'better-auth/plugins';

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
  plugins: [
    organization({
      
      // Organization additional fields
      organizationFields: {
        denomination: {
          type: 'string',
          required: true,
        },
        email: {
          type: 'string',
          required: true,
        },
        phoneNumber: {
          type: 'string',
          required: true,
        },
        website: {
          type: 'string',
          required: false,
        },
        establishedDate: {
          type: 'date',
          required: true,
        },
        churchSize: {
          type: 'string',
          required: true,
        },
        numberOfBranches: {
          type: 'number',
          required: false,
          defaultValue: 1,
        },
        description: {
          type: 'string',
          required: false,
        },
        isSuspended: {
          type: 'boolean',
          required: false,
          defaultValue: false,
        },
        isDeleted: {
          type: 'boolean',
          required: false,
          defaultValue: false,
        },
        createdBy: {
          type: 'string',
          required: true,
        },
      },
      // Member additional fields
      memberFields: {
        branchId: {
          type: 'string',
          required: false,
        },
      },
    }),
  ],
});