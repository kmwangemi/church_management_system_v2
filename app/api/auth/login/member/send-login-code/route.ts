/** biome-ignore-all assist/source/organizeImports: ignore sort import files */
import { logger } from '@/lib/logger';
import { withApiLogger } from '@/lib/middleware/api-logger';
import dbConnect from '@/lib/mongodb';
import { sendEmail, sendSMS } from '@/lib/notifications';
import { isEmail, isPhoneNumber } from '@/lib/utils';
import { generateVerificationCode } from '@/lib/verification-code';
import type { IUserModel } from '@/models/user';
import User from '@/models/user';
import { type NextRequest, NextResponse } from 'next/server';

function checkUserStatus(
  existingUser: IUserModel,
  contextLogger: {
    warn: (message: string, meta?: Record<string, unknown>) => void;
  },
  identifier: string
) {
  if (existingUser.status === 'inactive') {
    contextLogger.warn('Login code request failed - Account is deactivated', {
      identifier,
    });
    return NextResponse.json(
      { error: 'Account is deactivated' },
      { status: 401 }
    );
  }
  if (existingUser.status === 'suspended') {
    contextLogger.warn('Login code request failed - Account is suspended', {
      identifier,
    });
    return NextResponse.json(
      { error: 'Account is suspended' },
      { status: 401 }
    );
  }
  if (existingUser.status === 'pending') {
    contextLogger.warn('Login code request failed - Account is pending', {
      identifier,
    });
    return NextResponse.json({ error: 'Account is pending' }, { status: 401 });
  }
  if (existingUser.isDeleted) {
    contextLogger.warn('Login code request failed - Account is deleted', {
      identifier,
    });
    return NextResponse.json(
      { error: 'Account does not exist' },
      { status: 401 }
    );
  }
  return null;
}

async function sendLoginCodeHandler(request: NextRequest) {
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    { requestId, endpoint: '/api/auth/send-login-code' },
    'api'
  );
  try {
    await dbConnect();
    const { emailOrPhoneNumber } = await request.json();
    if (!emailOrPhoneNumber) {
      contextLogger.warn('Send login code failed - Missing identifier');
      return NextResponse.json(
        { error: 'Email or phone number is required' },
        { status: 400 }
      );
    }
    const identifier = emailOrPhoneNumber.toLowerCase().trim();
    const isEmailAddress = isEmail(identifier);
    const isPhoneNum = isPhoneNumber(identifier);
    if (!(isEmailAddress || isPhoneNum)) {
      contextLogger.warn('Send login code failed - Invalid identifier format', {
        identifier,
      });
      return NextResponse.json(
        { error: 'Please provide a valid email address or phone number' },
        { status: 400 }
      );
    }
    // Find user by email or phone number
    let existingUser: IUserModel | null = null;
    if (isEmailAddress) {
      existingUser = await User.findOne({ email: identifier });
    } else {
      // Assuming you have a phoneNumber field in your User model
      existingUser = await User.findOne({ phoneNumber: identifier });
    }
    if (!existingUser) {
      contextLogger.warn('Send login code failed - User not found', {
        identifier,
      });
      return NextResponse.json(
        { error: 'Account not found with this email or phone number' },
        { status: 404 }
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
    // Check rate limiting - prevent spam
    const now = new Date();
    const lastCodeSentAt = existingUser.lastCodeSentAt;
    const cooldownPeriod = 60 * 1000; // 1 minute cooldown
    if (
      lastCodeSentAt &&
      now.getTime() - lastCodeSentAt.getTime() < cooldownPeriod
    ) {
      const remainingTime = Math.ceil(
        (cooldownPeriod - (now.getTime() - lastCodeSentAt.getTime())) / 1000
      );
      contextLogger.warn('Send login code failed - Rate limited', {
        identifier,
        remainingTime,
      });
      return NextResponse.json(
        {
          error: `Please wait ${remainingTime} seconds before requesting another code`,
        },
        { status: 429 }
      );
    }
    // Generate verification code
    const verificationCode = generateVerificationCode();
    const codeExpiresAt = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes expiry
    // Save code to user record
    existingUser.verificationCode = verificationCode;
    existingUser.verificationCodeExpiresAt = codeExpiresAt;
    existingUser.lastCodeSentAt = now;
    await existingUser.save();
    // Send verification code
    try {
      if (isEmailAddress) {
        await sendEmail({
          to: existingUser.email,
          subject: 'Your Login Verification Code',
          template: 'login-verification',
          data: {
            firstName: existingUser.firstName,
            verificationCode,
            expiryMinutes: 10,
          },
        });
        contextLogger.info('Login verification code sent via email', {
          identifier,
          userId: existingUser._id,
        });
      } else {
        await sendSMS({
          to: existingUser.phoneNumber,
          message: `Your login verification code is: ${verificationCode}. This code expires in 10 minutes.`,
        });
        contextLogger.info('Login verification code sent via SMS', {
          identifier,
          userId: existingUser._id,
        });
      }
    } catch (notificationError) {
      contextLogger.error('Failed to send verification code', {
        error: notificationError as Error,
        identifier,
        method: isEmailAddress ? 'email' : 'sms',
      });
      return NextResponse.json(
        { error: 'Failed to send verification code. Please try again.' },
        { status: 500 }
      );
    }
    return NextResponse.json({
      message: `Verification code sent to your ${isEmailAddress ? 'email' : 'phone number'}`,
      method: isEmailAddress ? 'email' : 'sms',
      expiresIn: 600, // 10 minutes in seconds
    });
  } catch (error) {
    contextLogger.error('Send login code failed', error as Error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Export the handler wrapped with logging middleware
export const POST = withApiLogger(sendLoginCodeHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});
