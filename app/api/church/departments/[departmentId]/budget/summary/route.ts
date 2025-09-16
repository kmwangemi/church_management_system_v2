// /api/church/departments/[departmentId]/budget/summary/route.ts
import { requireAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { withApiLogger } from '@/lib/middleware/api-logger';
import dbConnect from '@/lib/mongodb';
import { DepartmentModel } from '@/models';
import mongoose from 'mongoose';
import { type NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  params: {
    departmentId: string;
  };
}

// GET /api/church/departments/[departmentId]/budget/summary - Get budget summary
async function getBudgetSummaryHandler(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { departmentId } = await params;
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    {
      requestId,
      endpoint: `/api/church/departments/${departmentId}/budget/summary`,
    },
    'api'
  );
  try {
    // Check authentication and authorization
    const authResult = await requireAuth(['superadmin', 'admin', 'member'])(
      request
    );
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
    // Check if department exists and belongs to the user's church
    const department = await DepartmentModel.findOne({
      _id: departmentId,
      churchId: user.user.churchId,
    }).select('totalBudget budgetCategories expenses');
    if (!department) {
      return NextResponse.json(
        { error: 'Department not found' },
        { status: 404 }
      );
    }
    // Calculate totals
    interface Expense {
      amount: number;
      category: string;
      createdAt: string | Date;
    }
    interface BudgetCategory {
      category: string;
      allocatedAmount: number;
      description?: string;
    }
    const totalSpent = department.expenses.reduce(
      (sum: number, expense: Expense) => sum + expense.amount,
      0
    );
    const remainingBudget = department.totalBudget - totalSpent;
    // Calculate spending by category
    interface CategorySpending {
      [category: string]: number;
    }
    const categorySpending = department.expenses.reduce(
      (acc: CategorySpending, expense: Expense): CategorySpending => {
        if (!acc[expense.category]) {
          acc[expense.category] = 0;
        }
        acc[expense.category] += expense.amount;
        return acc;
      },
      {} as CategorySpending
    );
    // Prepare category breakdown
    interface CategoryBreakdownItem {
      category: string;
      allocated: number;
      spent: number;
      remaining: number;
      description?: string;
    }
    const categoryBreakdown: CategoryBreakdownItem[] =
      department.budgetCategories.map(
        (category: BudgetCategory): CategoryBreakdownItem => ({
          category: category.category,
          allocated: category.allocatedAmount,
          spent: categorySpending[category.category] || 0,
          remaining:
            category.allocatedAmount -
            (categorySpending[category.category] || 0),
          description: category.description,
        })
      );
    // Add categories that have spending but no allocation
    Object.keys(categorySpending).forEach((category) => {
      if (
        !department.budgetCategories.find(
          (cat: BudgetCategory) => cat.category === category
        )
      ) {
        categoryBreakdown.push({
          category,
          allocated: 0,
          spent: categorySpending[category],
          remaining: -categorySpending[category],
          description: 'No budget allocated',
        } as CategoryBreakdownItem);
      }
    });
    interface RecentExpense {
      amount: number;
      category: string;
      createdAt: string | Date;
    }
    interface BudgetSummary {
      totalBudget: number;
      totalSpent: number;
      remainingBudget: number;
      budgetUtilization: number;
      categoryBreakdown: CategoryBreakdownItem[];
      recentExpenses: RecentExpense[];
    }
    const summary: BudgetSummary = {
      totalBudget: department.totalBudget,
      totalSpent,
      remainingBudget,
      budgetUtilization:
        department.totalBudget > 0
          ? (totalSpent / department.totalBudget) * 100
          : 0,
      categoryBreakdown,
      recentExpenses: (department.expenses as RecentExpense[])
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, 10), // Last 10 expenses
    };
    contextLogger.info('Budget summary retrieved successfully', {
      departmentId,
      totalBudget: department.totalBudget,
      totalSpent,
    });
    return NextResponse.json({
      success: true,
      data: summary,
    });
  } catch (error: any) {
    contextLogger.error('Unexpected error in getBudgetSummaryHandler', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Export the handler wrapped with logging middleware
export const GET = withApiLogger(getBudgetSummaryHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});
