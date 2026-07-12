import { NextResponse } from 'next/server';
import { hasAccess } from './lib/rbac';

export function middleware(request) {
  const path = request.nextUrl.pathname;
  
  // Public routes (anyone can access these)
  const publicRoutes = ['/', '/login', '/signup'];
  const apiRoutes = ['/api'];
  
  // Allow public routes
  if (publicRoutes.includes(path) || path.startsWith('/api')) {
    return NextResponse.next();
  }

  // Get user from cookie (set after login)
  const userCookie = request.cookies.get('user');
  
  // If no cookie, redirect to login
  if (!userCookie) {
    const url = new URL('/login', request.url);
    url.searchParams.set('redirect', path);
    return NextResponse.redirect(url);
  }

  try {
    const user = JSON.parse(userCookie.value);
    
    // If user has no role or no access, redirect to unauthorized
    if (!user || !user.role || !hasAccess(user.role, path)) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  } catch (e) {
    // If cookie is invalid, redirect to login
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // User is authenticated and authorized
  return NextResponse.next();
}

// Which paths to protect
export const config = {
  matcher: [
    // Protect all dashboard routes
    '/admin/:path*',
    '/manager/:path*',
    '/department/:path*',
    '/employee/:path*',
    '/assets/:path*',
    '/allocations/:path*',
    '/bookings/:path*',
    '/maintenance/:path*',
    '/audits/:path*',
    '/reports/:path*',
    '/activity/:path*',
    '/people/:path*',
    '/departments/:path*',
    '/settings/:path*',
  ],
};