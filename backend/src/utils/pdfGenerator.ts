import PDFDocument from 'pdfkit';
import { config } from '../config';
import { formatearFechaHora } from './dateHelpers';

/**
 * Crea un documento PDF base con encabezado y pie de página
 */
export function crearDocumentoPDF(options?: {
  titulo?: string;
  orientacion?: 'portrait' | 'landscape';
}): PDFKit.PDFDocument {
  const doc = new PDFDocument({
    size: 'A4',
    layout: options?.orientacion || 'portrait',
    margin: 50,
    info: {
      Title: options?.titulo || 'Reporte',
      Author: config.empresa.nombre,
      Creator: 'Sistema E-Commerce',
    },
  });

  // Encabezado
  doc.fontSize(10)
     .text(config.empresa.nombre, { align: 'center' })
     .text(`RUC: ${config.empresa.ruc}`, { align: 'center' })
     .text(config.empresa.direccion, { align: 'center' });

  if (options?.titulo) {
    doc.moveDown()
       .fontSize(14)
       .text(options.titulo, { align: 'center' });
  }

  doc.moveDown();

  return doc;
}

/**
 * Agrega pie de página con número de página
 */
export function agregarPiePagina(doc: PDFKit.PDFDocument): void {
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);
    doc.fontSize(8).text(
      `Generado: ${formatearFechaHora(new Date())} | Página ${i + 1} de ${range.count}`,
      50,
      doc.page.height - 50,
      { align: 'center', width: doc.page.width - 100 }
    );
  }
}

/**
 * Agrega una tabla simple al PDF
 */
export function agregarTablaPDF(
  doc: PDFKit.PDFDocument,
  headers: string[],
  rows: any[][],
  columnWidths?: number[]
): void {
  const startX = 50;
  const pageWidth = doc.page.width - 100;
  const colWidth = columnWidths || headers.map(() => pageWidth / headers.length);

  // Headers
  doc.font('Helvetica-Bold').fontSize(8);
  let x = startX;
  headers.forEach((header, i) => {
    doc.text(header, x, doc.y, { width: colWidth[i], align: 'left' });
    x += colWidth[i];
  });

  doc.moveDown(0.5);

  // Rows
  doc.font('Helvetica').fontSize(7);
  rows.forEach((row) => {
    x = startX;
    row.forEach((cell, i) => {
      doc.text(String(cell || ''), x, doc.y, { width: colWidth[i], align: 'left' });
      x += colWidth[i];
    });
    doc.moveDown(0.3);

    // Nueva página si es necesario
    if (doc.y > doc.page.height - 100) {
      doc.addPage();
    }
  });
}