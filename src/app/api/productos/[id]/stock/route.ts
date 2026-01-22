import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, getEmpresaFromUser } from '@/lib/supabase-server';

interface StockAdjustmentBody {
  delta: number; // +1 o -1 para ajustes manuales
  notas?: string;
}

// PATCH /api/productos/[id]/stock - Ajustar stock (+1 / -1)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  console.log('[API productos/stock] PATCH iniciado para producto:', id);

  try {
    // Verificar autenticación
    const { empresa, error: authError, user } = await getEmpresaFromUser();

    if (authError || !empresa || !user) {
      console.error('[API productos/stock] Error de autenticación:', authError);
      return NextResponse.json(
        { error: 'No autenticado', details: authError },
        { status: 401 }
      );
    }

    // Validar UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        { error: 'ID de producto inválido' },
        { status: 400 }
      );
    }

    // Parsear body
    let body: StockAdjustmentBody;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'JSON inválido en el body' },
        { status: 400 }
      );
    }

    // Validar delta
    if (typeof body.delta !== 'number' || !Number.isInteger(body.delta)) {
      return NextResponse.json(
        { error: 'El campo delta debe ser un número entero' },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();

    // Obtener producto actual
    const { data: producto, error: fetchError } = await supabase
      .from('productos')
      .select('id, nombre, stock, empresa_id')
      .eq('id', id)
      .single();

    if (fetchError || !producto) {
      console.error('[API productos/stock] Producto no encontrado:', fetchError);
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      );
    }

    // Verificar permisos (mismo usuario/empresa)
    if (producto.empresa_id !== user.id) {
      return NextResponse.json(
        { error: 'No tienes permisos para modificar este producto' },
        { status: 403 }
      );
    }

    // Calcular nuevo stock
    const stockAnterior = producto.stock;
    const nuevoStock = stockAnterior + body.delta;

    // Validar que no sea negativo
    if (nuevoStock < 0) {
      return NextResponse.json(
        { error: 'El stock no puede ser negativo', stock_actual: stockAnterior },
        { status: 400 }
      );
    }

    // Actualizar stock
    const { data: productoActualizado, error: updateError } = await supabase
      .from('productos')
      .update({ stock: nuevoStock })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('[API productos/stock] Error al actualizar:', updateError);
      return NextResponse.json(
        { error: 'Error al actualizar stock', details: updateError.message },
        { status: 500 }
      );
    }

    // Registrar movimiento en historial
    const { error: movimientoError } = await supabase
      .from('movimientos_stock')
      .insert({
        empresa_id: user.id,
        producto_id: id,
        tipo: 'ajuste_manual',
        cantidad: body.delta,
        stock_anterior: stockAnterior,
        stock_nuevo: nuevoStock,
        notas: body.notas || `Ajuste manual: ${body.delta > 0 ? '+' : ''}${body.delta}`,
        usuario_id: user.id,
      });

    if (movimientoError) {
      console.warn('[API productos/stock] Error al registrar movimiento (no crítico):', movimientoError);
      // No fallamos si el registro del movimiento falla, el stock ya se actualizó
    }

    console.log('[API productos/stock] Stock actualizado:', {
      producto: producto.nombre,
      stockAnterior,
      nuevoStock,
      delta: body.delta,
    });

    return NextResponse.json({
      success: true,
      producto: productoActualizado,
      stock_anterior: stockAnterior,
      stock_nuevo: nuevoStock,
    });
  } catch (error) {
    console.error('[API productos/stock] Error inesperado:', error);
    return NextResponse.json(
      {
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}
