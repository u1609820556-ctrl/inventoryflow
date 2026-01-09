import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const res = NextResponse.next();

  // Public routes that don't require authentication
  const publicRoutes = ['/login'];
  if (publicRoutes.includes(pathname)) {
    return res;
  }

  // Check authentication
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // If Supabase is not configured, allow through (development mode)
    return res;
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          res.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: any) {
          res.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      // No session, redirect to login
      const loginUrl = new URL('/login', req.url);
      return NextResponse.redirect(loginUrl);
    }

    // User is authenticated, check if setup is complete
    const { data: company, error: companyError } = await supabase
      .from('empresa')
      .select('id')
      .maybeSingle();

    const isSetupComplete = company !== null && !companyError;

    // If trying to access setup page but setup is already complete, redirect to dashboard
    if ((pathname === '/setup' || pathname.startsWith('/setup/')) && isSetupComplete) {
      const dashboardUrl = new URL('/dashboard', req.url);
      return NextResponse.redirect(dashboardUrl);
    }

    // If trying to access protected pages but setup is not complete, redirect to setup
    if (pathname !== '/setup' && !pathname.startsWith('/setup/') && !isSetupComplete) {
      const setupUrl = new URL('/setup', req.url);
      return NextResponse.redirect(setupUrl);
    }

    return res;
  } catch (error) {
    console.error('Middleware error:', error);
    // On error, allow through to avoid redirect loops
    return res;
  }
}

export const config = {
  matcher: [
    '/',
    '/dashboard/:path*',
    '/products/:path*',
    '/movements/:path*',
    '/orders/:path*',
    '/auto-orders/:path*',
    '/providers/:path*',
    '/setup/:path*',
    '/config/:path*',
  ],
};
