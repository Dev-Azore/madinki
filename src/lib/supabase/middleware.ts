import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { Database } from '@/types/database';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  // Route classification
  const isAuthRoute =
    path.startsWith('/login') ||
    path.startsWith('/register') ||
    path.startsWith('/admin-login'); // Explicit admin login page
  const isLandingRoute = path === '/';
  const isPublicRoute = isAuthRoute || isLandingRoute || path.startsWith('/suspended') || path.startsWith('/not-found');
  const isAppRoute =
    path.startsWith('/dashboard') ||
    path.startsWith('/clients') ||
    path.startsWith('/templates') ||
    path.startsWith('/measurements');
  // /admin-login is excluded from the admin guard — it must remain directly reachable
  const isAdminRoute = path.startsWith('/admin') && !path.startsWith('/admin-login');

  // Unauthenticated users attempting to access /admin routes:
  // STEALTH MODE: Do NOT redirect to /admin-login (prevents route guessing/enumeration). Rewrite to 404 Not Found.
  if (!user && isAdminRoute) {
    return NextResponse.rewrite(new URL('/not-found', request.url), {
      status: 404,
    });
  }

  // Unauthenticated users accessing protected tailor app routes: redirect to /login
  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  if (user) {
    // Single query for user profile (role & status)
    const { data: profile } = await supabase
      .from('users')
      .select('role, status')
      .eq('id', user.id)
      .single();

    // Authenticated users visiting auth/login pages: redirect to their respective home
    if (isAuthRoute) {
      const destination = profile?.role === 'admin' ? '/admin' : '/dashboard';
      const url = request.nextUrl.clone();
      url.pathname = destination;
      return NextResponse.redirect(url);
    }

    // Block suspended accounts
    if (profile?.status === 'suspended' && !path.startsWith('/suspended')) {
      const url = request.nextUrl.clone();
      url.pathname = '/suspended';
      return NextResponse.redirect(url);
    }

    // Stealth protection: Non-admin users attempting to access /admin routes receive 404 Not Found
    if (isAdminRoute && profile?.role !== 'admin') {
      return NextResponse.rewrite(new URL('/not-found', request.url), {
        status: 404,
      });
    }

    // Prevent admins from accidentally using tailor app routes
    if (isAppRoute && profile?.role === 'admin') {
      const url = request.nextUrl.clone();
      url.pathname = '/admin';
      return NextResponse.redirect(url);
    }

    // Prevent stale browser cache on authenticated app/admin views
    if (isAppRoute || isAdminRoute) {
      supabaseResponse.headers.set(
        'Cache-Control',
        'no-store, no-cache, max-age=0, must-revalidate'
      );
    }
  }

  return supabaseResponse;
}
