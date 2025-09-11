import { requireAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { withApiLogger } from '@/lib/middleware/api-logger';
import dbConnect from '@/lib/mongodb';
import { MessageTemplateModel } from '@/models';
import mongoose from 'mongoose';
import { type NextRequest, NextResponse } from 'next/server';

// GET /api/message-templates - Fetch message templates
async function getTemplatesHandler(
  request: NextRequest
): Promise<NextResponse> {
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    { requestId, endpoint: '/api/church/message-templates' },
    'api'
  );
  try {
    // Check authentication and authorization
    const authResult = await requireAuth(['superadmin', 'admin'])(request);
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
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || '';
    const category = searchParams.get('category') || '';
    const search = searchParams.get('search')?.trim() || '';
    const activeOnly = searchParams.get('activeOnly') === 'true';
    // Build query object
    const query: any = {
      churchId: new mongoose.Types.ObjectId(user.user?.churchId),
    };
    if (activeOnly) {
      query.isActive = true;
    }
    if (type && ['sms', 'email'].includes(type)) {
      query.type = type;
    }
    if (
      category &&
      [
        'service-reminder',
        'event-registration',
        'welcome-member',
        'announcement',
        'custom',
      ].includes(category)
    ) {
      query.category = category;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
      ];
    }
    // Fetch templates
    const templates = await MessageTemplateModel.find(query)
      .populate('createdBy', 'name email')
      .sort({ usageCount: -1, name: 1 })
      .lean();
    return NextResponse.json({
      success: true,
      data: { templates },
    });
  } catch (error) {
    contextLogger.error('Unexpected error in getTemplatesHandler', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}

// POST /api/message-templates - Create a new message template
async function createTemplateHandler(
  request: NextRequest
): Promise<NextResponse> {
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    { requestId, endpoint: '/api/church/message-templates' },
    'api'
  );
  try {
    // Check authentication and authorization
    const authResult = await requireAuth(['superadmin', 'admin'])(request);
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
    const templateData = await request.json();
    // Validate required fields
    const requiredFields = ['name', 'type', 'category', 'title', 'content'];
    for (const field of requiredFields) {
      if (!templateData[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }
    // Validate type
    if (!['sms', 'email'].includes(templateData.type)) {
      return NextResponse.json(
        { error: 'Invalid template type' },
        { status: 400 }
      );
    }
    // Validate category
    if (
      ![
        'service-reminder',
        'event-registration',
        'welcome-member',
        'announcement',
        'custom',
      ].includes(templateData.category)
    ) {
      return NextResponse.json(
        { error: 'Invalid template category' },
        { status: 400 }
      );
    }
    // Check for duplicate template name
    const existingTemplate = await MessageTemplateModel.findOne({
      churchId: new mongoose.Types.ObjectId(user.user?.churchId),
      name: templateData.name,
    });
    if (existingTemplate) {
      return NextResponse.json(
        { error: 'Template with this name already exists' },
        { status: 409 }
      );
    }
    // Create template
    const template = new MessageTemplateModel({
      ...templateData,
      churchId: user.user?.churchId,
      createdBy: user.user?.sub,
    });
    const savedTemplate = await template.save();
    // Populate the saved template for response
    const populatedTemplate = await MessageTemplateModel.findById(
      savedTemplate._id
    ).populate('createdBy', 'firstName lastName email');
    contextLogger.info('Template created successfully', {
      templateId: savedTemplate._id,
      name: savedTemplate.name,
      type: savedTemplate.type,
      category: savedTemplate.category,
    });
    return NextResponse.json(
      {
        success: true,
        data: populatedTemplate,
        message: 'Template created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    contextLogger.error('Unexpected error in createTemplateHandler', error);
    // Handle validation errors
    if (error instanceof mongoose.Error.ValidationError) {
      const validationErrors = Object.values(error.errors).map(
        (err) => err.message
      );
      return NextResponse.json(
        { error: 'Validation failed', details: validationErrors },
        { status: 400 }
      );
    }
    // Handle duplicate key error
    // if (error.code === 11_000) {
    //   return NextResponse.json(
    //     { error: 'Template with this name already exists' },
    //     { status: 409 }
    //   );
    // }
    return NextResponse.json(
      { error: 'Failed to create template' },
      { status: 500 }
    );
  }
}

// Export handlers with logging middleware
export const GET = withApiLogger(getTemplatesHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});

export const POST = withApiLogger(createTemplateHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});
