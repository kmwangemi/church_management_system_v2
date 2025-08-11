/** biome-ignore-all assist/source/organizeImports: ignore import sort files */
import { verifyToken } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { withApiLogger } from '@/lib/middleware/api-logger';
import dbConnect from '@/lib/mongodb';
import type { ContextLogger } from '@/lib/types';
import {
  createValidationErrorResponse,
  validateWithZod,
} from '@/lib/validation';
import type { AdminPayload, ChurchPayload } from '@/lib/validations/auth';
import { churchRegistrationSchema } from '@/lib/validations/auth';
import Church from '@/models/church';
import User from '@/models/user';
import mongoose from 'mongoose';
import { type NextRequest, NextResponse } from 'next/server';

async function checkChurchExists(
  churchData: { email: string; phoneNumber: string },
  session: mongoose.ClientSession,
  contextLogger: ContextLogger
) {
  const existingChurchEmail = await Church.findOne({
    email: churchData.email,
  }).session(session);
  if (existingChurchEmail) {
    contextLogger.warn('Church registration failed - email already exists', {
      email: churchData.email,
    });
    return { error: 'Church with this email already exists' };
  }
  const existingChurchPhone = await Church.findOne({
    phoneNumber: churchData.phoneNumber,
  }).session(session);
  if (existingChurchPhone) {
    contextLogger.warn(
      'Church registration failed - phone number already exists',
      {
        phoneNumber: churchData.phoneNumber,
      }
    );
    return { error: 'Church with this phone number already exists' };
  }
  return null;
}

async function checkUserExists(
  adminData: { email: string; phoneNumber: string },
  session: mongoose.ClientSession,
  contextLogger: ContextLogger
) {
  const existingUserEmail = await User.findOne({
    email: adminData.email,
  }).session(session);
  if (existingUserEmail) {
    contextLogger.warn('Admin registration failed - email already exists', {
      email: adminData.email,
    });
    return { error: 'User with this email already exists' };
  }
  const existingUserPhone = await User.findOne({
    phoneNumber: adminData.phoneNumber,
  }).session(session);
  if (existingUserPhone) {
    contextLogger.warn(
      'Admin registration failed - phone number already exists',
      {
        phoneNumber: adminData.phoneNumber,
      }
    );
    return { error: 'User with this phone number already exists' };
  }
  return null;
}

async function validateAndAuthorize(
  request: NextRequest,
  contextLogger: ContextLogger
): Promise<
  | { error: NextResponse }
  | {
      user: { sub: string; role: string };
      churchData: ChurchPayload;
      adminData: AdminPayload;
    }
> {
  const { user } = await verifyToken(request);
  if (!user) {
    return {
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }
  if (user.role !== 'superadmin') {
    return {
      error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
    };
  }
  await dbConnect();
  contextLogger.info('Database connection established');
  const body = await request.json();
  const validation = validateWithZod(churchRegistrationSchema, body);
  if (!validation.success) {
    contextLogger.warn('Validation failed during registration', {
      errors: validation.errors,
      requestBody: body,
    });
    return { error: createValidationErrorResponse(validation.errors) };
  }
  return {
    user,
    churchData: validation.data.churchData,
    adminData: validation.data.adminData,
  };
}

async function performRegistrationTransaction(
  churchData: ChurchPayload,
  adminData: AdminPayload,
  user: { sub: string; role: string },
  contextLogger: ContextLogger
) {
  let session: mongoose.ClientSession | null = null;
  let transactionCommitted = false;
  try {
    session = await mongoose.startSession();
    contextLogger.info('Starting church registration transaction', {
      churchEmail: churchData.email,
      adminEmail: adminData.email,
    });
    await session.startTransaction();
    const churchExists = await checkChurchExists(
      churchData,
      session,
      contextLogger
    );
    if (churchExists) {
      await session.abortTransaction();
      return {
        response: NextResponse.json(
          { error: churchExists.error },
          { status: 400 }
        ),
      };
    }
    const userExists = await checkUserExists(adminData, session, contextLogger);
    if (userExists) {
      await session.abortTransaction();
      return {
        response: NextResponse.json(
          { error: userExists.error },
          { status: 400 }
        ),
      };
    }
    const church = new Church({
      churchName: churchData.churchName,
      denomination: churchData.denomination,
      description: churchData.description,
      churchLogoUrl: churchData.churchLogoUrl,
      establishedDate: new Date(churchData.establishedDate),
      email: churchData.email,
      phoneNumber: churchData.phoneNumber,
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
      churchName: church.churchName,
    });
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
      updatedBy: user.sub,
    });
    await admin.save({ session });
    contextLogger.info('Admin user created successfully', {
      userId: admin._id.toString(),
      userEmail: admin.email,
    });
    await session.commitTransaction();
    transactionCommitted = true;
    contextLogger.info('Church registration completed successfully', {
      churchId: church._id.toString(),
      userId: admin._id.toString(),
    });
    return {
      response: NextResponse.json(
        {
          message: 'Church and admin user created successfully',
          church: {
            id: church._id,
            name: church.churchName,
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
        { status: 201 }
      ),
    };
  } catch (error) {
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
    return {
      response: NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      ),
    };
  } finally {
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

async function registerHandler(request: NextRequest): Promise<NextResponse> {
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    { requestId, endpoint: '/api/auth/register' },
    'api'
  );
  try {
    const validationResult = await validateAndAuthorize(request, contextLogger);
    if ('error' in validationResult) {
      return validationResult.error;
    }
    const { user, churchData, adminData } = validationResult;
    const { response } = await performRegistrationTransaction(
      churchData,
      adminData,
      user,
      contextLogger
    );
    return response;
  } catch (error) {
    contextLogger.error('Unexpected error in registerHandler', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Export the handler wrapped with logging middleware
export const POST = withApiLogger(registerHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});
