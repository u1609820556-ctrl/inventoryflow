import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, getEmpresaFromUser } from '@/lib/supabase-server';

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
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'ID de regla requerido' },
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

    // Construir objeto de actualización
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (body.producto_id !== undefined) {
      updateData.producto_id = body.producto_id;
    }
    if (body.proveedor_id !== undefined) {
      updateData.proveedor_id = body.proveedor_id;
    }
    if (body.stock_minimo !== undefined) {
      if (typeof body.stock_minimo !== 'number' || body.stock_minimo < 0) {
        return NextResponse.json(
          { error: 'stock_minimo debe ser un número >= 0' },
          { status: 400 }
        );
      }
      updateData.stock_minimo_trigger = body.stock_minimo;
    }
    if (body.cantidad_pedido !== undefined) {
      if (typeof body.cantidad_pedido !== 'number' || body.cantidad_pedido <= 0) {
        return NextResponse.json(
          { error: 'cantidad_pedido debe ser un número > 0' },
          { status: 400 }
        );
      }
      updateData.cantidad_a_pedir = body.cantidad_pedido;
    }
    if (body.activa !== undefined) {
      updateData.habilitado = body.activa;
    }

    // Actualizar regla
    const { data, error } = await supabase
      .from('reglas_autopedido')
      .update(updateData)
      .eq('id', id)
      .select('*, productos(nombre), proveedores(nombre)')
      .single();

    if (error) {
      return NextResponse.json(
        {
          error: 'Error al actualizar la regla',
          details: error.message,
          code: error.code,
        },
        { status: 500 }
      );
    }

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
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'ID de regla requerido' },
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
      return NextResponse.json(
        {
          error: 'Error al eliminar la regla',
          details: error.message,
          code: error.code,
        },
        { status: 500 }
      );
    }

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
