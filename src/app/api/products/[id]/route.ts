import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, getEmpresaFromUser } from '@/lib/supabase-server';

// Validación de UUID
function isValidUUID(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

interface UpdateProductBody {
  nombre?: string;
  descripcion?: string;
  referencia?: string;
  proveedor_id?: string;
  stock?: number;
  precio_unitario?: number;
}

// PUT /api/products/[id] - Actualizar producto
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log('[API products/[id]] PUT iniciado');

  try {
    const { id } = await params;

    // Validar UUID
    if (!id || !isValidUUID(id)) {
      return NextResponse.json(
        { error: 'ID de producto inválido' },
        { status: 400 }
      );
    }

    // Verificar autenticación y obtener empresa
    const { empresa, error: authError, user } = await getEmpresaFromUser();

    if (authError || !empresa || !user) {
      return NextResponse.json(
        { error: 'No autenticado', details: authError || 'Usuario o empresa no encontrado' },
        { status: 401 }
      );
    }

    // Parsear body
    let body: UpdateProductBody;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'JSON inválido en el body' },
        { status: 400 }
      );
    }

    // Validaciones
    if (body.nombre !== undefined && !body.nombre.trim()) {
      return NextResponse.json(
        { error: 'El nombre del producto no puede estar vacío' },
        { status: 400 }
      );
    }

    if (body.precio_unitario !== undefined && (typeof body.precio_unitario !== 'number' || body.precio_unitario < 0)) {
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

    // Verificar que el producto existe y pertenece a la empresa
    const { data: existingProduct, error: findError } = await supabase
      .from('productos')
      .select('id')
      .eq('id', id)
      .eq('empresa_id', empresa.id)
      .single();

    if (findError || !existingProduct) {
      return NextResponse.json(
        { error: 'Producto no encontrado o no pertenece a esta empresa' },
        { status: 404 }
      );
    }

    // Construir objeto de actualización
    const updateData: Record<string, unknown> = {};

    if (body.nombre !== undefined) {
      updateData.nombre = body.nombre.trim();
    }
    if (body.descripcion !== undefined) {
      updateData.descripcion = body.descripcion?.trim() || null;
    }
    if (body.referencia !== undefined) {
      updateData.referencia = body.referencia?.trim() || null;
    }
    if (body.proveedor_id !== undefined) {
      updateData.proveedor_id = body.proveedor_id || null;
    }
    if (body.stock !== undefined) {
      updateData.stock = body.stock;
    }
    if (body.precio_unitario !== undefined) {
      updateData.precio_unitario = body.precio_unitario;
    }

    // Si no hay nada que actualizar
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No se proporcionaron campos para actualizar' },
        { status: 400 }
      );
    }

    // Actualizar producto
    const { data, error } = await supabase
      .from('productos')
      .update(updateData)
      .eq('id', id)
      .eq('empresa_id', empresa.id)
      .select()
      .single();

    if (error) {
      console.error('[API products/[id]] Error actualizando:', error);

      let errorMessage = 'Error al actualizar el producto';
      if (error.code === '42501') {
        errorMessage = 'Error de permisos: No tienes permiso para actualizar este producto.';
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

    console.log('[API products/[id]] Producto actualizado:', id);
    return NextResponse.json({
      message: 'Producto actualizado',
      data,
    });
  } catch (error) {
    console.error('[API products/[id]] Error inesperado en PUT:', error);
    return NextResponse.json(
      {
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}

// DELETE /api/products/[id] - Eliminar producto
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log('[API products/[id]] DELETE iniciado');

  try {
    const { id } = await params;

    // Validar UUID
    if (!id || !isValidUUID(id)) {
      return NextResponse.json(
        { error: 'ID de producto inválido' },
        { status: 400 }
      );
    }

    // Verificar autenticación y obtener empresa
    const { empresa, error: authError } = await getEmpresaFromUser();

    if (authError || !empresa) {
      return NextResponse.json(
        { error: 'No autenticado', details: authError },
        { status: 401 }
      );
    }

    const supabase = await createServerSupabaseClient();

    // Verificar que el producto existe y pertenece a la empresa
    const { data: existingProduct, error: findError } = await supabase
      .from('productos')
      .select('id')
      .eq('id', id)
      .eq('empresa_id', empresa.id)
      .single();

    if (findError || !existingProduct) {
      return NextResponse.json(
        { error: 'Producto no encontrado o no pertenece a esta empresa' },
        { status: 404 }
      );
    }

    // Eliminar producto
    const { error } = await supabase
      .from('productos')
      .delete()
      .eq('id', id)
      .eq('empresa_id', empresa.id);

    if (error) {
      console.error('[API products/[id]] Error eliminando:', error);

      let errorMessage = 'Error al eliminar el producto';
      if (error.code === '23503') {
        errorMessage = 'No se puede eliminar: Este producto está referenciado en reglas de autopedido u otros registros.';
      } else if (error.code === '42501') {
        errorMessage = 'Error de permisos: No tienes permiso para eliminar este producto.';
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

    console.log('[API products/[id]] Producto eliminado:', id);
    return NextResponse.json({ message: 'Producto eliminado' });
  } catch (error) {
    console.error('[API products/[id]] Error inesperado en DELETE:', error);
    return NextResponse.json(
      {
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}
