import { verifyToken } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Contribution from '@/models/Contribution';
import Donation from '@/models/Donation';
import { type NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const [contribution, donations] = await Promise.all([
      Contribution.findOne({ _id: params.id, churchId: user.churchId })
        .populate('organizerId', 'firstName lastName email phone')
        .populate('branchId', 'name address'),
      Donation.find({
        contributionId: params.id,
        churchId: user.churchId,
      })
        .populate('donorId', 'firstName lastName')
        .sort({ createdAt: -1 }),
    ]);

    if (!contribution) {
      return NextResponse.json(
        { error: 'Contribution not found' },
        { status: 404 },
      );
    }

    // Calculate statistics
    const totalDonations = donations.reduce(
      (sum, donation) => sum + donation.amount,
      0,
    );
    const donationsByMonth = donations.reduce((acc, donation) => {
      const month = donation.date.toISOString().substring(0, 7);
      acc[month] = (acc[month] || 0) + donation.amount;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      contribution,
      donations,
      stats: {
        totalDonations,
        donationCount: donations.length,
        progress: (totalDonations / contribution.targetAmount) * 100,
        donationsByMonth,
      },
    });
  } catch (error) {
    console.error('Get contribution error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const updateData = await request.json();

    const contribution = await Contribution.findOneAndUpdate(
      { _id: params.id, churchId: user.churchId },
      updateData,
      {
        new: true,
      },
    ).populate(['organizerId', 'branchId']);

    if (!contribution) {
      return NextResponse.json(
        { error: 'Contribution not found' },
        { status: 404 },
      );
    }

    return NextResponse.json(contribution);
  } catch (error) {
    console.error('Update contribution error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
