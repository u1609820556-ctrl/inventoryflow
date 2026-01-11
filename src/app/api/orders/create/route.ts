import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, getEmpresaFromUser } from '@/lib/supabase-server';
import { calculateOrderTotal } from '@/lib/pdf-generator';
import type { LineaPedidoGenerado } from '@/types';

interface CreateOrderBody {
  proveedor_id: string;
  lineas: Array<{
    producto_id: string;
    cantidad: number;
    precio_unitario: number;
  }>;
  pdf_url?: string;
  notas?: string;
}

// POST /api/orders/create - Crea un registro de pedido generado en la BD
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación y obtener empresa
    const { empresa, error: authError } = await getEmpresaFromUser();
    if (authError || !empresa) {
      return NextResponse.json(
        { error: 'No autenticado', details: authError },
        { status: 401 }
      );
    }

    // Parsear body
    const body: CreateOrderBody = await request.json();

    // Validaciones básicas
    if (!body.proveedor_id) {
      return NextResponse.json(
        { error: 'proveedor_id es requerido' },
        { status: 400 }
      );
    }

    if (!body.lineas || !Array.isArray(body.lineas) || body.lineas.length === 0) {
      return NextResponse.json(
        { error: 'lineas es requerido y debe ser un array con al menos un elemento' },
        { status: 400 }
      );
    }

    // Validar cada línea
    for (const linea of body.lineas) {
      if (!linea.producto_id) {
        return NextResponse.json(
          { error: 'Cada línea debe tener producto_id' },
          { status: 400 }
        );
      }
      if (typeof linea.cantidad !== 'number' || linea.cantidad <= 0) {
        return NextResponse.json(
          { error: 'Cada línea debe tener cantidad > 0' },
          { status: 400 }
        );
      }
      if (typeof linea.precio_unitario !== 'number' || linea.precio_unitario < 0) {
        return NextResponse.json(
          { error: 'Cada línea debe tener precio_unitario >= 0' },
          { status: 400 }
        );
      }
    }

    const supabase = await createServerSupabaseClient();

    // Verificar que el proveedor existe
    const { data: proveedor, error: proveedorError } = await supabase
      .from('proveedores')
      .select('id, nombre')
      .eq('id', body.proveedor_id)
      .single();

    if (proveedorError || !proveedor) {
      return NextResponse.json(
        { error: 'Proveedor no encontrado' },
        { status: 400 }
      );
    }

    // Verificar que todos los productos existen
    const productIds = body.lineas.map(l => l.producto_id);
    const { data: productos, error: productosError } = await supabase
      .from('productos')
      .select('id, nombre, codigo_barras')
      .in('id', productIds);

    if (productosError) {
      return NextResponse.json(
        { error: 'Error al verificar productos', details: productosError.message },
        { status: 500 }
      );
    }

    // Verificar que todos los productos existen
    const productosMap = new Map(productos?.map(p => [p.id, p]) || []);
    for (const linea of body.lineas) {
      if (!productosMap.has(linea.producto_id)) {
        return NextResponse.json(
          { error: `Producto no encontrado: ${linea.producto_id}` },
          { status: 400 }
        );
      }
    }

    // Enriquecer líneas con datos del producto
    const lineasEnriquecidas: LineaPedidoGenerado[] = body.lineas.map(linea => {
      const producto = productosMap.get(linea.producto_id);
      return {
        producto_id: linea.producto_id,
        cantidad: linea.cantidad,
        precio_unitario: linea.precio_unitario,
        nombre_producto: producto?.nombre || 'Producto desconocido',
        codigo: producto?.codigo_barras || '-',
      };
    });

    // Calcular total estimado
    const totalEstimado = calculateOrderTotal(lineasEnriquecidas);

    // Crear el pedido en la base de datos
    const { data: pedido, error: pedidoError } = await supabase
      .from('pedidos_generados')
      .insert({
        empresa_id: empresa.id,
        proveedor_id: body.proveedor_id,
        estado: 'pending_review',
        datos_pedido: lineasEnriquecidas,
        total_estimado: totalEstimado,
        pdf_url: body.pdf_url || null,
        notas: body.notas || null,
      })
      .select('*')
      .single();

    if (pedidoError) {
      console.error('Error creating order:', pedidoError);
      return NextResponse.json(
        { error: 'Error al crear el pedido', details: pedidoError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        pedido_id: pedido.id,
        estado: pedido.estado,
        total_estimado: pedido.total_estimado,
        proveedor: {
          id: proveedor.id,
          nombre: proveedor.nombre,
        },
        lineas: lineasEnriquecidas,
        created_at: pedido.created_at,
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error in orders/create POST:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// GET /api/orders/create - Obtener todos los pedidos generados de la empresa
export async function GET() {
  try {
    const { empresa, error: authError } = await getEmpresaFromUser();
    if (authError || !empresa) {
      return NextResponse.json(
        { error: 'No autenticado', details: authError },
        { status: 401 }
      );
    }

    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
      .from('pedidos_generados')
      .select('*, proveedores(nombre)')
      .eq('empresa_id', empresa.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
      return NextResponse.json(
        { error: 'Error al obtener pedidos', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error in orders GET:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
