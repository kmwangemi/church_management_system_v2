// /api/church/departments/[id]/budget/categories/route.ts
import { connectDB } from '@/lib/mongodb';
import Department, { ExpenseCategory } from '@/models/Department';
import mongoose from 'mongoose';
import { type NextRequest, NextResponse } from 'next/server';

// POST /api/church/departments/[id]/budget/categories - Add budget category
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

    const department = await Department.findById(id);

    if (!department) {
      return NextResponse.json(
        { error: 'Department not found' },
        { status: 404 }
      );
    }

    // Check if category already exists
    const existingCategory = department.budgetCategories.find(
      (cat) => cat.category === category
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

    return NextResponse.json(
      {
        success: true,
        message: 'Budget category added successfully',
        data: newCategory,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error adding budget category:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
