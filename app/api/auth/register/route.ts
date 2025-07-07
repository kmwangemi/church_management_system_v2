import { logger } from '@/lib/logger';
import { withApiLogger } from '@/lib/middleware/apiLogger';
import dbConnect from '@/lib/mongodb';
import Church from '@/models/Church';
import User from '@/models/User';
import mongoose from 'mongoose';
import { type NextRequest, NextResponse } from 'next/server';

async function registerHandler(request: NextRequest) {
  let session: mongoose.ClientSession | null = null;
  let transactionCommitted = false;
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    { requestId, endpoint: '/api/auth/register' },
    'api',
  );
  try {
    // FIRST: Connect to database
    await dbConnect();
    contextLogger.info('Database connection established');
    // THEN: Start a session for the transaction
    session = await mongoose.startSession();
    const body = await request.json();
    const { churchData, adminData } = body;
    contextLogger.info('Starting church registration transaction', {
      churchEmail: churchData.email,
      adminEmail: adminData.email,
    });
    // Start the transaction
    await session.startTransaction();
    // Validate that the role exists
    // const roleExists = await Role.findById(adminData.role).session(session);
    // const roleExists = await Role.findOne({
    //   email: churchData.email,
    // }).session(session);
    // if (!roleExists) {
    //   contextLogger.warn('Invalid role specified during registration', {
    //     providedRoleId: adminData.role,
    //   });
    //   await session.abortTransaction();
    //   return NextResponse.json(
    //     { error: 'Invalid role specified' },
    //     { status: 400 },
    //   );
    // }
    // Check if church email already exists
    const existingChurchEmail = await Church.findOne({
      email: churchData.email,
    }).session(session);
    if (existingChurchEmail) {
      contextLogger.warn('Church registration failed - email already exists', {
        email: churchData.email,
      });
      await session.abortTransaction();
      return NextResponse.json(
        { error: 'Church with this email already exists' },
        { status: 400 },
      );
    }
    // Check if church phone number already exists
    const existingChurchPhone = await Church.findOne({
      phoneNumber: churchData.phoneNumber,
    }).session(session);
    if (existingChurchPhone) {
      contextLogger.warn(
        'Church registration failed - phone number already exists',
        {
          phoneNumber: churchData.phoneNumber,
        },
      );
      await session.abortTransaction();
      return NextResponse.json(
        { error: 'Church with this phone number already exists' },
        { status: 400 },
      );
    }
    // Check if admin email already exists
    const existingUserEmail = await User.findOne({
      email: adminData.email,
    }).session(session);
    if (existingUserEmail) {
      contextLogger.warn('Admin registration failed - email already exists', {
        email: adminData.email,
      });
      await session.abortTransaction();
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 },
      );
    }
    // Check if admin phone number already exists
    const existingUserPhone = await User.findOne({
      phoneNumber: adminData.phoneNumber,
    }).session(session);
    if (existingUserPhone) {
      contextLogger.warn(
        'Admin registration failed - phone number already exists',
        {
          phoneNumber: adminData.phoneNumber,
        },
      );
      await session.abortTransaction();
      return NextResponse.json(
        { error: 'User with this phone number already exists' },
        { status: 400 },
      );
    }
    // Create church within the transaction
    const church = new Church(churchData);
    await church.save({ session });
    contextLogger.info('Church created successfully', {
      churchId: church._id.toString(),
      churchName: church.name,
    });
    // Create admin user within the transaction
    const admin = new User({
      churchId: church._id,
      email: adminData.email,
      password: adminData.password,
      firstName: adminData.firstName,
      lastName: adminData.lastName,
      role: '6869451cd2c5336aef1196eb', // admin id
      phoneNumber: adminData.phoneNumber,
    });
    await admin.save({ session });
    contextLogger.info('Admin user created successfully', {
      userId: admin._id.toString(),
      userEmail: admin.email,
    });
    // Commit the transaction
    await session.commitTransaction();
    transactionCommitted = true;
    contextLogger.info('Church registration completed successfully', {
      churchId: church._id.toString(),
      userId: admin._id.toString(),
    });
    return NextResponse.json(
      {
        message: 'Church and admin user created successfully',
        churchId: church._id,
        userId: admin._id,
      },
      { status: 201 },
    );
  } catch (error) {
    // Only abort the transaction if it's still active
    if (session && !transactionCommitted) {
      try {
        await session.abortTransaction();
        contextLogger.info('Transaction aborted due to error');
      } catch (abortError) {
        contextLogger.error('Error aborting transaction', abortError);
      }
    }
    contextLogger.error('Church registration failed', error, {
      transactionCommitted,
      sessionActive: !!session,
    });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  } finally {
    // Always end the session (if it was created)
    if (session) {
      try {
        await session.endSession();
        contextLogger.debug('Database session ended');
      } catch (endError) {
        contextLogger.error('Error ending session', endError);
      }
    }
  }
}

// Export the handler wrapped with logging middleware
export const POST = withApiLogger(registerHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});
