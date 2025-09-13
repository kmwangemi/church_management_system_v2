import { connectDB } from '@/lib/mongodb';
import Department, { ExpenseCategory } from '@/models/Department';
import mongoose from 'mongoose';
import { type NextRequest, NextResponse } from 'next/server';

// /api/church/departments/[id]/expenses/route.ts
// POST /api/church/departments/[id]/expenses - Add expense
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const { id } = params;
    const body = await request.json();

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid department ID' },
        { status: 400 }
      );
    }

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

    const department = await Department.findById(id);

    if (!department) {
      return NextResponse.json(
        { error: 'Department not found' },
        { status: 404 }
      );
    }

    // Check if expense would exceed budget
    const totalExpenses = department.expenses.reduce(
      (sum, exp) => sum + exp.amount,
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
      (cat) => cat.category === category
    );
    if (budgetCategory) {
      budgetCategory.spentAmount += amount;
    }

    await department.save();

    // Populate approvedBy field
    await department.populate('expenses.approvedBy', 'firstName lastName');

    return NextResponse.json(
      {
        success: true,
        message: 'Expense added successfully',
        data: newExpense,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error adding expense:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
