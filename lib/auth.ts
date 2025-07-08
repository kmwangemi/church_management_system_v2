import { AuthUser } from '@/lib/types';
import { decodeJwt, jwtVerify } from 'jose';
import type { NextRequest } from 'next/server';

interface TokenPayload extends AuthUser {
  exp?: number;
  iat?: number;
}

export async function verifyToken(request: NextRequest): Promise<{
  isValid: boolean;
  user: AuthUser | null;
  reason?: 'missing' | 'expired' | 'invalid' | 'malformed';
}> {
  try {
    const token = request.cookies.get('token')?.value;
    const secret = process.env.JWT_SECRET;
    if (!token) {
      return { isValid: false, user: null, reason: 'missing' };
    }
    if (!secret) throw new Error('JWT_SECRET is not set');
    // Decode without verification first to check expiration
    let decodedUnverified: TokenPayload | null = null;
    try {
      decodedUnverified = decodeJwt(token) as TokenPayload;
    } catch (error) {
      return { isValid: false, user: null, reason: 'malformed' };
    }
    if (!decodedUnverified) {
      return { isValid: false, user: null, reason: 'malformed' };
    }
    // Check expiration before verification
    if (
      decodedUnverified.exp &&
      decodedUnverified.exp < Math.floor(Date.now() / 1000)
    ) {
      return { isValid: false, user: null, reason: 'expired' };
    }
    // Now verify the token
    const secretKey = new TextEncoder().encode(secret);
    const { payload } = await jwtVerify(token, secretKey);
    const decoded = payload as unknown as TokenPayload;
    return {
      isValid: true,
      user: {
        sub: decoded.sub,
        churchId: decoded.churchId,
        branchId: decoded.branchId,
        role: decoded.role,
      },
    };
  } catch (error) {
    if (error instanceof Error) {
      // Check for specific JOSE error types
      if (error.message.includes('exp')) {
        return { isValid: false, user: null, reason: 'expired' };
      } else if (error.message.includes('signature')) {
        return { isValid: false, user: null, reason: 'invalid' };
      }
    }
    return { isValid: false, user: null, reason: 'invalid' };
  }
}

// Updated requireAuth function to work with your middleware
export function requireAuth(roles?: string[]) {
  return async (request: NextRequest) => {
    const user = await verifyToken(request);
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    if (roles && (!user.user || !roles.includes(user.user.role))) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return user;
  };
}

// For API routes - extract user from headers set by middleware
export function getUserFromHeaders(request: NextRequest): AuthUser | null {
  const userId = request.headers.get('x-user-id');
  const churchId = request.headers.get('x-church-id');
  const branchId = request.headers.get('x-branch-id');
  const role = request.headers.get('x-user-role');
  if (!userId || !churchId || !branchId || !role) {
    return null;
  }
  return {
    sub: userId,
    churchId,
    branchId,
    role,
  };
}
