import { NextRequest } from 'next/server';
import { auth } from './config';

export async function middleware(request: NextRequest) {
  // Get the pathname of the request (e.g. /, /protected)
  const path = request.nextUrl.pathname;

  // Define protected routes
  const protectedRoutes = ['/admin', '/dashboard', '/profile'];
  const isProtectedRoute = protectedRoutes.some(route =>
    path.startsWith(route)
  );

  if (isProtectedRoute) {
    const session = await auth();

    if (!session) {
      // Redirect to login page
      return Response.redirect(new URL('/login', request.url));
    }
  }

  return Response.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
