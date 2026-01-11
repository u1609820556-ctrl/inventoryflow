/**
 * Email Templates para Purchase Orders
 *
 * Estos templates están diseñados para ser usados con:
 * - Resend (https://resend.com)
 * - Nodemailer
 * - SendGrid
 * - Cualquier servicio de email
 */

import type { Empresa, Proveedor, LineaPedidoGenerado } from '@/types';

export interface OrderEmailData {
  empresa: Empresa;
  proveedor: Proveedor;
  lineas: LineaPedidoGenerado[];
  numero_pedido: string;
  total_estimado: number;
  fecha?: string;
  notas?: string;
}

/**
 * Formatea un número como moneda (EUR)
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
}

/**
 * Genera el asunto del email
 */
export function generateOrderEmailSubject(data: OrderEmailData): string {
  const fecha = data.fecha || new Date().toLocaleDateString('es-ES');
  return `Nuevo pedido de ${data.empresa.nombre_empresa} - ${fecha} [${data.numero_pedido}]`;
}

/**
 * Genera el cuerpo del email en formato HTML
 */
export function generateOrderEmailHTML(data: OrderEmailData): string {
  const fecha = data.fecha || new Date().toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const lineasHTML = data.lineas.map(linea => `
    <tr>
      <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; font-size: 14px;">
        ${linea.nombre_producto || 'Producto'}
      </td>
      <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; font-size: 14px; color: #6b7280;">
        ${linea.codigo || '-'}
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
  <title>Orden de Compra - ${data.numero_pedido}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 20px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 32px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">
                ${data.empresa.nombre_empresa}
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
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #eff6ff; border-radius: 8px; padding: 16px;">
                      <tr>
                        <td>
                          <p style="margin: 0 0 4px; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">
                            Número de Pedido
                          </p>
                          <p style="margin: 0; font-size: 20px; font-weight: 600; color: #1e40af;">
                            ${data.numero_pedido}
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
                      Adjunto encontrará nuestra orden de compra. Por favor, confirme la recepción
                      y disponibilidad de los productos solicitados.
                    </p>
                  </td>
                </tr>

                <!-- Products Table -->
                <tr>
                  <td>
                    <p style="margin: 0 0 12px; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">
                      Detalle del Pedido
                    </p>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                      <thead>
                        <tr style="background-color: #1e40af;">
                          <th style="padding: 12px 16px; text-align: left; font-size: 12px; font-weight: 600; color: #ffffff; text-transform: uppercase;">
                            Producto
                          </th>
                          <th style="padding: 12px 16px; text-align: left; font-size: 12px; font-weight: 600; color: #ffffff; text-transform: uppercase;">
                            Código
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
                        <td width="200" style="background-color: #1e40af; padding: 16px; border-radius: 8px;">
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="font-size: 14px; color: rgba(255,255,255,0.8);">
                                Total Estimado
                              </td>
                              <td style="text-align: right; font-size: 20px; font-weight: 600; color: #ffffff;">
                                ${formatCurrency(data.total_estimado)}
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                ${data.notas ? `
                <!-- Notes -->
                <tr>
                  <td style="padding-top: 24px;">
                    <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 0 8px 8px 0;">
                      <p style="margin: 0 0 8px; font-size: 12px; font-weight: 600; color: #92400e; text-transform: uppercase;">
                        Notas adicionales
                      </p>
                      <p style="margin: 0; font-size: 14px; color: #78350f;">
                        ${data.notas}
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
                        Próximos pasos:
                      </p>
                      <ol style="margin: 0; padding-left: 20px; color: #6b7280; font-size: 14px; line-height: 1.8;">
                        <li>Confirme la recepción de este pedido</li>
                        <li>Verifique disponibilidad de stock</li>
                        <li>Envíe factura proforma si hay cambios en precios</li>
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
                ${data.empresa.nombre_empresa}
              </p>
              <p style="margin: 0 0 4px; font-size: 13px; color: #6b7280;">
                ${data.empresa.direccion}
              </p>
              <p style="margin: 0; font-size: 13px; color: #6b7280;">
                ${data.empresa.email} | ${data.empresa.telefono}
              </p>
            </td>
          </tr>
        </table>

        <!-- Legal -->
        <table role="presentation" width="600" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding: 24px; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                Este email ha sido generado automáticamente. Por favor, no responda directamente a este mensaje.
                Para cualquier consulta, contacte con nosotros en ${data.empresa.email}
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
 * Genera el cuerpo del email en formato texto plano (fallback)
 */
export function generateOrderEmailText(data: OrderEmailData): string {
  const fecha = data.fecha || new Date().toLocaleDateString('es-ES');

  let text = `
ORDEN DE COMPRA - ${data.numero_pedido}
========================================

De: ${data.empresa.nombre_empresa}
Para: ${data.proveedor.nombre}
Fecha: ${fecha}

----------------------------------------

Estimado/a ${data.proveedor.nombre},

Adjunto encontrará nuestra orden de compra. Por favor, confirme la recepción
y disponibilidad de los productos solicitados.

DETALLE DEL PEDIDO
------------------
`;

  for (const linea of data.lineas) {
    text += `
- ${linea.nombre_producto || 'Producto'}
  Código: ${linea.codigo || '-'}
  Cantidad: ${linea.cantidad}
  Precio unitario: ${formatCurrency(linea.precio_unitario)}
  Total: ${formatCurrency(linea.cantidad * linea.precio_unitario)}
`;
  }

  text += `
----------------------------------------
TOTAL ESTIMADO: ${formatCurrency(data.total_estimado)}
----------------------------------------
`;

  if (data.notas) {
    text += `
NOTAS ADICIONALES:
${data.notas}
`;
  }

  text += `
PRÓXIMOS PASOS:
1. Confirme la recepción de este pedido
2. Verifique disponibilidad de stock
3. Envíe factura proforma si hay cambios en precios
4. Coordine fecha de entrega

----------------------------------------

${data.empresa.nombre_empresa}
${data.empresa.direccion}
${data.empresa.email} | ${data.empresa.telefono}

Este email ha sido generado automáticamente.
`;

  return text;
}

/**
 * Interfaz para el resultado del envío de email
 */
export interface SendEmailResult {
  success: boolean;
  message_id?: string;
  error?: string;
}

/**
 * Función placeholder para enviar email
 *
 * Para implementar con Resend:
 *
 * import { Resend } from 'resend';
 * const resend = new Resend(process.env.RESEND_API_KEY);
 *
 * export async function sendOrderEmail(
 *   to: string,
 *   data: OrderEmailData,
 *   pdfAttachment?: { filename: string; content: Buffer }
 * ): Promise<SendEmailResult> {
 *   const result = await resend.emails.send({
 *     from: 'pedidos@tudominio.com',
 *     to: [to],
 *     subject: generateOrderEmailSubject(data),
 *     html: generateOrderEmailHTML(data),
 *     text: generateOrderEmailText(data),
 *     attachments: pdfAttachment ? [{
 *       filename: pdfAttachment.filename,
 *       content: pdfAttachment.content,
 *     }] : undefined,
 *   });
 *   return { success: true, message_id: result.id };
 * }
 */
export async function sendOrderEmail(
  to: string,
  data: OrderEmailData,
  pdfBase64?: string
): Promise<SendEmailResult> {
  // Esta es una implementación placeholder
  // En producción, integra con Resend, SendGrid, Nodemailer, etc.

  console.log('=== EMAIL SEND REQUEST ===');
  console.log('To:', to);
  console.log('Subject:', generateOrderEmailSubject(data));
  console.log('Has PDF attachment:', !!pdfBase64);
  console.log('========================');

  // Simular envío exitoso para desarrollo
  // En producción, aquí iría la lógica real de envío

  // Ejemplo con Resend (descomentar cuando tengas API key):
  /*
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);

    const attachments = pdfBase64 ? [{
      filename: `orden-${data.numero_pedido}.pdf`,
      content: Buffer.from(pdfBase64, 'base64'),
    }] : [];

    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'pedidos@tudominio.com',
      to: [to],
      subject: generateOrderEmailSubject(data),
      html: generateOrderEmailHTML(data),
      text: generateOrderEmailText(data),
      attachments,
    });

    return {
      success: true,
      message_id: result.data?.id
    };
  } catch (error) {
    console.error('Error sending email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al enviar email'
    };
  }
  */

  // Para desarrollo, retornamos éxito simulado
  return {
    success: true,
    message_id: `dev-${Date.now()}`,
  };
}
