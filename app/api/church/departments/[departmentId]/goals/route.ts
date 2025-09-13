// /api/church/departments/[id]/goals/route.ts
import { connectDB } from '@/lib/mongodb';
import Department, { GoalStatus } from '@/models/Department';
import mongoose from 'mongoose';
import { type NextRequest, NextResponse } from 'next/server';

// GET /api/church/departments/[id]/goals - List goals
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const { id } = params;
    const { searchParams } = new URL(request.url);

    // Query parameters for filtering
    const status = searchParams.get('status');
    const limit = Number.parseInt(searchParams.get('limit') || '50');
    const page = Number.parseInt(searchParams.get('page') || '1');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid department ID' },
        { status: 400 }
      );
    }

    const department = await Department.findById(id)
      .populate('goals.createdBy', 'firstName lastName')
      .populate('goals.assignedTo', 'firstName lastName');

    if (!department) {
      return NextResponse.json(
        { error: 'Department not found' },
        { status: 404 }
      );
    }

    let goals = department.goals;

    // Apply status filter
    if (status && Object.values(GoalStatus).includes(status as GoalStatus)) {
      goals = goals.filter((goal) => goal.status === status);
    }

    // Sort goals
    goals.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'targetDate':
          aValue = new Date(a.targetDate).getTime();
          bValue = new Date(b.targetDate).getTime();
          break;
        case 'progress':
          aValue = a.progress;
          bValue = b.progress;
          break;
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      }
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    });

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const paginatedGoals = goals.slice(startIndex, startIndex + limit);

    // Calculate statistics
    const stats = {
      total: goals.length,
      planned: goals.filter((g) => g.status === GoalStatus.PLANNED).length,
      inProgress: goals.filter((g) => g.status === GoalStatus.IN_PROGRESS)
        .length,
      completed: goals.filter((g) => g.status === GoalStatus.COMPLETED).length,
      cancelled: goals.filter((g) => g.status === GoalStatus.CANCELLED).length,
      averageProgress:
        goals.length > 0
          ? goals.reduce((sum, g) => sum + g.progress, 0) / goals.length
          : 0,
    };

    return NextResponse.json({
      success: true,
      data: {
        goals: paginatedGoals,
        statistics: stats,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(goals.length / limit),
          totalGoals: goals.length,
          hasMore: startIndex + limit < goals.length,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching goals:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/church/departments/[id]/goals - Add goal
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

    const {
      title,
      description,
      targetDate,
      assignedTo,
      milestones,
      createdBy,
    } = body;

    // Validate required fields
    if (!(title && description && targetDate && createdBy)) {
      return NextResponse.json(
        { error: 'title, description, targetDate, and createdBy are required' },
        { status: 400 }
      );
    }

    // Validate target date is in the future
    const target = new Date(targetDate);
    if (target <= new Date()) {
      return NextResponse.json(
        { error: 'Target date must be in the future' },
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

    // Process milestones if provided
    const processedMilestones = milestones
      ? milestones.map((milestone: any) => ({
          title: milestone.title,
          description: milestone.description || undefined,
          targetDate: new Date(milestone.targetDate),
          isCompleted: false,
        }))
      : [];

    // Create new goal
    const newGoal = {
      _id: new mongoose.Types.ObjectId(),
      title,
      description,
      targetDate: target,
      status: GoalStatus.PLANNED,
      progress: 0,
      assignedTo: assignedTo
        ? assignedTo.map(
            (userId: string) => new mongoose.Types.ObjectId(userId)
          )
        : [],
      milestones: processedMilestones,
      createdBy: new mongoose.Types.ObjectId(createdBy),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    department.goals.push(newGoal);
    await department.save();

    // Populate the new goal
    await department.populate([
      { path: 'goals.createdBy', select: 'firstName lastName' },
      { path: 'goals.assignedTo', select: 'firstName lastName' },
    ]);

    const addedGoal = department.goals[department.goals.length - 1];

    return NextResponse.json(
      {
        success: true,
        message: 'Goal added successfully',
        data: addedGoal,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error adding goal:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
