// api/church/groups/[id]/goals/route.ts
import { connectDB } from '@/lib/mongodb';
import Group, { GroupGoalStatus } from '@/models/Group';
import mongoose from 'mongoose';
import { type NextRequest, NextResponse } from 'next/server';

// GET /api/church/groups/[id]/goals - List group goals
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as GroupGoalStatus;

    const group = await Group.findById(params.id)
      .populate('goals.createdBy', 'firstName lastName')
      .populate('goals.assignedTo', 'firstName lastName');

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    let goals = [...group.goals];

    if (status) {
      goals = goals.filter((goal) => goal.status === status);
    }

    goals.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({ goals });
  } catch (error) {
    console.error('Error fetching group goals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch group goals' },
      { status: 500 }
    );
  }
}

// POST /api/church/groups/[id]/goals - Create new goal
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const body = await request.json();
    const {
      title,
      description,
      targetDate,
      assignedTo = [],
      milestones = [],
      metrics,
      createdBy,
    } = body;

    if (!(title && description && targetDate && createdBy)) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const group = await Group.findById(params.id);
    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    const newGoal = {
      _id: new mongoose.Types.ObjectId(),
      title,
      description,
      targetDate: new Date(targetDate),
      status: GroupGoalStatus.PLANNED,
      progress: 0,
      assignedTo,
      milestones,
      metrics,
      createdBy,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    group.goals.push(newGoal);
    await group.save();

    const updatedGroup = await Group.findById(params.id).populate(
      'goals.createdBy',
      'firstName lastName'
    );

    const createdGoal = updatedGroup.goals.find(
      (goal) => goal._id?.toString() === newGoal._id.toString()
    );

    return NextResponse.json(createdGoal, { status: 201 });
  } catch (error) {
    console.error('Error creating group goal:', error);
    return NextResponse.json(
      { error: 'Failed to create group goal' },
      { status: 500 }
    );
  }
}
