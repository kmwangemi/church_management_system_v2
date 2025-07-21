import crypto from 'node:crypto';
import { type NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import dbConnect from '@/lib/mongodb';
import User from '@/models/user';

export async function POST(request: NextRequest) {
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    { requestId, endpoint: '/api/auth/login' },
    'api'
  );
  try {
    await dbConnect();
    const { email } = await request.json();
    if (!email) {
      contextLogger.warn('Forgot password failed - Missing email', { email });
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({
        message:
          'If an account with that email exists, a reset link has been sent.',
      });
    }
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 3_600_000); // 1 hour
    await user.save();
    // In a real application, you would send an email here
    // For now, we'll just return the token (remove this in production)
    return NextResponse.json({
      message: 'Password reset link sent to your email',
      resetToken, // Remove this in production
    });
  } catch (error) {
    contextLogger.error('Forgot password failed', error as Error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
