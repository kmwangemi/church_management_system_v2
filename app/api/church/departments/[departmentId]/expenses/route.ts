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

// GET /api/church/departments/[departmentId]/expenses - Get department expenses
async function getExpensesHandler(
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
    const { searchParams } = new URL(request.url);
    const page = Number.parseInt(searchParams.get('page') || '1', 10);
    const limit = Number.parseInt(searchParams.get('limit') || '10', 10);
    const category = searchParams.get('category') || '';
    const search = searchParams.get('search') || '';
    // Check if department exists and belongs to the user's church
    const department = await DepartmentModel.findOne({
      _id: departmentId,
      churchId: user.user.churchId,
    }).populate('expenses.approvedBy', 'firstName lastName');
    if (!department) {
      return NextResponse.json(
        { error: 'Department not found' },
        { status: 404 }
      );
    }
    // Filter expenses based on query parameters
    let filteredExpenses = [...department.expenses];
    // Filter by category
    if (
      category &&
      Object.values(ExpenseCategory).includes(category as ExpenseCategory)
    ) {
      filteredExpenses = filteredExpenses.filter(
        (exp) => exp.category === category
      );
    }
    // Filter by search term (description)
    if (search) {
      filteredExpenses = filteredExpenses.filter((exp) =>
        exp.description.toLowerCase().includes(search.toLowerCase())
      );
    }
    // Sort by date (most recent first)
    filteredExpenses.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    // Calculate pagination
    const total = filteredExpenses.length;
    const skip = (page - 1) * limit;
    const paginatedExpenses = filteredExpenses.slice(skip, skip + limit);
    // Calculate total spent amount from filtered expenses
    const totalSpent = filteredExpenses.reduce(
      (sum, exp) => sum + exp.amount,
      0
    );
    // Get budget summary
    const budgetSummary = {
      totalBudget: department.totalBudget,
      totalSpent: department.expenses.reduce((sum, exp) => sum + exp.amount, 0),
      remainingBudget:
        department.totalBudget -
        department.expenses.reduce((sum, exp) => sum + exp.amount, 0),
      budgetCategories: department.budgetCategories,
    };
    contextLogger.info('Department expenses retrieved successfully', {
      departmentId,
      totalExpenses: total,
      page,
      limit,
    });
    return NextResponse.json({
      expenses: paginatedExpenses,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      summary: {
        filteredTotal: totalSpent,
        departmentName: department.departmentName,
        ...budgetSummary,
      },
    });
  } catch (error: any) {
    contextLogger.error('Unexpected error in getExpensesHandler', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
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
      totalExpenses + Number(amount) > department.totalBudget
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

// Export the handlers wrapped with logging middleware
export const GET = withApiLogger(getExpensesHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});

export const POST = withApiLogger(addExpenseHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});
