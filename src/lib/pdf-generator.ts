/**
 * PDF Generator para Purchase Orders usando pdfkit
 */

import PDFDocument from 'pdfkit';
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
  pdfBuffer?: Buffer;
  pdf_base64?: string;
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
 * Genera un numero de pedido unico
 */
export function generateOrderNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `PO-${year}${month}${day}-${random}`;
}

/**
 * Genera un PDF de Purchase Order usando pdfkit
 */
export async function generarPDFPedido(
  pedido: {
    id: string;
    datos_pedido: LineaPedidoGenerado[];
    total_estimado: number;
    notas?: string;
  },
  cliente: Empresa,
  proveedor: Proveedor
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const chunks: Buffer[] = [];
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 50, bottom: 50, left: 50, right: 50 }
      });

      // Collect PDF data
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const numeroPedido = `PO-${pedido.id.slice(0, 8).toUpperCase()}`;
      const fecha = new Date().toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      // Colors
      const primaryColor = '#064E3B';
      const textColor = '#1f2937';
      const grayColor = '#6b7280';
      const lightGray = '#f3f4f6';

      // =====================================================
      // HEADER
      // =====================================================
      doc.fillColor(primaryColor)
         .fontSize(24)
         .font('Helvetica-Bold')
         .text(cliente.nombre_empresa, 50, 50);

      doc.fillColor(grayColor)
         .fontSize(10)
         .font('Helvetica')
         .text(cliente.direccion, 50, 80)
         .text(`${cliente.email} | ${cliente.telefono}`, 50, 95);

      // Order title on right
      doc.fillColor(primaryColor)
         .fontSize(20)
         .font('Helvetica-Bold')
         .text('ORDEN DE COMPRA', 350, 50, { align: 'right', width: 195 });

      doc.fillColor(grayColor)
         .fontSize(10)
         .font('Helvetica')
         .text(`Fecha: ${fecha}`, 350, 80, { align: 'right', width: 195 });

      // Order number box
      doc.roundedRect(420, 95, 125, 25, 4)
         .fillColor('#ecfdf5')
         .fill();

      doc.fillColor(primaryColor)
         .fontSize(11)
         .font('Helvetica-Bold')
         .text(numeroPedido, 425, 102, { width: 115, align: 'center' });

      // Separator line
      doc.strokeColor(primaryColor)
         .lineWidth(2)
         .moveTo(50, 135)
         .lineTo(545, 135)
         .stroke();

      // =====================================================
      // PROVEEDOR SECTION
      // =====================================================
      doc.fillColor(grayColor)
         .fontSize(9)
         .font('Helvetica-Bold')
         .text('PROVEEDOR', 50, 155);

      doc.roundedRect(50, 170, 230, 70, 6)
         .fillColor(lightGray)
         .fill();

      doc.fillColor(textColor)
         .fontSize(12)
         .font('Helvetica-Bold')
         .text(proveedor.nombre, 60, 182);

      doc.fillColor(grayColor)
         .fontSize(10)
         .font('Helvetica')
         .text(proveedor.email || 'Sin email', 60, 200)
         .text(proveedor.telefono || '', 60, 215)
         .text(proveedor.direccion || '', 60, 230, { width: 210 });

      // =====================================================
      // PRODUCTS TABLE
      // =====================================================
      const tableTop = 260;
      const tableLeft = 50;
      const tableWidth = 495;
      const colWidths = [200, 80, 100, 115]; // Producto, Cantidad, Precio, Total

      // Table header
      doc.roundedRect(tableLeft, tableTop, tableWidth, 25, 4)
         .fillColor(primaryColor)
         .fill();

      doc.fillColor('#ffffff')
         .fontSize(9)
         .font('Helvetica-Bold');

      let xPos = tableLeft + 10;
      doc.text('PRODUCTO', xPos, tableTop + 8);
      xPos += colWidths[0];
      doc.text('CANTIDAD', xPos, tableTop + 8, { width: colWidths[1], align: 'center' });
      xPos += colWidths[1];
      doc.text('PRECIO UNIT.', xPos, tableTop + 8, { width: colWidths[2], align: 'right' });
      xPos += colWidths[2];
      doc.text('TOTAL', xPos, tableTop + 8, { width: colWidths[3] - 10, align: 'right' });

      // Table rows
      let yPos = tableTop + 30;
      let subtotal = 0;

      for (const linea of pedido.datos_pedido) {
        const lineaTotal = linea.cantidad * linea.precio_unitario;
        subtotal += lineaTotal;

        // Alternating background
        if (pedido.datos_pedido.indexOf(linea) % 2 === 0) {
          doc.rect(tableLeft, yPos - 3, tableWidth, 25)
             .fillColor('#fafafa')
             .fill();
        }

        doc.fillColor(textColor)
           .fontSize(10)
           .font('Helvetica');

        xPos = tableLeft + 10;
        doc.text(linea.nombre_producto || 'Producto', xPos, yPos, { width: colWidths[0] - 15 });
        xPos += colWidths[0];
        doc.text(String(linea.cantidad), xPos, yPos, { width: colWidths[1], align: 'center' });
        xPos += colWidths[1];
        doc.text(formatCurrency(linea.precio_unitario), xPos, yPos, { width: colWidths[2], align: 'right' });
        xPos += colWidths[2];
        doc.font('Helvetica-Bold')
           .text(formatCurrency(lineaTotal), xPos, yPos, { width: colWidths[3] - 10, align: 'right' });

        yPos += 25;

        // Add separator line
        doc.strokeColor('#e5e7eb')
           .lineWidth(0.5)
           .moveTo(tableLeft, yPos - 3)
           .lineTo(tableLeft + tableWidth, yPos - 3)
           .stroke();
      }

      // =====================================================
      // TOTALS
      // =====================================================
      const totalsTop = yPos + 20;
      const totalsLeft = 330;
      const totalsWidth = 215;

      // IVA calculation
      const iva = subtotal * 0.21;
      const total = subtotal + iva;

      // Subtotal row
      doc.fillColor(grayColor)
         .fontSize(10)
         .font('Helvetica')
         .text('Subtotal', totalsLeft, totalsTop);
      doc.fillColor(textColor)
         .text(formatCurrency(subtotal), totalsLeft + 100, totalsTop, { width: 115, align: 'right' });

      // IVA row
      doc.fillColor(grayColor)
         .text('IVA (21%)', totalsLeft, totalsTop + 20);
      doc.fillColor(textColor)
         .text(formatCurrency(iva), totalsLeft + 100, totalsTop + 20, { width: 115, align: 'right' });

      // Total row with background
      doc.roundedRect(totalsLeft - 10, totalsTop + 40, totalsWidth, 30, 4)
         .fillColor(primaryColor)
         .fill();

      doc.fillColor('#ffffff')
         .fontSize(12)
         .font('Helvetica-Bold')
         .text('TOTAL', totalsLeft, totalsTop + 50);
      doc.text(formatCurrency(total), totalsLeft + 80, totalsTop + 50, { width: 115, align: 'right' });

      // =====================================================
      // NOTES (if any)
      // =====================================================
      let currentY = totalsTop + 90;

      if (pedido.notas) {
        doc.roundedRect(50, currentY, 495, 50, 4)
           .fillColor('#fef3c7')
           .fill();

        doc.fillColor('#92400e')
           .fontSize(9)
           .font('Helvetica-Bold')
           .text('NOTAS ADICIONALES', 60, currentY + 10);

        doc.fillColor('#78350f')
           .fontSize(10)
           .font('Helvetica')
           .text(pedido.notas, 60, currentY + 25, { width: 475 });

        currentY += 65;
      }

      // =====================================================
      // TERMS & CONDITIONS
      // =====================================================
      doc.roundedRect(50, currentY, 495, 80, 6)
         .fillColor(lightGray)
         .fill();

      doc.fillColor(textColor)
         .fontSize(10)
         .font('Helvetica-Bold')
         .text('Terminos y Condiciones', 60, currentY + 12);

      doc.fillColor(grayColor)
         .fontSize(9)
         .font('Helvetica')
         .text('• Pago a 30 dias desde la fecha de factura', 60, currentY + 30)
         .text('• Entrega estimada: 5-7 dias habiles', 60, currentY + 45)
         .text('• Los precios incluyen transporte hasta nuestras instalaciones', 60, currentY + 60)
         .text('• Garantia segun condiciones del fabricante', 300, currentY + 30);

      // =====================================================
      // FOOTER
      // =====================================================
      const pageHeight = doc.page.height;
      doc.fillColor(grayColor)
         .fontSize(8)
         .font('Helvetica')
         .text(
           `Documento generado automaticamente por InventoryFlow | ${cliente.nombre_empresa}`,
           50,
           pageHeight - 40,
           { align: 'center', width: 495 }
         );

      // Finalize
      doc.end();

    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Genera un PDF y retorna como base64 (para descarga desde frontend)
 */
export async function generateOrderPDF(data: PDFOrderData): Promise<PDFGeneratorResult> {
  try {
    const pedido = {
      id: data.numero_pedido || generateOrderNumber(),
      datos_pedido: data.lineas,
      total_estimado: data.lineas.reduce((acc, l) => acc + l.cantidad * l.precio_unitario, 0),
      notas: data.notas,
    };

    const pdfBuffer = await generarPDFPedido(pedido, data.empresa, data.proveedor);

    return {
      success: true,
      pdfBuffer,
      pdf_base64: pdfBuffer.toString('base64'),
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
