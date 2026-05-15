import { headers } from 'next/headers';
import { auth } from '../auth';

/**
 * Check if the current user has specific permissions
 */
export async function hasPermission(permission: Record<string, string[]>) {
  const result = await auth.api.hasPermission({
    body: { permission },
    headers: await headers(),
  });
  return result.success;
}

/**
 * Require permission or throw error
 */
export async function requirePermission(
  permission: Record<string, string[]>,
  errorMessage = 'Insufficient permissions'
) {
  const allowed = await hasPermission(permission);
  if (!allowed) {
    throw new Error(errorMessage);
  }
}

/**
 * Get current session with user and organization
 */
export async function getCurrentSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    throw new Error('Not authenticated');
  }
  return session;
}

/**
 * Require authentication
 */
export async function requireAuth() {
  const session = await getCurrentSession();
  if (!session.user) {
    throw new Error('Authentication required');
  }
  return session;
}

/**
 * Get active organization or throw
 */
export async function getActiveOrganization() {
  const session = await getCurrentSession();
  if (!session.session.activeOrganizationId) {
    throw new Error('No active organization set');
  }
  return session.session.activeOrganizationId;
}
