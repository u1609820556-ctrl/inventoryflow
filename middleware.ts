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

    // User is authenticated, allow through
    // Setup check will be done client-side in dashboard
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
    '/pedidos/:path*',
    '/proveedores/:path*',
    '/config/:path*',
  ],
};
