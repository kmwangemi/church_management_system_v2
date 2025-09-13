// /api/church/departments/[id]/activities/route.ts
import { connectDB } from '@/lib/mongodb';
import Department, { ActivityType } from '@/models/Department';
import mongoose from 'mongoose';
import { type NextRequest, NextResponse } from 'next/server';

// GET /api/church/departments/[id]/activities - List activities
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const { id } = params;
    const { searchParams } = new URL(request.url);

    // Query parameters for filtering
    const type = searchParams.get('type');
    const status = searchParams.get('status'); // 'completed' or 'upcoming'
    const limit = Number.parseInt(searchParams.get('limit') || '50');
    const page = Number.parseInt(searchParams.get('page') || '1');
    const sortBy = searchParams.get('sortBy') || 'date';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid department ID' },
        { status: 400 }
      );
    }

    const department = await Department.findById(id)
      .populate('activities.organizedBy', 'firstName lastName')
      .populate('activities.participants', 'firstName lastName');

    if (!department) {
      return NextResponse.json(
        { error: 'Department not found' },
        { status: 404 }
      );
    }

    let activities = department.activities;

    // Apply filters
    if (type && Object.values(ActivityType).includes(type as ActivityType)) {
      activities = activities.filter((activity) => activity.type === type);
    }

    if (status === 'completed') {
      activities = activities.filter((activity) => activity.isCompleted);
    } else if (status === 'upcoming') {
      activities = activities.filter((activity) => !activity.isCompleted);
    }

    // Sort activities
    activities.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'date':
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
          break;
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'type':
          aValue = a.type;
          bValue = b.type;
          break;
        default:
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      }
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    });

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const paginatedActivities = activities.slice(
      startIndex,
      startIndex + limit
    );

    return NextResponse.json({
      success: true,
      data: {
        activities: paginatedActivities,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(activities.length / limit),
          totalActivities: activities.length,
          hasMore: startIndex + limit < activities.length,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching activities:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/church/departments/[id]/activities - Add activity
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
      type,
      date,
      duration,
      location,
      participants,
      organizedBy,
      notes,
    } = body;

    // Validate required fields
    if (!(title && description && type && date && organizedBy)) {
      return NextResponse.json(
        {
          error: 'title, description, type, date, and organizedBy are required',
        },
        { status: 400 }
      );
    }

    // Validate activity type
    if (!Object.values(ActivityType).includes(type)) {
      return NextResponse.json(
        { error: 'Invalid activity type' },
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

    // Create new activity
    const newActivity = {
      _id: new mongoose.Types.ObjectId(),
      title,
      description,
      type,
      date: new Date(date),
      duration: duration || undefined,
      location: location || undefined,
      participants: participants
        ? participants.map((p: string) => new mongoose.Types.ObjectId(p))
        : [],
      organizedBy: new mongoose.Types.ObjectId(organizedBy),
      notes: notes || undefined,
      isCompleted: false,
      createdAt: new Date(),
    };

    department.activities.push(newActivity);
    await department.save();

    // Populate the new activity
    await department.populate([
      { path: 'activities.organizedBy', select: 'firstName lastName' },
      { path: 'activities.participants', select: 'firstName lastName' },
    ]);

    const addedActivity =
      department.activities[department.activities.length - 1];

    return NextResponse.json(
      {
        success: true,
        message: 'Activity added successfully',
        data: addedActivity,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error adding activity:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
