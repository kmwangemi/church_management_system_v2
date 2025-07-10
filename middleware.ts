import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './lib/auth';

// Define protected routes and their required roles
const protectedRoutes = {
  '/member': ['member', 'admin', 'superadmin'],
  '/dashboard': ['member', 'admin', 'superadmin'],
  '/superadmin': ['superadmin'],
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // Check if the current path is protected
  const matchedRoute = Object.keys(protectedRoutes).find(route =>
    pathname.startsWith(route),
  );
  if (!matchedRoute) {
    return NextResponse.next();
  }
  const requiredRoles =
    protectedRoutes[matchedRoute as keyof typeof protectedRoutes];
  // Use your existing token verification logic with expiration check
  const user = await verifyToken(request);
  if (!user) {
    // Token is either missing, invalid, or expired
    const loginUrl = new URL('/auth/login', request.url);
    // Optional: Add a query parameter to indicate why they're being redirected
    if (request.cookies.get('token')?.value) {
      loginUrl.searchParams.set('reason', 'expired');
    }
    // Clear the expired/invalid token cookie
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete('token');
    return response;
  }
  // Check if user has required role
  if (!user.user || !requiredRoles.includes(user.user.role)) {
    return NextResponse.redirect(new URL('/auth/unauthorized', request.url));
  }
  // Optional: Add user data to headers for use in your app
  const response = NextResponse.next();
  response.headers.set('x-user-id', user.user.sub);
  response.headers.set('x-church-id', user.user.churchId);
  response.headers.set('x-branch-id', user.user.branchId);
  response.headers.set('x-user-role', user.user.role);
  return response;
}

export const config = {
  matcher: [
    '/member/:path*',
    '/dashboard/:path*',
    '/superadmin/:path*',
  ],
};
