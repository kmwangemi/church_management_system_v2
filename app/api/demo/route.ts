import { logger } from '@/lib/logger';
import { withApiLogger } from '@/lib/middleware/api-logger';
import dbConnect from '@/lib/mongodb';
import type { ContextLogger } from '@/lib/types';
import {
  createValidationErrorResponse,
  validateWithZod,
} from '@/lib/validation';
import {
  requestDemoSchema,
  type ChurchDemoPayload,
  type UserDemoPayload,
} from '@/lib/validations/demo';
import Demo from '@/models/demo';
import { NextResponse, type NextRequest } from 'next/server';

async function validateData(
  request: NextRequest,
  contextLogger: ContextLogger
): Promise<
  | { error: NextResponse }
  | {
      churchData: ChurchDemoPayload;
      userData: UserDemoPayload;
    }
> {
  await dbConnect();
  contextLogger.info('Database connection established');
  const body = await request.json();
  const validation = validateWithZod(requestDemoSchema, body);
  if (!validation.success) {
    contextLogger.warn('Validation failed during registration', {
      errors: validation.errors,
      requestBody: body,
    });
    return { error: createValidationErrorResponse(validation.errors) };
  }
  return {
    churchData: validation.data.churchData,
    userData: validation.data.userData,
  };
}

async function performRegistrationTransaction(
  churchData: ChurchDemoPayload,
  userData: UserDemoPayload,
  contextLogger: ContextLogger
) {
  try {
    contextLogger.info('Starting church registration transaction', {
      churchName: churchData.churchName,
      userEmail: userData.email,
    });
    const church = new Demo({
      churchData: {
        churchName: churchData.churchName,
        denomination: churchData.denomination,
        address: churchData.address,
        churchSize: churchData.churchSize,
        numberOfBranches: churchData.numberOfBranches,
      },
      userData: {
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phoneNumber: userData.phoneNumber,
        agreeToTerms: true,
      },
    });
    await church.save();
    contextLogger.info('Church created successfully', {
      churchId: church._id.toString(),
      churchName: church.churchName,
    });
    contextLogger.info('Church registration completed successfully', {
      churchId: church._id.toString(),
    });
    return {
      response: NextResponse.json(
        {
          message: 'Church and user created successfully',
          church: {
            id: church._id,
          },
        },
        { status: 201 }
      ),
    };
  } catch (error) {
    contextLogger.error('Church registration failed', error);
    return {
      response: NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      ),
    };
  }
}

async function registerHandler(request: NextRequest): Promise<NextResponse> {
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    { requestId, endpoint: '/api/auth/demo' },
    'api'
  );
  try {
    const validationResult = await validateData(request, contextLogger);
    if ('error' in validationResult) {
      return validationResult.error;
    }
    const { churchData, userData } = validationResult;
    const { response } = await performRegistrationTransaction(
      churchData,
      userData,
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
