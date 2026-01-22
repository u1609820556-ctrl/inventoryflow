import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, getEmpresaFromUser } from '@/lib/supabase-server';
import { generateOrderPDF, generateOrderNumber } from '@/lib/pdf-generator';
import type { Empresa, Proveedor, LineaPedidoGenerado } from '@/types';

interface GeneratePDFBody {
  proveedor_id: string;
  lineas: Array<{
    producto_id: string;
    cantidad: number;
    precio_unitario: number;
  }>;
  notas?: string;
}

// POST /api/orders/generate-pdf - Genera un PDF de Purchase Order
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
    const body: GeneratePDFBody = await request.json();

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

    // Obtener datos del proveedor
    const { data: proveedor, error: proveedorError } = await supabase
      .from('proveedores')
      .select('*')
      .eq('id', body.proveedor_id)
      .single();

    if (proveedorError || !proveedor) {
      return NextResponse.json(
        { error: 'Proveedor no encontrado' },
        { status: 400 }
      );
    }

    // Obtener datos de los productos
    const productIds = body.lineas.map(l => l.producto_id);
    const { data: productos, error: productosError } = await supabase
      .from('productos')
      .select('id, nombre, codigo_barras')
      .in('id', productIds);

    if (productosError) {
      return NextResponse.json(
        { error: 'Error al obtener productos', details: productosError.message },
        { status: 500 }
      );
    }

    // Mapear productos por ID para lookup rápido
    const productosMap = new Map(productos?.map(p => [p.id, p]) || []);

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

    // Generar PDF
    const numeroPedido = generateOrderNumber();
    const result = await generateOrderPDF({
      empresa: empresa as Empresa,
      proveedor: proveedor as Proveedor,
      lineas: lineasEnriquecidas,
      numero_pedido: numeroPedido,
      notas: body.notas,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: 'Error al generar PDF', details: result.error },
        { status: 500 }
      );
    }

    // Calcular total
    const total = lineasEnriquecidas.reduce(
      (acc, l) => acc + l.cantidad * l.precio_unitario,
      0
    );

    return NextResponse.json({
      success: true,
      numero_pedido: numeroPedido,
      pdf_base64: result.pdf_base64,
      total_estimado: total,
      lineas: lineasEnriquecidas,
      proveedor: {
        id: proveedor.id,
        nombre: proveedor.nombre,
        email: proveedor.email,
      },
    });

  } catch (error) {
    console.error('Error in generate-pdf POST:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
