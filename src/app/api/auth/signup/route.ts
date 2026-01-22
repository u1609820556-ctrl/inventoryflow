import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, nombreEmpresa } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y contraseña son requeridos' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    );

    // 1. Registrar usuario (el trigger creará la empresa automáticamente)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nombre_empresa: nombreEmpresa || 'Mi Empresa',
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/login`,
      },
    });

    if (error) {
      console.error('Signup error:', error);

      // Verificar si es correo duplicado
      if (error.message.includes('already registered') || error.message.includes('User already registered')) {
        return NextResponse.json(
          { error: 'Este correo ya está registrado. Usa el login.' },
          { status: 400 }
        );
      }

      // Error de base de datos al crear usuario
      if (error.message.includes('Database error')) {
        return NextResponse.json(
          { error: 'Error de configuración. Por favor, ejecuta la migración fix_auth_and_empresa.sql en Supabase.' },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { error: error.message || 'Error al crear cuenta' },
        { status: 400 }
      );
    }

    if (!data.user) {
      return NextResponse.json(
        { error: 'Error al crear usuario' },
        { status: 500 }
      );
    }

    // 2. Verificar si el email necesita confirmación
    const needsEmailConfirmation = !data.session;

    if (needsEmailConfirmation) {
      // Usuario creado pero necesita confirmar email
      return NextResponse.json({
        success: true,
        user: data.user,
        needsEmailConfirmation: true,
        message: 'Revisa tu correo para confirmar tu cuenta',
      });
    }

    // 3. Si no necesita confirmación, la sesión ya está activa
    // La empresa se crea automáticamente via trigger

    return NextResponse.json({
      success: true,
      user: data.user,
      message: 'Cuenta creada exitosamente',
    });
  } catch (err: unknown) {
    console.error('Error en signup:', err);
    return NextResponse.json(
      { error: 'Error al crear cuenta' },
      { status: 500 }
    );
  }
}
