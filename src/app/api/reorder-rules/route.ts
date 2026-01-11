import { NextRequest, NextResponse } from 'next/server';
// Note: NextRequest is used by POST handler
import { createServerSupabaseClient, getEmpresaFromUser } from '@/lib/supabase-server';

interface ReorderRuleBody {
  producto_id: string;
  proveedor_id: string;
  stock_minimo: number;
  cantidad_pedido: number;
  activa?: boolean;
}

// POST /api/reorder-rules - Crear o actualizar una regla de autopedido
export async function POST(request: NextRequest) {
  console.log('[API reorder-rules] POST iniciado');

  try {
    // Verificar autenticación y obtener empresa
    console.log('[API reorder-rules] Verificando autenticación...');
    const { empresa, error: authError, user } = await getEmpresaFromUser();

    if (authError || !empresa || !user) {
      console.error('[API reorder-rules] Error de autenticación:', { authError, hasEmpresa: !!empresa, hasUser: !!user });
      return NextResponse.json(
        { error: 'No autenticado', details: authError || 'Usuario o empresa no encontrado' },
        { status: 401 }
      );
    }

    console.log('[API reorder-rules] Usuario autenticado:', { userId: user.id, empresaId: empresa.id });

    // Parsear body
    let body: ReorderRuleBody;
    try {
      body = await request.json();
      console.log('[API reorder-rules] Body recibido:', body);
    } catch (parseError) {
      console.error('[API reorder-rules] Error parseando JSON:', parseError);
      return NextResponse.json(
        { error: 'JSON inválido en el body' },
        { status: 400 }
      );
    }

    // Validaciones básicas
    if (!body.producto_id) {
      console.log('[API reorder-rules] Validación fallida: falta producto_id');
      return NextResponse.json(
        { error: 'producto_id es requerido' },
        { status: 400 }
      );
    }

    if (!body.proveedor_id) {
      console.log('[API reorder-rules] Validación fallida: falta proveedor_id');
      return NextResponse.json(
        { error: 'proveedor_id es requerido' },
        { status: 400 }
      );
    }

    if (typeof body.stock_minimo !== 'number' || body.stock_minimo < 0) {
      console.log('[API reorder-rules] Validación fallida: stock_minimo inválido:', body.stock_minimo);
      return NextResponse.json(
        { error: 'stock_minimo debe ser un número >= 0' },
        { status: 400 }
      );
    }

    if (typeof body.cantidad_pedido !== 'number' || body.cantidad_pedido <= 0) {
      console.log('[API reorder-rules] Validación fallida: cantidad_pedido inválido:', body.cantidad_pedido);
      return NextResponse.json(
        { error: 'cantidad_pedido debe ser un número > 0' },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();

    // Verificar que el producto existe
    console.log('[API reorder-rules] Verificando producto:', body.producto_id);
    const { data: producto, error: productoError } = await supabase
      .from('productos')
      .select('id, nombre')
      .eq('id', body.producto_id)
      .single();

    if (productoError) {
      console.error('[API reorder-rules] Error buscando producto:', productoError);
      return NextResponse.json(
        { error: 'Producto no encontrado', details: productoError.message },
        { status: 400 }
      );
    }

    if (!producto) {
      console.log('[API reorder-rules] Producto no encontrado');
      return NextResponse.json(
        { error: 'Producto no encontrado o no pertenece a esta empresa' },
        { status: 400 }
      );
    }
    console.log('[API reorder-rules] Producto encontrado:', producto.nombre);

    // Verificar que el proveedor existe
    console.log('[API reorder-rules] Verificando proveedor:', body.proveedor_id);
    const { data: proveedor, error: proveedorError } = await supabase
      .from('proveedores')
      .select('id, nombre')
      .eq('id', body.proveedor_id)
      .single();

    if (proveedorError) {
      console.error('[API reorder-rules] Error buscando proveedor:', proveedorError);
      return NextResponse.json(
        { error: 'Proveedor no encontrado', details: proveedorError.message },
        { status: 400 }
      );
    }

    if (!proveedor) {
      console.log('[API reorder-rules] Proveedor no encontrado');
      return NextResponse.json(
        { error: 'Proveedor no encontrado o no pertenece a esta empresa' },
        { status: 400 }
      );
    }
    console.log('[API reorder-rules] Proveedor encontrado:', proveedor.nombre);

    // Buscar si ya existe una regla para este producto + proveedor
    console.log('[API reorder-rules] Buscando regla existente...');
    const { data: existingRule, error: searchError } = await supabase
      .from('reglas_autopedido')
      .select('id')
      .eq('producto_id', body.producto_id)
      .eq('proveedor_id', body.proveedor_id)
      .eq('empresa_id', empresa.id)
      .maybeSingle();

    if (searchError) {
      console.error('[API reorder-rules] Error buscando regla existente:', searchError);
    }

    console.log('[API reorder-rules] Regla existente:', existingRule ? existingRule.id : 'ninguna');

    const ruleData = {
      empresa_id: empresa.id,
      producto_id: body.producto_id,
      proveedor_id: body.proveedor_id,
      stock_minimo_trigger: body.stock_minimo,
      cantidad_a_pedir: body.cantidad_pedido,
      habilitado: body.activa ?? true,
      requerir_aprobacion: true,
    };

    let result;

    if (existingRule) {
      // Actualizar regla existente
      console.log('[API reorder-rules] Actualizando regla existente:', existingRule.id);
      const { data, error } = await supabase
        .from('reglas_autopedido')
        .update({
          stock_minimo_trigger: ruleData.stock_minimo_trigger,
          cantidad_a_pedir: ruleData.cantidad_a_pedir,
          habilitado: ruleData.habilitado,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingRule.id)
        .select('*, productos(nombre), proveedores(nombre)')
        .single();

      if (error) {
        console.error('[API reorder-rules] Error actualizando regla:', error);
        return NextResponse.json(
          {
            error: 'Error al actualizar la regla',
            details: error.message,
            code: error.code,
          },
          { status: 500 }
        );
      }

      console.log('[API reorder-rules] Regla actualizada exitosamente');
      result = data;
    } else {
      // Crear nueva regla
      console.log('[API reorder-rules] Creando nueva regla:', ruleData);
      const { data, error } = await supabase
        .from('reglas_autopedido')
        .insert(ruleData)
        .select('*, productos(nombre), proveedores(nombre)')
        .single();

      if (error) {
        console.error('[API reorder-rules] Error creando regla:', error);

        // Errores específicos
        let errorMessage = 'Error al crear la regla';
        if (error.code === '42501') {
          errorMessage = 'Error de permisos (RLS): No tienes permiso para crear reglas. Verifica la configuración de seguridad en Supabase.';
        } else if (error.code === '23503') {
          errorMessage = 'Error de referencia: El producto o proveedor no existe.';
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

      console.log('[API reorder-rules] Regla creada exitosamente:', data?.id);
      result = data;
    }

    return NextResponse.json(
      {
        message: existingRule ? 'Regla actualizada' : 'Regla creada',
        data: result,
      },
      { status: existingRule ? 200 : 201 }
    );
  } catch (error) {
    console.error('[API reorder-rules] Error inesperado en POST:', error);
    return NextResponse.json(
      {
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}

// GET /api/reorder-rules - Obtener todas las reglas de la empresa
export async function GET() {
  console.log('[API reorder-rules] GET iniciado');

  try {
    console.log('[API reorder-rules] Verificando autenticación...');
    const { empresa, error: authError } = await getEmpresaFromUser();

    if (authError || !empresa) {
      console.error('[API reorder-rules] Error de autenticación:', authError);
      return NextResponse.json(
        { error: 'No autenticado', details: authError },
        { status: 401 }
      );
    }

    console.log('[API reorder-rules] Empresa:', empresa.id);

    const supabase = await createServerSupabaseClient();

    console.log('[API reorder-rules] Ejecutando query...');
    const { data, error } = await supabase
      .from('reglas_autopedido')
      .select('*, productos(nombre), proveedores(nombre)')
      .eq('empresa_id', empresa.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[API reorder-rules] Error en query:', error);
      return NextResponse.json(
        {
          error: 'Error al obtener reglas',
          details: error.message,
          code: error.code,
        },
        { status: 500 }
      );
    }

    console.log('[API reorder-rules] Reglas obtenidas:', data?.length || 0);
    return NextResponse.json({ data });
  } catch (error) {
    console.error('[API reorder-rules] Error inesperado en GET:', error);
    return NextResponse.json(
      {
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}

