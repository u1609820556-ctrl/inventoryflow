/**
 * Email Service para InventoryFlow
 * Usa Resend para enviar emails con PDFs adjuntos
 */

import { Resend } from 'resend';
import type { Empresa, Proveedor, LineaPedidoGenerado } from '@/types';

// Inicializar Resend (solo si hay API key)
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export interface EmailPedidoData {
  proveedor: Proveedor;
  cliente: Empresa;
  pedido: {
    id: string;
    numero_pedido: string;
    datos_pedido: LineaPedidoGenerado[];
    total_estimado: number;
    notas?: string;
  };
  pdfBuffer: Buffer;
}

export interface SendEmailResult {
  success: boolean;
  message_id?: string;
  error?: string;
}

/**
 * Formatea un numero como moneda (EUR)
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
}

/**
 * Genera el HTML del email de pedido
 */
function generateEmailHTML(data: EmailPedidoData): string {
  const fecha = new Date().toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const lineasHTML = data.pedido.datos_pedido.map(linea => `
    <tr>
      <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; font-size: 14px;">
        ${linea.nombre_producto || 'Producto'}
      </td>
      <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; font-size: 14px; text-align: center;">
        ${linea.cantidad}
      </td>
      <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; font-size: 14px; text-align: right;">
        ${formatCurrency(linea.precio_unitario)}
      </td>
      <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; font-size: 14px; text-align: right; font-weight: 500;">
        ${formatCurrency(linea.cantidad * linea.precio_unitario)}
      </td>
    </tr>
  `).join('');

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Orden de Compra - ${data.pedido.numero_pedido}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 20px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #064E3B 0%, #065F46 100%); padding: 32px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">
                ${data.cliente.nombre_empresa}
              </h1>
              <p style="margin: 8px 0 0; color: rgba(255,255,255,0.8); font-size: 14px;">
                Nueva Orden de Compra
              </p>
            </td>
          </tr>

          <!-- Order Info -->
          <tr>
            <td style="padding: 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-bottom: 24px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #ecfdf5; border-radius: 8px; padding: 16px;">
                      <tr>
                        <td>
                          <p style="margin: 0 0 4px; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">
                            Numero de Pedido
                          </p>
                          <p style="margin: 0; font-size: 20px; font-weight: 600; color: #064E3B;">
                            ${data.pedido.numero_pedido}
                          </p>
                        </td>
                        <td style="text-align: right;">
                          <p style="margin: 0 0 4px; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">
                            Fecha
                          </p>
                          <p style="margin: 0; font-size: 16px; color: #1f2937;">
                            ${fecha}
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Greeting -->
                <tr>
                  <td style="padding-bottom: 24px;">
                    <p style="margin: 0 0 12px; font-size: 16px; color: #1f2937;">
                      Estimado/a <strong>${data.proveedor.nombre}</strong>,
                    </p>
                    <p style="margin: 0; font-size: 14px; color: #6b7280; line-height: 1.6;">
                      Adjunto encontrara nuestra orden de compra en formato PDF. Por favor, confirme la recepcion
                      y disponibilidad de los productos solicitados.
                    </p>
                  </td>
                </tr>

                <!-- Products Table -->
                <tr>
                  <td>
                    <p style="margin: 0 0 12px; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">
                      Resumen del Pedido
                    </p>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                      <thead>
                        <tr style="background-color: #064E3B;">
                          <th style="padding: 12px 16px; text-align: left; font-size: 12px; font-weight: 600; color: #ffffff; text-transform: uppercase;">
                            Producto
                          </th>
                          <th style="padding: 12px 16px; text-align: center; font-size: 12px; font-weight: 600; color: #ffffff; text-transform: uppercase;">
                            Cantidad
                          </th>
                          <th style="padding: 12px 16px; text-align: right; font-size: 12px; font-weight: 600; color: #ffffff; text-transform: uppercase;">
                            Precio
                          </th>
                          <th style="padding: 12px 16px; text-align: right; font-size: 12px; font-weight: 600; color: #ffffff; text-transform: uppercase;">
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        ${lineasHTML}
                      </tbody>
                    </table>
                  </td>
                </tr>

                <!-- Total -->
                <tr>
                  <td style="padding-top: 16px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td></td>
                        <td width="200" style="background-color: #064E3B; padding: 16px; border-radius: 8px;">
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="font-size: 14px; color: rgba(255,255,255,0.8);">
                                Total Estimado
                              </td>
                              <td style="text-align: right; font-size: 20px; font-weight: 600; color: #ffffff;">
                                ${formatCurrency(data.pedido.total_estimado)}
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                ${data.pedido.notas ? `
                <!-- Notes -->
                <tr>
                  <td style="padding-top: 24px;">
                    <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 0 8px 8px 0;">
                      <p style="margin: 0 0 8px; font-size: 12px; font-weight: 600; color: #92400e; text-transform: uppercase;">
                        Notas adicionales
                      </p>
                      <p style="margin: 0; font-size: 14px; color: #78350f;">
                        ${data.pedido.notas}
                      </p>
                    </div>
                  </td>
                </tr>
                ` : ''}

                <!-- Instructions -->
                <tr>
                  <td style="padding-top: 24px;">
                    <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px;">
                      <p style="margin: 0 0 12px; font-size: 14px; font-weight: 600; color: #1f2937;">
                        Proximos pasos:
                      </p>
                      <ol style="margin: 0; padding-left: 20px; color: #6b7280; font-size: 14px; line-height: 1.8;">
                        <li>Confirme la recepcion de este pedido</li>
                        <li>Verifique disponibilidad de stock</li>
                        <li>Envie factura proforma si hay cambios en precios</li>
                        <li>Coordine fecha de entrega</li>
                      </ol>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px; font-size: 14px; color: #1f2937; font-weight: 500;">
                ${data.cliente.nombre_empresa}
              </p>
              <p style="margin: 0 0 4px; font-size: 13px; color: #6b7280;">
                ${data.cliente.direccion}
              </p>
              <p style="margin: 0; font-size: 13px; color: #6b7280;">
                ${data.cliente.email} | ${data.cliente.telefono}
              </p>
            </td>
          </tr>
        </table>

        <!-- Legal -->
        <table role="presentation" width="600" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding: 24px; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                Este email ha sido generado automaticamente por InventoryFlow.
                Para cualquier consulta, contacte con nosotros en ${data.cliente.email}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * Genera texto plano del email (fallback)
 */
function generateEmailText(data: EmailPedidoData): string {
  const fecha = new Date().toLocaleDateString('es-ES');

  let text = `
ORDEN DE COMPRA - ${data.pedido.numero_pedido}
========================================

De: ${data.cliente.nombre_empresa}
Para: ${data.proveedor.nombre}
Fecha: ${fecha}

----------------------------------------

Estimado/a ${data.proveedor.nombre},

Adjunto encontrara nuestra orden de compra en formato PDF.
Por favor, confirme la recepcion y disponibilidad de los productos solicitados.

RESUMEN DEL PEDIDO
------------------
`;

  for (const linea of data.pedido.datos_pedido) {
    text += `
- ${linea.nombre_producto || 'Producto'}
  Cantidad: ${linea.cantidad}
  Precio unitario: ${formatCurrency(linea.precio_unitario)}
  Total: ${formatCurrency(linea.cantidad * linea.precio_unitario)}
`;
  }

  text += `
----------------------------------------
TOTAL ESTIMADO: ${formatCurrency(data.pedido.total_estimado)}
----------------------------------------
`;

  if (data.pedido.notas) {
    text += `
NOTAS ADICIONALES:
${data.pedido.notas}
`;
  }

  text += `
PROXIMOS PASOS:
1. Confirme la recepcion de este pedido
2. Verifique disponibilidad de stock
3. Envie factura proforma si hay cambios en precios
4. Coordine fecha de entrega

----------------------------------------

${data.cliente.nombre_empresa}
${data.cliente.direccion}
${data.cliente.email} | ${data.cliente.telefono}

Este email ha sido generado automaticamente por InventoryFlow.
`;

  return text;
}

/**
 * Envia un pedido por email al proveedor con PDF adjunto
 */
export async function enviarPedidoAlProveedor(data: EmailPedidoData): Promise<SendEmailResult> {
  const emailDestino = data.proveedor.email;

  if (!emailDestino) {
    return {
      success: false,
      error: 'El proveedor no tiene email configurado'
    };
  }

  // Si no hay Resend configurado, simular envio (desarrollo)
  if (!resend) {
    console.log('=== EMAIL SIMULADO (sin RESEND_API_KEY) ===');
    console.log('To:', emailDestino);
    console.log('Subject:', `Nuevo pedido de ${data.cliente.nombre_empresa} - ${data.pedido.numero_pedido}`);
    console.log('PDF adjunto:', `${data.pedido.numero_pedido}.pdf`);
    console.log('==========================================');

    return {
      success: true,
      message_id: `dev-${Date.now()}`,
    };
  }

  try {
    // Dominio de envio (configurable via env)
    const fromDomain = process.env.EMAIL_FROM_DOMAIN || 'inventoryflow.app';
    const fromEmail = `pedidos@${fromDomain}`;

    const result = await resend.emails.send({
      from: `${data.cliente.nombre_empresa} <${fromEmail}>`,
      to: [emailDestino],
      replyTo: data.cliente.email, // Las respuestas van al cliente
      subject: `Nuevo pedido de ${data.cliente.nombre_empresa} - ${data.pedido.numero_pedido}`,
      html: generateEmailHTML(data),
      text: generateEmailText(data),
      attachments: [{
        filename: `${data.pedido.numero_pedido}.pdf`,
        content: data.pdfBuffer,
      }],
    });

    if (result.error) {
      console.error('[EMAIL] Error de Resend:', result.error);
      return {
        success: false,
        error: result.error.message || 'Error al enviar email'
      };
    }

    console.log(`[EMAIL] Email enviado exitosamente: ${result.data?.id}`);

    return {
      success: true,
      message_id: result.data?.id,
    };

  } catch (error) {
    console.error('[EMAIL] Error al enviar email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido al enviar email'
    };
  }
}

/**
 * Verifica si el servicio de email esta configurado
 */
export function isEmailServiceConfigured(): boolean {
  return !!resend;
}
