import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, getEmpresaFromUser } from '@/lib/supabase-server';

// Validación de email
function isValidEmail(email: string): boolean {
  if (!email) return true; // Email es opcional
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

interface CreateProveedorBody {
  nombre: string;
  email?: string;
  telefono?: string;
  direccion?: string;
}

// GET /api/proveedores - Obtener todos los proveedores del usuario
export async function GET() {
  console.log('[API proveedores] GET iniciado');

  try {
    // Verificar autenticación y obtener empresa
    const { empresa, error: authError } = await getEmpresaFromUser();

    if (authError || !empresa) {
      console.error('[API proveedores] Error de autenticación:', authError);
      return NextResponse.json(
        { error: 'No autenticado', details: authError },
        { status: 401 }
      );
    }

    console.log('[API proveedores] Empresa:', empresa.id);

    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
      .from('proveedores')
      .select('*')
      .eq('empresa_id', empresa.id)
      .order('nombre');

    if (error) {
      console.error('[API proveedores] Error en query:', error);
      return NextResponse.json(
        {
          error: 'Error al obtener proveedores',
          details: error.message,
          code: error.code,
        },
        { status: 500 }
      );
    }

    console.log('[API proveedores] Proveedores obtenidos:', data?.length || 0);
    return NextResponse.json({ data });
  } catch (error) {
    console.error('[API proveedores] Error inesperado en GET:', error);
    return NextResponse.json(
      {
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}

// POST /api/proveedores - Crear nuevo proveedor
export async function POST(request: NextRequest) {
  console.log('[API proveedores] POST iniciado');

  try {
    // Verificar autenticación y obtener empresa
    const { empresa, error: authError, user } = await getEmpresaFromUser();

    if (authError || !empresa || !user) {
      console.error('[API proveedores] Error de autenticación:', { authError, hasEmpresa: !!empresa, hasUser: !!user });
      return NextResponse.json(
        { error: 'No autenticado', details: authError || 'Usuario o empresa no encontrado' },
        { status: 401 }
      );
    }

    console.log('[API proveedores] Usuario autenticado:', { userId: user.id, empresaId: empresa.id });

    // Parsear body
    let body: CreateProveedorBody;
    try {
      body = await request.json();
      console.log('[API proveedores] Body recibido:', body);
    } catch (parseError) {
      console.error('[API proveedores] Error parseando JSON:', parseError);
      return NextResponse.json(
        { error: 'JSON inválido en el body' },
        { status: 400 }
      );
    }

    // Validaciones
    if (!body.nombre || !body.nombre.trim()) {
      return NextResponse.json(
        { error: 'El nombre del proveedor es requerido' },
        { status: 400 }
      );
    }

    if (body.email && !isValidEmail(body.email.trim())) {
      return NextResponse.json(
        { error: 'El formato del email no es válido' },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();

    const insertData = {
      empresa_id: empresa.id,
      nombre: body.nombre.trim(),
      email: body.email?.trim() || null,
      telefono: body.telefono?.trim() || null,
      direccion: body.direccion?.trim() || null,
    };

    console.log('[API proveedores] Insertando proveedor:', insertData);

    const { data, error } = await supabase
      .from('proveedores')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('[API proveedores] Error creando proveedor:', error);

      let errorMessage = 'Error al crear el proveedor';
      if (error.code === '42501') {
        errorMessage = 'Error de permisos (RLS): No tienes permiso para crear proveedores.';
      } else if (error.code === '23505') {
        errorMessage = 'Ya existe un proveedor con ese nombre o email.';
      }

      return NextResponse.json(
        {
          error: errorMessage,
          details: error.message,
          code: error.code,
        },
        { status: 500 }
      );
    }

    console.log('[API proveedores] Proveedor creado:', data?.id);
    return NextResponse.json(
      {
        message: 'Proveedor creado',
        data,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[API proveedores] Error inesperado en POST:', error);
    return NextResponse.json(
      {
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}
