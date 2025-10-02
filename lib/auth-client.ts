import { organizationClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';
import {
  ac,
  owner,
  admin,
  member,
  pastor,
  visitor,
  bishop,
} from './auth/permissions';

export const authClient = createAuthClient({
  baseURL: 'http://localhost:3000',
  plugins: [
    organizationClient({
      ac,
      roles: {
        owner,
        admin,
        member,
        pastor,
        visitor,
        bishop,
      },
    }),
  ],
});

// Export commonly used methods
export const {
  signIn,
  signUp,
  signOut,
  useSession,
  organization,
  useActiveOrganization,
} = authClient;

// Type inference helper
export type Session = typeof authClient.$Infer.Session;
