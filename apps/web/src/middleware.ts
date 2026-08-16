import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJwt } from '@talora/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect /api/v1 routes for now, exclude auth
  if (pathname.startsWith('/api/v1') && !pathname.startsWith('/api/v1/auth') && !pathname.startsWith('/api/v1/health')) {
    const token = request.cookies.get('talora_token')?.value;

    if (!token) {
      return NextResponse.json(
        { code: 'UNAUTHORIZED', message: 'Authentication required' },
        { status: 401 }
      );
    }

    try {
      const payload = await verifyJwt(token);
      
      // Clone the request headers and inject user info
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', payload.userId);
      // We could also pass roles as a JSON string, but for now we'll fetch them in the route if needed,
      // or pass the whole scope. Let's pass the stringified payload.
      requestHeaders.set('x-user-scope', JSON.stringify(payload));

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (error) {
      console.error('JWT verification failed in middleware:', error);
      return NextResponse.json(
        { code: 'UNAUTHORIZED', message: 'Invalid or expired token' },
        { status: 401 }
      );
    }
  }

  // Also protect dashboard routes if not logged in
  const isPublicRoute = pathname === '/login' || pathname === '/register';
  const isDashboardRoute = !isPublicRoute && !pathname.startsWith('/api/');

  if (isDashboardRoute) {
    const token = request.cookies.get('talora_token')?.value;
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    try {
      const payload = await verifyJwt(token);
      
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', payload.userId);
      requestHeaders.set('x-user-scope', JSON.stringify(payload));
      
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch {
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('talora_token');
      return response;
    }
  }

  // If visiting /login and already logged in, redirect to dashboard
  if (pathname === '/login') {
    const token = request.cookies.get('talora_token')?.value;
    if (token) {
      try {
        await verifyJwt(token);
        return NextResponse.redirect(new URL('/', request.url));
      } catch {
        // Invalid token, allow them to see login page
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
