import { requireAuth } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import { AddMemberFormValues } from '@/lib/validations/members';
import Member from '@/models/Member';
import User from '@/models/User';
import mongoose from 'mongoose';
import { type NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Check authentication and authorization
    const authResult = await requireAuth(['superadmin', 'admin'])(request);
    // If authResult is a Response object, it means authentication/authorization failed
    if (authResult instanceof Response) {
      return authResult;
    }
    // authResult is now the authenticated user
    const user = authResult;
    console.log('user--->', user);
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const page = Number.parseInt(searchParams.get('page') || '1');
    const limit = Number.parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const branchId = searchParams.get('branchId') || '';
    const query: any = { churchId: user.churchId };
    if (search) {
      query.$or = [
        // { firstName: { $regex: search, $options: 'i' } },
        // { lastName: { $regex: search, $options: 'i' } },
        // { email: { $regex: search, $options: 'i' } },
        { memberId: { $regex: search, $options: 'i' } },
      ];
    }
    // if (status) {
    //   query.membershipStatus = status;
    // }
    // if (branchId) {
    //   query.branchId = branchId;
    // }
    const skip = (page - 1) * limit;
    const [members, total] = await Promise.all([
      Member.find(query)
        // .populate('branchId', 'branchName')
        // .populate('departmentIds', 'departmentName')
        // .populate('groupIds', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Member.countDocuments(query),
    ]);
    console.log('members--->', JSON.stringify(members));
    return NextResponse.json({
      members,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get members error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  let session: mongoose.ClientSession | null = null;
  let transactionCommitted = false;
  try {
    // Check authentication and authorization
    const authResult = await requireAuth(['superadmin', 'admin'])(request);
    // If authResult is a Response object, it means authentication/authorization failed
    if (authResult instanceof Response) {
      return authResult;
    }
    // authResult is now the authenticated user
    const user = authResult;
    // FIRST: Connect to database
    await dbConnect();
    // THEN: Start a session for the transaction
    session = await mongoose.startSession();
    const memberData: AddMemberFormValues = await request.json();
    // Start the transaction
    await session.startTransaction();
    // Check if member email already exists
    const existingUserEmail = await User.findOne({
      email: memberData.email,
    }).session(session);
    if (existingUserEmail) {
      await session.abortTransaction();
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 },
      );
    }
    // Check if member phone number already exists
    const existingUserPhone = await User.findOne({
      phoneNumber: memberData.phoneNumber,
    }).session(session);
    if (existingUserPhone) {
      await session.abortTransaction();
      return NextResponse.json(
        { error: 'User with this phone number already exists' },
        { status: 400 },
      );
    }
    // Create user within the transaction
    const createdUser = new User({
      churchId: user.churchId,
      email: memberData.email,
      password: '123', // Consider hashing this password
      firstName: memberData.firstName,
      lastName: memberData.lastName,
      role: memberData.role,
      phoneNumber: memberData.phoneNumber,
    });
    await createdUser.save({ session });
    // Generate member ID (more robust approach)
    const memberCount = await Member.countDocuments({
      churchId: user.churchId, // error here at the moment
    }).session(session);
    console.log('memberCount--->', memberCount);
    const memberId = `MEM${String(memberCount + 1).padStart(4, '0')}`;
    console.log('memberId--->', memberId);
    // Create member with the generated member ID
    const createdMember = new Member({
      userId: createdUser._id,
      memberId: memberId, // Actually use the generated member ID
      gender: memberData.gender,
      branchId: memberData.branchId,
      churchId: user.churchId, // Add churchId for consistency
      departmentIds: memberData.departments,
      joinedDate: memberData.joinedDate,
      notes: memberData.notes,
    });
    await createdMember.save({ session });
    // Commit the transaction
    await session.commitTransaction();
    transactionCommitted = true;
    return NextResponse.json(
      {
        message: 'Member created successfully',
        memberId: createdMember.memberId, // Return the member ID
        branchId: createdMember.branchId,
        userId: createdMember.userId,
      },
      { status: 201 },
    );
  } catch (error) {
    // Only abort the transaction if it's still active
    if (session && !transactionCommitted) {
      try {
        await session.abortTransaction();
      } catch (abortError) {
        console.error('Error aborting transaction:', abortError);
      }
    }
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  } finally {
    // Always end the session (if it was created)
    if (session) {
      try {
        await session.endSession();
      } catch (endError) {
        console.error('Error ending session:', endError);
      }
    }
  }
}

// export async function POST(request: NextRequest) {
//   try {
//     const user = await verifyToken(request);
//     if (!user) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }
//     // Check if user has superadmin role
//     if (user.role !== 'superadmin') {
//       return NextResponse.json(
//         { error: 'Forbidden - Insufficient permissions' },
//         { status: 403 },
//       );
//     }
//     await dbConnect();
//     const memberData = await request.json();
//     // Rest of your existing code...
//     const memberCount = await Member.countDocuments({
//       churchId: user.churchId,
//     });
//     const memberId = `MEM${String(memberCount + 1).padStart(4, '0')}`;
//     const member = new Member({
//       ...memberData,
//       churchId: user.churchId,
//       memberId,
//     });
//     await member.save();
//     await member.populate(['branchId', 'departmentIds', 'groupIds']);
//     return NextResponse.json(member, { status: 201 });
//   } catch (error) {
//     console.error('Create member error:', error);
//     return NextResponse.json(
//       { error: 'Internal server error' },
//       { status: 500 },
//     );
//   }
// }
