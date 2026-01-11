/**
 * PDF Generator para Purchase Orders
 *
 * Esta implementación genera un PDF simple en formato texto/base64.
 * Para producción, considera usar:
 * - pdfkit (Node.js nativo)
 * - @react-pdf/renderer (React-based)
 * - puppeteer (HTML to PDF)
 *
 * Instalación recomendada (cuando npm funcione):
 * npm install pdfkit
 * npm install @types/pdfkit --save-dev
 */

import type { Empresa, Proveedor, LineaPedidoGenerado } from '@/types';

export interface PDFOrderData {
  empresa: Empresa;
  proveedor: Proveedor;
  lineas: LineaPedidoGenerado[];
  numero_pedido?: string;
  fecha?: string;
  notas?: string;
}

export interface PDFGeneratorResult {
  success: boolean;
  pdf_base64?: string;
  pdf_url?: string;
  error?: string;
  html_content?: string; // Para debug/preview
}

/**
 * Genera el contenido HTML del Purchase Order
 */
export function generateOrderHTML(data: PDFOrderData): string {
  const fecha = data.fecha || new Date().toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const numeroPedido = data.numero_pedido || `PO-${Date.now()}`;

  // Calcular totales
  const subtotal = data.lineas.reduce((acc, linea) => {
    return acc + (linea.cantidad * linea.precio_unitario);
  }, 0);

  const iva = subtotal * 0.21; // 21% IVA
  const total = subtotal + iva;

  const lineasHTML = data.lineas.map((linea, index) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${index + 1}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${linea.nombre_producto || 'Producto'}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${linea.codigo || '-'}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${linea.cantidad}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">${formatCurrency(linea.precio_unitario)}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">${formatCurrency(linea.cantidad * linea.precio_unitario)}</td>
    </tr>
  `).join('');

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Orden de Compra - ${numeroPedido}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      color: #1f2937;
      line-height: 1.5;
      padding: 40px;
      max-width: 800px;
      margin: 0 auto;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 3px solid #3b82f6;
    }
    .company-info h1 {
      font-size: 28px;
      color: #1e40af;
      margin-bottom: 8px;
    }
    .company-info p {
      color: #6b7280;
      font-size: 14px;
    }
    .order-info {
      text-align: right;
    }
    .order-info h2 {
      font-size: 24px;
      color: #1e40af;
      margin-bottom: 8px;
    }
    .order-info p {
      font-size: 14px;
      color: #6b7280;
    }
    .order-number {
      background: #eff6ff;
      padding: 8px 16px;
      border-radius: 6px;
      font-weight: 600;
      color: #1e40af;
      display: inline-block;
      margin-top: 8px;
    }
    .section {
      margin-bottom: 30px;
    }
    .section-title {
      font-size: 14px;
      font-weight: 600;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 12px;
    }
    .provider-card {
      background: #f9fafb;
      padding: 20px;
      border-radius: 8px;
      border: 1px solid #e5e7eb;
    }
    .provider-card h3 {
      font-size: 18px;
      color: #1f2937;
      margin-bottom: 8px;
    }
    .provider-card p {
      font-size: 14px;
      color: #6b7280;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }
    th {
      background: #1e40af;
      color: white;
      padding: 14px 12px;
      text-align: left;
      font-size: 13px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    th:first-child { border-radius: 8px 0 0 0; }
    th:last-child { border-radius: 0 8px 0 0; text-align: right; }
    th:nth-child(4), th:nth-child(5) { text-align: center; }
    th:nth-child(5), th:nth-child(6) { text-align: right; }
    .totals-section {
      margin-top: 30px;
      display: flex;
      justify-content: flex-end;
    }
    .totals-table {
      width: 300px;
    }
    .totals-table tr td {
      padding: 10px 16px;
      font-size: 14px;
    }
    .totals-table tr td:first-child {
      color: #6b7280;
    }
    .totals-table tr td:last-child {
      text-align: right;
      font-weight: 500;
    }
    .totals-table tr.total-row {
      background: #1e40af;
      color: white;
    }
    .totals-table tr.total-row td {
      font-size: 16px;
      font-weight: 600;
      border-radius: 6px;
    }
    .totals-table tr.total-row td:first-child {
      color: white;
    }
    .footer {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
    }
    .terms {
      background: #f9fafb;
      padding: 20px;
      border-radius: 8px;
      font-size: 13px;
      color: #6b7280;
    }
    .terms h4 {
      font-size: 14px;
      color: #1f2937;
      margin-bottom: 10px;
    }
    .terms ul {
      list-style: none;
      padding-left: 0;
    }
    .terms li {
      margin-bottom: 6px;
      padding-left: 16px;
      position: relative;
    }
    .terms li::before {
      content: "•";
      position: absolute;
      left: 0;
      color: #3b82f6;
    }
    .notes {
      margin-top: 20px;
      padding: 16px;
      background: #fef3c7;
      border-radius: 8px;
      border-left: 4px solid #f59e0b;
    }
    .notes h4 {
      font-size: 14px;
      color: #92400e;
      margin-bottom: 8px;
    }
    .notes p {
      font-size: 13px;
      color: #78350f;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="company-info">
      <h1>${data.empresa.nombre_empresa}</h1>
      <p>${data.empresa.direccion}</p>
      <p>${data.empresa.email} | ${data.empresa.telefono}</p>
    </div>
    <div class="order-info">
      <h2>ORDEN DE COMPRA</h2>
      <p>Fecha: ${fecha}</p>
      <div class="order-number">${numeroPedido}</div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Proveedor</div>
    <div class="provider-card">
      <h3>${data.proveedor.nombre}</h3>
      <p>${data.proveedor.email || ''}</p>
      <p>${data.proveedor.telefono || ''}</p>
      <p>${data.proveedor.direccion || ''}</p>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Detalle del Pedido</div>
    <table>
      <thead>
        <tr>
          <th style="width: 40px;">#</th>
          <th>Producto</th>
          <th style="width: 100px;">Código</th>
          <th style="width: 80px;">Cantidad</th>
          <th style="width: 100px;">Precio Unit.</th>
          <th style="width: 100px;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${lineasHTML}
      </tbody>
    </table>
  </div>

  <div class="totals-section">
    <table class="totals-table">
      <tr>
        <td>Subtotal</td>
        <td>${formatCurrency(subtotal)}</td>
      </tr>
      <tr>
        <td>IVA (21%)</td>
        <td>${formatCurrency(iva)}</td>
      </tr>
      <tr class="total-row">
        <td>TOTAL</td>
        <td>${formatCurrency(total)}</td>
      </tr>
    </table>
  </div>

  <div class="footer">
    <div class="terms">
      <h4>Términos y Condiciones</h4>
      <ul>
        <li>Pago a 30 días desde la fecha de factura</li>
        <li>Entrega estimada: 5-7 días hábiles</li>
        <li>Los precios incluyen transporte hasta nuestras instalaciones</li>
        <li>Garantía según condiciones del fabricante</li>
      </ul>
    </div>
    ${data.notas ? `
    <div class="notes">
      <h4>Notas adicionales</h4>
      <p>${data.notas}</p>
    </div>
    ` : ''}
  </div>
</body>
</html>
  `;
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
 * Genera un PDF de Purchase Order
 *
 * NOTA: Esta implementación básica retorna el HTML.
 * Para generar PDF real, hay varias opciones:
 *
 * 1. Con pdfkit (Node.js):
 *    - npm install pdfkit
 *    - Generar PDF programáticamente
 *
 * 2. Con puppeteer (HTML to PDF):
 *    - npm install puppeteer
 *    - Renderizar HTML y convertir a PDF
 *
 * 3. Con servicio externo:
 *    - https://api.pdfmonkey.io
 *    - https://api.html2pdf.app
 *    - https://cloudconvert.com/api
 *
 * 4. Con Supabase Edge Functions + Deno:
 *    - Usar deno-pdf o similar
 */
export async function generateOrderPDF(data: PDFOrderData): Promise<PDFGeneratorResult> {
  try {
    // Generar HTML
    const htmlContent = generateOrderHTML(data);

    // Convertir HTML a Base64 para preview/almacenamiento
    const htmlBase64 = Buffer.from(htmlContent).toString('base64');

    // En producción, aquí usarías una de las siguientes opciones:
    //
    // Opción 1: Puppeteer (mejor calidad)
    // const browser = await puppeteer.launch();
    // const page = await browser.newPage();
    // await page.setContent(htmlContent);
    // const pdfBuffer = await page.pdf({ format: 'A4' });
    // await browser.close();
    // return { success: true, pdf_base64: pdfBuffer.toString('base64') };
    //
    // Opción 2: pdfkit (más ligero, sin navegador)
    // import PDFDocument from 'pdfkit';
    // const doc = new PDFDocument();
    // ... generar contenido ...
    // return { success: true, pdf_base64: buffer.toString('base64') };
    //
    // Opción 3: Servicio externo
    // const response = await fetch('https://api.htmltopdf.com/convert', {
    //   method: 'POST',
    //   body: JSON.stringify({ html: htmlContent })
    // });
    // const pdfData = await response.json();
    // return { success: true, pdf_base64: pdfData.pdf };

    // Por ahora, retornamos el HTML como base64 (para preview en navegador)
    // El frontend puede renderizar esto en un iframe o usar html2pdf.js del lado cliente
    return {
      success: true,
      pdf_base64: htmlBase64,
      html_content: htmlContent,
    };

  } catch (error) {
    console.error('Error generating PDF:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al generar PDF'
    };
  }
}

/**
 * Calcula el total estimado de un pedido
 */
export function calculateOrderTotal(lineas: LineaPedidoGenerado[]): number {
  return lineas.reduce((acc, linea) => {
    return acc + (linea.cantidad * linea.precio_unitario);
  }, 0);
}

/**
 * Genera un número de pedido único
 */
export function generateOrderNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `PO-${year}${month}${day}-${random}`;
}
