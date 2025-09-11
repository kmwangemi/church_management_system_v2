/** biome-ignore-all assist/source/organizeImports: ignore sort import files */
import { logger } from '@/lib/logger';
import { withApiLogger } from '@/lib/middleware/api-logger';
import dbConnect from '@/lib/mongodb';
import { getUserId } from '@/lib/utils';
import { UserModel } from '@/models';
import type { IUser } from '@/models/user';
import { SignJWT } from 'jose';
import { type NextRequest, NextResponse } from 'next/server';

function checkUserStatus(
  existingUser: IUser,
  contextLogger: {
    warn: (message: string, meta?: Record<string, unknown>) => void;
  },
  email: string
) {
  if (existingUser.status === 'inactive') {
    contextLogger.warn('Login failed - Account is deactivated', { email });
    return NextResponse.json(
      { error: 'Account is deactivated' },
      { status: 401 }
    );
  }
  if (existingUser.status === 'suspended') {
    contextLogger.warn('Login failed - Account is suspended', { email });
    return NextResponse.json(
      { error: 'Account is suspended' },
      { status: 401 }
    );
  }
  if (existingUser.status === 'pending') {
    contextLogger.warn('Login failed - Account is pending', { email });
    return NextResponse.json({ error: 'Account is pending' }, { status: 401 });
  }
  if (existingUser.isDeleted) {
    contextLogger.warn('Login failed - Account is deleted', { email });
    return NextResponse.json(
      { error: 'Account does not exist' },
      { status: 401 }
    );
  }
  return null;
}

async function validatePassword(
  existingUser: IUser,
  password: string,
  contextLogger: {
    warn: (message: string, meta?: Record<string, unknown>) => void;
  },
  email: string
) {
  let isPasswordValid = false;
  try {
    isPasswordValid = await existingUser.comparePassword(password);
  } catch (error: unknown) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'message' in error &&
      typeof (error as { message: unknown }).message === 'string' &&
      (error as { message: string }).message.includes('temporarily locked')
    ) {
      contextLogger.warn('Login failed - Account temporarily locked', {
        email,
        lockUntil: existingUser.lockUntil,
      });
      return {
        response: NextResponse.json(
          {
            error: `Account temporarily locked until ${new Date(
              existingUser.lockUntil ?? Date.now()
            ).toLocaleString()} due to too many failed login attempts.`,
          },
          { status: 423 }
        ),
        isPasswordValid: false,
      };
    }
    throw error;
  }
  if (!isPasswordValid) {
    contextLogger.warn('Login failed - Invalid password', {
      email,
      loginAttempts: (existingUser.loginAttempts ?? 0) + 1,
    });
    const willBeLocked = (existingUser.loginAttempts ?? 0) + 1 >= 5;
    if (willBeLocked) {
      return {
        response: NextResponse.json(
          {
            error: `Invalid credentials. Account has been temporarily locked until ${new Date(
              Date.now() + 2 * 60 * 60 * 1000
            ).toISOString()}.`,
          },
          { status: 423 }
        ),
        isPasswordValid: false,
      };
    }
    return {
      response: NextResponse.json(
        {
          error: `Invalid credentials. Attempts remaining: ${
            5 - ((existingUser.loginAttempts ?? 0) + 1)
          }.`,
        },
        { status: 401 }
      ),
      isPasswordValid: false,
    };
  }
  return { response: null, isPasswordValid: true };
}

async function loginHandler(request: NextRequest) {
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    { requestId, endpoint: '/api/auth/login' },
    'api'
  );
  try {
    await dbConnect();
    const { email, password } = await request.json();
    if (!(email && password)) {
      contextLogger.warn('Login failed - Missing email or password', {
        email,
      });
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }
    const existingUser = await UserModel.findOne({
      email: email.toLowerCase().trim(),
    });
    if (!existingUser) {
      contextLogger.warn('Login failed - User not found', { email });
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    const statusResponse = checkUserStatus(existingUser, contextLogger, email);
    if (statusResponse) {
      return statusResponse;
    }
    const { response: passwordResponse } = await validatePassword(
      existingUser,
      password,
      contextLogger,
      email
    );
    if (passwordResponse) {
      return passwordResponse;
    }
    existingUser.lastLogin = new Date();
    await existingUser.save();
    if (!process.env.JWT_SECRET) {
      contextLogger.error('JWT_SECRET environment variable is not set');
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const userRole = existingUser.role ?? 'user';
    const token = await new SignJWT({
      sub: getUserId(existingUser._id),
      churchId: existingUser?.churchId
        ? getUserId(existingUser.churchId)
        : null,
      branchId: existingUser?.branchId
        ? getUserId(existingUser.branchId)
        : null,
      role: userRole,
      accessLevel:
        userRole === 'admin' ? existingUser?.adminDetails?.accessLevel : null,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(secret);
    contextLogger.info('Login successful', {
      email,
      userId: String(existingUser._id),
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
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return response;
  } catch (error) {
    contextLogger.error('Login failed', error as Error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Export the handler wrapped with logging middleware
export const POST = withApiLogger(loginHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});
