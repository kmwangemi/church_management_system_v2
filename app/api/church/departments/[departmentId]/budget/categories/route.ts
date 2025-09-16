// /api/church/departments/[departmentId]/budget/categories/route.ts
import { requireAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { withApiLogger } from '@/lib/middleware/api-logger';
import dbConnect from '@/lib/mongodb';
import { DepartmentModel } from '@/models';
import { ExpenseCategory } from '@/models/department';
import mongoose from 'mongoose';
import { type NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  params: {
    departmentId: string;
  };
}

// POST /api/church/departments/[departmentId]/budget/categories - Add budget category
async function addBudgetCategoryHandler(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { departmentId } = await params;
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    {
      requestId,
      endpoint: `/api/church/departments/${departmentId}/budget/categories`,
    },
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
    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(departmentId)) {
      return NextResponse.json(
        { error: 'Invalid department ID' },
        { status: 400 }
      );
    }
    await dbConnect();
    const body = await request.json();
    const { category, allocatedAmount, description } = body;
    // Validate required fields
    if (!category || allocatedAmount === undefined || allocatedAmount < 0) {
      return NextResponse.json(
        { error: 'category and valid allocatedAmount are required' },
        { status: 400 }
      );
    }
    // Validate category
    if (!Object.values(ExpenseCategory).includes(category)) {
      return NextResponse.json(
        { error: 'Invalid expense category' },
        { status: 400 }
      );
    }
    // Check if department exists and belongs to the user's church
    const department = await DepartmentModel.findOne({
      _id: departmentId,
      churchId: user.user.churchId,
    });
    if (!department) {
      return NextResponse.json(
        { error: 'Department not found' },
        { status: 404 }
      );
    }
    // Check if category already exists
    const existingCategory = department.budgetCategories.find(
      (cat: { category: ExpenseCategory }) => cat.category === category
    );
    if (existingCategory) {
      return NextResponse.json(
        { error: 'Budget category already exists' },
        { status: 409 }
      );
    }
    // Add new budget category
    const newCategory = {
      category,
      allocatedAmount,
      spentAmount: 0,
      description: description || undefined,
    };
    department.budgetCategories.push(newCategory);
    await department.save();
    contextLogger.info('Budget category added successfully', {
      departmentId,
      category,
      allocatedAmount,
    });
    return NextResponse.json(
      {
        success: true,
        message: 'Budget category added successfully',
        data: newCategory,
      },
      { status: 201 }
    );
  } catch (error: any) {
    contextLogger.error('Unexpected error in addBudgetCategoryHandler', error);
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Export the handler wrapped with logging middleware
export const POST = withApiLogger(addBudgetCategoryHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});
