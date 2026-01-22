import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, getEmpresaFromUser } from '@/lib/supabase-server';
import { enviarPedidoAlProveedor } from '@/lib/email-service';
import { generarPDFPedido } from '@/lib/pdf-generator';
import {
  generateOrderEmailSubject,
  generateOrderEmailHTML,
  generateOrderEmailText,
  type OrderEmailData
} from '@/lib/email-templates';
import type { Empresa, Proveedor, PedidoGenerado } from '@/types';

interface SendEmailBody {
  email_proveedor: string;
}

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// POST /api/orders/[id]/send-email - Envia el pedido por email al proveedor
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Verificar autenticacion y obtener empresa
    const { empresa, error: authError } = await getEmpresaFromUser();
    if (authError || !empresa) {
      return NextResponse.json(
        { error: 'No autenticado', details: authError },
        { status: 401 }
      );
    }

    // Parsear body
    const body: SendEmailBody = await request.json();

    // Validar email
    if (!body.email_proveedor) {
      return NextResponse.json(
        { error: 'email_proveedor es requerido' },
        { status: 400 }
      );
    }

    // Validar formato de email basico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email_proveedor)) {
      return NextResponse.json(
        { error: 'Formato de email invalido' },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();

    // Obtener el pedido con proveedor
    const { data: pedido, error: pedidoError } = await supabase
      .from('pedidos_generados')
      .select('*, proveedores(*)')
      .eq('id', id)
      .eq('empresa_id', empresa.id)
      .single();

    if (pedidoError || !pedido) {
      return NextResponse.json(
        { error: 'Pedido no encontrado' },
        { status: 404 }
      );
    }

    const typedPedido = pedido as PedidoGenerado & { proveedores: Proveedor };

    // Verificar que el pedido esta en estado valido para enviar
    if (typedPedido.estado === 'sent') {
      return NextResponse.json(
        { error: 'Este pedido ya ha sido enviado', sent_at: typedPedido.sent_at },
        { status: 400 }
      );
    }

    if (typedPedido.estado === 'cancelled') {
      return NextResponse.json(
        { error: 'No se puede enviar un pedido cancelado' },
        { status: 400 }
      );
    }

    // Generar numero de pedido
    const numeroPedido = `PO-${typedPedido.id.slice(0, 8).toUpperCase()}`;

    // Generar PDF del pedido
    const pdfBuffer = await generarPDFPedido(
      {
        id: typedPedido.id,
        datos_pedido: typedPedido.datos_pedido,
        total_estimado: Number(typedPedido.total_estimado),
        notas: typedPedido.notas,
      },
      empresa as Empresa,
      typedPedido.proveedores
    );

    // Enviar email con PDF adjunto
    const emailResult = await enviarPedidoAlProveedor({
      proveedor: {
        ...typedPedido.proveedores,
        email: body.email_proveedor, // Usar el email proporcionado
      },
      cliente: empresa as Empresa,
      pedido: {
        id: typedPedido.id,
        numero_pedido: numeroPedido,
        datos_pedido: typedPedido.datos_pedido,
        total_estimado: Number(typedPedido.total_estimado),
        notas: typedPedido.notas,
      },
      pdfBuffer,
    });

    if (!emailResult.success) {
      return NextResponse.json(
        { error: 'Error al enviar el email', details: emailResult.error },
        { status: 500 }
      );
    }

    // Actualizar el pedido con estado 'sent' y fecha de envio
    const now = new Date().toISOString();
    const { error: updateError } = await supabase
      .from('pedidos_generados')
      .update({
        estado: 'sent',
        sent_at: now,
        email_template_used: 'order_v1',
        updated_at: now,
      })
      .eq('id', id);

    if (updateError) {
      console.error('Error updating order status:', updateError);
      // El email ya se envio, pero no pudimos actualizar el estado
      return NextResponse.json({
        estado: 'sent',
        sent_at: now,
        email_sent_to: body.email_proveedor,
        message_id: emailResult.message_id,
        warning: 'Email enviado pero hubo un error actualizando el estado en BD'
      });
    }

    return NextResponse.json({
      estado: 'sent',
      sent_at: now,
      email_sent_to: body.email_proveedor,
      message_id: emailResult.message_id,
      numero_pedido: numeroPedido,
    });

  } catch (error) {
    console.error('Error in send-email POST:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// GET /api/orders/[id]/send-email - Preview del email (para testing/debug)
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Verificar autenticacion y obtener empresa
    const { empresa, error: authError } = await getEmpresaFromUser();
    if (authError || !empresa) {
      return NextResponse.json(
        { error: 'No autenticado', details: authError },
        { status: 401 }
      );
    }

    const supabase = await createServerSupabaseClient();

    // Obtener el pedido
    const { data: pedido, error: pedidoError } = await supabase
      .from('pedidos_generados')
      .select('*, proveedores(*)')
      .eq('id', id)
      .eq('empresa_id', empresa.id)
      .single();

    if (pedidoError || !pedido) {
      return NextResponse.json(
        { error: 'Pedido no encontrado' },
        { status: 404 }
      );
    }

    const typedPedido = pedido as PedidoGenerado & { proveedores: Proveedor };

    const numeroPedido = `PO-${typedPedido.id.slice(0, 8).toUpperCase()}`;

    const emailData: OrderEmailData = {
      empresa: empresa as Empresa,
      proveedor: typedPedido.proveedores,
      lineas: typedPedido.datos_pedido,
      numero_pedido: numeroPedido,
      total_estimado: Number(typedPedido.total_estimado),
      notas: typedPedido.notas || undefined,
    };

    // Retornar preview del email
    return NextResponse.json({
      subject: generateOrderEmailSubject(emailData),
      html: generateOrderEmailHTML(emailData),
      text: generateOrderEmailText(emailData),
      to_email: typedPedido.proveedores.email || 'No email configurado',
    });

  } catch (error) {
    console.error('Error in send-email GET:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
