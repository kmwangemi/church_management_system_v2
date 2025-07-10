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
    // Input validation
    if (!email || !password) {
      contextLogger.warn('Login failed - Missing email or password');
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 },
      );
    }
    // Find user by email
    const existingUser = await User.findOne({
      email: email.toLowerCase().trim(),
    });
    if (!existingUser) {
      contextLogger.warn('Login failed - User not found', {
        email: email,
      });
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 },
      );
    }
    // Check if user is active before attempting password verification
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
    // Check if user is suspended
    if (existingUser.isSuspended) {
      contextLogger.warn('Login failed - Account is suspended', {
        email: email,
      });
      return NextResponse.json(
        { error: 'Account is suspended' },
        { status: 401 },
      );
    }
    // Check password with built-in rate limiting
    let isPasswordValid = false;
    try {
      isPasswordValid = await existingUser.comparePassword(password);
    } catch (error: any) {
      // Handle account locked error
      if (error.message && error.message.includes('temporarily locked')) {
        contextLogger.warn('Login failed - Account temporarily locked', {
          email: email,
          lockUntil: existingUser.lockUntil,
        });
        return NextResponse.json(
          {
            error: `Account temporarily locked until ${new Date(
              existingUser.lockUntil,
            ).toLocaleString()} due to too many failed login attempts.`,
          },
          { status: 423 }, // 423 Locked
        );
      }
      throw error; // Re-throw other errors
    }
    if (!isPasswordValid) {
      contextLogger.warn('Login failed - Invalid password', {
        email: email,
        loginAttempts: existingUser.loginAttempts + 1,
      });
      // Check if account will be locked after this attempt
      const willBeLocked = existingUser.loginAttempts + 1 >= 5;
      if (willBeLocked) {
        return NextResponse.json(
          {
            error: `Invalid credentials. Account has been temporarily locked until ${new Date(
              Date.now() + 2 * 60 * 60 * 1000,
            ).toISOString()}.`, // 2 hours from now
          },
          { status: 423 },
        );
      }
      return NextResponse.json(
        {
          error: `Invalid credentials. Attempts remaining: ${
            5 - (existingUser.loginAttempts + 1)
          }.`,
        },
        { status: 401 },
      );
    }
    // Update last login timestamp
    existingUser.lastLogin = new Date();
    await existingUser.save();
    // Generate JWT token using JOSE
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const token = await new SignJWT({
      sub: getUserId(existingUser._id),
      churchId: existingUser?.churchId
        ? getUserId(existingUser.churchId)
        : null,
      branchId: existingUser?.branchId
        ? getUserId(existingUser.branchId)
        : null,
      role: existingUser.role, // Direct string value since we're not populating role
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(secret);
    contextLogger.info('Login successful', {
      email: email,
      userId: existingUser._id,
      role: existingUser.role,
    });
    const response = NextResponse.json({
      message: 'Login successful',
      user: {
        id: existingUser._id,
        email: existingUser.email,
        firstName: existingUser.firstName,
        lastName: existingUser.lastName,
        role: existingUser.role,
        churchId: existingUser.churchId,
        branchId: existingUser.branchId,
        lastLogin: existingUser.lastLogin,
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
