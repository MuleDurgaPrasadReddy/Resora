import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // Refresh the Supabase authentication session and retrieve authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname, searchParams } = request.nextUrl;

  // Safe redirect helper preventing open-redirect attacks
  const isSafeRedirect = (url: string | null): boolean => {
    if (!url) return false;
    return url.startsWith('/') && !url.startsWith('//') && !url.startsWith('/\\');
  };

  const isDemoMode = process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === 'true';

  // Protected route groups: /admin/*, /faculty/*, /student/*
  const isAdminRoute = pathname.startsWith('/admin');
  const isFacultyRoute = pathname.startsWith('/faculty');
  const isStudentRoute = pathname.startsWith('/student');
  const isProtectedRoute = isAdminRoute || isFacultyRoute || isStudentRoute;

  // In production (demo mode disabled), enforce strict session and role protection
  if (!isDemoMode && isProtectedRoute) {
    if (!user) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(loginUrl);
    }

    const metadataRole = (user.user_metadata?.role || user.app_metadata?.role || '').toUpperCase();

    // /admin/* requires ADMIN role
    if (isAdminRoute && metadataRole && metadataRole !== 'ADMIN') {
      const redirectPath = metadataRole === 'FACULTY' ? '/faculty/dashboard' : '/student/dashboard';
      return NextResponse.redirect(new URL(redirectPath, request.url));
    }

    // /faculty/* requires FACULTY or ADMIN role
    if (isFacultyRoute && metadataRole === 'STUDENT') {
      return NextResponse.redirect(new URL('/student/dashboard', request.url));
    }
  }

  // If authenticated user visits /login or /signup, redirect them to intended or role dashboard
  if (!isDemoMode && (pathname === '/login' || pathname === '/signup') && user) {
    const redirectTo = searchParams.get('redirectTo');
    if (isSafeRedirect(redirectTo)) {
      return NextResponse.redirect(new URL(redirectTo!, request.url));
    }
    const role = (user.user_metadata?.role || 'STUDENT').toUpperCase();
    const defaultDashboard =
      role === 'ADMIN' ? '/admin/dashboard' : role === 'FACULTY' ? '/faculty/dashboard' : '/student/dashboard';
    return NextResponse.redirect(new URL(defaultDashboard, request.url));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - static image files (.svg, .png, .jpg, .jpeg, .gif, .webp)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
