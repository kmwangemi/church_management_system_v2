import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { type NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  // IMPORTANT: Delete this endpoint after creating your admin!
  const secret = req.headers.get('x-setup-secret');
  if (secret !== process.env.SETUP_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { email, password, name } = await req.json();
  // Check if any user exists
  const userCount = await prisma.user.count();
  if (userCount > 0) {
    return Response.json({ error: 'Setup already completed' }, { status: 400 });
  }
  // Create super admin using Better Auth
  const user = await auth.api.signUpEmail({
    body: {
      email,
      password,
      name,
    },
  });
  // Update user to SUPER_ADMIN
  await prisma.user.update({
    where: { id: user.user.id },
    data: {
      role: 'SUPER_ADMIN',
      emailVerified: true,
      status: 'ACTIVE',
    },
  });
  return NextResponse.json(user);
}

// curl -X POST http://localhost:3000/api/setup \
//   -H "Content-Type: application/json" \
//   -H "x-setup-secret: your-random-secret-key-here" \
//   -d '{
//     "email": "admin@churchhub.com",
//     "password": "Password123!",
//     "name": "Super Admin"
//   }'
