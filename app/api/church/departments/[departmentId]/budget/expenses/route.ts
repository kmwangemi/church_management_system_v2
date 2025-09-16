// /api/church/departments/[departmentId]/expenses/route.ts
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

// POST /api/church/departments/[departmentId]/expenses - Add expense
async function addExpenseHandler(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { departmentId } = await params;
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    {
      requestId,
      endpoint: `/api/church/departments/${departmentId}/expenses`,
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
    const { category, amount, description, date, approvedBy, receiptUrl } =
      body;
    // Validate required fields
    if (!(category && amount) || amount <= 0 || !description || !date) {
      return NextResponse.json(
        { error: 'category, amount, description, and date are required' },
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
    // Check if expense would exceed budget
    interface DepartmentExpense {
      _id: mongoose.Types.ObjectId;
      category: ExpenseCategory;
      amount: number;
      description: string;
      date: Date;
      approvedBy?: mongoose.Types.ObjectId;
      receiptUrl?: string;
      createdAt: Date;
    }
    const totalExpenses = department.expenses.reduce(
      (sum: number, exp: DepartmentExpense) => sum + exp.amount,
      0
    );
    if (
      department.totalBudget > 0 &&
      totalExpenses + amount > department.totalBudget
    ) {
      return NextResponse.json(
        {
          error: 'Expense would exceed total department budget',
          currentSpent: totalExpenses,
          totalBudget: department.totalBudget,
          remainingBudget: department.totalBudget - totalExpenses,
        },
        { status: 400 }
      );
    }
    // Add new expense
    const newExpense = {
      _id: new mongoose.Types.ObjectId(),
      category,
      amount,
      description,
      date: new Date(date),
      approvedBy: approvedBy
        ? new mongoose.Types.ObjectId(approvedBy)
        : undefined,
      receiptUrl: receiptUrl || undefined,
      createdAt: new Date(),
    };
    department.expenses.push(newExpense);
    // Update spent amount in budget categories if category exists
    const budgetCategory = department.budgetCategories.find(
      (cat: { category: ExpenseCategory; spentAmount: number }) =>
        cat.category === category
    );
    if (budgetCategory) {
      budgetCategory.spentAmount += amount;
    }
    await department.save();
    // Populate approvedBy field
    await department.populate('expenses.approvedBy', 'firstName lastName');
    const addedExpense = department.expenses.at(-1);
    contextLogger.info('Department expense added successfully', {
      departmentId,
      expenseId: newExpense._id,
      category,
      amount,
    });
    return NextResponse.json(
      {
        success: true,
        message: 'Expense added successfully',
        data: addedExpense,
      },
      { status: 201 }
    );
  } catch (error: any) {
    contextLogger.error('Unexpected error in addExpenseHandler', error);
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
export const POST = withApiLogger(addExpenseHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});
