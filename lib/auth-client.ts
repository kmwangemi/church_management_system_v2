import {
  inferAdditionalFields,
  inferOrgAdditionalFields,
  organizationClient,
} from 'better-auth/client/plugins';
import { nextCookies } from 'better-auth/next-js';
import { createAuthClient } from 'better-auth/react';
import type { auth } from '@/lib/auth';
import {
  ac,
  admin,
  staff,
  member,
  owner,
  volunteer,
  visitor,
} from './auth/permissions';

export const authClient = createAuthClient({
  appName: 'Church Management System',
  baseURL: 'http://localhost:3000',
  plugins: [
    inferAdditionalFields<typeof auth>(),
    organizationClient({
      schema: inferOrgAdditionalFields<typeof auth>(),
      teams: {
        enabled: true,
      },
      ac,
      roles: {
        OWNER: owner,
        ADMIN: admin,
        MEMBER: member,
        VOvolunteer: volunteer,
        VISITOR: visitor,
        STAFF: staff,
      },
    }),
    nextCookies(),
  ],
});
