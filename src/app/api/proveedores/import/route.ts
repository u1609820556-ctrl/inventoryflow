import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, getEmpresaFromUser } from '@/lib/supabase-server';

interface ProveedorImportData {
  nombre: string;
  email?: string;
  telefono?: string;
  direccion?: string;
}

interface ImportRequestBody {
  datos: ProveedorImportData[];
}

// Validación de email
const isValidEmail = (email: string): boolean => {
  if (!email) return true;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// POST /api/proveedores/import - Importar múltiples proveedores
export async function POST(request: NextRequest) {
  console.log('[API proveedores/import] POST iniciado');

  try {
    // Verificar autenticación y obtener empresa
    const { empresa, error: authError, user } = await getEmpresaFromUser();

    if (authError || !empresa || !user) {
      console.error('[API proveedores/import] Error de autenticación:', authError);
      return NextResponse.json(
        { error: 'No autenticado', details: authError },
        { status: 401 }
      );
    }

    console.log('[API proveedores/import] Usuario autenticado:', user.id, 'Empresa:', empresa.id);

    // Parsear body
    let body: ImportRequestBody;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('[API proveedores/import] Error parseando JSON:', parseError);
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

    console.log('[API proveedores/import] Proveedores a importar:', body.datos.length);

    const supabase = await createServerSupabaseClient();
    const errores: string[] = [];
    const datosImportados: unknown[] = [];
    let exitosos = 0;

    // Procesar cada proveedor
    for (let i = 0; i < body.datos.length; i++) {
      const proveedor = body.datos[i];

      // Validar campos requeridos
      if (!proveedor.nombre || !proveedor.nombre.trim()) {
        errores.push(`Fila ${i + 1}: El nombre es requerido`);
        continue;
      }

      // Validar email si existe
      if (proveedor.email && !isValidEmail(proveedor.email.trim())) {
        errores.push(`Fila ${i + 1}: El email "${proveedor.email}" no es válido`);
        continue;
      }

      // Preparar datos para inserción
      const insertData = {
        empresa_id: empresa.id,
        nombre: proveedor.nombre.trim(),
        email: proveedor.email?.trim() || null,
        telefono: proveedor.telefono?.trim() || null,
        direccion: proveedor.direccion?.trim() || null,
      };

      try {
        const { data, error } = await supabase
          .from('proveedores')
          .insert(insertData)
          .select()
          .single();

        if (error) {
          console.error(`[API proveedores/import] Error en fila ${i + 1}:`, error);

          if (error.code === '23505') {
            errores.push(`Fila ${i + 1}: Ya existe un proveedor con ese nombre o email`);
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
        console.error(`[API proveedores/import] Error inesperado en fila ${i + 1}:`, err);
        errores.push(`Fila ${i + 1}: Error inesperado al procesar`);
      }
    }

    console.log('[API proveedores/import] Importación completada:', {
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
    console.error('[API proveedores/import] Error inesperado:', error);
    return NextResponse.json(
      {
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}
