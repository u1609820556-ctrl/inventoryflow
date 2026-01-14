import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, getEmpresaFromUser } from '@/lib/supabase-server';

interface ProductoImportData {
  nombre: string;
  descripcion?: string;
  codigo_barras?: string;
  stock?: number;
  precio_unitario?: number;
}

interface ImportRequestBody {
  datos: ProductoImportData[];
}

// POST /api/productos/import - Importar múltiples productos
export async function POST(request: NextRequest) {
  console.log('[API productos/import] POST iniciado');

  try {
    // Verificar autenticación y obtener empresa
    const { empresa, error: authError, user } = await getEmpresaFromUser();

    if (authError || !empresa || !user) {
      console.error('[API productos/import] Error de autenticación:', authError);
      return NextResponse.json(
        { error: 'No autenticado', details: authError },
        { status: 401 }
      );
    }

    console.log('[API productos/import] Usuario autenticado:', user.id, 'Empresa:', empresa.id);

    // Parsear body
    let body: ImportRequestBody;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('[API productos/import] Error parseando JSON:', parseError);
      return NextResponse.json(
        { error: 'JSON inválido en el body' },
        { status: 400 }
      );
    }

    // Validar que hay datos
    if (!body.datos || !Array.isArray(body.datos) || body.datos.length === 0) {
      return NextResponse.json(
        { error: 'No hay datos para importar' },
        { status: 400 }
      );
    }

    console.log('[API productos/import] Productos a importar:', body.datos.length);

    const supabase = await createServerSupabaseClient();
    const errores: string[] = [];
    const datosImportados: unknown[] = [];
    let exitosos = 0;

    // Procesar cada producto
    for (let i = 0; i < body.datos.length; i++) {
      const producto = body.datos[i];

      // Validar campos requeridos
      if (!producto.nombre || !producto.nombre.trim()) {
        errores.push(`Fila ${i + 1}: El nombre es requerido`);
        continue;
      }

      // Preparar datos para inserción
      const insertData = {
        empresa_id: empresa.id,
        nombre: producto.nombre.trim(),
        descripcion: producto.descripcion?.trim() || null,
        codigo_barras: producto.codigo_barras?.trim() || null,
        stock: typeof producto.stock === 'number' && producto.stock >= 0 ? producto.stock : 0,
        precio_unitario: typeof producto.precio_unitario === 'number' && producto.precio_unitario >= 0 ? producto.precio_unitario : 0,
      };

      try {
        const { data, error } = await supabase
          .from('productos')
          .insert(insertData)
          .select()
          .single();

        if (error) {
          console.error(`[API productos/import] Error en fila ${i + 1}:`, error);

          if (error.code === '23505') {
            errores.push(`Fila ${i + 1}: Ya existe un producto con el nombre "${producto.nombre}"`);
          } else {
            errores.push(`Fila ${i + 1}: ${error.message}`);
          }
          continue;
        }

        if (data) {
          datosImportados.push(data);
          exitosos++;
        }
      } catch (err) {
        console.error(`[API productos/import] Error inesperado en fila ${i + 1}:`, err);
        errores.push(`Fila ${i + 1}: Error inesperado al procesar`);
      }
    }

    console.log('[API productos/import] Importación completada:', {
      exitosos,
      total: body.datos.length,
      errores: errores.length,
    });

    return NextResponse.json({
      exito: exitosos,
      total: body.datos.length,
      errores,
      datos_importados: datosImportados,
    });
  } catch (error) {
    console.error('[API productos/import] Error inesperado:', error);
    return NextResponse.json(
      {
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}
