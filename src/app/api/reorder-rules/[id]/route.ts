import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, getEmpresaFromUser } from '@/lib/supabase-server';

// Validación de UUID
function isValidUUID(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

interface UpdateRuleBody {
  producto_id?: string;
  proveedor_id?: string;
  stock_minimo?: number;
  cantidad_pedido?: number;
  activa?: boolean;
}

// PUT /api/reorder-rules/[id] - Actualizar una regla de autopedido
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log('[API reorder-rules/[id]] PUT iniciado');

  try {
    const { id } = await params;

    // Validar UUID
    if (!id || !isValidUUID(id)) {
      return NextResponse.json(
        { error: 'ID de regla inválido' },
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
    let body: UpdateRuleBody;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'JSON inválido en el body' },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();

    // Verificar que la regla existe y pertenece a la empresa
    const { data: existingRule, error: findError } = await supabase
      .from('reglas_autopedido')
      .select('id, empresa_id')
      .eq('id', id)
      .eq('empresa_id', empresa.id)
      .single();

    if (findError || !existingRule) {
      return NextResponse.json(
        { error: 'Regla no encontrada o no pertenece a esta empresa' },
        { status: 404 }
      );
    }

    // Construir objeto de actualización (con nombres de campos actualizados)
    const updateData: Record<string, unknown> = {};

    if (body.producto_id !== undefined) {
      if (!isValidUUID(body.producto_id)) {
        return NextResponse.json(
          { error: 'producto_id no es un UUID válido' },
          { status: 400 }
        );
      }
      // Verificar que el producto existe y pertenece a la empresa
      const { data: producto, error: productoError } = await supabase
        .from('productos')
        .select('id')
        .eq('id', body.producto_id)
        .eq('empresa_id', empresa.id)
        .single();

      if (productoError || !producto) {
        return NextResponse.json(
          { error: 'Producto no encontrado o no pertenece a esta empresa' },
          { status: 400 }
        );
      }
      updateData.producto_id = body.producto_id;
    }

    if (body.proveedor_id !== undefined) {
      if (!isValidUUID(body.proveedor_id)) {
        return NextResponse.json(
          { error: 'proveedor_id no es un UUID válido' },
          { status: 400 }
        );
      }
      // Verificar que el proveedor existe y pertenece a la empresa
      const { data: proveedor, error: proveedorError } = await supabase
        .from('proveedores')
        .select('id')
        .eq('id', body.proveedor_id)
        .eq('empresa_id', empresa.id)
        .single();

      if (proveedorError || !proveedor) {
        return NextResponse.json(
          { error: 'Proveedor no encontrado o no pertenece a esta empresa' },
          { status: 400 }
        );
      }
      updateData.proveedor_id = body.proveedor_id;
    }

    if (body.stock_minimo !== undefined) {
      if (typeof body.stock_minimo !== 'number' || body.stock_minimo < 0) {
        return NextResponse.json(
          { error: 'stock_minimo debe ser un número >= 0' },
          { status: 400 }
        );
      }
      updateData.stock_minimo = body.stock_minimo;
    }

    if (body.cantidad_pedido !== undefined) {
      if (typeof body.cantidad_pedido !== 'number' || body.cantidad_pedido <= 0) {
        return NextResponse.json(
          { error: 'cantidad_pedido debe ser un número > 0' },
          { status: 400 }
        );
      }
      updateData.cantidad_pedido = body.cantidad_pedido;
    }

    if (body.activa !== undefined) {
      updateData.activa = body.activa;
    }

    // Si no hay nada que actualizar
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No se proporcionaron campos para actualizar' },
        { status: 400 }
      );
    }

    // Actualizar regla
    const { data, error } = await supabase
      .from('reglas_autopedido')
      .update(updateData)
      .eq('id', id)
      .select('*, productos(id, nombre), proveedores(id, nombre)')
      .single();

    if (error) {
      console.error('[API reorder-rules/[id]] Error actualizando:', error);

      let errorMessage = 'Error al actualizar la regla';
      if (error.code === '42501') {
        errorMessage = 'Error de permisos: No tienes permiso para actualizar esta regla.';
      } else if (error.code === '23505') {
        errorMessage = 'Ya existe una regla para esta combinación de producto y proveedor.';
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

    console.log('[API reorder-rules/[id]] Regla actualizada:', id);
    return NextResponse.json({
      message: 'Regla actualizada',
      data,
    });
  } catch (error) {
    console.error('[API reorder-rules/[id]] Error inesperado en PUT:', error);
    return NextResponse.json(
      {
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}

// DELETE /api/reorder-rules/[id] - Eliminar una regla de autopedido
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log('[API reorder-rules/[id]] DELETE iniciado');

  try {
    const { id } = await params;

    // Validar UUID
    if (!id || !isValidUUID(id)) {
      return NextResponse.json(
        { error: 'ID de regla inválido' },
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

    // Verificar que la regla existe y pertenece a la empresa
    const { data: existingRule, error: findError } = await supabase
      .from('reglas_autopedido')
      .select('id')
      .eq('id', id)
      .eq('empresa_id', empresa.id)
      .single();

    if (findError || !existingRule) {
      return NextResponse.json(
        { error: 'Regla no encontrada o no pertenece a esta empresa' },
        { status: 404 }
      );
    }

    // Eliminar regla
    const { error } = await supabase
      .from('reglas_autopedido')
      .delete()
      .eq('id', id)
      .eq('empresa_id', empresa.id);

    if (error) {
      console.error('[API reorder-rules/[id]] Error eliminando:', error);
      return NextResponse.json(
        {
          error: 'Error al eliminar la regla',
          details: error.message,
          code: error.code,
        },
        { status: 500 }
      );
    }

    console.log('[API reorder-rules/[id]] Regla eliminada:', id);
    return NextResponse.json({ message: 'Regla eliminada' });
  } catch (error) {
    console.error('[API reorder-rules/[id]] Error inesperado en DELETE:', error);
    return NextResponse.json(
      {
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}
