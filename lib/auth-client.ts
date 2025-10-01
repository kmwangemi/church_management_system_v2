import { organizationClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  baseURL: 'http://localhost:3000',
  plugins: [organizationClient()],
});

// ✅ CORRECT - Destructure from the SAME client
export const {
  signIn,
  signUp,
  signOut,
  useSession,
  // Organization-specific methods
  organization,
} = authClient;
