import { verifyToken } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { withApiLogger } from '@/lib/middleware/apiLogger';
import dbConnect from '@/lib/mongodb';
import {
  createValidationErrorResponse,
  validateWithZod,
} from '@/lib/validation';
import { churchRegistrationSchema } from '@/lib/validations/auth';
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
  const { user } = await verifyToken(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (user.role !== 'superadmin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  try {
    // FIRST: Connect to database
    await dbConnect();
    contextLogger.info('Database connection established');
    // Parse and validate request body
    const body = await request.json();
    // Validate the entire request body with Zod
    const validation = validateWithZod(churchRegistrationSchema, body);
    if (!validation.success) {
      contextLogger.warn('Validation failed during registration', {
        errors: validation.errors,
        requestBody: body,
      });

      return createValidationErrorResponse(validation.errors);
    }
    // Extract validated data
    const { churchData, adminData } = validation.data;
    // Start a session for the transaction
    session = await mongoose.startSession();
    contextLogger.info('Starting church registration transaction', {
      churchEmail: churchData.email,
      adminEmail: adminData.email,
    });
    // Start the transaction
    await session.startTransaction();
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
    const church = new Church({
      churchName: churchData.churchName,
      denomination: churchData.denomination,
      description: churchData.description,
      churchLogoUrl: churchData.churchLogoUrl,
      establishedDate: new Date(churchData.establishedDate),
      email: churchData.email,
      phoneNumber: churchData.phoneNumber,
      country: churchData.country,
      website: churchData.website,
      address: churchData.address,
      subscriptionPlan: churchData.subscriptionPlan,
      churchSize: churchData.churchSize,
      numberOfBranches: churchData.numberOfBranches,
      createdBy: user.sub,
    });
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
      role: 'admin',
      phoneNumber: adminData.phoneNumber,
      agreeToTerms: true,
      isActive: true,
      isSuspended: false,
      isDeleted: false,
      loginAttempts: 0,
      createdBy: user.sub,
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
        church: {
          id: church._id,
          name: church.name,
          email: church.email,
        },
        admin: {
          id: admin._id,
          email: admin.email,
          firstName: admin.firstName,
          lastName: admin.lastName,
          role: admin.role,
        },
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
