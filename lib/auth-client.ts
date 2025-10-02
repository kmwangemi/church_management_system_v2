import {
  inferAdditionalFields,
  organizationClient,
} from 'better-auth/client/plugins';
import { nextCookies } from 'better-auth/next-js';
import { createAuthClient } from 'better-auth/react';
import type { auth } from './auth';
import {
  ac,
  admin,
  bishop,
  member,
  owner,
  pastor,
  visitor,
} from './auth/permissions';

export const authClient = createAuthClient({
  baseURL: 'http://localhost:3000',
  plugins: [
    inferAdditionalFields<typeof auth>(),
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
    nextCookies(),
  ],
});
