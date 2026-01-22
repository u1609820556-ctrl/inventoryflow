import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

async function getSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );
}

// DELETE - Delete user account and all associated data
export async function DELETE() {
  try {
    const supabase = await getSupabaseClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Get empresa_id first
    const { data: empresas, error: empresaError } = await supabase
      .from('empresa')
      .select('id')
      .limit(1);

    if (empresaError) {
      console.error('Error getting empresa:', empresaError);
      return NextResponse.json(
        { error: 'Error al obtener datos de empresa', details: empresaError.message },
        { status: 500 }
      );
    }

    const empresa = empresas && empresas.length > 0 ? empresas[0] : null;

    if (empresa) {
      const empresaId = empresa.id;

      // Delete all data associated with the empresa in order
      // 1. Delete pedidos_generados
      const { error: deleteOrdersError } = await supabase
        .from('pedidos_generados')
        .delete()
        .eq('empresa_id', empresaId);

      if (deleteOrdersError) {
        console.error('Error deleting orders:', deleteOrdersError);
      }

      // 2. Delete reglas_autopedido
      const { error: deleteRulesError } = await supabase
        .from('reglas_autopedido')
        .delete()
        .eq('empresa_id', empresaId);

      if (deleteRulesError) {
        console.error('Error deleting rules:', deleteRulesError);
      }

      // 3. Delete productos
      const { error: deleteProductsError } = await supabase
        .from('productos')
        .delete()
        .eq('empresa_id', empresaId);

      if (deleteProductsError) {
        console.error('Error deleting products:', deleteProductsError);
      }

      // 4. Delete proveedores
      const { error: deleteProvidersError } = await supabase
        .from('proveedores')
        .delete()
        .eq('empresa_id', empresaId);

      if (deleteProvidersError) {
        console.error('Error deleting providers:', deleteProvidersError);
      }

      // 5. Delete empresa
      const { error: deleteEmpresaError } = await supabase
        .from('empresa')
        .delete()
        .eq('id', empresaId);

      if (deleteEmpresaError) {
        console.error('Error deleting empresa:', deleteEmpresaError);
        return NextResponse.json(
          { error: 'Error al eliminar empresa', details: deleteEmpresaError.message },
          { status: 500 }
        );
      }
    }

    // Note: Deleting the actual auth user requires admin privileges
    // The user will be logged out and their data deleted
    // For full account deletion, you would need to use Supabase admin SDK

    return NextResponse.json({
      message: 'Cuenta y datos eliminados correctamente',
    });
  } catch (error) {
    console.error('Error in DELETE /api/config/cuenta:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// GET - Get account info
export async function GET() {
  try {
    const supabase = await getSupabaseClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      data: {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
      }
    });
  } catch (error) {
    console.error('Error in GET /api/config/cuenta:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
