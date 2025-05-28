import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase URL or Anon Key is missing in middleware');
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        // If the cookie is updated, update the cookies for the request and response
        request.cookies.set({
          name,
          value,
          ...options,
        });
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });
        response.cookies.set({
          name,
          value,
          ...options,
        });
      },
      remove(name: string, options: CookieOptions) {
        // If the cookie is removed, update the cookies for the request and response
        request.cookies.set({
          name,
          value: '',
          ...options,
        });
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });
        response.cookies.set({
          name,
          value: '',
          ...options,
        });
      },
    },
  });

  try {
    // Get session to check authentication status - this is more reliable for logout detection
    // https://supabase.com/docs/guides/auth/server-side/nextjs
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      console.error('Error getting session in middleware:', error);
    }

    // Use session.user for basic authentication checks (less critical)
    const user = session?.user;

    // Check if user is accessing a protected route
    const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard') || 
                            request.nextUrl.pathname.startsWith('/profile');
    
    const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');

    // If no session and trying to access protected route, redirect to login
    if (!session && (isProtectedRoute || isAdminRoute)) {
      const redirectUrl = new URL('/login', request.url);
      
      // Add the current path as a query parameter for potential redirect after login
      redirectUrl.searchParams.set('redirectedFrom', request.nextUrl.pathname);
      
      console.log(`Redirecting unauthenticated user from ${request.nextUrl.pathname} to login (session: ${session ? 'exists' : 'null'})`);
      return NextResponse.redirect(redirectUrl);
    }

    // If session exists and user is accessing admin route, perform secure verification
    if (session && isAdminRoute) {
      try {
        // SECURITY: Use getUser() for server-verified user object before role checks
        // This ensures the session is valid and hasn't been tampered with
        const { data: { user: verifiedUser }, error: authError } = await supabase.auth.getUser();

        if (authError || !verifiedUser) {
          console.error('Auth verification failed for admin route:', authError);
          // Session exists in cookie but couldn't be verified by server
          // This could indicate a tampered/expired session - redirect to login
          const redirectUrl = new URL('/login', request.url);
          redirectUrl.searchParams.set('error', 'auth_verification_failed');
          redirectUrl.searchParams.set('redirectedFrom', request.nextUrl.pathname);
          return NextResponse.redirect(redirectUrl);
        }

        // Now use the server-verified user ID for profile lookup
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', verifiedUser.id) // Use server-verified user ID
          .single();

        if (profileError) {
          console.error('Error fetching user profile for admin check:', profileError);
          // Redirect to dashboard if profile fetch fails
          return NextResponse.redirect(new URL('/dashboard', request.url));
        }

        if (profile?.role !== 'admin') {
          console.log(`Non-admin user ${verifiedUser.id} attempted to access admin route: ${request.nextUrl.pathname}`);
          // Redirect non-admin users to dashboard
          return NextResponse.redirect(new URL('/dashboard', request.url));
        }

        console.log(`Admin user ${verifiedUser.id} accessing admin route: ${request.nextUrl.pathname}`);
      } catch (err) {
        console.error('Error checking admin role:', err);
        // On error, redirect to dashboard for safety
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }

    // If user is authenticated and trying to access auth pages, redirect to dashboard
    if (user && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup')) {
      console.log(`Redirecting authenticated user from ${request.nextUrl.pathname} to dashboard`);
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

  } catch (err) {
    console.error('Unexpected error in middleware:', err);
    // On error, allow the request to continue but log the issue
  }

  return response;
} 