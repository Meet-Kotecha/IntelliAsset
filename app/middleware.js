import { NextResponse } from 'next/server';
import { hasAccess } from './lib/rbac';

export function middleware(request) {
  const path = request.nextUrl.pathname;
  
  // Public routes (anyone can access these)
  const publicRoutes = ['/', '/login', '/signup'];
  const apiRoutes = ['/api'];
  
  if (publicRoutes.includes(path) || path.startsWith('/api')) {
    return NextResponse.next();
  }

  const userCookie = request.cookies.get('user');
  
  if (!userCookie) {
    const url = new URL('/login', request.url);
    url.searchParams.set('redirect', path);
    return NextResponse.redirect(url);
  }

  try {
    const user = JSON.parse(userCookie.value);
    if (!user || !user.role || !hasAccess(user.role, path)) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  } catch (e) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
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