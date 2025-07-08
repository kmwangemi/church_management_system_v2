import { logger } from '@/lib/logger';
import { withApiLogger } from '@/lib/middleware/apiLogger';
import jwt from 'jsonwebtoken';
import { type NextRequest, NextResponse } from 'next/server';

async function logoutHandler(request: NextRequest) {
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    { requestId, endpoint: '/api/auth/logout' },
    'api',
  );
  try {
    // Get the token from cookies to log user info before clearing
    const token = request.cookies.get('token')?.value;
    let userInfo = null;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
        userInfo = {
          userId: decoded.userId,
          role: decoded.role,
        };
      } catch (error) {
        // Token might be invalid or expired, but we'll still proceed with logout
        contextLogger.warn('Invalid or expired token during logout', { error });
      }
    }
    contextLogger.info('User logged out successfully', {
      userId: userInfo?.userId || 'unknown',
      role: userInfo?.role || 'unknown',
    });
    // Create response
    const response = NextResponse.json({
      message: 'Logout successful',
    });
    // Clear the token cookie
    response.cookies.set('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0, // Expire immediately
      expires: new Date(0), // Set expiration to past date
    });
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    contextLogger.error('Logout failed', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

// Export the handler wrapped with logging middleware
export const POST = withApiLogger(logoutHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});
