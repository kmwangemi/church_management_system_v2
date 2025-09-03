import { requireAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { withApiLogger } from '@/lib/middleware/api-logger';
import dbConnect from '@/lib/mongodb';
import { PrayerRequestModel } from '@/models';
import mongoose from 'mongoose';
import { type NextRequest, NextResponse } from 'next/server';

// Additional handler for updating prayer count (when someone prays)
async function updatePrayerCountHandler(
  request: NextRequest
): Promise<NextResponse> {
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    { requestId, endpoint: '/api/prayer-requests/pray' },
    'api'
  );
  try {
    // Check authentication
    const authResult = await requireAuth(['superadmin', 'admin', 'member'])(
      request
    );
    if (authResult instanceof Response) {
      const body = await authResult.text();
      return new NextResponse(body, {
        status: authResult.status,
        statusText: authResult.statusText,
        headers: authResult.headers,
      });
    }
    const user = authResult;
    if (!user.user?.churchId) {
      return NextResponse.json(
        { error: 'Church ID not found' },
        { status: 400 }
      );
    }
    await dbConnect();
    const { prayerRequestId } = await request.json();
    if (
      !(prayerRequestId && mongoose.Types.ObjectId.isValid(prayerRequestId))
    ) {
      return NextResponse.json(
        { error: 'Valid prayer request ID is required' },
        { status: 400 }
      );
    }
    // Update prayer count
    const updatedPrayerRequest = await PrayerRequestModel.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(prayerRequestId),
        churchId: new mongoose.Types.ObjectId(user.user?.churchId),
        isPublic: true, // Only allow praying for public requests
      },
      { $inc: { prayerCount: 1 } },
      { new: true }
    );
    if (!updatedPrayerRequest) {
      return NextResponse.json(
        { error: 'Prayer request not found or not accessible' },
        { status: 404 }
      );
    }
    return NextResponse.json({
      success: true,
      data: {
        prayerRequestId: updatedPrayerRequest._id,
        prayerCount: updatedPrayerRequest.prayerCount,
      },
      message: 'Prayer count updated successfully',
    });
  } catch (error) {
    contextLogger.error('Unexpected error in updatePrayerCountHandler', error);
    return NextResponse.json(
      { error: 'Failed to update prayer count' },
      { status: 500 }
    );
  }
}

// Export the prayer count handler
export const PATCH = withApiLogger(updatePrayerCountHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});
