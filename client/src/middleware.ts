import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check if token exists in cookies
  const tokenCookie = request.cookies.get('token')?.value;
  const token = tokenCookie === 'none' ? null : tokenCookie;

  // Protected routes that require authentication
  const protectedPaths = ['/dashboard', '/studio', '/settings', '/analytics'];
  
  const isProtectedPath = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );

  // If trying to access a protected route without a valid token, redirect to login
  if (isProtectedPath && !token) {
    const loginUrl = new URL('/login', request.url);
    // Add ?redirect=path so they can be redirected back after login if needed
    // loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Optional: If trying to access login/signup while already logged in, redirect to dashboard
  const authPaths = ['/login', '/signup'];
  const isAuthPath = authPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );
  
  if (isAuthPath && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/studio/:path*',
    '/settings/:path*',
    '/analytics/:path*',
    '/login',
    '/signup'
  ],
};
