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

// PUT - Update email settings
export async function PUT(request: NextRequest) {
  try {
    const supabase = await getSupabaseClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { email_defecto, enviar_email_crear_pedido, enviar_email_completar_pedido } = body;

    // Get current empresa
    const { data: empresas, error: fetchError } = await supabase
      .from('empresa')
      .select('id, info_extra')
      .limit(1);

    if (fetchError) {
      return NextResponse.json(
        { error: 'Error al verificar empresa', details: fetchError.message },
        { status: 500 }
      );
    }

    const empresa = empresas && empresas.length > 0 ? empresas[0] : null;

    if (!empresa) {
      return NextResponse.json(
        { error: 'Empresa no encontrada' },
        { status: 404 }
      );
    }

    // Update empresa with email settings in info_extra JSONB field
    const currentInfoExtra = empresa.info_extra || {};
    const updatedInfoExtra = {
      ...currentInfoExtra,
      email_settings: {
        email_defecto: email_defecto || '',
        enviar_email_crear_pedido: enviar_email_crear_pedido || false,
        enviar_email_completar_pedido: enviar_email_completar_pedido || false,
      },
    };

    const { error: updateError } = await supabase
      .from('empresa')
      .update({
        info_extra: updatedInfoExtra,
        updated_at: new Date().toISOString(),
      })
      .eq('id', empresa.id);

    if (updateError) {
      return NextResponse.json(
        { error: 'Error al guardar ajustes de email', details: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Ajustes de email guardados',
      data: {
        email_defecto: email_defecto || '',
        enviar_email_crear_pedido: enviar_email_crear_pedido || false,
        enviar_email_completar_pedido: enviar_email_completar_pedido || false,
      }
    });
  } catch (error) {
    console.error('Error in PUT /api/config/email:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// GET - Get email settings
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
      .select('info_extra')
      .limit(1);

    if (fetchError) {
      return NextResponse.json(
        { error: 'Error al obtener empresa', details: fetchError.message },
        { status: 500 }
      );
    }

    const empresa = empresas && empresas.length > 0 ? empresas[0] : null;
    const emailSettings = empresa?.info_extra?.email_settings || {};

    return NextResponse.json({
      data: {
        email_defecto: emailSettings.email_defecto || '',
        enviar_email_crear_pedido: emailSettings.enviar_email_crear_pedido || false,
        enviar_email_completar_pedido: emailSettings.enviar_email_completar_pedido || false,
      }
    });
  } catch (error) {
    console.error('Error in GET /api/config/email:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
