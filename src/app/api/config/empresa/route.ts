import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

// Helper to get server-side Supabase client with auth
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

// PUT - Update empresa data
export async function PUT(request: NextRequest) {
  try {
    const supabase = await getSupabaseClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { nombre_empresa, email, telefono, direccion } = body;

    // Validate required fields
    if (!nombre_empresa?.trim()) {
      return NextResponse.json(
        { error: 'El nombre de la empresa es requerido' },
        { status: 400 }
      );
    }

    if (!email?.trim()) {
      return NextResponse.json(
        { error: 'El email es requerido' },
        { status: 400 }
      );
    }

    // Check if empresa exists for user
    const { data: empresas, error: fetchError } = await supabase
      .from('empresa')
      .select('id')
      .limit(1);

    if (fetchError) {
      console.error('Error fetching empresa:', fetchError);
      return NextResponse.json(
        { error: 'Error al verificar empresa', details: fetchError.message },
        { status: 500 }
      );
    }

    const empresa = empresas && empresas.length > 0 ? empresas[0] : null;

    if (empresa) {
      // Update existing empresa
      const { data, error: updateError } = await supabase
        .from('empresa')
        .update({
          nombre_empresa: nombre_empresa.trim(),
          email: email.trim(),
          telefono: telefono?.trim() || '',
          direccion: direccion?.trim() || '',
          updated_at: new Date().toISOString(),
        })
        .eq('id', empresa.id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating empresa:', updateError);
        return NextResponse.json(
          { error: 'Error al actualizar empresa', details: updateError.message },
          { status: 500 }
        );
      }

      return NextResponse.json({ data, message: 'Empresa actualizada' });
    } else {
      // This shouldn't happen if setup is complete, but handle it
      return NextResponse.json(
        { error: 'Empresa no encontrada. Completa el setup primero.' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Error in PUT /api/config/empresa:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// GET - Get empresa data
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

    const { data: empresas, error: fetchError } = await supabase
      .from('empresa')
      .select('*')
      .limit(1);

    if (fetchError) {
      return NextResponse.json(
        { error: 'Error al obtener empresa', details: fetchError.message },
        { status: 500 }
      );
    }

    const empresa = empresas && empresas.length > 0 ? empresas[0] : null;

    return NextResponse.json({ data: empresa });
  } catch (error) {
    console.error('Error in GET /api/config/empresa:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
