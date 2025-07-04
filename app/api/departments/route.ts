import { requireAuth } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import { AddDepartmentFormValues } from '@/lib/validations/department';
import Department from '@/models/Department';
import { type NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Check authentication and authorization
    const authResult = await requireAuth(['superadmin', 'admin'])(request);
    // If authResult is a Response object, it means authentication/authorization failed
    if (authResult instanceof Response) {
      return authResult;
    }
    // authResult is now the authenticated user
    const user = authResult;
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const page = Number.parseInt(searchParams.get('page') || '1');
    const limit = Number.parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const query: any = { churchId: user.churchId };
    if (search) {
      query.$or = [
        { departmentName: { $regex: search, $options: 'i' } },
        // { address: { $regex: search, $options: 'i' } },
      ];
    }
    const skip = (page - 1) * limit;
    const [departments, total] = await Promise.all([
      Department.find(query)
        .populate('branchId', 'branchName address country')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Department.countDocuments(query),
    ]);
    return NextResponse.json({
      departments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get departments error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication and authorization
    const authResult = await requireAuth(['superadmin', 'admin'])(request);
    // If authResult is a Response object, it means authentication/authorization failed
    if (authResult instanceof Response) {
      return authResult;
    }
    // authResult is now the authenticated user
    const user = authResult;
    await dbConnect();
    const departmentData: AddDepartmentFormValues = await request.json();
    const existingChurchBranchDepartment = await Department.findOne({
      departmentName: departmentData.departmentName,
      branchId: departmentData.branchId,
      churchId: user.churchId,
    });
    if (existingChurchBranchDepartment) {
      return NextResponse.json(
        { error: 'Church branch department already exists' },
        { status: 400 },
      );
    }
    const department = new Department({
      ...departmentData,
      churchId: user.churchId,
    });
    await department.save();
    console.log('department---->', JSON.stringify(department));
    return NextResponse.json(department, { status: 201 });
  } catch (error) {
    console.error('Create department error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
