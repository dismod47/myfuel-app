import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        
        // Public routes
        const publicRoutes = [
          '/',
          '/auth/sign-in',
          '/auth/sign-up',
          '/api/auth',
        ];

        const isPublic = publicRoutes.some(route => 
          pathname.startsWith(route)
        ) || pathname.match(/^\/(favicon\.ico|_next\/|manifest\.)/);

        if (isPublic) return true;

        // All other routes require authentication
        return !!token;
      },
    },
    pages: {
      signIn: '/auth/sign-in',
    },
  }
);

export const config = {
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\..*|auth/sign-in|auth/sign-up).*)',
  ],
};
