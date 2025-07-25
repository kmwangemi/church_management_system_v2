import dbConnect from '@/lib/mongodb';
import Pledge, { type IPledgeModel } from '@/models/pledge';
import { headers } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';

export async function GET(_request: NextRequest) {
  try {
    // Verify the request is from Vercel Cron
    const headersList = await headers();
    const authorization = headersList.get('authorization');
    if (authorization !== `Bearer ${process.env.CRON_SECRET}`) {
      // Corrected template literal
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Connect to database
    await dbConnect();
    // Update overdue pledges - Cast Pledge to IPledgeModel
    const result = await (Pledge as IPledgeModel).updateOverdueStatuses();
    // console.log(`Updated ${result.modifiedCount} pledges to overdue status`);
    return NextResponse.json({
      success: true,
      message: `Updated ${result.modifiedCount} pledges to overdue status`,
      updatedCount: result.modifiedCount,
      timestamp: new Date().toISOString(),
    });
  } catch (_error) {
    // You might want to log the actual error for debugging
    return NextResponse.json(
      { error: 'Failed to update overdue pledges' },
      { status: 500 }
    );
  }
}
