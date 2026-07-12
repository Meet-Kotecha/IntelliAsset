import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

/**
 * Get user session from the request cookies.
 * Returns user object or null if not authenticated.
 */
export function getSession(request) {
  const cookieHeader = request.headers.get('cookie') || '';
  const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    if (key && value) {
      acc[key] = decodeURIComponent(value);
    }
    return acc;
  }, {});

  const userCookie = cookies['user'];
  if (!userCookie) return null;

  try {
    const user = JSON.parse(userCookie);
    // Basic validation – ensure user has id and role
    if (!user.id || !user.role) return null;
    return user;
  } catch {
    return null;
  }
}

/**
 * Higher-order function to require authentication for an API handler.
 * If no user, returns 401 Unauthorized.
 */
export function requireAuth(handler) {
  return async (request, ...args) => {
    const user = getSession(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Attach user to request for downstream handlers
    request.user = user;
    return handler(request, ...args);
  };
}

/**
 * Higher-order function to require specific roles.
 * Accepts a single role or an array of roles.
 */
export function requireRole(roles) {
  return (handler) => {
    return async (request, ...args) => {
      const user = getSession(request);
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      const allowedRoles = Array.isArray(roles) ? roles : [roles];
      if (!allowedRoles.includes(user.role)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      request.user = user;
      return handler(request, ...args);
    };
  };
}

/**
 * Clear session cookie (logout).
 */
export function clearSession() {
  return new Response(null, {
    status: 200,
    headers: {
      'Set-Cookie': 'user=; path=/; max-age=0; SameSite=Lax',
    },
  });
}