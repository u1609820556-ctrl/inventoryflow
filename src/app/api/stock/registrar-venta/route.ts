import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, getEmpresaFromUser } from '@/lib/supabase-server';

interface RegistrarVentaBody {
  producto_id: string;
  cantidad: number;
  notas?: string;
}

// POST /api/stock/registrar-venta - Registrar una venta y bajar stock
export async function POST(request: NextRequest) {
  console.log('[API stock/registrar-venta] POST iniciado');

  try {
    // Verificar autenticación
    const { empresa, error: authError, user } = await getEmpresaFromUser();

    if (authError || !empresa || !user) {
      console.error('[API stock/registrar-venta] Error de autenticación:', authError);
      return NextResponse.json(
        { error: 'No autenticado', details: authError },
        { status: 401 }
      );
    }

    // Parsear body
    let body: RegistrarVentaBody;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'JSON inválido en el body' },
        { status: 400 }
      );
    }

    // Validar campos requeridos
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!body.producto_id || !uuidRegex.test(body.producto_id)) {
      return NextResponse.json(
        { error: 'producto_id inválido' },
        { status: 400 }
      );
    }

    if (typeof body.cantidad !== 'number' || !Number.isInteger(body.cantidad) || body.cantidad <= 0) {
      return NextResponse.json(
        { error: 'La cantidad debe ser un número entero positivo' },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();

    // Obtener producto actual con stock mínimo (si tiene regla de autopedido)
    const { data: producto, error: fetchError } = await supabase
      .from('productos')
      .select(`
        id,
        nombre,
        stock,
        empresa_id,
        reglas_autopedido (
          stock_minimo
        )
      `)
      .eq('id', body.producto_id)
      .single();

    if (fetchError || !producto) {
      console.error('[API stock/registrar-venta] Producto no encontrado:', fetchError);
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      );
    }

    // Verificar permisos
    if (producto.empresa_id !== user.id) {
      return NextResponse.json(
        { error: 'No tienes permisos para modificar este producto' },
        { status: 403 }
      );
    }

    // Calcular nuevo stock
    const stockAnterior = producto.stock;
    const nuevoStock = stockAnterior - body.cantidad;

    // Validar que no sea negativo
    if (nuevoStock < 0) {
      return NextResponse.json(
        {
          error: 'Stock insuficiente',
          stock_actual: stockAnterior,
          cantidad_solicitada: body.cantidad
        },
        { status: 400 }
      );
    }

    // Actualizar stock
    const { data: productoActualizado, error: updateError } = await supabase
      .from('productos')
      .update({ stock: nuevoStock })
      .eq('id', body.producto_id)
      .select()
      .single();

    if (updateError) {
      console.error('[API stock/registrar-venta] Error al actualizar:', updateError);
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
        producto_id: body.producto_id,
        tipo: 'venta',
        cantidad: -body.cantidad, // Negativo porque es salida
        stock_anterior: stockAnterior,
        stock_nuevo: nuevoStock,
        notas: body.notas || `Venta registrada: ${body.cantidad} unidades`,
        usuario_id: user.id,
      });

    if (movimientoError) {
      console.warn('[API stock/registrar-venta] Error al registrar movimiento (no crítico):', movimientoError);
    }

    // Verificar si el stock cayó por debajo del mínimo
    let stockBajoMinimo = false;
    let stockMinimo: number | null = null;

    // Obtener stock mínimo de las reglas de autopedido
    const reglas = producto.reglas_autopedido as Array<{ stock_minimo: number }> | null;
    if (reglas && reglas.length > 0) {
      // Tomar el stock mínimo más alto de todas las reglas
      stockMinimo = Math.max(...reglas.map(r => r.stock_minimo));
      stockBajoMinimo = nuevoStock < stockMinimo;
    }

    console.log('[API stock/registrar-venta] Venta registrada:', {
      producto: producto.nombre,
      stockAnterior,
      nuevoStock,
      cantidad: body.cantidad,
      stockBajoMinimo,
    });

    return NextResponse.json({
      success: true,
      producto: productoActualizado,
      stock_anterior: stockAnterior,
      stock_nuevo: nuevoStock,
      cantidad_vendida: body.cantidad,
      alerta_stock_bajo: stockBajoMinimo,
      stock_minimo: stockMinimo,
    });
  } catch (error) {
    console.error('[API stock/registrar-venta] Error inesperado:', error);
    return NextResponse.json(
      {
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}
