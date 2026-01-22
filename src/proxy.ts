import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            response = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();

    const pathname = request.nextUrl.pathname;

    // Rutas privadas (requieren autenticación)
    const privateRoutes = ['/dashboard', '/products', '/proveedores', '/pedidos', '/config'];

    // Si el usuario está autenticado y trata de acceder a login/signup
    if (user && (pathname === '/login' || pathname === '/signup')) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Si el usuario NO está autenticado y trata de acceder a ruta privada
    if (!user && privateRoutes.some((route) => pathname.startsWith(route))) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Si accede a / sin autenticación
    if (!user && pathname === '/') {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Si accede a / con autenticación
    if (user && pathname === '/') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return response;
  } catch {
    // En caso de error, redirigir a login
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: ['/((?!_next|api|.*\\..*).*)'],
};
