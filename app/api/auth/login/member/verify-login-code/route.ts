/** biome-ignore-all assist/source/organizeImports: ignore sort import files */
import { logger } from '@/lib/logger';
import { withApiLogger } from '@/lib/middleware/api-logger';
import dbConnect from '@/lib/mongodb';
import { getUserId, isEmail } from '@/lib/utils';
import { UserModel } from '@/models';
import type { IUser } from '@/models/user';
import { SignJWT } from 'jose';
import { type NextRequest, NextResponse } from 'next/server';

function checkUserStatus(
  existingUser: IUser,
  contextLogger: {
    warn: (message: string, meta?: Record<string, unknown>) => void;
  },
  identifier: string
) {
  if (existingUser.status === 'inactive') {
    contextLogger.warn('Login verification failed - Account is deactivated', {
      identifier,
    });
    return NextResponse.json(
      { error: 'Account is deactivated' },
      { status: 401 }
    );
  }
  if (existingUser.status === 'suspended') {
    contextLogger.warn('Login verification failed - Account is suspended', {
      identifier,
    });
    return NextResponse.json(
      { error: 'Account is suspended' },
      { status: 401 }
    );
  }
  if (existingUser.status === 'pending') {
    contextLogger.warn('Login verification failed - Account is pending', {
      identifier,
    });
    return NextResponse.json({ error: 'Account is pending' }, { status: 401 });
  }
  if (existingUser.isDeleted) {
    contextLogger.warn('Login verification failed - Account is deleted', {
      identifier,
    });
    return NextResponse.json(
      { error: 'Account does not exist' },
      { status: 401 }
    );
  }
  return null;
}

async function verifyLoginCodeHandler(request: NextRequest) {
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    { requestId, endpoint: '/api/auth/verify-login-code' },
    'api'
  );
  try {
    await dbConnect();
    const { emailOrPhoneNumber, verification_code } = await request.json();

    if (!(emailOrPhoneNumber && verification_code)) {
      contextLogger.warn('Login verification failed - Missing parameters');
      return NextResponse.json(
        { error: 'Email/phone number and verification code are required' },
        { status: 400 }
      );
    }
    // Validate verification code format
    if (!/^\d{6}$/.test(verification_code)) {
      contextLogger.warn('Login verification failed - Invalid code format', {
        identifier: emailOrPhoneNumber,
      });
      return NextResponse.json(
        { error: 'Verification code must be 6 digits' },
        { status: 400 }
      );
    }
    const identifier = emailOrPhoneNumber.toLowerCase().trim();
    const isEmailAddress = isEmail(identifier);
    // Find user by email or phone number
    let existingUser: IUser | null = null;
    if (isEmailAddress) {
      existingUser = await UserModel.findOne({ email: identifier });
    } else {
      // Assuming you have a phoneNumber field in your User model
      existingUser = await UserModel.findOne({ phoneNumber: identifier });
    }
    if (!existingUser) {
      contextLogger.warn('Login verification failed - User not found', {
        identifier,
      });
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    // Check user status
    const statusResponse = checkUserStatus(
      existingUser,
      contextLogger,
      identifier
    );
    if (statusResponse) {
      return statusResponse;
    }
    // Check if verification code exists and is not expired
    if (
      !(existingUser.verificationCode && existingUser.verificationCodeExpiresAt)
    ) {
      contextLogger.warn(
        'Login verification failed - No active verification code',
        {
          identifier,
          userId: existingUser._id,
        }
      );
      return NextResponse.json(
        {
          error:
            'No active verification code found. Please request a new code.',
        },
        { status: 400 }
      );
    }
    // Check if verification code has expired
    const now = new Date();
    if (now > existingUser.verificationCodeExpiresAt) {
      contextLogger.warn('Login verification failed - Code expired', {
        identifier,
        userId: existingUser._id,
        expiredAt: existingUser.verificationCodeExpiresAt,
      });
      // Clear expired code
      existingUser.verificationCode = undefined;
      existingUser.verificationCodeExpiresAt = undefined;
      await existingUser.save();
      return NextResponse.json(
        { error: 'Verification code has expired. Please request a new code.' },
        { status: 400 }
      );
    }
    // Verify the code
    if (existingUser.verificationCode !== verification_code) {
      // Increment failed verification attempts
      existingUser.failedVerificationAttempts =
        (existingUser.failedVerificationAttempts || 0) + 1;
      // Lock account if too many failed attempts (optional security measure)
      if (existingUser.failedVerificationAttempts >= 5) {
        existingUser.verificationCode = undefined;
        existingUser.verificationCodeExpiresAt = undefined;
        existingUser.lockUntil = new Date(now.getTime() + 30 * 60 * 1000); // 30 minutes lock
        await existingUser.save();
        contextLogger.warn(
          'Login verification failed - Account locked due to too many failed attempts',
          {
            identifier,
            userId: existingUser._id,
            attempts: existingUser.failedVerificationAttempts,
          }
        );
        return NextResponse.json(
          {
            error:
              'Account temporarily locked due to too many failed verification attempts. Please try again in 30 minutes.',
          },
          { status: 423 }
        );
      }
      await existingUser.save();
      contextLogger.warn('Login verification failed - Invalid code', {
        identifier,
        userId: existingUser._id,
        attempts: existingUser.failedVerificationAttempts,
      });
      const remainingAttempts = 5 - existingUser.failedVerificationAttempts;
      return NextResponse.json(
        {
          error: `Invalid verification code. ${remainingAttempts} attempts remaining.`,
        },
        { status: 400 }
      );
    }
    // Code is valid - complete the login process
    // Clear verification code and reset failed attempts
    existingUser.verificationCode = undefined;
    existingUser.verificationCodeExpiresAt = undefined;
    existingUser.failedVerificationAttempts = 0;
    existingUser.lastLogin = new Date();
    existingUser.loginAttempts = 0; // Reset login attempts as well
    existingUser.lockUntil = undefined; // Clear any existing lock
    await existingUser.save();
    // Generate JWT token
    if (!process.env.JWT_SECRET) {
      contextLogger.error('JWT_SECRET environment variable is not set');
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const token = await new SignJWT({
      sub: getUserId(existingUser._id),
      churchId: existingUser?.churchId
        ? getUserId(existingUser.churchId)
        : null,
      branchId: existingUser?.branchId
        ? getUserId(existingUser.branchId)
        : null,
      role: existingUser.role,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(secret);
    contextLogger.info('Login verification successful', {
      identifier,
      userId: existingUser._id,
      role: existingUser.role,
      method: isEmailAddress ? 'email' : 'sms',
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
        phoneNumber: existingUser.phoneNumber, // Include phone number if needed
        lastLogin: existingUser.lastLogin,
      },
    });
    // Set JWT token as httpOnly cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    return response;
  } catch (error) {
    contextLogger.error('Login verification failed', error as Error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Export the handler wrapped with logging middleware
export const POST = withApiLogger(verifyLoginCodeHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});
