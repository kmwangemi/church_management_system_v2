import { logger } from '@/lib/logger';
import { withApiLogger } from '@/lib/middleware/apiLogger';
import dbConnect from '@/lib/mongodb';
import { getUserId } from '@/lib/utils';
import User from '@/models/User';
import { SignJWT } from 'jose';
import { type NextRequest, NextResponse } from 'next/server';

async function loginHandler(request: NextRequest) {
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    { requestId, endpoint: '/api/auth/login' },
    'api',
  );
  try {
    await dbConnect();
    contextLogger.info('Database connection established');
    const { email, password } = await request.json();
    const existingUser = await User.findOne({ email }).populate('role', 'name');
    if (!existingUser) {
      contextLogger.warn('Login failed - Invalid credentials', {
        email: email,
      });
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 },
      );
    }
    // Check password
    const isPasswordValid = await existingUser.comparePassword(password);
    if (!isPasswordValid) {
      contextLogger.warn('Login failed - Invalid credentials', {
        password: password,
      });
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 },
      );
    }
    // Check if user is active
    if (!existingUser.isActive) {
      contextLogger.warn('Login failed - Account is deactivated', {
        email: email,
      });
      return NextResponse.json(
        { error: 'Account is deactivated' },
        { status: 401 },
      );
    }
    // Check if user is deleted
    if (existingUser.isDeleted) {
      contextLogger.warn('Login failed - Account is deleted', {
        email: email,
      });
      return NextResponse.json(
        { error: 'Account does not exist' },
        { status: 401 },
      );
    }
    // Update last login
    existingUser.lastLogin = new Date();
    await existingUser.save();
    // Generate JWT token using JOSE
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const token = await new SignJWT({
      sub: getUserId(existingUser._id),
      churchId: existingUser?.churchId ? getUserId(existingUser.churchId) : null,
      branchId: existingUser?.branchId ? getUserId(existingUser.branchId) : null,
      role: existingUser?.role?.name,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(secret);
    contextLogger.info('Login successfully', {
      email: email,
    });
    const response = NextResponse.json({
      message: 'Login successful',
      user: {
        id: existingUser._id,
        email: existingUser.email,
        firstName: existingUser.firstName,
        lastName: existingUser.lastName,
        role: existingUser.role.name,
      },
    });
    // Set HTTP-only cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    return response;
  } catch (error) {
    console.error('Login error:', error);
    contextLogger.error('Login failed', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

// Export the handler wrapped with logging middleware
export const POST = withApiLogger(loginHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});
