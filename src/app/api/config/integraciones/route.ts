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

// PUT - Update integraciones
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
    const { resend_api_key, n8n_webhook_url } = body;

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

    // Update empresa with integraciones in info_extra JSONB field
    const currentInfoExtra = empresa.info_extra || {};
    const updatedInfoExtra = {
      ...currentInfoExtra,
      integraciones: {
        resend_api_key: resend_api_key || '',
        n8n_webhook_url: n8n_webhook_url || '',
      },
    };

    const { data, error: updateError } = await supabase
      .from('empresa')
      .update({
        info_extra: updatedInfoExtra,
        updated_at: new Date().toISOString(),
      })
      .eq('id', empresa.id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: 'Error al guardar integraciones', details: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Integraciones guardadas',
      data: {
        resend_api_key: resend_api_key ? '***' + resend_api_key.slice(-4) : '',
        n8n_webhook_url: n8n_webhook_url || '',
      }
    });
  } catch (error) {
    console.error('Error in PUT /api/config/integraciones:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// GET - Get integraciones
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
    const integraciones = empresa?.info_extra?.integraciones || {};

    // Mask the API key for security
    return NextResponse.json({
      data: {
        resend_api_key: integraciones.resend_api_key ? '***' + integraciones.resend_api_key.slice(-4) : '',
        n8n_webhook_url: integraciones.n8n_webhook_url || '',
      }
    });
  } catch (error) {
    console.error('Error in GET /api/config/integraciones:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
