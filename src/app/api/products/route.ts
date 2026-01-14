import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, getEmpresaFromUser } from '@/lib/supabase-server';

// Validación de UUID
function isValidUUID(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

interface CreateProductBody {
  nombre: string;
  descripcion?: string;
  codigo_barras?: string;
  stock?: number;
  precio_unitario: number;
}

// GET /api/products - Obtener todos los productos del usuario
export async function GET() {
  console.log('[API products] GET iniciado');

  try {
    // Verificar autenticación y obtener empresa
    const { empresa, error: authError } = await getEmpresaFromUser();

    if (authError || !empresa) {
      console.error('[API products] Error de autenticación:', authError);
      return NextResponse.json(
        { error: 'No autenticado', details: authError },
        { status: 401 }
      );
    }

    console.log('[API products] Empresa:', empresa.id);

    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .eq('empresa_id', empresa.id)
      .order('nombre');

    if (error) {
      console.error('[API products] Error en query:', error);
      return NextResponse.json(
        {
          error: 'Error al obtener productos',
          details: error.message,
          code: error.code,
        },
        { status: 500 }
      );
    }

    console.log('[API products] Productos obtenidos:', data?.length || 0);
    return NextResponse.json({ data });
  } catch (error) {
    console.error('[API products] Error inesperado en GET:', error);
    return NextResponse.json(
      {
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}

// POST /api/products - Crear nuevo producto
export async function POST(request: NextRequest) {
  console.log('[API products] POST iniciado');

  try {
    // Verificar autenticación y obtener empresa
    const { empresa, error: authError, user } = await getEmpresaFromUser();

    if (authError || !empresa || !user) {
      console.error('[API products] Error de autenticación:', { authError, hasEmpresa: !!empresa, hasUser: !!user });
      return NextResponse.json(
        { error: 'No autenticado', details: authError || 'Usuario o empresa no encontrado' },
        { status: 401 }
      );
    }

    console.log('[API products] Usuario autenticado:', { userId: user.id, empresaId: empresa.id });

    // Parsear body
    let body: CreateProductBody;
    try {
      body = await request.json();
      console.log('[API products] Body recibido:', body);
    } catch (parseError) {
      console.error('[API products] Error parseando JSON:', parseError);
      return NextResponse.json(
        { error: 'JSON inválido en el body' },
        { status: 400 }
      );
    }

    // Validaciones
    if (!body.nombre || !body.nombre.trim()) {
      return NextResponse.json(
        { error: 'El nombre del producto es requerido' },
        { status: 400 }
      );
    }

    if (typeof body.precio_unitario !== 'number' || body.precio_unitario < 0) {
      return NextResponse.json(
        { error: 'El precio unitario debe ser un número >= 0' },
        { status: 400 }
      );
    }

    if (body.stock !== undefined && (typeof body.stock !== 'number' || body.stock < 0)) {
      return NextResponse.json(
        { error: 'El stock debe ser un número >= 0' },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();

    const insertData = {
      empresa_id: empresa.id,
      nombre: body.nombre.trim(),
      descripcion: body.descripcion?.trim() || null,
      codigo_barras: body.codigo_barras?.trim() || null,
      stock: body.stock ?? 0,
      precio_unitario: body.precio_unitario,
    };

    console.log('[API products] Insertando producto:', insertData);

    const { data, error } = await supabase
      .from('productos')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('[API products] Error creando producto:', error);

      let errorMessage = 'Error al crear el producto';
      if (error.code === '42501') {
        errorMessage = 'Error de permisos (RLS): No tienes permiso para crear productos.';
      } else if (error.code === '23505') {
        errorMessage = 'Ya existe un producto con ese nombre en tu empresa.';
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

    console.log('[API products] Producto creado:', data?.id);
    return NextResponse.json(
      {
        message: 'Producto creado',
        data,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[API products] Error inesperado en POST:', error);
    return NextResponse.json(
      {
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}
