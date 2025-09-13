// api/church/groups/[id]/activities/route.ts
import { connectDB } from '@/lib/mongodb';
import Group, { type GroupActivityType } from '@/models/Group';
import mongoose from 'mongoose';
import { type NextRequest, NextResponse } from 'next/server';

// GET /api/church/groups/[id]/activities - List group activities
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = Number.parseInt(searchParams.get('page') || '1');
    const limit = Number.parseInt(searchParams.get('limit') || '10');
    const type = searchParams.get('type') as GroupActivityType;
    const upcoming = searchParams.get('upcoming') === 'true';
    const completed = searchParams.get('completed');

    const group = await Group.findById(params.id)
      .populate('activities.organizedBy', 'firstName lastName')
      .populate('activities.plannedParticipants', 'firstName lastName')
      .populate('activities.actualParticipants', 'firstName lastName');

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    let activities = [...group.activities];

    // Apply filters
    if (type) {
      activities = activities.filter((activity) => activity.type === type);
    }

    if (upcoming) {
      const now = new Date();
      activities = activities.filter(
        (activity) => activity.date > now && !activity.isCompleted
      );
    }

    if (completed !== null && completed !== undefined) {
      activities = activities.filter(
        (activity) => activity.isCompleted === (completed === 'true')
      );
    }

    // Sort by date
    activities.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    // Pagination
    const skip = (page - 1) * limit;
    const paginatedActivities = activities.slice(skip, skip + limit);

    return NextResponse.json({
      activities: paginatedActivities,
      pagination: {
        page,
        limit,
        total: activities.length,
        pages: Math.ceil(activities.length / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching group activities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch group activities' },
      { status: 500 }
    );
  }
}

// POST /api/church/groups/[id]/activities - Create new activity
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
      type,
      date,
      duration,
      location,
      plannedParticipants = [],
      organizedBy,
      materials = [],
      notes,
    } = body;

    if (!(title && description && type && date && organizedBy)) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const group = await Group.findById(params.id);
    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    const newActivity = {
      _id: new mongoose.Types.ObjectId(),
      title,
      description,
      type,
      date: new Date(date),
      duration,
      location,
      plannedParticipants,
      actualParticipants: [],
      organizedBy,
      materials,
      notes,
      attendance: [],
      isCompleted: false,
      createdAt: new Date(),
    };

    group.activities.push(newActivity);
    await group.save();

    const updatedGroup = await Group.findById(params.id).populate(
      'activities.organizedBy',
      'firstName lastName'
    );

    const createdActivity = updatedGroup.activities.find(
      (activity) => activity._id?.toString() === newActivity._id.toString()
    );

    return NextResponse.json(createdActivity, { status: 201 });
  } catch (error) {
    console.error('Error creating group activity:', error);
    return NextResponse.json(
      { error: 'Failed to create group activity' },
      { status: 500 }
    );
  }
}
