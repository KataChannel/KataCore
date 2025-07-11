import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { siteConfig } from './lib/config/site';

export async function middleware(request: NextRequest) {
  console.log('Middleware called for:', request.nextUrl.pathname);

  // Get token from cookie
  const token = request.cookies.get('token')?.value;
  console.log('Token from cookie:', token ? '***' + token.slice(-10) : 'null');

  let isValidToken = false;

  if (token) {
    try {
      // Verify JWT token
      const secret = new TextEncoder().encode(
        process.env.JWT_SECRET || 'your-secret-key'
      );
      await jwtVerify(token, secret);
      isValidToken = true;
      console.log('Token verification: SUCCESS');
    } catch (error) {
      console.log('Token verification failed:', error);
      isValidToken = false;
    }
  }

  console.log('Token exists and valid:', isValidToken);

  const isAuthPage = request.nextUrl.pathname.startsWith('/login');
  const isProtectedRoute =
    request.nextUrl.pathname.startsWith('/admin') ||
    request.nextUrl.pathname.startsWith('/dashboard');

  // If on login page and already authenticated, redirect to dashboard
  if (isAuthPage) {
    if (isValidToken) {
      console.log('Redirecting authenticated user from login to dashboard');
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // If on protected route and not authenticated, redirect to login
  if (isProtectedRoute && siteConfig.auth.loginRequired) {
    if (!isValidToken) {
      console.log(
        'Redirecting unauthenticated user from protected route to login'
      );
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|public).*)'],
};
