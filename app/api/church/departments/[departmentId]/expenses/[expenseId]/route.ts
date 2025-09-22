// /api/church/departments/[departmentId]/expenses/[expenseId]/route.ts
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
    expenseId: string;
  };
}

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

// PUT /api/church/departments/[departmentId]/expenses/[expenseId] - Update expense
async function updateExpenseHandler(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { departmentId, expenseId } = await params;
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    {
      requestId,
      endpoint: `/api/church/departments/${departmentId}/expenses/${expenseId}`,
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
    if (
      !(
        mongoose.Types.ObjectId.isValid(departmentId) &&
        mongoose.Types.ObjectId.isValid(expenseId)
      )
    ) {
      return NextResponse.json(
        { error: 'Invalid department ID or expense ID' },
        { status: 400 }
      );
    }
    await dbConnect();
    const body = await request.json();
    const { category, amount, description, date, approvedBy, receiptUrl } =
      body;
    // Validate request body
    if (!body || Object.keys(body).length === 0) {
      return NextResponse.json(
        { error: 'Request body cannot be empty' },
        { status: 400 }
      );
    }
    // Validate category if provided
    if (category && !Object.values(ExpenseCategory).includes(category)) {
      return NextResponse.json(
        { error: 'Invalid expense category' },
        { status: 400 }
      );
    }
    // Validate amount if provided
    // if (amount !== undefined && (typeof amount !== 'number' || amount <= 0)) {
    //   return NextResponse.json(
    //     { error: 'Amount must be a positive number' },
    //     { status: 400 }
    //   );
    // }
    // Validate date if provided
    if (date) {
      const parsedDate = new Date(date);
      if (Number.isNaN(parsedDate.getTime())) {
        return NextResponse.json(
          { error: 'Invalid date format' },
          { status: 400 }
        );
      }
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
    // Find the expense
    const expenseIndex = department.expenses.findIndex(
      (expense: DepartmentExpense) => expense._id?.toString() === expenseId
    );
    if (expenseIndex === -1) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }
    const expense = department.expenses[expenseIndex];
    const originalAmount = expense.amount;
    const originalCategory = expense.category;
    // Track what fields are being updated
    const updatedFields: string[] = [];
    // Update expense fields
    if (category !== undefined && category !== expense.category) {
      expense.category = category;
      updatedFields.push('category');
    }
    if (amount !== undefined && amount !== expense.amount) {
      // Check if updated expense would exceed budget
      const totalExpensesWithoutCurrent = department.expenses.reduce(
        (sum: number, exp: DepartmentExpense, index: number) =>
          index === expenseIndex ? sum : sum + exp.amount,
        0
      );
      if (
        department.totalBudget > 0 &&
        totalExpensesWithoutCurrent + Number(amount) > department.totalBudget
      ) {
        return NextResponse.json(
          {
            error: 'Updated expense would exceed total department budget',
            currentSpent: totalExpensesWithoutCurrent + originalAmount,
            totalBudget: department.totalBudget,
            remainingBudget:
              department.totalBudget - totalExpensesWithoutCurrent,
          },
          { status: 400 }
        );
      }
      expense.amount = amount;
      updatedFields.push('amount');
    }
    if (description !== undefined && description !== expense.description) {
      if (typeof description !== 'string' || description.trim().length === 0) {
        return NextResponse.json(
          { error: 'Description must be a non-empty string' },
          { status: 400 }
        );
      }
      expense.description = description.trim();
      updatedFields.push('description');
    }
    if (date !== undefined) {
      const parsedDate = new Date(date);
      if (parsedDate.getTime() !== expense.date?.getTime()) {
        expense.date = parsedDate;
        updatedFields.push('date');
      }
    }
    if (
      approvedBy !== undefined &&
      approvedBy !== expense.approvedBy?.toString()
    ) {
      expense.approvedBy = approvedBy
        ? new mongoose.Types.ObjectId(approvedBy)
        : undefined;
      updatedFields.push('approvedBy');
    }
    if (receiptUrl !== undefined && receiptUrl !== expense.receiptUrl) {
      expense.receiptUrl = receiptUrl || undefined;
      updatedFields.push('receiptUrl');
    }
    // Check if any changes were made
    if (updatedFields.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No changes detected',
        data: expense,
      });
    }
    // Update spent amounts in budget categories if category or amount changed
    if (
      originalCategory !== expense.category ||
      originalAmount !== expense.amount
    ) {
      // Remove old amount from original category
      const oldBudgetCategory = department.budgetCategories.find(
        (cat: { category: ExpenseCategory; spentAmount: number }) =>
          cat.category === originalCategory
      );
      if (oldBudgetCategory) {
        oldBudgetCategory.spentAmount -= originalAmount;
      }
      // Add new amount to new/updated category
      const newBudgetCategory = department.budgetCategories.find(
        (cat: { category: ExpenseCategory; spentAmount: number }) =>
          cat.category === expense.category
      );
      if (newBudgetCategory) {
        newBudgetCategory.spentAmount += expense.amount;
      }
    }
    await department.save();
    // Populate the updated expense
    await department.populate('expenses.approvedBy', 'firstName lastName');
    contextLogger.info('Department expense updated successfully', {
      departmentId,
      expenseId,
      updatedFields,
      amountChange:
        originalAmount !== expense.amount
          ? `${originalAmount} -> ${expense.amount}`
          : null,
      categoryChange:
        originalCategory !== expense.category
          ? `${originalCategory} -> ${expense.category}`
          : null,
    });
    return NextResponse.json({
      success: true,
      message: 'Expense updated successfully',
      data: department.expenses[expenseIndex],
      changes: {
        updatedFields,
        amountChanged: originalAmount !== expense.amount,
        categoryChanged: originalCategory !== expense.category,
      },
    });
  } catch (error: any) {
    contextLogger.error('Unexpected error in updateExpenseHandler', error);
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.message },
        { status: 400 }
      );
    }
    if (error.name === 'CastError') {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/church/departments/[departmentId]/expenses/[expenseId] - Remove expense
async function removeExpenseHandler(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { departmentId, expenseId } = await params;
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    {
      requestId,
      endpoint: `/api/church/departments/${departmentId}/expenses/${expenseId}`,
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
    if (
      !(
        mongoose.Types.ObjectId.isValid(departmentId) &&
        mongoose.Types.ObjectId.isValid(expenseId)
      )
    ) {
      return NextResponse.json(
        { error: 'Invalid department ID or expense ID' },
        { status: 400 }
      );
    }
    await dbConnect();
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
    // Find and remove the expense
    const expenseIndex = department.expenses.findIndex(
      (expense: DepartmentExpense) => expense._id?.toString() === expenseId
    );
    if (expenseIndex === -1) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }
    // Store expense info for logging before removal
    const removedExpense = department.expenses[expenseIndex];
    // Update spent amount in budget categories
    const budgetCategory = department.budgetCategories.find(
      (cat: { category: ExpenseCategory; spentAmount: number }) =>
        cat.category === removedExpense.category
    );
    if (budgetCategory) {
      budgetCategory.spentAmount -= removedExpense.amount;
    }
    // Remove expense from array
    department.expenses.splice(expenseIndex, 1);
    await department.save();
    contextLogger.info('Department expense removed successfully', {
      departmentId,
      expenseId,
      expenseDescription: removedExpense.description,
      expenseAmount: removedExpense.amount,
      expenseCategory: removedExpense.category,
    });
    return NextResponse.json({
      success: true,
      message: 'Expense removed successfully',
      data: {
        expenseId,
        removedAmount: removedExpense.amount,
        category: removedExpense.category,
      },
    });
  } catch (error: any) {
    contextLogger.error('Unexpected error in removeExpenseHandler', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Export the handlers wrapped with logging middleware
export const PUT = withApiLogger(updateExpenseHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});

export const DELETE = withApiLogger(removeExpenseHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});
