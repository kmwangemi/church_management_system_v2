import { type NextRequest, NextResponse } from 'next/server';
import { getServerSession } from './lib/get-session';
export async function middleware(request: NextRequest) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }
  return NextResponse.next();
}
export const config = {
  runtime: 'nodejs',
  matcher: ['/member/:path*', '/church/:path*', '/superadmin/:path*'], // Apply middleware to specific routes
};
