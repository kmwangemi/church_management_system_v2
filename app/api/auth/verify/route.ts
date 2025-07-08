import { verifyToken } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json({ error: 'No valid token' }, { status: 401 });
    }
    // You can fetch additional user data from your database here
    // For now, returning the JWT payload
    return NextResponse.json({
      user: {
        userId: user.user?.sub,
        churchId: user.user?.churchId,
        branchId: user.user?.branchId,
        role: user.user?.role,
      },
    });
  } catch (error) {
    console.error('Token verification failed:', error);
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}
