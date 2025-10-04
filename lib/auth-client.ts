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
        OWNER: owner,
        ADMIN: admin,
        MEMBER: member,
        PASTOR: pastor,
        VISITOR: visitor,
        BISHOP: bishop,
      },
    }),
    nextCookies(),
  ],
});
