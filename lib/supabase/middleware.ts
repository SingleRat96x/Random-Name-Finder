import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export async function updateSession(request: NextRequest) {
  /**
   * 1.  Build SSR-aware Supabase client -------------------------------
   */
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name)   => request.cookies.get(name)?.value,
        set: (name, value, options: CookieOptions) => {
          request.cookies.set({ name, value, ...options });
        },
        remove: (name, options: CookieOptions) => {
          request.cookies.set({ name, value: '', ...options });
        },
      },
    },
  );

  /**
   * 2.  Always verify the cookie with getUser() -----------------------
   */
  const { data: { user: verifiedUser } } = await supabase.auth.getUser();

  const pathname      = request.nextUrl.pathname;
  const isProtected   = pathname.startsWith('/dashboard') || pathname.startsWith('/profile');
  const isAdminRoute  = pathname.startsWith('/admin');

  // 2a. Unauthenticated → bounce to /login
  if (!verifiedUser && (isProtected || isAdminRoute)) {
    const url = new URL('/login', request.url);
    url.searchParams.set('redirectedFrom', pathname);
    return NextResponse.redirect(url);
  }

  // 2b.  Admin route → check role in profiles table
  if (verifiedUser && isAdminRoute) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', verifiedUser.id)
      .single();

    if (profile?.role !== 'admin') {
      // not an admin – send to dashboard instead
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  /**
   * 3.  Auth pages while already signed-in → send home ---------------
   */
  if (verifiedUser && (pathname === '/login' || pathname === '/signup')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
} 