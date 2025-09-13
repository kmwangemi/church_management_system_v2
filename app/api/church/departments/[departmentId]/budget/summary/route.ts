import { connectDB } from '@/lib/mongodb';
import Department from '@/models/Department';
import mongoose from 'mongoose';
import { type NextRequest, NextResponse } from 'next/server';

// /api/church/departments/[id]/budget/summary/route.ts
// GET /api/church/departments/[id]/budget/summary - Get budget summary
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const { id } = params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid department ID' },
        { status: 400 }
      );
    }

    const department = await Department.findById(id).select(
      'totalBudget budgetCategories expenses'
    );

    if (!department) {
      return NextResponse.json(
        { error: 'Department not found' },
        { status: 404 }
      );
    }

    // Calculate totals
    const totalSpent = department.expenses.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );
    const remainingBudget = department.totalBudget - totalSpent;

    // Calculate spending by category
    const categorySpending = department.expenses.reduce(
      (acc, expense) => {
        if (!acc[expense.category]) {
          acc[expense.category] = 0;
        }
        acc[expense.category] += expense.amount;
        return acc;
      },
      {} as Record<string, number>
    );

    // Prepare category breakdown
    const categoryBreakdown = department.budgetCategories.map((category) => ({
      category: category.category,
      allocated: category.allocatedAmount,
      spent: categorySpending[category.category] || 0,
      remaining:
        category.allocatedAmount - (categorySpending[category.category] || 0),
      description: category.description,
    }));

    // Add categories that have spending but no allocation
    Object.keys(categorySpending).forEach((category) => {
      if (
        !department.budgetCategories.find((cat) => cat.category === category)
      ) {
        categoryBreakdown.push({
          category,
          allocated: 0,
          spent: categorySpending[category],
          remaining: -categorySpending[category],
          description: 'No budget allocated',
        });
      }
    });

    const summary = {
      totalBudget: department.totalBudget,
      totalSpent,
      remainingBudget,
      budgetUtilization:
        department.totalBudget > 0
          ? (totalSpent / department.totalBudget) * 100
          : 0,
      categoryBreakdown,
      recentExpenses: department.expenses
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, 10), // Last 10 expenses
    };

    return NextResponse.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error('Error getting budget summary:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
