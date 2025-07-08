import { verifyToken } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json({ error: 'No valid token' }, { status: 401 });
    }
    const userId = user.user?.sub;
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID not found in token' },
        { status: 401 },
      );
    }
    // Connect to MongoDB
    await dbConnect();
    // Fetch additional user data from your database
    const userProfile = await User.findById(userId).select(
      'firstName lastName email profilePictureUrl churchId branchId role',
    );
    if (!userProfile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json({
      user: {
        userId: userProfile._id,
        firstName: userProfile.firstName,
        lastName: userProfile.lastName,
        email: userProfile.email,
        profilePictureUrl: userProfile.profilePictureUrl,
        churchId: userProfile.churchId,
        branchId: userProfile.branchId,
        role: userProfile.role,
        fullName: `${userProfile.firstName} ${userProfile.lastName}`,
      },
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
      },
      { status: 500 },
    );
  }
}
