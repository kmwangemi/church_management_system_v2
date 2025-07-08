import { getUserFromHeaders, requireAuth } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import { AddBranchFormValues } from '@/lib/validations/branch';
import Branch from '@/models/Branch';
import { type NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get user from headers set by middleware
    const user = getUserFromHeaders(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (user.role !== 'admin' && user.role !== 'superadmin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const page = Number.parseInt(searchParams.get('page') || '1');
    const limit = Number.parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const query: any = { churchId: user.churchId };
    if (search) {
      query.$or = [
        { branchName: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } },
      ];
    }
    const skip = (page - 1) * limit;
    const [branches, total] = await Promise.all([
      Branch.find(query)
        // .populate('pastorId', 'firstName lastName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Branch.countDocuments(query),
    ]);
    return NextResponse.json({
      branches,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get branches error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication and authorization
    const authResult = await requireAuth(['superadmin', 'admin'])(request);
    // If authResult is a Response object, it means authentication/authorization failed
    if (authResult instanceof Response) {
      return authResult;
    }
    // authResult is now the authenticated user
    const user = authResult;
    await dbConnect();
    const branchData: AddBranchFormValues = await request.json();
    const existingChurchBranch = await Branch.findOne({
      branchName: branchData.branchName,
      churchId: user.user?.churchId,
    });
    if (existingChurchBranch) {
      return NextResponse.json(
        { error: 'Church branch already exists' },
        { status: 400 },
      );
    }
    const branch = new Branch({
      ...branchData,
      churchId: user.user?.churchId,
    });
    await branch.save();
    return NextResponse.json(branch, { status: 201 });
  } catch (error) {
    console.error('Create branch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
