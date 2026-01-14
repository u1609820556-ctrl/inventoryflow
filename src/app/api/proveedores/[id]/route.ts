import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, getEmpresaFromUser } from '@/lib/supabase-server';

// Validación de UUID
function isValidUUID(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

// Validación de email
function isValidEmail(email: string): boolean {
  if (!email) return true; // Email es opcional
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

interface UpdateProveedorBody {
  nombre?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
}

// PUT /api/proveedores/[id] - Actualizar proveedor
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log('[API proveedores/[id]] PUT iniciado');

  try {
    const { id } = await params;

    // Validar UUID
    if (!id || !isValidUUID(id)) {
      return NextResponse.json(
        { error: 'ID de proveedor inválido' },
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
    let body: UpdateProveedorBody;
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
        { error: 'El nombre del proveedor no puede estar vacío' },
        { status: 400 }
      );
    }

    if (body.email !== undefined && body.email && !isValidEmail(body.email.trim())) {
      return NextResponse.json(
        { error: 'El formato del email no es válido' },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();

    // Verificar que el proveedor existe y pertenece a la empresa
    const { data: existingProveedor, error: findError } = await supabase
      .from('proveedores')
      .select('id')
      .eq('id', id)
      .eq('empresa_id', empresa.id)
      .single();

    if (findError || !existingProveedor) {
      return NextResponse.json(
        { error: 'Proveedor no encontrado o no pertenece a esta empresa' },
        { status: 404 }
      );
    }

    // Construir objeto de actualización
    const updateData: Record<string, unknown> = {};

    if (body.nombre !== undefined) {
      updateData.nombre = body.nombre.trim();
    }
    if (body.email !== undefined) {
      updateData.email = body.email?.trim() || null;
    }
    if (body.telefono !== undefined) {
      updateData.telefono = body.telefono?.trim() || null;
    }
    if (body.direccion !== undefined) {
      updateData.direccion = body.direccion?.trim() || null;
    }

    // Si no hay nada que actualizar
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No se proporcionaron campos para actualizar' },
        { status: 400 }
      );
    }

    // Actualizar proveedor
    const { data, error } = await supabase
      .from('proveedores')
      .update(updateData)
      .eq('id', id)
      .eq('empresa_id', empresa.id)
      .select()
      .single();

    if (error) {
      console.error('[API proveedores/[id]] Error actualizando:', error);

      let errorMessage = 'Error al actualizar el proveedor';
      if (error.code === '42501') {
        errorMessage = 'Error de permisos: No tienes permiso para actualizar este proveedor.';
      } else if (error.code === '23505') {
        errorMessage = 'Ya existe un proveedor con ese nombre o email.';
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

    console.log('[API proveedores/[id]] Proveedor actualizado:', id);
    return NextResponse.json({
      message: 'Proveedor actualizado',
      data,
    });
  } catch (error) {
    console.error('[API proveedores/[id]] Error inesperado en PUT:', error);
    return NextResponse.json(
      {
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}

// DELETE /api/proveedores/[id] - Eliminar proveedor
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log('[API proveedores/[id]] DELETE iniciado');

  try {
    const { id } = await params;

    // Validar UUID
    if (!id || !isValidUUID(id)) {
      return NextResponse.json(
        { error: 'ID de proveedor inválido' },
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

    // Verificar que el proveedor existe y pertenece a la empresa
    const { data: existingProveedor, error: findError } = await supabase
      .from('proveedores')
      .select('id')
      .eq('id', id)
      .eq('empresa_id', empresa.id)
      .single();

    if (findError || !existingProveedor) {
      return NextResponse.json(
        { error: 'Proveedor no encontrado o no pertenece a esta empresa' },
        { status: 404 }
      );
    }

    // Eliminar proveedor
    const { error } = await supabase
      .from('proveedores')
      .delete()
      .eq('id', id)
      .eq('empresa_id', empresa.id);

    if (error) {
      console.error('[API proveedores/[id]] Error eliminando:', error);

      let errorMessage = 'Error al eliminar el proveedor';
      if (error.code === '23503') {
        errorMessage = 'No se puede eliminar: Este proveedor está referenciado en reglas de autopedido, productos o pedidos.';
      } else if (error.code === '42501') {
        errorMessage = 'Error de permisos: No tienes permiso para eliminar este proveedor.';
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

    console.log('[API proveedores/[id]] Proveedor eliminado:', id);
    return NextResponse.json({ message: 'Proveedor eliminado' });
  } catch (error) {
    console.error('[API proveedores/[id]] Error inesperado en DELETE:', error);
    return NextResponse.json(
      {
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}
