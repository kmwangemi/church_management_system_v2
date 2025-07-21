import { type NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { seedPermissions, seedRoles } from '@/scripts/seed-roles';

export async function POST(_request: NextRequest) {
  try {
    // Optional: Add authentication check here
    // const session = await getServerSession(authOptions);
    // if (!session || session.user.role !== 'superadmin') {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }
    // Check if seeding is allowed (you might want to disable this in production)
    if (
      process.env.NODE_ENV === 'production' &&
      process.env.ALLOW_SEEDING !== 'true'
    ) {
      return NextResponse.json(
        { error: 'Seeding is not allowed in production' },
        { status: 403 }
      );
    }
    await dbConnect();
    // Seed permissions first
    const permissionMap = await seedPermissions();
    // Seed roles
    await seedRoles();
    return NextResponse.json({
      message: 'Roles and permissions seeded successfully',
      permissions: permissionMap.size,
      roles: 'Seeded', // or provide another appropriate value
    });
  } catch (_error) {
    // console.error('Seeding error:', error);
    return NextResponse.json(
      { error: 'Internal server error during seeding' },
      { status: 500 }
    );
  }
}

// Optional: GET endpoint to check current roles
export async function GET() {
  try {
    await dbConnect();
    const { Role } = await import('@/models/role');
    const { Permission } = await import('@/models/permission');
    const roles = await Role.find({ isSystemRole: true }).populate(
      'permissions'
    );
    const permissions = await Permission.find();
    return NextResponse.json({
      roles: roles.map((role) => ({
        name: role.name,
        description: role.description,
        permissionCount: role.permissions.length,
      })),
      totalPermissions: permissions.length,
    });
  } catch (_error) {
    // console.error('Error fetching roles:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
